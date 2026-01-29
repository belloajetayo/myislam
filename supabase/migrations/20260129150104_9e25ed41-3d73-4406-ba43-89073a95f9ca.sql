-- Create table for AI-generated Islamic posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'teaching', -- 'teaching', 'qa', 'hadith', 'verse'
  source TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for comments (anyone can comment)
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Posts are publicly readable
CREATE POLICY "Anyone can view posts" ON public.community_posts
  FOR SELECT USING (true);

-- Only system can insert posts (via edge function)
CREATE POLICY "System can insert posts" ON public.community_posts
  FOR INSERT WITH CHECK (true);

-- Comments are publicly readable
CREATE POLICY "Anyone can view comments" ON public.community_comments
  FOR SELECT USING (true);

-- Anyone can insert comments
CREATE POLICY "Anyone can insert comments" ON public.community_comments
  FOR INSERT WITH CHECK (true);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;