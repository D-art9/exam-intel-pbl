from django.contrib import admin
from .models import Document, DocumentChunk
from .ingestion import process_document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploaded_at', 'status', 'id')
    list_filter = ('status', 'uploaded_at')

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:  # Only run on new uploads
            # Process synchronously for feedback (simple MVP)
            process_document(obj.id)

@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'chunk_index', 'page_number')
    list_filter = ('document',)