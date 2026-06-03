CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS community_post_likes_user_unique
  ON public.community_post_likes (post_id, user_id);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post likes"
  ON public.community_post_likes
  FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.toggle_community_post_like(
  post_id_input UUID
)
RETURNS TABLE(liked BOOLEAN, likes_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_like_id UUID;
  next_likes_count INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to like posts';
  END IF;

  SELECT id INTO existing_like_id
  FROM public.community_post_likes
  WHERE post_id = post_id_input
    AND user_id = current_user_id
  LIMIT 1;

  IF existing_like_id IS NOT NULL THEN
    DELETE FROM public.community_post_likes WHERE id = existing_like_id;

    UPDATE public.community_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = post_id_input
    RETURNING community_posts.likes_count INTO next_likes_count;

    RETURN QUERY SELECT false, COALESCE(next_likes_count, 0);
  ELSE
    INSERT INTO public.community_post_likes (post_id, user_id)
    VALUES (post_id_input, current_user_id);

    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = post_id_input
    RETURNING community_posts.likes_count INTO next_likes_count;

    RETURN QUERY SELECT true, COALESCE(next_likes_count, 0);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.toggle_community_post_like(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.toggle_community_post_like(UUID) TO authenticated;
