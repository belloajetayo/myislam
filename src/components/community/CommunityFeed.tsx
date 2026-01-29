import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, RefreshCw, Sparkles, Send } from 'lucide-react';
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

const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  teaching: { label: '📖 Teaching', color: 'bg-emerald-500/20 text-emerald-400' },
  qa: { label: '❓ Q&A', color: 'bg-blue-500/20 text-blue-400' },
  hadith: { label: '📜 Hadith', color: 'bg-amber-500/20 text-amber-400' },
  verse: { label: '✨ Quran', color: 'bg-purple-500/20 text-purple-400' },
};

const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [authorName, setAuthorName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts((data as Post[]) || []);
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

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-community-post');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate');
      toast.success('New post generated!');
    } catch (error: any) {
      console.error('Error generating post:', error);
      toast.error(error.message || 'Failed to generate post');
    } finally {
      setIsGenerating(false);
    }
  };

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

    const name = authorName.trim() || 'Anonymous';

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
    const shareText = `${post.content}\n\n— ${post.source}\n📱 MyIslam App`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Islamic Teaching', text: shareText });
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

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-2xl p-4 border border-border">
            <div className="h-4 bg-muted rounded w-1/4 mb-3" />
            <div className="h-20 bg-muted rounded mb-3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-islamic-gold" />
          <h2 className="text-lg font-semibold text-foreground">Community Feed</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGeneratePost}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate
        </Button>
      </div>

      {/* Author Name Input */}
      <div className="bg-card rounded-xl p-3 border border-border">
        <Input
          placeholder="Your display name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="bg-background/50"
        />
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Click "Generate" to create the first one!</p>
        </div>
      ) : (
        posts.map((post) => {
          const typeInfo = POST_TYPE_LABELS[post.post_type] || POST_TYPE_LABELS.teaching;
          const postComments = comments[post.id] || [];
          
          return (
            <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Post Header */}
              <div className="p-4 pb-2 flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-islamic-gold/20">
                  <AvatarFallback className="bg-islamic-gold/20 text-islamic-gold font-semibold">
                    MI
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">MyIslam AI</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 py-2 border-t border-border/50 flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes_count}</span>
                </button>
                <button
                  onClick={() => handleExpandComments(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    expandedPost === post.id ? 'text-islamic-gold' : 'text-muted-foreground hover:text-islamic-gold'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{postComments.length}</span>
                </button>
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="border-t border-border/50 bg-muted/30">
                  {/* Comments List */}
                  {postComments.length > 0 && (
                    <div className="p-4 space-y-3">
                      {postComments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-secondary">
                              {comment.author_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-background/50 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">
                                {comment.author_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90 mt-0.5">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="p-4 pt-2 flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                      className="flex-1 bg-background"
                    />
                    <Button
                      size="icon"
                      onClick={() => handleSubmitComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CommunityFeed;
