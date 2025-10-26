import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Clock, CheckCircle } from 'lucide-react';

interface Connection {
  USER_ID: number;
  F_NAME: string;
  L_NAME: string;
  HEADLINE: string;
  PROFILE_PIC_URL?: string;
  CITY?: string;
  COUNTRY?: string;
  ACCEPTED_AT?: string;
  CONNECTION_ID?: number;
  REQUESTED_AT?: string;
  mutual_connections?: number;
}

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');
  const navigate = useNavigate();
  const { toast } = useToast();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching connections data...');

      const [connectionsRes, pendingRes, sentRes, suggestionsRes] = await Promise.all([
        axios.get(`/connections/${userId}`),
        axios.get('/connections/pending/received'),
        axios.get('/connections/pending/sent'),
        axios.get('/connections/suggestions'),
      ]);

      console.log('Connections:', connectionsRes.data.length);
      console.log('Pending:', pendingRes.data.length);
      console.log('Sent:', sentRes.data.length);
      console.log('Suggestions:', suggestionsRes.data.length);

      setConnections(connectionsRes.data);
      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load connections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId: number) => {
    try {
      await axios.put(`/connections/${connectionId}/accept`, {});
      toast({ title: 'Success', description: 'Connection request accepted' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (connectionId: number) => {
    try {
      await axios.put(`/connections/${connectionId}/reject`, {});
      toast({ title: 'Success', description: 'Connection request rejected' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleSendRequest = async (receiverId: number) => {
    try {
      await axios.post('/connections/request', { receiverId });
      toast({ title: 'Success', description: 'Connection request sent' });
      fetchData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send request';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleCancelRequest = async (connectionId: number) => {
    try {
      await axios.delete(`/connections/${connectionId}`);
      toast({ title: 'Success', description: 'Connection request cancelled' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive',
      });
    }
  };

  const ConnectionCard = ({ connection, type }: { connection: Connection; type: string }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar
            className="h-16 w-16 cursor-pointer"
            onClick={() => navigate(`/profile/${connection.USER_ID}`)}
          >
            <AvatarImage src={connection.PROFILE_PIC_URL} />
            <AvatarFallback>
              {connection.F_NAME[0]}
              {connection.L_NAME[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3
              className="font-semibold text-lg cursor-pointer hover:text-blue-600"
              onClick={() => navigate(`/profile/${connection.USER_ID}`)}
            >
              {connection.F_NAME} {connection.L_NAME}
            </h3>
            <p className="text-sm text-gray-600">{connection.HEADLINE}</p>
            {connection.CITY && connection.COUNTRY && (
              <p className="text-xs text-gray-500 mt-1">
                {connection.CITY}, {connection.COUNTRY}
              </p>
            )}
            {connection.mutual_connections !== undefined && connection.mutual_connections > 0 && (
              <Badge variant="secondary" className="mt-2">
                {connection.mutual_connections} mutual connection
                {connection.mutual_connections > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {type === 'pending' && (
              <>
                <Button size="sm" onClick={() => handleAcceptRequest(connection.CONNECTION_ID!)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectRequest(connection.CONNECTION_ID!)}
                >
                  Reject
                </Button>
              </>
            )}
            {type === 'sent' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancelRequest(connection.CONNECTION_ID!)}
              >
                Cancel Request
              </Button>
            )}
            {type === 'suggestion' && (
              <Button size="sm" onClick={() => handleSendRequest(connection.USER_ID)}>
                <UserPlus className="h-4 w-4 mr-1" />
                Connect
              </Button>
            )}
            {type === 'connection' && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/profile/${connection.USER_ID}`)}>
                View Profile
              </Button>
            )}
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
              My Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="connections">
                  Connections ({connections.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="sent">
                  Sent ({sentRequests.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  Suggestions ({suggestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connections" className="space-y-4 mt-4">
                {connections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No connections yet. Start connecting with people!
                  </div>
                ) : (
                  connections.map((connection) => (
                    <ConnectionCard key={connection.USER_ID} connection={connection} type="connection" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    No pending requests
                  </div>
                ) : (
                  pendingRequests.map((connection) => (
                    <ConnectionCard key={connection.USER_ID} connection={connection} type="pending" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="sent" className="space-y-4 mt-4">
                {sentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No sent requests
                  </div>
                ) : (
                  sentRequests.map((connection) => (
                    <ConnectionCard key={connection.USER_ID} connection={connection} type="sent" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4 mt-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    No suggestions available
                  </div>
                ) : (
                  suggestions.map((connection) => (
                    <ConnectionCard key={connection.USER_ID} connection={connection} type="suggestion" />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Connections;
