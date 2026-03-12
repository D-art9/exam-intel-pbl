import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document

docs = Document.objects.all()
print(f"Total documents in DB: {docs.count()}")
for doc in docs:
    print(f"- {doc.title} (ID: {doc.id}, Status: {doc.status})")
