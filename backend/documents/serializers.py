from rest_framework import serializers
from .models import Document, DocumentChunk

class DocumentSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(read_only=True)
    last_message_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'uploaded_at', 'status', 'message_count', 'last_message_at', 'generated_lecture_plan']
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