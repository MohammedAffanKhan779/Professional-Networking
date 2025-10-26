import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import ProfileSidebar from '@/components/ProfileSidebar';
import PostCard from '@/components/PostCard';
import CreatePostCard from '@/components/CreatePostCard';
import SuggestionsCard from '@/components/SuggestionsCard';
import { Skeleton } from '@/components/ui/skeleton';

const Feed = () => {
  const { userId } = useAuthStore();
  const [page] = useState(1);

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      const { data } = await api.get(`/posts?page=${page}&limit=20`);
      return data;
    },
  });

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <ProfileSidebar user={currentUser} isLoading={userLoading} />
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-6 space-y-4">
            <CreatePostCard onPostCreated={refetchPosts} />
            
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <PostCard key={post.POST_ID} post={post} onUpdate={refetchPosts} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-lg p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Start sharing your thoughts!</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <SuggestionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
