'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PostCard } from '@/components/PostCard';
import { BottomNav } from '@/components/BottomNav';
import { Share2, MessageCircle, Settings2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MainMenu } from '@/components/MainMenu';
import { Loader } from '@/components/ui/loader';
import { PostSkeleton } from '@/components/PostSkeleton';
import { toast } from 'sonner';
import Link from 'next/link';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const PAGE_SIZE = 10;

type Post = {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  user: { id: string; full_name: string; username: string; avatar_url: string | null; identity_tag?: string | null };
  user_id?: string;
  community?: { id: string; name: string };
  created_at: string;
  is_community_post?: boolean;
  isFollower?: boolean;
  [key: string]: unknown;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string;
  avatar_url: string | null;
  [key: string]: unknown;
};

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);
  const [feedMode, setFeedMode] = useState<'trending' | 'explore' | 'following' | 'sharable' | 'communities'>('trending');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  const observer = useRef<IntersectionObserver | null>(null);

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const fetchPosts = useCallback(async (currentOffset: number, mode: typeof feedMode, isLoadMore: boolean = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (user && !profile && !isLoadMore) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (profileData) setProfile(profileData);

        // Fetch user's following list
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followsData) {
          setFollowingIds(new Set(followsData.map(f => f.following_id)));
        }
      }

      let fetchedPosts: Post[] = [];

        if (mode === 'communities') {
          // Fetch user's community posts
          if (!user) {
            setHasMore(false);
            fetchedPosts = [];
          } else {
            // Get user's communities
            const { data: userCommunities } = await supabase
              .from('community_members')
              .select('community_id')
              .eq('user_id', user.id);

            const communityIds = (userCommunities || []).map(m => m.community_id);

            if (communityIds.length === 0) {
              fetchedPosts = [];
            } else {
              // Get posts from user's communities
              const { data, error } = await supabase
                .from('community_posts')
                .select(`
                  *,
                  user:profiles!inner(id, full_name, username, avatar_url, identity_tag, is_deactivated),
                  community:communities(id, name),
                  likes:community_post_likes(count),
                  comments:community_post_comments(count)
                `)
                .in('community_id', communityIds)
                // .eq('is_approved', true) // Removed filter to show all posts as requested
                .eq('user.is_deactivated', false)
                .order('created_at', { ascending: false })
                .range(currentOffset, currentOffset + PAGE_SIZE - 1);

              if (error) throw error;
	              fetchedPosts = (data || []).map(post => ({
	                ...post,
	                id: post.id,
	                content: post.content,
	                media_url: post.media_url,
	                media_type: post.media_type,
	                media_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
	                media_types: post.media_types || (post.media_type ? [post.media_type] : []),
	                user: post.user,
	                community: post.community,
	                created_at: post.created_at,
	                is_community_post: true,
	              }));
            }
          }
        } else if (mode === 'trending') {
          // Use RPC for trending posts
          const { data, error } = await supabase.rpc('get_trending_posts', {
            limit_count: PAGE_SIZE,
            offset_count: currentOffset
          });

          if (error) throw error;
          fetchedPosts = (data || []).map((post: any) => {
            const urls = Array.isArray(post.media_urls) && post.media_urls.length > 0
              ? post.media_urls
              : post.media_url ? [post.media_url] : [];
            const types = Array.isArray(post.media_types) && post.media_types.length > 0
              ? post.media_types
              : post.media_type ? [post.media_type] : urls.map(() => 'image');
            return { ...post, media_urls: urls, media_types: types };
          });
        } else {
          let query = supabase
            .from('posts')
            .select(`
              *,
              user:profiles!inner(full_name, avatar_url, username, identity_tag, is_deactivated),
              original_post:reposted_id(
                *,
                user:profiles(full_name, avatar_url, username, identity_tag)
              )
            `)
            .eq('user.is_deactivated', false);

          if (mode === 'following') {
            if (!user) {
              query = query.order('created_at', { ascending: false });
            } else {
              const { data: followsData, error: followsError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

              if (followsError) throw followsError;

              const followingIds = (followsData || []).map(f => f.following_id);
              query = query
                .in('user_id', [...followingIds, user.id])
                .order('created_at', { ascending: false });
            }
          } else if (mode === 'sharable') {
            // Explicitly filter by official account and sort by newest
            query = query
              .eq('user.username', 'sharable')
              .order('created_at', { ascending: false });
          } else {
            // Explore - show newest posts from everyone
            query = query.order('created_at', { ascending: false });
          }

          query = query.range(currentOffset, currentOffset + PAGE_SIZE - 1);
          const { data, error } = await query;
          if (error) throw error;
          fetchedPosts = (data || []).map((post: any) => ({
            ...post,
            media_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
            media_types: post.media_types || (post.media_type ? [post.media_type] : []),
          }));

          // Also fetch community posts for explore and following modes
          if (mode === 'explore' || mode === 'following') {
            let communityQuery = supabase
              .from('community_posts')
              .select(`
                *,
                user:profiles!inner(id, full_name, username, avatar_url, identity_tag, is_deactivated),
                community:communities(id, name),
                likes:community_post_likes(count),
                comments:community_post_comments(count)
              `)
              // .eq('is_approved', true) // Removed filter to show all posts as requested
              .eq('user.is_deactivated', false);

            if (mode === 'following' && user) {
              // For following mode, only show community posts from people you follow
              const { data: followsData } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);
              const followingIds = (followsData || []).map(f => f.following_id);
              communityQuery = communityQuery.in('user_id', [...followingIds, user.id]);
            }

            const { data: communityData } = await communityQuery
              .order('created_at', { ascending: false })
              .range(currentOffset, currentOffset + PAGE_SIZE - 1);

            if (communityData) {
	              const formattedCommunityPosts = communityData.map(post => ({
	                ...post,
	                media_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
	                media_types: post.media_types || (post.media_type ? [post.media_type] : []),
	                is_community_post: true,
	              }));
              fetchedPosts = [...fetchedPosts, ...formattedCommunityPosts]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, PAGE_SIZE);
            }
          }
        }

      if (isLoadMore) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }

      setHasMore(fetchedPosts.length === PAGE_SIZE);
      setOffset(currentOffset + fetchedPosts.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to load posts: ' + errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [profile, feedMode]);

    useEffect(() => {
      setOffset(0);
      setHasMore(true);
      fetchPosts(0, feedMode);

      // Set up Realtime for posts
      const channel = supabase
        .channel('public:posts')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            // When a new post is added, refresh the first page
            fetchPosts(0, feedMode);
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted post from state
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            // Update modified post in state
            setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [feedMode, fetchPosts]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchPosts(offset, feedMode, true);
  }, [loadingMore, hasMore, offset, feedMode, fetchPosts]);

  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMorePosts]);

  const avatarSrc = profile?.avatar_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : profile?.full_name
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;

  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black"
      style={{ touchAction: 'pan-y' }}
      onPanStart={() => setIsGesturing(true)}
      onPanEnd={(e, info) => {
        if (!isGesturing) return;
        setIsGesturing(false);
        const isHorizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
        if (isHorizontal) {
          if (info.offset.x > 50 && !mainMenuOpen) setMainMenuOpen(true);
          if (info.offset.x < -50 && mainMenuOpen) setMainMenuOpen(false);
        }
      }}
    >
      <MainMenu
        open={mainMenuOpen}
        onClose={() => setMainMenuOpen(false)}
        avatarSrc={avatarSrc}
        feedMode={feedMode}
        onFeedModeChange={(mode) => setFeedMode(mode)}
      />

      <header className={`fixed top-0 left-0 right-0 h-16 z-50 px-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b-0 transition-transform duration-300 ${
        useScrollDirection() ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="h-full flex items-center justify-between">
          <button
            onClick={() => setMainMenuOpen(true)}
            className="p-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <Settings2 size={24} strokeWidth={1.5} />
          </button>

          <div className="flex-1 flex justify-center">
            <Share2
              size={24}
              strokeWidth={1.5}
              className="text-black dark:text-white cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>

          <button
            onClick={() => router.push('/messages')}
            className="p-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <MessageCircle size={24} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main
        className="max-w-xl mx-auto pt-16 pb-20"
      >
        <div className="px-4 py-4 flex items-center gap-3 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <img
              src={avatarSrc}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <Link
            href="/post/create"
            className="flex-1 h-11 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center px-5 text-zinc-500 text-[15px] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Anything Sharable today?
          </Link>
        </div>

        <div className="flex flex-col">
          {posts.map((post, index) => (
            <div
              key={`${post.id}-${index}`}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <PostCard
                {...post}
                onDelete={handleDeletePost}
                avatarSize={40}
                isFollower={post.user_id ? followingIds.has(post.user_id) : false}
              />
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
              <PostSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {!loading && loadingMore && (
          <div className="py-4">
            <Loader />
          </div>
        )}

        {!loading && !loadingMore && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No posts yet</h3>
            <p className="text-zinc-500 max-w-[240px]">Be the first to share something with the world!</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="py-12 text-center text-zinc-500 text-sm font-medium">
            🌸
          </div>
        )}
      </main>

      <BottomNav />
    </motion.div>
  );
}
