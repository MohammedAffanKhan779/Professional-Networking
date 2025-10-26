import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugAuth = () => {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      console.log('Token:', token?.substring(0, 30) + '...');
      console.log('UserId from localStorage:', userId);
      
      // axios instance automatically adds the token via interceptor
      const response = await axios.get('/connections/debug/auth');
      
      console.log('Debug response:', response.data);
      setDebugData(response.data);
    } catch (error: any) {
      console.error('Debug error:', error);
      console.error('Error details:', error.response);
      setDebugData({ 
        error: error.response?.data || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">LocalStorage Data:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify({
                  userId: localStorage.getItem('userId'),
                  token: localStorage.getItem('token')?.substring(0, 50) + '...',
                  hasToken: !!localStorage.getItem('token')
                }, null, 2)}
              </pre>
            </div>

            <Button onClick={checkAuth} disabled={loading}>
              {loading ? 'Checking...' : 'Refresh Debug Data'}
            </Button>

            {debugData && (
              <div>
                <h3 className="font-semibold mb-2">Server Response:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">What to check:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>authenticatedUserId should match your localStorage userId</li>
                <li>sentRequests should show connections where you are REQUEST_ID</li>
                <li>receivedRequests should show connections where you are RECEIVER_ID</li>
                <li>If authenticatedUserId is different, your token is for a different user</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuth;
