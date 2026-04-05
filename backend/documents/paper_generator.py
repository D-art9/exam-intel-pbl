import os
import datetime
from dataclasses import dataclass, field
from typing import List, Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from .pyq_matcher import get_coverage_matrix
from .models import DocumentChunk
from django.conf import settings
from langchain_groq import ChatGroq

@dataclass
class SectionConfig:
    """Configuration for an exam paper section."""
    type: str  # e.g., 'multiple_choice', 'long_answer'
    marks_per_q: int
    count: int

@dataclass
class PaperConfig:
    """Configuration for generating an exam paper."""
    title: str
    total_marks: int = 100
    sections: List[SectionConfig] = field(default_factory=list)
    prefer_recent: bool = True
    cover_all_outcomes: bool = True

def generate_paper(config: PaperConfig, syllabus_id: str) -> str:
    """
    Generates a PDF exam paper based on syllabus outcomes and matching PYQs.
    
    Args:
        config: The configuration object for the paper.
        syllabus_id: The UUID of the syllabus (document).
        
    Returns:
        The path to the generated PDF.
    """
    try:
        # 1. Initialize Groq client once for potential fallbacks
        groq_client = ChatGroq(
            temperature=0.7,
            model_name="llama-3.3-70b-versatile",
            api_key=settings.GROQ_API_KEY
        )

        # 2. Fetch coverage matrix
        coverage_matrix = get_coverage_matrix(syllabus_id)
        
        # 2. Get syllabus chunks for outcome ordering and data
        outcomes = DocumentChunk.objects.filter(
            document_id=syllabus_id, 
            metadata__section='lecture_plan'
        ).order_by('chunk_index')
        
        selected_questions = []
        used_pyq_ids = set()
        source_papers = set()
        
        # 3. Greedy Selection Strategy
        # Iterate over sections to fill specified counts
        for section in config.sections:
            section_questions = []
            
            # Reset used outcomes tracker for each section or overall? 
            # We'll try to rotate through outcomes for better coverage.
            for outcome in outcomes:
                if len(section_questions) >= section.count:
                    break
                    
                outcome_id = str(outcome.id)
                data = coverage_matrix.get(outcome_id, {"matches": [], "blind_spot": True})
                
                # Filter matches by requested marks
                valid_matches = [
                    m for m in data.get("matches", []) 
                    if m['marks'] == section.marks_per_q and m['id'] not in used_pyq_ids
                ]
                
                if valid_matches:
                    # Pick best based on final_score (which already includes recency)
                    best_match = sorted(valid_matches, key=lambda x: x['final_score'], reverse=True)[0]
                    
                    section_questions.append({
                        "text": best_match['question_text'],
                        "marks": best_match['marks'],
                        "tags": ["★ HIGH FREQ"] if data.get("high_freq") else [],
                        "type": "PYQ",
                        "source": best_match['source_paper']
                    })
                    used_pyq_ids.add(best_match['id'])
                    source_papers.add(best_match['source_paper'])
                elif config.cover_all_outcomes or data.get("blind_spot"):
                    # 4. Blind-spot fallback (Using pre-initialized Groq client)
                    try:
                        messages = [
                            {"role": "system", "content": "You are an exam question writer."},
                            {"role": "user", "content": 
                                f"Generate a {section.marks_per_q}-mark exam question that tests "
                                f"this learning outcome: {outcome.text_content}. "
                                f"Return the question text only. No preamble. No numbering."
                            }
                        ]
                        
                        response = groq_client.invoke(messages)
                        llm_question = response.content.strip() if response.content else None
                    except Exception as e:
                        print(f"Error generating fallback question: {e}")
                        llm_question = None
                        
                    if llm_question:
                        section_questions.append({
                            "text": llm_question,
                            "marks": section.marks_per_q,
                            "tags": ["✦ NEW"],
                            "type": "LLM",
                            "source": None
                        })
            
            selected_questions.append({
                "config": section,
                "questions": section_questions
            })
            
        # 5. Render PDF with reportlab
        output_dir = "outputs"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{config.title.lower().replace(' ', '_')}_{timestamp}.pdf"
        filepath = os.path.join(output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        # Header
        elements.append(Paragraph(f"<b>{config.title}</b>", styles['Title']))
        elements.append(Paragraph("Model Examination Paper", styles['Heading2']))
        elements.append(Paragraph(f"Date: {datetime.date.today().strftime('%B %d, %Y')}", styles['Normal']))
        elements.append(Paragraph(f"Total Marks: {config.total_marks}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Sections
        q_count = 1
        for i, sec_group in enumerate(selected_questions):
            sec_config = sec_group['config']
            elements.append(Paragraph(f"<b>SECTION {chr(65+i)} ({sec_config.count} x {sec_config.marks_per_q} = {sec_config.count * sec_config.marks_per_q} Marks)</b>", styles['Heading3']))
            elements.append(Paragraph(f"Instructions: Answer {sec_config.count} questions. Each question carries {sec_config.marks_per_q} marks.", styles['Italic']))
            elements.append(Spacer(1, 10))
            
            for q in sec_group['questions']:
                tag_str = " ".join(q['tags'])
                q_text = f"<b>Q{q_count}.</b> {q['text']} [{q['marks']} marks] {tag_str}"
                elements.append(Paragraph(q_text, styles['Normal']))
                elements.append(Spacer(1, 12))
                q_count += 1
                
            elements.append(Spacer(1, 10))
            
        # Footer
        elements.append(Spacer(1, 30))
        sources_list = [s for s in source_papers if s]
        if sources_list:
            elements.append(Paragraph(f"Questions sourced from: {', '.join(sources_list)}", styles['Small']))
            
        doc.build(elements)
        return filepath
        
    except Exception as e:
        print(f"Error generating paper: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

