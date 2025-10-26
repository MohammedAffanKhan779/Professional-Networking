import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Activity as ActivityIcon, Heart, MessageCircle, FileText, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  ACTIVITY_ID: number;
  ACTIVITY_TYPE: 'post' | 'comment' | 'like_post' | 'like_comment' | 'connection';
  ACTIVITY_TEXT: string;
  CREATED_AT: string;
  reference_title?: string;
  post_id?: number;
}

const Activity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      console.log('Fetching activity...');
      const response = await axios.get('/posts/activity/me');
      console.log('Activity data:', response.data);
      setActivities(response.data);
    } catch (error: any) {
      console.error('Error fetching activity:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load activity',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'like_post':
      case 'like_comment':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'connection':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.ACTIVITY_TYPE) {
      case 'post':
        return 'You created a post';
      case 'comment':
        return 'You commented on a post';
      case 'like_post':
        return 'You liked a post';
      case 'like_comment':
        return 'You liked a comment';
      case 'connection':
        return 'You connected with someone';
      default:
        return 'Activity';
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-800';
      case 'comment':
        return 'bg-green-100 text-green-800';
      case 'like_post':
      case 'like_comment':
        return 'bg-red-100 text-red-800';
      case 'connection':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.post_id) {
      navigate(`/feed?postId=${activity.post_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-6 w-6" />
              Your Activity
            </CardTitle>
            <p className="text-sm text-gray-600">
              Track all your interactions and activities on ProConnect
            </p>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <ActivityIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 text-lg">No activity yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Start posting, commenting, and connecting with others!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card
                    key={activity.ACTIVITY_ID}
                    className={`hover:shadow-md transition-shadow ${
                      activity.post_id ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.ACTIVITY_TYPE)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={getActivityBadgeColor(activity.ACTIVITY_TYPE)}
                            >
                              {activity.ACTIVITY_TYPE.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.CREATED_AT), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {getActivityText(activity)}
                          </p>
                          {activity.ACTIVITY_TEXT && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {activity.ACTIVITY_TEXT}
                            </p>
                          )}
                          {activity.reference_title && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              "{activity.reference_title}"
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activity;
