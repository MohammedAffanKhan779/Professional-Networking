import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, UserPlus, UserCheck, Clock, UserX } from 'lucide-react';

interface User {
  USER_ID: number;
  F_NAME: string;
  L_NAME: string;
  HEADLINE: string;
  PROFILE_PIC_URL?: string;
  CITY?: string;
  COUNTRY?: string;
  INDUSTRY?: string;
  connectionStatus?: 'not_connected' | 'pending' | 'accepted' | 'sent';
  CONNECTION_ID?: number;
}

const People = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.F_NAME.toLowerCase().includes(query) ||
          user.L_NAME.toLowerCase().includes(query) ||
          user.HEADLINE?.toLowerCase().includes(query) ||
          user.INDUSTRY?.toLowerCase().includes(query) ||
          user.CITY?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/all');
      
      // Filter out current user and fetch connection status for each
      const otherUsers = response.data.filter(
        (user: User) => user.USER_ID.toString() !== currentUserId
      );

      // Fetch connection status for all users
      const usersWithStatus = await Promise.all(
        otherUsers.map(async (user: User) => {
          try {
            const statusRes = await axios.get(`/connections/status/${user.USER_ID}`);
            return { ...user, connectionStatus: statusRes.data.status };
          } catch (error) {
            return { ...user, connectionStatus: 'not_connected' };
          }
        })
      );

      setUsers(usersWithStatus);
      setFilteredUsers(usersWithStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: number) => {
    try {
      await axios.post('/connections/request', { receiverId: userId });
      toast({ title: 'Success', description: 'Connection request sent' });
      
      // Update user status locally
      setUsers(users.map(u => 
        u.USER_ID === userId ? { ...u, connectionStatus: 'sent' } : u
      ));
      setFilteredUsers(filteredUsers.map(u => 
        u.USER_ID === userId ? { ...u, connectionStatus: 'sent' } : u
      ));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to send request',
        variant: 'destructive',
      });
    }
  };

  const getConnectionButton = (user: User) => {
    switch (user.connectionStatus) {
      case 'accepted':
        return (
          <Button size="sm" variant="outline" disabled>
            <UserCheck className="h-4 w-4 mr-1" />
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button size="sm" variant="outline" disabled>
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </Button>
        );
      case 'sent':
        return (
          <Button size="sm" variant="outline" disabled>
            <Clock className="h-4 w-4 mr-1" />
            Request Sent
          </Button>
        );
      default:
        return (
          <Button size="sm" onClick={() => handleConnect(user.USER_ID)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Connect
          </Button>
        );
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar
            className="h-16 w-16 cursor-pointer"
            onClick={() => navigate(`/profile/${user.USER_ID}`)}
          >
            <AvatarImage src={user.PROFILE_PIC_URL} />
            <AvatarFallback>
              {user.F_NAME[0]}
              {user.L_NAME[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3
              className="font-semibold text-lg cursor-pointer hover:text-blue-600"
              onClick={() => navigate(`/profile/${user.USER_ID}`)}
            >
              {user.F_NAME} {user.L_NAME}
            </h3>
            <p className="text-sm text-gray-600">{user.HEADLINE}</p>
            {user.INDUSTRY && (
              <Badge variant="secondary" className="mt-1">
                {user.INDUSTRY}
              </Badge>
            )}
            {user.CITY && user.COUNTRY && (
              <p className="text-xs text-gray-500 mt-1">
                {user.CITY}, {user.COUNTRY}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {getConnectionButton(user)}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/profile/${user.USER_ID}`)}
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Discover People
            </CardTitle>
            <p className="text-sm text-gray-600">
              Find and connect with professionals
            </p>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, headline, industry, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your search query
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <UserCard key={user.USER_ID} user={user} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default People;
