-- FILE 1: supabase/migrations/pyq_questions.sql

-- Enable pgvector extension if it doesn't already exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the pyq_questions table
CREATE TABLE IF NOT EXISTS pyq_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text text NOT NULL,
    source_paper text,
    year integer,
    exam_type text CHECK (exam_type IN ('mid_sem', 'end_sem', 'quiz')),
    marks integer,
    question_number text,
    embedding vector(384),
    created_at timestamptz DEFAULT now()
);

-- Add an ivfflat index on the embedding column for cosine similarity searches
-- Using 100 lists as requested for the initial implementation
CREATE INDEX IF NOT EXISTS pyq_questions_embedding_idx ON pyq_questions 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
