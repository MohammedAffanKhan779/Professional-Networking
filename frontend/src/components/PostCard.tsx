import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: any;
  onUpdate: () => void;
}

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.LIKES_COUNT || 0);
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = userId === post.USER_ID?.toString();

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post.POST_ID}/like`);
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${post.POST_ID}`);
      toast.success('Post deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const truncateContent = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card className="card-hover">
      <CardContent className="pt-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate(`/profile/${post.USER_ID}`)}
          >
            <Avatar>
              <AvatarImage src={post.PROFILE_PIC_URL} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.F_NAME?.[0]}{post.L_NAME?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold hover:text-primary">
                {post.F_NAME} {post.L_NAME}
              </p>
              {post.HEADLINE && (
                <p className="text-sm text-muted-foreground">{post.HEADLINE}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.CREATED_AT), { addSuffix: true })}
              </p>
            </div>
          </div>

          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {post.TITLE && (
            <h3 className="font-semibold text-lg mb-2">{post.TITLE}</h3>
          )}
          <p className="text-foreground whitespace-pre-wrap">
            {post.CONTENT?.length > 300 ? (
              <>
                {truncateContent(post.CONTENT, 300)}
                <button className="text-primary hover:underline ml-1">
                  See more
                </button>
              </>
            ) : (
              post.CONTENT
            )}
          </p>
        </div>

        {/* Media */}
        {post.MEDIA_URL && (
          <div className="mb-4">
            {post.POST_TYPE === 'image' ? (
              <img 
                src={post.MEDIA_URL} 
                alt="Post media" 
                className="w-full rounded-lg"
              />
            ) : post.POST_TYPE === 'video' ? (
              <video 
                src={post.MEDIA_URL} 
                controls 
                className="w-full rounded-lg"
              />
            ) : null}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-y border-border">
          <div className="flex items-center space-x-4">
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
            <span>{post.COMMENTS_COUNT || 0} comments</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-around pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? 'text-primary' : 'text-muted-foreground'}
          >
            <ThumbsUp className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
