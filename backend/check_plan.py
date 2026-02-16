
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document

def check_latest_document():
    try:
        doc = Document.objects.last()
        if not doc:
            print("No documents found in database.")
            return

        print(f"--- DOCUMENT CHECK ---")
        print(f"ID: {doc.id}")
        print(f"Title: {doc.title}")
        print(f"Uploaded At: {doc.uploaded_at}")
        
        plan = doc.generated_lecture_plan
        if plan:
            print(f"Plan Found! Length: {len(plan)}")
            print(f"Sample Item: {plan[0] if len(plan) > 0 else 'Empty List'}")
        else:
            print("Plan is None or Empty.")

        # Check existing chunks to see if ingestion happened
        chunk_count = doc.chunks.count()
        print(f"Total Chunks: {chunk_count}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_latest_document()
