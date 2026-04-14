import os
import logging
import datetime
from .models import DocumentChunk, PYQQuestion # FIXED: Use Managed Model
from .rag_service import get_embedding_model

logger = logging.getLogger(__name__)

def get_coverage_matrix(syllabus_id: str) -> list: # FIXED: Returns array not dict
    """
    Computes a coverage matrix mapping syllabus outcomes to relevant PYQ questions.
    
    Args:
        syllabus_id: The UUID of the syllabus (document).
        
    Returns:
        A list of coverage objects for the syllabus.
    """
    try:
        logger.info(f"--- [COVERAGE START] Computing Intelligence Matrix for Syllabus: {syllabus_id} ---")
        # 1. Fetch lecture plan chunks from the syllabus
        lecture_chunks = DocumentChunk.objects.filter(
            document_id=syllabus_id, 
            metadata__section='lecture_plan'
        ).only('id', 'text_content', 'embedding', 'metadata')
        
        if not lecture_chunks.exists():
            logger.warning(f"No lecture plan chunks found for syllabus_id: {syllabus_id}")
            return [] # FIXED: Return empty array 
            
        coverage_list = [] # FIXED: Use array for result
        
        from pgvector.django import CosineDistance # FIXED: Direct ORM support

        for chunk in lecture_chunks:
            chunk_id = str(chunk.id)
            vector = chunk.embedding
            topic_name = chunk.metadata.get("topic", "Exam Topic")
            
            # Construct Intelligence-driven YouTube Query (Global for all topics)
            clean_topic = topic_name.replace(" ", "+")
            youtube_url = f"https://www.youtube.com/results?search_query={clean_topic}+explained+university+lecture"

            # Matches with distance < 0.5 (Similarity > 0.5)
            matches_qs = PYQQuestion.objects.annotate(
                distance=CosineDistance('embedding', vector)
            ).filter(distance__lt=0.5).order_by('distance')[:5] 
            
            matches_list = list(matches_qs)
            
            if not matches_list:
                logger.info(f"   -> [BLIND SPOT] Topic: {topic_name}")
                coverage_list.append({
                    "id": chunk_id,
                    "lecture_number": chunk.metadata.get("lecture_number"),
                    "topic": topic_name,
                    "co_mapped": chunk.metadata.get("co_mapped"),
                    "matches": [],
                    "match_count": 0,
                    "blind_spot": True,
                    "is_high_frequency": False,
                    "difficulty": "BASIC", # Blind spots default to basic until matched
                    "youtube_url": youtube_url,
                    "coverage_strength": "LOW"
                })
                continue
            
            match_data = []
            unique_years = set()
            seen_texts = set() # FIXED: De-duplication set
            
            # 3. Process matches
            for m in matches_list:
                # Normalize text for de-duplication
                norm_text = m.question_text.lower().strip()
                if norm_text in seen_texts:
                    continue
                seen_texts.add(norm_text)

                if m.year:
                    recency = max(0.5, 1.0 - ((2025 - m.year) * 0.1))
                    unique_years.add(m.year)
                else:
                    recency = 0.5
                    
                similarity = 1 - m.distance
                final_score = (similarity * 0.7) + (recency * 0.3)
                
                match_data.append({
                    "id": str(m.id),
                    "question_text": m.question_text,
                    "year": m.year,
                    "marks": m.marks,
                    "source_paper": m.source_paper,
                    "similarity": float(similarity),
                    "recency": float(recency),
                    "final_score": float(final_score),
                })
            
            # 5. Determine Difficulty Heuristic: 
            # High marks average (>10) = COMPLEX, Moderate (5-10) = INTERMEDIATE, Low (<5) = BASIC
            total_marks = sum([m.marks for m in matches_list if m.marks])
            avg_marks = total_marks / len(matches_list) if matches_list else 0
            
            difficulty = "BASIC"
            if avg_marks > 12: difficulty = "COMPLEX"
            elif avg_marks > 6: difficulty = "INTERMEDIATE"

            # 6. Construct Intelligence-driven YouTube Query
            # We use the topic name + a general academic suffix
            clean_topic = chunk.metadata.get("topic", "Exam Topic").replace(" ", "+")
            youtube_url = f"https://www.youtube.com/results?search_query={clean_topic}+explained+university+lecture"

            coverage_list.append({ # FIXED: Append to list
                "id": chunk_id,
                "lecture_number": chunk.metadata.get("lecture_number"),
                "topic": chunk.metadata.get("topic"),
                "co_mapped": chunk.metadata.get("co_mapped"),
                "matches": match_data,
                "match_count": len(match_data),
                "blind_spot": False,
                "is_high_frequency": len(unique_years) >= 3,
                "difficulty": difficulty,
                "youtube_url": youtube_url,
                "coverage_strength": "HIGH" if len(match_data) >= 3 else "MED" if len(match_data) > 0 else "LOW"
            })
                
        return coverage_list
        
    except Exception as e:
        logger.error(f"Error in get_coverage_matrix for syllabus {syllabus_id}: {str(e)}", exc_info=True)
        return []
