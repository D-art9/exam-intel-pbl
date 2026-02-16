import os
import time
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from django.conf import settings
from .models import DocumentChunk
from pgvector.django import L2Distance, CosineDistance

# Load embedding model (same one used for ingestion)
print("[RAG Init] Loading embedding model...")
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print("[RAG Init] Embedding model loaded successfully.")

def answer_question(document_id, question):
    """
    1. Embeds the question.
    2. Finds top 5 relevant chunks from the specific document.
    3. Asks Groq to answer based on those chunks.
    """
    print(f"\n--- [RAG START] Document: {document_id} ---")
    print(f"Question: {question}")
    
    start_time = time.time()
    
    try:
        # 1. Embed Question
        print(f"Step 1: Embedding question...")
        t0 = time.time()
        question_vector = embedding_model.embed_query(question)
        print(f"   -> Embedded in {time.time() - t0:.4f}s. Vector length: {len(question_vector)}")

        # 2. Semantic Search (Supabase pgvector)
        print(f"Step 2: Searching Supabase for relevant chunks...")
        t0 = time.time()
        relevant_chunks = DocumentChunk.objects.filter(
            document_id=document_id
        ).annotate(
            distance=CosineDistance('embedding', question_vector)
        ).order_by('distance')[:5]  # Get top 5 matches
        
        # Force evaluation to get count and time
        chunks_found = list(relevant_chunks)
        print(f"   -> Found {len(chunks_found)} chunks in {time.time() - t0:.4f}s.")

        if not chunks_found:
            print("   -> NO CHUNKS FOUND! Returning fallback.")
            return "I couldn't find any relevant context in the document."

        # Log chunks for debugging
        for i, chunk in enumerate(chunks_found):
            # distance is cosine distance (0 to 2), smaller is better/closer? 
            # Actually with CosineDistance in pgvector: distance = 1 - cosine_similarity. So 0 is identical, 2 is opposite.
            print(f"   -> Chunk {i+1} (Dist: {getattr(chunk, 'distance', 'N/A')}): {chunk.text_content[:60].replace('\n', ' ')}...")

        # 3. Prepare Context
        print(f"Step 3: Preparing context for LLM...")
        context_text = "\n\n".join([chunk.text_content for chunk in chunks_found])
        print(f"   -> Context assembled. Length: {len(context_text)} chars.")
        
        # 4. Ask Groq
        print(f"Step 4: Calling Groq (Llama 3)...")
        t0 = time.time()
        llm = ChatGroq(
            temperature=0, 
            model_name="llama-3.3-70b-versatile", 
            api_key=settings.GROQ_API_KEY
        )

        system_prompt = """
You are an expert exam assistant. Your task is to answer the student's question based strictly on the provided document context.

Instructions:
1. Use ONLY the information provided in the Context below. Do not use outside knowledge.
2. If the answer is not found in the Context, state: "I cannot find the answer in this document."
3. If the context contains multiple relevant sections, summarize them coherently.
4. Cite the section or question number if it is mentioned in the text (e.g., "According to Section A...").

Context:
{context}
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{question}")
        ])

        chain = prompt | llm
        response = chain.invoke({"context": context_text, "question": question})
        print(f"   -> Received response from Groq in {time.time() - t0:.4f}s.")
        print(f"   -> Response snippet: {response.content[:50]}...")
        
        print(f"--- [RAG END] Total time: {time.time() - start_time:.4f}s ---\n")
        return response.content

    except Exception as e:
        print(f"!!! CRITICAL RAG ERROR !!!: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Error generating answer: {str(e)}"

def generate_lecture_plan(document_id):
    """
    Generates a structured lecture plan from the document using Groq.
    """
    print(f"\n--- [PLAN GEN START] Document: {document_id} ---")
    start_time = time.time()
    
    try:
        from .models import Document, DocumentChunk
        
        doc = Document.objects.get(id=document_id)
        
        # 1. Fetch Context (First ~20 chunks or tailored query)
        # Syllabus/Plan is usually at the start.
        chunks = DocumentChunk.objects.filter(document_id=document_id).order_by('chunk_index')[:25]
        context_text = "\n\n".join([c.text_content for c in chunks])
        
        if not context_text:
            print("   -> No chunks found to generate plan.")
            return None

        # 2. Call Groq
        print(f"Step 2: Calling Groq (Llama 3) for extraction...")
        llm = ChatGroq(
            temperature=0, 
            model_name="llama-3.3-70b-versatile", 
            api_key=settings.GROQ_API_KEY
        )

        system_prompt = """
        You are a curriculum analyzer. Extract the lecture plan/syllabus from the provided text.
        Return ONLY a raw JSON list of objects with these keys:
        - "lecture_number" (string, e.g. "1" or "1-2")
        - "topic" (string, concise title)
        - "description" (string, brief summary if available, else empty)
        - "co_mapped" (string, course outcome if available, else empty)

        If no syllabus is found, return an empty list [].
        Do not include markdown formatting (like ```json). Just the raw JSON string.
        """

        messages = [
            ("system", system_prompt),
            ("human", f"Context:\n{context_text}")
        ]

        response = llm.invoke(messages)
        content = response.content.strip()
        
        # Clean markdown if present
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "")
        
        import json
        plan = json.loads(content)
        
        print(f"   -> Generated {len(plan)} items.")
        
        # 3. Save to Document
        doc.generated_lecture_plan = plan
        doc.save()
        print(f"--- [PLAN GEN END] Saved to DB in {time.time() - start_time:.4f}s ---")
        return plan

    except Exception as e:
        print(f"!!! PLAN GEN ERROR !!!: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
