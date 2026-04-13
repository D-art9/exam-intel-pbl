import os
import re
import sys
import uuid
import argparse
import pymupdf4llm
from django.conf import settings
from django.db import connection
from .models import PYQQuestion # FIXED: Imported Managed Model
from .rag_service import get_embedding_model

def extract_year(filename):
    """
    Extracts a 4-digit year (beginning with 20) from the filename.
    """
    pattern = r'(20\d{2})' # FIXED: Removed \b boundaries to support underscores
    match = re.search(pattern, filename)
    return int(match.group(1)) if match else None

def detect_exam_type(filename):
    """
    Detects the exam type from keywords in the filename.
    Returns one of: 'mid_sem', 'end_sem', 'quiz' or None.
    """
    fn_lower = filename.lower()
    if 'mid' in fn_lower:
        return 'mid_sem'
    elif 'end' in fn_lower:
        return 'end_sem'
    elif 'quiz' in fn_lower:
        return 'quiz'
    return None

def parse_marks(text):
    """
    Parses marks from patterns like [10 marks] or [5 mark].
    Returns the marks as an integer or None if not found.
    """
    pattern = r'\[(\d+)\s*marks?\]'
    match = re.search(pattern, text, re.IGNORECASE)
    return int(match.group(1)) if match else None

def extract_questions(markdown_text):
    """
    Extracts questions from the markdown using boundary regex.
    """
    # Patterns for question boundaries: Q1., 1), Question 1:, [1], Q.1
    patterns = [
        r'^\s*(?:Q|Question|Q\.)\s*\d+[\.\:]?\s*.*',
        r'^\s*\d+[\)\.]\s*.*',
        r'^\s*\[\d+\]\s*.*'
    ]
    boundary_regex = re.compile('|'.join(patterns), re.IGNORECASE)
    
    lines = markdown_text.split('\n')
    questions = []
    current_q_text = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped: continue
        
        # If line matches a boundary, it's a new question
        if boundary_regex.match(stripped):
            if current_q_text:
                questions.append('\n'.join(current_q_text))
            current_q_text = [line]
        else:
            if current_q_text:
                current_q_text.append(line)
    
    # Add final question
    if current_q_text:
        questions.append('\n'.join(current_q_text))
        
    # Return as structured list, filtering out very short/junk fragments
    return [
        {'num': str(i+1), 'text': q.strip()} 
        for i, q in enumerate(questions) 
        if len(q.strip()) > 30
    ]

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import json

def extract_questions_with_llm(markdown_text):
    """
    Uses Llama-3 (via Groq) to intelligently extract individual questions from raw Markdown.
    This replaces/augments the fragile regex-based extraction.
    """
    print("Step 2: Calling Groq (Llama 3) for structural question extraction...")
    try:
        llm = ChatGroq(
            temperature=0, 
            model_name="llama-3.3-70b-versatile", 
            api_key=settings.GROQ_API_KEY
        )

        system_prompt = """
        You are a Specialized Academic Document Parser. Your goal is to extract individual questions from an exam paper.
        Return ONLY a raw JSON list of objects with these keys:
        - "num" (string, the question number like '1', 'Q1', '2a', etc.)
        - "text" (string, the full text of the question including any mark values)
        - "marks" (number or null, the marks assigned to the question if explicitly stated)

        Instructions:
        1. Identify every unique question block.
        2. Preserve the original wording of the questions.
        3. If a question has sub-parts (like 1a, 1b), treat them as separate list items or group them if they belong together logically.
        4. Do NOT include markdown formatting (like ```json). Just the raw JSON string.
        5. If no clear questions are found, return [].
        """

        # Truncate text if too long (Groq context limits), usually exam papers aren't that huge
        # 16k chars is usually safe for most 4-8 page papers.
        payload = markdown_text[:18000]

        messages = [
            ("system", system_prompt),
            ("human", f"Exam Paper Content (Markdown):\n{payload}")
        ]

        response = llm.invoke(messages)
        content = response.content.strip()
        
        # Clean markdown if present
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "")
        
        extracted_json = json.loads(content)
        print(f"   -> LLM successfully extracted {len(extracted_json)} questions.")
        return extracted_json

    except Exception as e:
        print(f"!!! LLM EXTRACTION ERROR !!!: {str(e)}")
        return None

def ingest_pyq(file_path):
    """
    Main ingestion pipeline for PYQ PDFs.
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    filename = os.path.basename(file_path)
    year = extract_year(filename)
    exam_type = detect_exam_type(filename)
    
    print(f"Ingesting: {filename} (Year: {year}, Type: {exam_type})")
    
    # 1. Convert to Markdown
    try:
        markdown_text = pymupdf4llm.to_markdown(file_path)
    except Exception as e:
        print(f"Error converting PDF to Markdown: {e}")
        return

    # 2. Extract Questions (LLM First, Regex as backup)
    print(f"--- [EXTRACT DEBUG] Markdown Snippet: {markdown_text[:150].replace('\n', ' ')}...")
    
    # Try LLM Extraction first
    extracted = extract_questions_with_llm(markdown_text)
    
    # Fallback to Regex if LLM fails or returns empty
    if not extracted:
        print("Falling back to Regex Extraction...")
        extracted = extract_questions(markdown_text)
    
    # FINAL FALLBACK: If everything fails, use the full paper body
    if not extracted:
        print("!!! WARNING: All extraction methods failed. Using full paper body as fallback.")
        extracted = [{
            'num': 'FULL_PAPER',
            'text': f"Full Paper Content ({filename}):\n" + markdown_text[:8000]
        }]
    
    print(f"Extraction yield: {len(extracted)} question blocks.")

    # 3. Embed and Save
    embedding_model = get_embedding_model()
    inserted_count = 0
    
    for q in extracted:
        text = q['text']
        q_num = q['num']
        marks = parse_marks(text)
        
        # Embed question
        try:
            embedding = embedding_model.embed_query(text)
        except Exception as e:
            print(f"Error embedding question {q_num}: {e}")
            continue
        
        # FIXED: Using Django ORM instead of raw cursor
        try:
            obj, created = PYQQuestion.objects.update_or_create(
                source_paper=filename,
                question_number=q_num,
                defaults={
                    'question_text': text,
                    'year': year,
                    'exam_type': exam_type,
                    'marks': marks,
                    'embedding': embedding
                }
            )
            inserted_count += 1
        except Exception as e:
            print(f"Error saving question {q_num} to database: {e}")
            continue
                
    print(f"Successfully processed and inserted/updated {inserted_count} questions.")
    return inserted_count
                
    print(f"Successfully processed and inserted/updated {inserted_count} questions.")
    return inserted_count

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest PYQ PDF into the database.")
    parser.add_argument("file_path", help="Path to the PYQ PDF file.")
    args = parser.parse_args()
    
    # Ensure Django is initialized if running as a standalone script
    import django
    if not settings.configured:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        django.setup()
        
    ingest_pyq(args.file_path)
