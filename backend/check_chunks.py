import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documents.models import Document, DocumentChunk

print(f"Total Documents: {Document.objects.count()}")
print(f"Total Chunks: {DocumentChunk.objects.count()}")

for doc in Document.objects.all():
    chunk_count = doc.chunks.count()
    print(f"- {doc.title}: {chunk_count} chunks")
