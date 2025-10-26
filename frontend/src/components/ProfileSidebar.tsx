import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileSidebarProps {
  user: any;
  isLoading: boolean;
}

const ProfileSidebar = ({ user, isLoading }: ProfileSidebarProps) => {
  if (isLoading) {
    return (
      <Card>
        <div className="h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg" />
        <CardContent className="pt-0">
          <div className="flex flex-col items-center -mt-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-32 mt-4" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card className="overflow-hidden">
      {/* Banner */}
      <div className="h-16 bg-gradient-to-r from-primary/20 to-secondary/20" />
      
      <CardContent className="pt-0">
        {/* Profile Picture */}
        <div className="flex flex-col items-center -mt-10">
          <Avatar className="h-20 w-20 border-4 border-card">
            <AvatarImage src={user.PROFILE_PIC_URL} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {user.F_NAME?.[0]}{user.L_NAME?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="mt-4 font-semibold text-lg text-center">
            {user.F_NAME} {user.L_NAME}
          </h3>
          
          {user.HEADLINE && (
            <p className="text-sm text-muted-foreground text-center mt-1">
              {user.HEADLINE}
            </p>
          )}
          
          {(user.CITY || user.COUNTRY) && (
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{user.CITY}{user.CITY && user.COUNTRY && ', '}{user.COUNTRY}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Connections</span>
            <span className="font-semibold text-primary">
              <Users className="h-4 w-4 inline mr-1" />
              {user.connectionCount || 0}
            </span>
          </div>
        </div>

        <Link to={`/profile/${user.USER_ID}`}>
          <Button variant="outline" className="w-full mt-4">
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
