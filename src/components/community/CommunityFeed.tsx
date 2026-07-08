import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Share2, Send, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  post_type: string;
  source: string;
  likes_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const POST_TYPE_CONFIG: Record<string, { label: string; icon: string; gradient: string; border: string }> = {
  teaching: { 
    label: 'Daily Teaching', 
    icon: '📖', 
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30'
  },
  qa: { 
    label: 'Q&A', 
    icon: '❓', 
    gradient: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/30'
  },
  hadith: { 
    label: 'Hadith of the Day', 
    icon: '📜', 
    gradient: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30'
  },
  verse: { 
    label: 'Quranic Verse', 
    icon: '✨', 
    gradient: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30'
  },
  story: { 
    label: 'Prophet Story', 
    icon: '📚', 
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/30'
  },
};

const INITIAL_VISIBLE = 3;
const LIKED_POSTS_KEY = 'myislam_liked_community_posts';

const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

  const seedingRef = useRef(false);

  // Fetch posts (auto-seeds when empty)
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      const list = (data as Post[]) || [];
      setPosts(list);

      if (list.length === 0 && !seedingRef.current) {
        seedingRef.current = true;
        try {
          await Promise.all([
            supabase.functions.invoke('generate-community-post'),
            supabase.functions.invoke('generate-community-post'),
            supabase.functions.invoke('generate-community-post'),
          ]);
          const { data: refreshed } = await supabase
            .from('community_posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
          setPosts((refreshed as Post[]) || []);
        } catch (e) {
          console.warn('Auto-seed failed:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: (data as Comment[]) || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const postsChannel = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        setPosts(prev => [payload.new as Post, ...prev]);
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('community_comments_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_comments' }, (payload) => {
        const newComment = payload.new as Comment;
        setComments(prev => ({
          ...prev,
          [newComment.post_id]: [...(prev[newComment.post_id] || []), newComment],
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [fetchPosts]);

  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: lazy-load more posts when sentinel enters view
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= posts.length) return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loadingMore) {
        setLoadingMore(true);
        window.setTimeout(() => {
          setVisibleCount((prev) => prev + 3);
          setLoadingMore(false);
        }, 500);
      }
    }, { rootMargin: '400px 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, [visibleCount, posts.length, loadingMore]);

  const handleExpandComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleSubmitComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    const name = 'Anonymous';

    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          content,
          author_name: name,
          user_id: session?.session?.user?.id || null,
        });

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async (post: Post) => {
    const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.teaching;
    const shareText = `${typeConfig.icon} ${typeConfig.label}\n\n"${post.content}"\n\n— ${post.source}\n\n📱 Shared via MyIslam App\n🌙 Your daily source of Islamic wisdom`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: `${typeConfig.label} - MyIslam App`, text: shareText });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  const persistLikedPostIds = (next: Set<string>) => {
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(Array.from(next)));
  };

  const handleLike = async (post: Post) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Please sign in to like posts.');
      return;
    }

    const wasLiked = likedPostIds.has(post.id);
    const optimisticLiked = !wasLiked;
    const optimisticDelta = optimisticLiked ? 1 : -1;

    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (optimisticLiked) {
        next.add(post.id);
      } else {
        next.delete(post.id);
      }
      persistLikedPostIds(next);
      return next;
    });

    setPosts(prev =>
      prev.map(item =>
        item.id === post.id
          ? { ...item, likes_count: Math.max(item.likes_count + optimisticDelta, 0) }
          : item,
      ),
    );

    // Likes are tracked locally via likedPostIds (persisted to localStorage).
    // Server-side like aggregation is not yet implemented.
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border">
            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
            <div className="h-24 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-4 h-4 text-islamic-gold" />
        <h2 className="text-sm font-semibold text-foreground">Daily Wisdom</h2>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No posts yet. Tap "Refresh" to add wisdom!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.slice(0, visibleCount).map((post) => {
            const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.teaching;
            const postComments = comments[post.id] || [];
            const isLiked = likedPostIds.has(post.id);
            const isCommentsOpen = expandedPost === post.id;

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm animate-fade-in"
              >
                {/* Post header — avatar / label / time */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-islamic-gold to-amber-600 flex items-center justify-center ring-2 ring-amber-300 ring-offset-1 text-sm">
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate">MyIslam · {typeConfig.label}</p>
                    <p className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    Wisdom
                  </span>
                </div>

                {/* Hero — gradient banner styled like Discover image */}
                <div className={`w-full bg-gradient-to-br ${typeConfig.gradient} border-y ${typeConfig.border} px-5 py-8 flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{typeConfig.icon}</div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">{typeConfig.label}</p>
                  </div>
                </div>

                {/* Actions bar (Instagram-style) */}
                <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                  <button
                    onClick={() => handleLike(post)}
                    aria-pressed={isLiked}
                    className={`p-2 rounded-full transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                  </button>
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 -ml-1">{post.likes_count}</span>
                  <button
                    onClick={() => handleExpandComments(post.id)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-90 relative ml-2"
                  >
                    <Send className="w-5 h-5" />
                    {postComments.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white bg-amber-500 rounded-full w-4 h-4 flex items-center justify-center">
                        {postComments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-90"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption */}
                <div className="px-3 pb-3">
                  <p className="text-[12px] font-semibold text-gray-900 dark:text-white mb-0.5">MyIslam</p>
                  <p className={`text-[12px] text-gray-800 dark:text-gray-200 leading-relaxed font-medium italic ${
                    !expandedContent[post.id] ? 'line-clamp-4' : ''
                  }`}>
                    "{post.content}"
                  </p>
                  {post.content.length > 220 && (
                    <button
                      onClick={() => setExpandedContent(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-[11px] text-islamic-gold font-semibold mt-1"
                    >
                      {expandedContent[post.id] ? 'See less' : 'See more'}
                    </button>
                  )}
                  <p className="text-[10.5px] text-muted-foreground mt-2">— {post.source}</p>
                </div>

                {/* Comments */}
                {isCommentsOpen && (
                  <div className="border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-3 py-3 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Comments · {postComments.length}
                    </p>
                    {postComments.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            {c.author_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 bg-white dark:bg-white/5 rounded-2xl px-3 py-2 border border-gray-100 dark:border-white/10">
                          <p className="text-[10.5px] font-semibold text-gray-900 dark:text-white">{c.author_name}</p>
                          <p className="text-[11.5px] text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a comment…"
                        className="h-9 text-xs rounded-full bg-white dark:bg-white/5"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(post.id); }}
                      />
                      <button
                        onClick={() => handleSubmitComment(post.id)}
                        className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite scroll sentinel + shimmer */}
      {posts.length > visibleCount && (
        <div ref={sentinelRef} className="py-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-islamic-gold animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-islamic-gold animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-islamic-gold animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-[11px] text-muted-foreground">Loading more wisdom…</p>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
