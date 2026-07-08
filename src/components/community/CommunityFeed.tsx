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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-islamic-gold" />
        <h2 className="text-lg font-semibold text-foreground">Daily Wisdom</h2>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No posts yet. Tap "Refresh" to add wisdom!</p>
        </div>
      ) : (
        posts.slice(0, visibleCount).map((post) => {
          const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.teaching;
          const postComments = comments[post.id] || [];
          
          return (
            <div 
              key={post.id} 
              className={`bg-gradient-to-b ${typeConfig.gradient} rounded-2xl border ${typeConfig.border} overflow-hidden shadow-card`}
            >
              {/* Post Header - Like Hadith of the Day style */}
              <div className="p-4 pb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-islamic-gold to-amber-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl">{typeConfig.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{typeConfig.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-islamic-gold/10 border border-islamic-gold/20">
                    <span className="text-[10px] font-medium text-islamic-gold">MyIslam</span>
                  </div>
                </div>
              </div>

              {/* Post Content - Styled quote */}
              <div className="px-4 pb-4">
                <div className="bg-background/40 rounded-xl p-4 border border-border/50">
                  <p className={`text-foreground leading-relaxed italic text-sm ${
                    !expandedContent[post.id] ? 'line-clamp-6' : ''
                  }`}>
                    "{post.content}"
                  </p>
                  {post.content.length > 300 && (
                    <button
                      onClick={() => setExpandedContent(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-xs font-semibold text-islamic-gold mt-2 hover:underline"
                    >
                      {expandedContent[post.id] ? 'See less' : 'See more'}
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground mt-3 font-medium">
                    — {post.source}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-border/30 flex items-center gap-4 bg-background/20">
                <button
                  onClick={() => handleLike(post)}
                  aria-pressed={likedPostIds.has(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    likedPostIds.has(post.id)
                      ? 'text-red-500'
                      : 'text-muted-foreground hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likedPostIds.has(post.id) ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes_count}</span>
                </button>
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-400 transition-colors ml-auto"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Load More Button */}
      {posts.length > visibleCount && (
        <Button
          variant="outline"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full gap-2 border-border hover:bg-muted"
        >
          {loadingMore ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>Load More ({posts.length - visibleCount} remaining)</>
          )}
        </Button>
      )}
    </div>
  );
};

export default CommunityFeed;
