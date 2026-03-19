'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PostCard } from '@/components/PostCard';
import { ArrowLeft, Send, X, Heart, MessageCircle, Repeat, Share2, CornerRightDown } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useGuestMode } from '@/context/GuestModeContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url?: string | null;
    username?: string;
  };
  replies?: any[];
  votes_count?: number;
}

export default function PostCommentsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { isGuest } = useGuestMode();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUserProfile(profile);
      }
    }
    getSession();
  }, []);

  useEffect(() => {
    async function fetchPostAndComments() {
      try {
        setLoading(true);
        
        // Fetch post details
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            user:profiles(id, full_name, username, avatar_url)
          `)
          .eq('id', postId)
          .single();

        if (postError || !postData) {
          toast.error('Post not found');
          router.back();
          return;
        }
        setPost(postData);

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(full_name, avatar_url, username)
          `)
          .eq('post_id', postId)
          .is('parent_id', null)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;
        setComments(commentsData || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    }

    if (postId) fetchPostAndComments();
  }, [postId, router]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmitComment = async () => {
    if (isGuest) {
      toast('Sign up to comment', { description: 'Create an account to interact with content.' });
      return;
    }
    if (!currentUserId) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const insertData: any = {
        user_id: currentUserId,
        post_id: postId,
        content: newComment.trim(),
      };

      if (replyingTo) {
        insertData.parent_id = replyingTo.id;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert(insertData)
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id,
          user:profiles(full_name, avatar_url, username)
        `)
        .single();

      if (error) throw error;

      const newCommentData = data as any;
      const formattedComment: Comment = {
        id: newCommentData.id,
        content: newCommentData.content,
        created_at: newCommentData.created_at,
        user_id: newCommentData.user_id,
        user: Array.isArray(newCommentData.user) ? newCommentData.user[0] : newCommentData.user
      };

      if (!replyingTo) {
        setComments(prev => [...prev, formattedComment]);
      } else {
        // Handle reply logic if needed, or just refresh
        toast.success('Reply posted');
      }

      setNewComment('');
      setReplyingTo(null);
      if (commentInputRef.current) commentInputRef.current.style.height = 'auto';
      
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getAvatarUrl = (avatarPath: string | null | undefined, name: string) => {
    if (avatarPath) return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Comments</h1>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-32">
        {/* Original Post */}
        {post && (
          <div className="border-b border-black/5 dark:border-white/5">
            <PostCard {...post} isNested={true} />
          </div>
        )}

        {/* Comments List */}
        <div className="px-4 py-6 space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10">
                  <img 
                    src={getAvatarUrl(comment.user.avatar_url, comment.user.full_name)} 
                    alt={comment.user.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{comment.user.full_name}</span>
                    <span className="text-xs text-zinc-500">@{comment.user.username}</span>
                  </div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <button 
                      onClick={() => {
                        setReplyingTo({ id: comment.id, name: comment.user.full_name });
                        commentInputRef.current?.focus();
                      }}
                      className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500">
              No comments yet. Be the first to comment!
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-black/5 dark:border-white/5 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="max-w-2xl mx-auto">
          {replyingTo && (
            <div className="flex items-center justify-between py-2 px-4 bg-black/5 dark:bg-white/5">
              <span className="text-sm text-zinc-500">
                Replying to <span className="font-bold text-black dark:text-white">{replyingTo.name}</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="p-1 text-zinc-400 hover:text-black dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3">
            {currentUserProfile && (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0">
                <img 
                  src={getAvatarUrl(currentUserProfile.avatar_url, currentUserProfile.full_name)} 
                  alt={currentUserProfile.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <textarea
              ref={commentInputRef}
              rows={1}
              value={newComment}
              onChange={handleCommentChange}
              placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : 'Add a comment...'}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white px-4 py-2.5 rounded-2xl text-sm outline-none placeholder-zinc-500 resize-none max-h-32"
            />
            <button
              onClick={handleSubmitComment}
              disabled={submittingComment || !newComment.trim()}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
                submittingComment || !newComment.trim()
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  : 'bg-black dark:bg-white text-white dark:text-black'
              }`}
            >
              {submittingComment ? <Loader centered={false} className="w-4 h-4" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
