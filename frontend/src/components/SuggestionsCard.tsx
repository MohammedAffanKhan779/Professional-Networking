import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

const SuggestionsCard = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      // Filter out current user
      return data.filter((user: any) => user.USER_ID?.toString() !== userId).slice(0, 5);
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      await api.post('/connections/request', { receiverId });
    },
    onSuccess: () => {
      toast.success('Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: () => {
      toast.error('Failed to send connection request');
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">People you may know</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">People you may know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((user: any) => (
          <div key={user.USER_ID} className="flex items-start justify-between">
            <div 
              className="flex items-start space-x-3 cursor-pointer flex-1"
              onClick={() => navigate(`/profile/${user.USER_ID}`)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.PROFILE_PIC_URL} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.F_NAME?.[0]}{user.L_NAME?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm hover:text-primary truncate">
                  {user.F_NAME} {user.L_NAME}
                </p>
                {user.HEADLINE && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {user.HEADLINE}
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => connectMutation.mutate(user.USER_ID.toString())}
              disabled={connectMutation.isPending}
              className="ml-2 shrink-0"
            >
              Connect
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuggestionsCard;
