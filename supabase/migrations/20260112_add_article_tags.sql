-- Add tags column to articles
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for faster array searching
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);
