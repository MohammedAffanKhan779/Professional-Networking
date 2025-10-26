import { useState } from 'react';
import { Image, Video, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import CreatePostModal from './CreatePostModal';

interface CreatePostCardProps {
  onPostCreated: () => void;
}

const CreatePostCard = ({ onPostCreated }: CreatePostCardProps) => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.profilePicUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 text-left px-4 py-3 rounded-full border border-input bg-background hover:bg-muted/50 transition-colors text-muted-foreground"
            >
              Start a post...
            </button>
          </div>

          <div className="flex items-center justify-around mt-4 pt-4 border-t border-border">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Image className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Photo</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Video className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Video</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Article</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={() => {
          onPostCreated();
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default CreatePostCard;
