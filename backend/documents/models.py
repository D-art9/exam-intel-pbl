from django.db import models
import uuid 
from pgvector.django import VectorField

class Document(models.Model):
    """Represents a single uploaded file (PDF/Exam Paper)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='exam_uploads/')
    title = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Status tracking
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Stores the AI-generated lecture plan (JSON list)
    generated_lecture_plan = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.title or 'Untitled'} ({self.status})"

class DocumentChunk(models.Model):
    """
    Represents a small piece of text from the document.
    RAG works by finding the most relevant chunks for a question.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()  # Order of the chunk in the doc
    text_content = models.TextField()    # The actual text
    page_number = models.IntegerField(null=True, blank=True) # Citation needed!
    metadata = models.JSONField(null=True, blank=True) # For structured info (Lecture No, CO ID, etc.)
    embedding = VectorField(dimensions=384, null=True, blank=True) # all-MiniLM-L6-v2 output dimension
    
    class Meta:
        ordering = ['chunk_index']

class ChatMessage(models.Model):
    """
    Stores individual chat messages for a document conversation.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='messages')
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']