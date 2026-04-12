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
    Handles hierarchy (parent question + subparts).
    """
    # Patterns for question boundaries: Q1., 1), Question 1, [1]
    boundaries = [
        r'^\s*(?:Q|Question|Q.)\s*\d+[\.\:]?.*',   # Q1., Question 1:, Q.1
        r'^\s*\d+[\)\.].*',                        # 1) or 1.
        r'^\s*\[\d+\]\s*.*',                       # [1]
        r'^\s*\(?[a-z]\)?\..*'                     # a. or (a).
    ]
    
    # Split text into lines but keep boundaries
    lines = markdown_text.split('\n')
    questions = []
    current_q_text = []
    current_q_num = None
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        is_parent = re.match(r'^(?:Q\d+\.|\d+\))', stripped)
        
        if is_parent:
            # Save previous question if exists
            if current_q_text:
                questions.append({
                    'num': current_q_num,
                    'text': '\n'.join(current_q_text)
                })
            # Start new question
            match = re.match(r'^(Q\d+|\d+)', stripped)
            current_q_num = match.group(1) if match else "Unknown"
            current_q_text = [line]
        elif current_q_text:
            # Generic text or subpart, if we have a current question, attach it
            current_q_text.append(line)
    
    # Add final question
    if current_q_text:
        questions.append({
            'num': current_q_num,
            'text': '\n'.join(current_q_text)
        })
        
    return questions

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

    # 2. Extract Questions
    extracted = extract_questions(markdown_text)
    print(f"Extracted {len(extracted)} questions.")

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
