import os
import re
import pymupdf4llm
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
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
    Advanced Ingestion Pipeline:
    1. PDF -> Markdown
    2. Section Extraction (Regex)
    3. Structured Chunking (Row-based for tables)
    4. Fallback Chunking (Text-based)
    5. Embedding & Saving
    """
    try:
        doc = Document.objects.get(id=doc_id)
        doc.status = 'processing'
        doc.title = doc.title or os.path.basename(doc.file.name)
        doc.save()

        file_path = os.path.join(settings.MEDIA_ROOT, str(doc.file))
        print(f"Processing (Structured Mode): {file_path}")
        
        # 1. Convert to Markdown
        full_text = pymupdf4llm.to_markdown(file_path)
        
        chunks_to_create = []
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # --- SECTION 1: LECTURE PLAN (Structured Table) ---
        # Look for "Lecture Plan" header
        lec_pattern = r"(?i)^(?:#+\s*)?Lecture\s+Plan[:\s]*(.*?)(?=\n#|\Z)"
        lec_match = re.search(lec_pattern, full_text, re.DOTALL | re.MULTILINE)
        
        if lec_match:
            print("Found Lecture Plan Section!")
            section_text = lec_match.group(1)
            
            # Find the table inside
            table_match = re.search(r"(\|.*\|[\r\n]+\|[-:| ]+\|[\r\n]+(?:\|.*\|[\r\n]*)+)", section_text)
            if table_match:
                table_str = table_match.group(1)
                rows = parse_markdown_table(table_str)
                
                print(f"Parsed {len(rows)} Lecture Rows.")
                
                # Create a Summary Chunk
                summary_text = "Full List of Topics in Lecture Plan: " + ", ".join([r.get('Topics', '') for r in rows])
                chunks_to_create.append({
                    "text": summary_text,
                    "metadata": {"section": "lecture_plan_summary"}
                })

                # Create Granular Chunks
                for row in rows:
                    # Construct rich text for retrieval
                    # "Lecture 5: Image Sampling. Outcome: Apply techniques. CO: CSE3241.1"
                    lec_no = row.get('Lec.', 'N/A')
                    topic = row.get('Topics', 'Unknown Topic')
                    outcome = row.get('Session Outcome', '')
                    co = row.get('Corresponding CO', '')
                    
                    content = f"Lecture {lec_no}: {topic}. \nSession Outcome: {outcome}. \nMapped CO: {co}."
                    
                    chunks_to_create.append({
                        "text": content,
                        "metadata": {
                            "section": "lecture_plan",
                            "lecture_number": lec_no,
                            "topic": topic,
                            "co_mapped": co
                        }
                    })

        # --- SECTION 2: COURSE OUTCOMES (Structured Table) ---
        co_pattern = r"(?i)^(?:#+\s*)?Course\s+Outcomes.*?(.*?)(?=\n#|\Z)"
        co_match = re.search(co_pattern, full_text, re.DOTALL | re.MULTILINE)

        if co_match:
            print("Found Course Outcomes Section!")
            section_text = co_match.group(1)
            table_match = re.search(r"(\|.*\|[\r\n]+\|[-:| ]+\|[\r\n]+(?:\|.*\|[\r\n]*)+)", section_text)
            
            if table_match:
                rows = parse_markdown_table(table_match.group(1))
                print(f"Parsed {len(rows)} CO Rows.")
                
                for row in rows:
                    co_id = row.get('CO', '')
                    statement = row.get('CO Statement', '')
                    bloom = row.get("Bloom's Level", '')
                    
                    content = f"Course Outcome {co_id}: {statement}. \nBloom's Level: {bloom}."
                    
                    chunks_to_create.append({
                        "text": content,
                        "metadata": {
                            "section": "course_outcomes",
                            "co_id": co_id,
                            "bloom_level": bloom
                        }
                    })

        # --- SECTION 3: FALLBACK (Everything Else) ---
        # If we didn't find specific sections, or for the rest of the text
        # Simple recursion on the whole text (skipping what we already parsed is hard, so we just chunk fully as backup)
        # Ideally, we remove the parsed tables from full_text, but for now, duplication is safer than missing data.
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        raw_chunks = text_splitter.split_text(full_text)
        
        for i, txt in enumerate(raw_chunks):
            chunks_to_create.append({
                "text": txt,
                "metadata": {"section": "general_text", "chunk_id": i}
            })

        print(f"Total Chunks prepared: {len(chunks_to_create)}")
        
        # 4. Generate Embeddings & Save
        print("Generating embeddings...")
        texts = [c['text'] for c in chunks_to_create]
        embeddings = embedding_model.embed_documents(texts)
        
        db_chunks = []
        for idx, item in enumerate(chunks_to_create):
            db_chunks.append(DocumentChunk(
                document=doc,
                chunk_index=idx,
                text_content=item['text'],
                metadata=item['metadata'],
                embedding=embeddings[idx]
            ))
            
        DocumentChunk.objects.bulk_create(db_chunks)

        # 5. Generate Lecture Plan (Groq)
        try:
            print("Triggering AI Lecture Plan Generation...")
            from .rag_service import generate_lecture_plan
            generate_lecture_plan(doc.id)
        except Exception as e:
            print(f"Warning: Failed to generate lecture plan: {e}")

        doc.status = 'completed'
        doc.save()
        return True

    except Exception as e:
        print(f"Error processing document {doc_id}: {e}")
        import traceback
        traceback.print_exc()
        # Ensure doc exists before saving
        if 'doc' in locals():
            doc.status = 'failed'
            doc.save()
        return False
        