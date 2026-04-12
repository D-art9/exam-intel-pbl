import os
import django
import sys
from django.conf import settings

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document, DocumentChunk, PYQQuestion
from pgvector.django import CosineDistance

def analyze():
    print("--- MATCHING ANALYSIS ---")
    
    # 1. Check Chunks
    latest_doc = Document.objects.order_by('-uploaded_at').first()
    if not latest_doc:
        print("No documents found.")
        return
        
    print(f"Latest Doc: {latest_doc.title} ({latest_doc.id})")
    
    lp_chunks = DocumentChunk.objects.filter(
        document=latest_doc, 
        metadata__section='lecture_plan'
    )
    print(f"Lecture Plan Chunks: {lp_chunks.count()}")
    
    if lp_chunks.count() == 0:
        print("!!! ERROR: No lecture plan chunks found for this document.")
        # Check all chunks to see what we HAVE
        all_sections = DocumentChunk.objects.filter(document=latest_doc).values_list('metadata__section', flat=True).distinct()
        print(f"Available sections in DB: {list(all_sections)}")
    
    # 2. Check PYQs
    pyqs = PYQQuestion.objects.all()
    print(f"Total PYQ Questions in DB: {pyqs.count()}")
    
    if pyqs.count() == 0:
        print("!!! ERROR: No PYQ questions found in database.")
        return

    # 3. Sample Match
    if lp_chunks.exists() and pyqs.exists():
        lec = lp_chunks.first()
        print(f"\nAnalyzing Sample Topic: {lec.text_content[:100]}...")
        
        matches = PYQQuestion.objects.annotate(
            dist=CosineDistance('embedding', lec.embedding)
        ).order_by('dist')[:5]
        
        print("\nTop 5 Matches:")
        for m in matches:
            print(f"- [Dist: {m.dist:.4f}] {m.question_text[:100].replace('\n', ' ')}...")
            
        best_dist = matches[0].dist if matches else 1.0
        print(f"\nBest Distance: {best_dist:.4f}")
        print(f"Covered (Threshold < 0.35)? {'YES' if best_dist < 0.35 else 'NO'}")

if __name__ == "__main__":
    analyze()
