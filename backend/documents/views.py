from django.shortcuts import render
from django.db.models import Count, Max

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Document, ChatMessage # FIXED: Cleaned imports
from .serializers import DocumentSerializer, ChatMessageSerializer

# Import the ingestion logic (we'll ensure this file exists in Step 5)
from .ingestion import process_document 

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        return Document.objects.annotate(
            message_count=Count('messages'),
            last_message_at=Max('messages__timestamp')
        ).order_by('-last_message_at', '-uploaded_at')

    def create(self, request, *args, **kwargs):
        """
        Handle file upload. Detects .docx and converts to PDF if necessary.
        """
        file_obj = request.data.get('file')
        
        # 1. Detection: Handle Word Documents
        if file_obj and file_obj.name.endswith('.docx'):
            from .converter import convert_docx_to_pdf
            from django.core.files.base import ContentFile
            import os

            # Read raw bytes from the uploaded file
            content = file_obj.read()
            
            # Convert to a temporary PDF file
            pdf_path = convert_docx_to_pdf(content)
            
            if pdf_path:
                try:
                    with open(pdf_path, 'rb') as f:
                        # Create the document instance with the CONVERTED PDF
                        new_name = file_obj.name.replace('.docx', '.pdf')
                        doc = Document.objects.create(
                            title=new_name,
                            file=ContentFile(f.read(), name=new_name)
                        )
                    
                    # Manual trigger of ingestion
                    process_document(doc.id)
                    serializer = self.get_serializer(doc)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                finally:
                    # Local cleanup of the temporary converted PDF
                    if os.path.exists(pdf_path):
                        os.remove(pdf_path)
            else:
                return Response({"error": "Failed to convert Word document to PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Standard Logic for PDFs
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            doc = serializer.save()
            process_document(doc.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=True, methods=['post'])
    def generate_plan(self, request, pk=None):
        """
        Endpoint to explicitly re-run the Lecture Plan prompt.
        POST /api/documents/{id}/generate_plan/
        """
        document = self.get_object()
        from .rag_service import generate_lecture_plan
        plan = generate_lecture_plan(document.id)
        if plan is None:
            return Response({"error": "Failed to generate plan"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(plan)
