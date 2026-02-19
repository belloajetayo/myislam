
-- Fix overly permissive RLS policies

-- 1. chat_messages: require authenticated user for INSERT
DROP POLICY "Anyone can insert chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can insert chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2. community_comments: require authenticated user for INSERT  
DROP POLICY "Anyone can insert comments" ON public.community_comments;
CREATE POLICY "Authenticated users can insert comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. community_posts: only service role should insert (AI-generated posts)
DROP POLICY "System can insert posts" ON public.community_posts;
CREATE POLICY "Service role can insert posts" ON public.community_posts
  FOR INSERT WITH CHECK (false);
-- Note: Edge functions using service_role key bypass RLS, so this effectively 
-- blocks client-side inserts while allowing server-side (edge function) inserts.
