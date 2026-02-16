from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Document, ChatMessage
from .serializers import DocumentSerializer, ChatMessageSerializer

# Import the ingestion logic (we'll ensure this file exists in Step 5)
from .ingestion import process_document 

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        """
        Handle file upload and trigger ingestion synchronously.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            doc = serializer.save()
            
            # TRIGGER INGESTION HERE (Synchronous for now)
            process_document(doc.id)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def ask(self, request, pk=None):
        """
        Endpoint to ask a question about a specific document.
        POST /api/documents/{id}/ask/
        Body: { "question": "What is the exam pattern?" }
        """
        document = self.get_object()
        question = request.data.get('question')

        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save User Message
        ChatMessage.objects.create(
            document=document,
            role='user',
            content=question
        )

        # Import locally to avoid circular imports during startup if needed
        from .rag_service import answer_question
        
        answer = answer_question(document.id, question)

        # 2. Save AI Response
        ChatMessage.objects.create(
            document=document,
            role='assistant',
            content=answer
        )

        return Response({"answer": answer})

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Endpoint to get chat history for a document.
        GET /api/documents/{id}/history/
        """
        document = self.get_object()
        messages = document.messages.all().order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def lecture_outcomes(self, request, pk=None):
        """
        Endpoint to get lecture outcomes from document chunks.
        GET /api/documents/{id}/lecture_outcomes/
        """
        document = self.get_object()
        
        # 1. Prefer AI-Generated Plan
        if document.generated_lecture_plan:
            return Response(document.generated_lecture_plan)
            
        # 2. Fallback to Metadata Extraction
        lecture_chunks = document.chunks.filter(metadata__section='lecture_plan')
        
        outcomes = []
        for chunk in lecture_chunks:
            meta = chunk.metadata or {}
            outcomes.append({
                "lecture_number": meta.get("lecture_number", "N/A"),
                "topic": meta.get("topic", "Unknown"),
                "co_mapped": meta.get("co_mapped", "-"),
            })
            
        return Response(outcomes)
