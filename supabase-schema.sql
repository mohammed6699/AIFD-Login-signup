-- Polling App Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE poll_status AS ENUM ('active', 'closed', 'draft');

-- Create polls table
CREATE TABLE polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question TEXT NOT NULL,
    status poll_status DEFAULT 'active',
    allow_multiple_votes BOOLEAN DEFAULT false,
    max_votes_per_option INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT true,
    share_token VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::text
);

-- Create poll_options table
CREATE TABLE poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(500) NOT NULL,
    option_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    voter_email VARCHAR(255), -- For anonymous voting
    voter_name VARCHAR(255), -- For anonymous voting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, option_id, voter_id),
    UNIQUE(poll_id, option_id, voter_email)
);

-- Create indexes for better performance
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_share_token ON polls(share_token);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for polls table
CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON polls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls table
CREATE POLICY "Polls are viewable by everyone" ON polls
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON polls
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for poll_options table
CREATE POLICY "Poll options are viewable by everyone" ON poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = poll_options.poll_id 
            AND (polls.is_public = true OR polls.created_by = auth.uid())
        )
    );

CREATE POLICY "Poll creators can manage options" ON poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

-- RLS Policies for votes table
CREATE POLICY "Votes are viewable by poll creator" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = votes.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Anyone can vote on public polls" ON votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = votes.poll_id 
            AND polls.is_public = true
            AND polls.status = 'active'
            AND (polls.expires_at IS NULL OR polls.expires_at > NOW())
        )
    );

-- Create view for poll results
CREATE VIEW poll_results AS
SELECT 
    p.id as poll_id,
    p.title as poll_title,
    p.question as poll_question,
    po.id as option_id,
    po.option_text,
    po.option_order,
    COUNT(v.id) as vote_count,
    ROUND(
        (COUNT(v.id) * 100.0 / NULLIF((
            SELECT COUNT(*) 
            FROM votes v2 
            WHERE v2.poll_id = p.id
        ), 0)), 2
    ) as vote_percentage
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON po.id = v.option_id
GROUP BY p.id, p.title, p.question, po.id, po.option_text, po.option_order
ORDER BY p.id, po.option_order;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create function to get poll with options and votes
CREATE OR REPLACE FUNCTION get_poll_with_results(poll_uuid UUID)
RETURNS TABLE (
    poll_id UUID,
    title VARCHAR(255),
    description TEXT,
    question TEXT,
    status poll_status,
    allow_multiple_votes BOOLEAN,
    max_votes_per_option INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN,
    share_token VARCHAR(255),
    total_votes BIGINT,
    options JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.question,
        p.status,
        p.allow_multiple_votes,
        p.max_votes_per_option,
        p.created_by,
        p.created_at,
        p.expires_at,
        p.is_public,
        p.share_token,
        COALESCE(vote_counts.total_votes, 0) as total_votes,
        COALESCE(options_json.options, '[]'::json) as options
    FROM polls p
    LEFT JOIN (
        SELECT poll_id, COUNT(*) as total_votes
        FROM votes
        WHERE poll_id = poll_uuid
        GROUP BY poll_id
    ) vote_counts ON p.id = vote_counts.poll_id
    LEFT JOIN (
        SELECT 
            poll_id,
            json_agg(
                json_build_object(
                    'id', po.id,
                    'option_text', po.option_text,
                    'option_order', po.option_order,
                    'vote_count', COALESCE(vc.vote_count, 0),
                    'vote_percentage', COALESCE(vc.vote_percentage, 0)
                ) ORDER BY po.option_order
            ) as options
        FROM poll_options po
        LEFT JOIN (
            SELECT 
                option_id,
                COUNT(*) as vote_count,
                ROUND(
                    (COUNT(*) * 100.0 / NULLIF((
                        SELECT COUNT(*) 
                        FROM votes v2 
                        WHERE v2.poll_id = poll_uuid
                    ), 0)), 2
                ) as vote_percentage
            FROM votes
            WHERE poll_id = poll_uuid
            GROUP BY option_id
        ) vc ON po.id = vc.option_id
        WHERE po.poll_id = poll_uuid
        GROUP BY poll_id
    ) options_json ON p.id = options_json.poll_id
    WHERE p.id = poll_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
