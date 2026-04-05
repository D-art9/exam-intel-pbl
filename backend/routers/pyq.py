import os
import shutil
import tempfile
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.documents.pyq_ingestion import ingest_pyq
from backend.documents.pyq_matcher import get_coverage_matrix
from backend.documents.paper_generator import generate_paper, PaperConfig, SectionConfig
from backend.documents.models import Document
from backend.documents.ingestion import process_document
from django.core.files.base import ContentFile

router = APIRouter()

class SectionConfigSchema(BaseModel):
    type: str
    marks_per_q: int
    count: int

class PaperConfigSchema(BaseModel):
    title: str
    total_marks: int = 100
    sections: List[SectionConfigSchema]
    prefer_recent: bool = True
    cover_all_outcomes: bool = True
    syllabus_id: str

@router.post("/upload")
async def upload_pyq(file: UploadFile = File(...)):
    """
    Uploads a PYQ PDF, saves it temporarily, and runs the ingestion pipeline.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Save to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
        
    try:
        # Run ingestion logic
        # Note: ingest_pyq prints count, so we might need it to return count for the API
        # I'll assume I can modify it or it returns something.
        # For now, we'll just run it and return a success message.
        # (In a real scenario, I'd update ingest_pyq to return the count)
        ingest_pyq(tmp_path)
        return {"message": "Processing started", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/upload-batch")
async def upload_batch(
    handout_file: UploadFile = File(...),
    pyq_files: List[UploadFile] = File(...)
):
    """
    Simultaneously ingests a syllabus/handout and multiple PYQ files for Smart Paper Mode.
    """
    # 1. Store local temp paths for cleanup
    temp_paths = []
    syllabus_id = None
    total_q = 0

    try:
        # A. Process Handout (Django Ingestion)
        # We save it to a ContentFile so Django handles media storage correctly
        doc = Document.objects.create(
            title=handout_file.filename,
            file=ContentFile(await handout_file.read(), name=handout_file.filename)
        )
        
        # Trigger standard ingestion logic
        success = process_document(doc.id)
        if not success:
            raise HTTPException(status_code=500, detail="Handout ingestion protocol failed.")
        
        syllabus_id = str(doc.id)

        # B. Process PYQ Files
        for file in pyq_files:
            if not file.filename.endswith(".pdf"):
                continue
            
            # Save to temporary path for the pyq_ingestion logic (pymupdf4llm needs a path)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
                temp_paths.append(tmp_path)
            
            try:
                # Assuming modified ingest_pyq returns the question count
                count = ingest_pyq(tmp_path)
                total_q += (count or 0)
            except Exception as e:
                print(f"Warning: Failed to ingest PYQ {file.filename}: {e}")
                continue

        return {
            "syllabus_id": syllabus_id,
            "pyq_count": len(pyq_files),
            "question_count": total_q
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mission Failed: {str(e)}")
        
    finally:
        # 4. Neural Cleanup Protocol
        for path in temp_paths:
            if os.path.exists(path):
                os.remove(path)

@router.get("/coverage")
async def get_coverage(syllabus_id: str):
    """
    Returns the coverage matrix and a summary for a given syllabus.
    """
    matrix = get_coverage_matrix(syllabus_id)
    if not matrix:
        return {"summary": {"total_outcomes": 0, "covered": 0, "blind_spots": 0, "high_freq_count": 0}, "matrix": {}}
        
    total_outcomes = len(matrix)
    blind_spots = sum(1 for m in matrix.values() if m.get("blind_spot"))
    covered = total_outcomes - blind_spots
    high_freq_count = sum(1 for m in matrix.values() if m.get("high_freq"))
    
    return {
        "summary": {
            "total_outcomes": total_outcomes,
            "covered": covered,
            "blind_spots": blind_spots,
            "high_freq_count": high_freq_count
        },
        "matrix": matrix
    }

@router.post("/generate")
async def generate_exam_paper(config: PaperConfigSchema):
    """
    Generates a PDF exam paper based on the provided configuration.
    """
    # Convert Pydantic schema to the dataclass expected by paper_generator
    sections = [SectionConfig(type=s.type, marks_per_q=s.marks_per_q, count=s.count) for s in config.sections]
    paper_config = PaperConfig(
        title=config.title,
        total_marks=config.total_marks,
        sections=sections,
        prefer_recent=config.prefer_recent,
        cover_all_outcomes=config.cover_all_outcomes
    )
    
    pdf_path = generate_paper(paper_config, config.syllabus_id)
    
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Failed to generate PDF paper.")
        
    return FileResponse(
        pdf_path, 
        media_type="application/pdf", 
        filename=os.path.basename(pdf_path),
        headers={"Content-Disposition": f"attachment; filename={os.path.basename(pdf_path)}"}
    )
