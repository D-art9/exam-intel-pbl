import os
import tempfile
from docx import Document
from fpdf import FPDF

def convert_docx_to_pdf(docx_bytes):
    """
    Takes docx bytes, saves to a temp file, converts to a PDF, 
    and returns the path to the resulting PDF.
    """
    # 1. Save bytes to a temp docx
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_docx:
        tmp_docx.write(docx_bytes)
        docx_path = tmp_docx.name

    try:
        # 2. Extract text from DOCX
        doc = Document(docx_path)
        pdf = FPDF()
        pdf.add_page()
        
        # We use a standard safe font
        pdf.set_font("Helvetica", size=10)
        
        # Basic Title Header
        pdf.set_font("Helvetica", 'B', 14)
        pdf.cell(0, 10, "CONVERTED DOCUMENT (DOCX SOURCE)", 0, 1, 'C')
        pdf.ln(5)
        pdf.set_font("Helvetica", size=10)

        for para in doc.paragraphs:
            if para.text.strip():
                # Sanitize text for FPDF (remove non-latin-1 chars to prevent crashes)
                clean_text = para.text.encode('ascii', 'ignore').decode('ascii')
                pdf.multi_cell(0, 6, clean_text)
                pdf.ln(2)

        # 3. Output to temp PDF
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(temp_pdf.name)
        return temp_pdf.name

    except Exception as e:
        print(f"Conversion Error: {e}")
        return None
    finally:
        # Cleanup docx
        if os.path.exists(docx_path):
            os.remove(docx_path)
