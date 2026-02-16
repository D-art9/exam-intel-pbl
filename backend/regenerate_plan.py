
import os
import django
import sys

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document
from documents.rag_service import generate_lecture_plan

def regenerate_latest():
    try:
        doc = Document.objects.last()
        if not doc:
            print("No document found.")
            return

        print(f"Regenerating plan for: {doc.title} ({doc.id})")
        
        # Call the service function
        plan = generate_lecture_plan(doc.id)
        
        if plan:
            print("SUCCESS! Plan generated.")
            print(f"Items: {len(plan)}")
        else:
            print("FAILED to generate plan.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    regenerate_latest()
