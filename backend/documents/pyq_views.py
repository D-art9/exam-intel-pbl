import os
import shutil
import tempfile
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from django.core.files.base import ContentFile

# Import existing logic
from .pyq_ingestion import ingest_pyq
from .pyq_matcher import get_coverage_matrix
from .paper_generator import generate_paper, PaperConfig, SectionConfig
from .models import Document
from .ingestion import process_document
from .converter import convert_docx_to_pdf

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_batch(request):
    """Django version of upload-batch."""
    handout_file = request.FILES.get('handout_file')
    pyq_files = request.FILES.getlist('pyq_files')
    
    if not handout_file or not pyq_files:
        return Response({"error": "Syllabus and at least one PYQ are required."}, status=400)

    temp_paths = []
    syllabus_id = None
    total_q = 0

    try:
        # 1. Process Handout
        content = handout_file.read()
        target_name = handout_file.name
        
        if target_name.endswith('.docx'):
            pdf_path = convert_docx_to_pdf(content)
            if pdf_path:
                with open(pdf_path, 'rb') as f:
                    content = f.read()
                target_name = target_name.replace('.docx', '.pdf')
                temp_paths.append(pdf_path)

        doc = Document.objects.create(
            title=target_name,
            file=ContentFile(content, name=target_name)
        )
        process_document(doc.id)
        syllabus_id = str(doc.id)

        # 2. Process PYQs
        for file in pyq_files:
            if not (file.name.endswith(".pdf") or file.name.endswith(".docx")):
                continue
            
            q_content = file.read()
            if file.name.endswith(".docx"):
                tmp_path = convert_docx_to_pdf(q_content)
                if not tmp_path: continue
            else:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(q_content)
                    tmp_path = tmp.name
            
            temp_paths.append(tmp_path)
            
            try:
                count = ingest_pyq(tmp_path)
                total_q += (count or 0)
            except Exception as e:
                print(f"PYQ Error: {e}")
                continue

        return Response({
            "syllabus_id": syllabus_id,
            "pyq_count": len(pyq_files),
            "question_count": total_q
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    finally:
        for path in temp_paths:
            if os.path.exists(path):
                os.remove(path)

@api_view(['POST'])
def process_demo(request):
    """Django version of the demo seeder."""
    demo_dir = os.path.join(os.getcwd(), "demo_assets")
    # If on Render, the assets might be in backend/demo_assets/
    if not os.path.exists(demo_dir):
        demo_dir = os.path.join(os.getcwd(), "backend", "demo_assets")
        
    handout_path = os.path.join(demo_dir, "demo_handout.pdf")
    pyq_paths = [
        os.path.join(demo_dir, "demo_pyq_2022.pdf"),
        os.path.join(demo_dir, "demo_pyq_2023.pdf")
    ]

    if not os.path.exists(handout_path):
        return Response({"error": "Demo assets not found."}, status=404)

    try:
        with open(handout_path, 'rb') as f:
            content = f.read()
            doc = Document.objects.create(
                title="DEMO: Neural Networks 101",
                file=ContentFile(content, name="demo_handout.pdf")
            )
        process_document(doc.id)
        syllabus_id = str(doc.id)

        total_q = 0
        for path in pyq_paths:
            count = ingest_pyq(path)
            total_q += (count or 0)

        return Response({
            "syllabus_id": syllabus_id,
            "pyq_count": len(pyq_paths),
            "question_count": total_q,
            "is_demo": True
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def coverage(request):
    syllabus_id = request.query_params.get('syllabus_id')
    if not syllabus_id:
        return Response({"error": "syllabus_id required"}, status=400)
    
    matrix = get_coverage_matrix(syllabus_id)
    if not matrix:
        return Response({"summary": {"total_outcomes": 0, "covered": 0, "blind_spots": 0, "high_freq_count": 0}, "matrix": {}})
        
    return Response({
        "summary": {
            "total_outcomes": len(matrix),
            "blind_spots": sum(1 for m in matrix.values() if m.get("blind_spot")),
            "high_freq_count": sum(1 for m in matrix.values() if m.get("high_freq"))
        },
        "matrix": matrix
    })

@api_view(['POST'])
def generate(request):
    data = request.data
    sections = [SectionConfig(type=s['type'], marks_per_q=s['marks_per_q'], count=s['count']) for s in data.get('sections', [])]
    config = PaperConfig(
        title=data.get('title', 'Exam Paper'),
        total_marks=data.get('total_marks', 100),
        sections=sections,
        prefer_recent=data.get('prefer_recent', True),
        cover_all_outcomes=data.get('cover_all_outcomes', True)
    )
    
    pdf_path = generate_paper(config, data.get('syllabus_id'))
    if not pdf_path or not os.path.exists(pdf_path):
        return Response({"error": "Generation failed"}, status=500)
        
    response = FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{os.path.basename(pdf_path)}"'
    return response
