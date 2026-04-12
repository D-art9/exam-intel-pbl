import os
import re
import pymupdf4llm
from langchain_text_splitters import RecursiveCharacterTextSplitter
from django.conf import settings
from .models import Document, DocumentChunk

def clean_text(text):
    """Refine text by removing markdown artifacts."""
    text = text.replace("**", "").replace("_", "").strip()
    return re.sub(r'\s+', ' ', text)

def parse_markdown_table(table_text):
    """
    Parses a markdown table into a list of dictionaries (rows).
    Assumes standard pipe table format:
    | Col1 | Col2 |
    |---|---|
    | Val1 | Val2 |
    """
    lines = table_text.strip().split('\n')
    if len(lines) < 3: return []

    # 1. Extract Headers
    headers = [h.strip() for h in lines[0].split('|') if h.strip()]
    
    data = []
    # Skip separator line (lines[1] usually |---|)
    for line in lines[2:]:
        if not line.strip() or set(line.strip()) == {'|', '-'}: continue
        
        cells = [c.strip() for c in line.split('|')]
        # Drop empty first/last if pipe starts/ends line
        if line.strip().startswith('|'): cells = cells[1:]
        if line.strip().endswith('|'): cells = cells[:-1]
        
        if len(cells) == len(headers):
            row_dict = dict(zip(headers, cells))
            data.append(row_dict)
    
    return data

def process_document(doc_id):
    """
    Stabilized Ingestion Pipeline with AI Fallback for Lecture Plans.
    """
    try:
        doc = Document.objects.get(id=doc_id)
        doc.status = 'processing'
        doc.title = doc.title or os.path.basename(doc.file.name)
        doc.save()

        file_path = os.path.join(settings.MEDIA_ROOT, str(doc.file))
        print(f"Processing (Resilient Mode): {file_path}")
        
        # 1. Convert to Markdown
        full_text = pymupdf4llm.to_markdown(file_path)
        
        chunks_to_prepare = []
        from .rag_service import get_embedding_model
        embedding_model = get_embedding_model()

        # --- PHASE 1: Structured Regex Extraction ---
        lec_pattern = r"(?i)^(?:#+\s*)?Lecture\s+Plan[:\s]*(.*?)(?=\n#|\Z)"
        lec_match = re.search(lec_pattern, full_text, re.DOTALL | re.MULTILINE)
        
        regex_plan_count = 0
        if lec_match:
            print("Found Lecture Plan Section (Regex).")
            section_text = lec_match.group(1)
            table_match = re.search(r"(\|.*\|[\r\n]+\|[-:| ]+\|[\r\n]+(?:\|.*\|[\r\n]*)+)", section_text)
            if table_match:
                rows = parse_markdown_table(table_match.group(1))
                for row in rows:
                    content = f"Lecture {row.get('Lec.', 'N/A')}: {row.get('Topics', 'Unknown Topic')}. \nOutcome: {row.get('Session Outcome', '')}."
                    chunks_to_prepare.append({
                        "text": content,
                        "metadata": {
                            "section": "lecture_plan",
                            "lecture_number": row.get('Lec.', 'N/A'),
                            "topic": row.get('Topics', 'Unknown Topic'),
                            "co_mapped": row.get('Session Outcome', '')
                        }
                    })
                    regex_plan_count += 1

        # --- PHASE 2: General Text Splitter (Backup context) ---
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        raw_chunks = text_splitter.split_text(full_text)
        for i, txt in enumerate(raw_chunks):
            chunks_to_prepare.append({
                "text": txt,
                "metadata": {"section": "general_text", "chunk_id": i}
            })

        # --- PHASE 3: Embedding & Initial Save ---
        if not chunks_to_prepare:
            doc.status = 'failed'
            doc.save()
            return False

        print(f"Preparing embeddings for {len(chunks_to_prepare)} initial chunks...")
        texts = [c['text'] for c in chunks_to_prepare]
        all_embeddings = embedding_model.embed_documents(texts)
        
        db_chunks = [
            DocumentChunk(
                document=doc,
                chunk_index=i,
                text_content=c['text'],
                metadata=c['metadata'],
                embedding=all_embeddings[i]
            ) for i, c in enumerate(chunks_to_prepare)
        ]
        doc.chunks.all().delete()
        DocumentChunk.objects.bulk_create(db_chunks)

        # --- PHASE 4: AI Extraction Fallback ---
        # If regex missed the lecture plan, we run the LLM extraction and ADD those items as chunks
        print("Triggering AI Lecture Plan Generation (Internal Fallback Check)...")
        from .rag_service import generate_lecture_plan
        plan = generate_lecture_plan(doc.id)
        
        if plan and regex_plan_count == 0:
            print(f"Regex failed. Creating {len(plan)} fallback chunks from AI Plan.")
            fallback_chunks = []
            for item in plan:
                content = f"Lecture {item.get('lecture_number')}: {item.get('topic')}. {item.get('description', '')}. \nOutcome: {item.get('co_mapped', '')}"
                embedding = embedding_model.embed_query(content)
                
                # Get current count to set proper index
                curr_index = DocumentChunk.objects.filter(document=doc).count()
                
                fallback_chunks.append(DocumentChunk(
                    document=doc,
                    chunk_index=curr_index + len(fallback_chunks),
                    text_content=content,
                    metadata={
                        "section": "lecture_plan",
                        "lecture_number": item.get('lecture_number'),
                        "topic": item.get('topic'),
                        "co_mapped": item.get('co_mapped')
                    },
                    embedding=embedding
                ))
            DocumentChunk.objects.bulk_create(fallback_chunks)
            print(f"Successfully integrated {len(fallback_chunks)} AI-extracted outcomes.")

        doc.status = 'completed'
        doc.save()
        return True

    except Exception as e:
        print(f"Processing Error: {e}")
        import traceback
        traceback.print_exc()
        if 'doc' in locals():
            doc.status = 'failed'
            doc.save()
        return False
        