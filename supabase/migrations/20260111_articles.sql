
-- Articles Table for CMS
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL, -- Markdown or HTML
    cover_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage articles" 
ON articles 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE)
);

CREATE POLICY "Public can read published articles" 
ON articles FOR SELECT
USING (is_published = TRUE);
