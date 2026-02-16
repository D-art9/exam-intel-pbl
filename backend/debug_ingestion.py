
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document
from documents.ingestion import process_document

try:
    # Get the latest failed document
    latest_doc = Document.objects.filter(status='failed').last()
    
    if not latest_doc:
        print("No failed documents found!")
        exit()

    print(f"Retrying document: {latest_doc.title} (ID: {latest_doc.id})")
    
    # Process it synchronously so we see the output
    success = process_document(latest_doc.id)
    
    if success:
        print("SUCCESS! Document processed.")
    else:
        print("FAILURE! Check the logs above for the error.")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
