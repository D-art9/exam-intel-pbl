
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document

# Filter documents that failed or are stuck pending
# (Assuming your statuses are 'pending', 'processing', 'completed', 'failed')
# Be careful: 'processing' could be a live upload. But we're killing everything bad.
documents_to_delete = Document.objects.exclude(status='completed')

count = documents_to_delete.count()

if count > 0:
    print(f"Found {count} garbage documents (status != 'completed').")
    for doc in documents_to_delete:
        print(f" - Deleting: {doc.title} (ID: {doc.id}, Status: {doc.status})")
        # Deleting the object also triggers the model's delete() method
        # which usually cleans up the file from the filesystem if using django-cleanup.
        # If not, Django by default doesn't delete files, but that's okay for now.
        doc.delete()
    print("Cleanup complete!")
else:
    print("Database is clean! No failed/pending documents found.")
