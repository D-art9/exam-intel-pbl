
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document, DocumentChunk


# Get the LATEST document (so we inspect the one you just uploaded)
doc = Document.objects.order_by('-uploaded_at').first()

if doc:
    print(f"\n--- INSPECTING DOCUMENT: {doc.title} (ID: {doc.id}) ---")
    print(f"Status: {doc.status}")
    
    chunks = DocumentChunk.objects.filter(document=doc).order_by('chunk_index')
    count = chunks.count()
    print(f"Total Chunks: {count}")
    
    if count == 0:
        print("ERROR: No chunks found! Ingestion failed.")
    else:
        print("\n--- FIRST 5 CHUNKS PREVIEW ---")
        for chunk in chunks[:5]:
            print(f"\n[Chunk {chunk.chunk_index}] (Page {chunk.page_number})")
            print("-" * 40)
            # Print first 500 chars to check quality
            print(chunk.text_content[:500] + "...") 
            print("-" * 40)
else:
    print("No documents found in database.")
