from rest_framework import serializers
from .models import Document, DocumentChunk

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'uploaded_at', 'status']
        read_only_fields = ['id', 'uploaded_at', 'status']

class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = ['chunk_index', 'text_content', 'page_number']

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import ChatMessage # Import locally to avoid potential circular imports if models changes
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp']