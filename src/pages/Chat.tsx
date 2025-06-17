
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';
import ChatDemo from '@/components/ChatDemo';

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-bg text-white flex items-center justify-center">
        <div className="film-grain"></div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cinema-red mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-bg text-white flex flex-col">
      <div className="film-grain"></div>
      
      {/* Header for chat page */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md flex-shrink-0">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative overflow-hidden rounded-full p-0.5 bg-gradient-to-r from-cinema-red to-cinema-red/70">
              <div className="bg-black rounded-full p-1">
                <Film className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">classic</span>
              <span className="text-cinema-red">shit.com</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => navigate('/account')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Account
            </Button>
          </div>
        </div>
      </header>

      {/* Full-screen chat interface - removed footer for full viewport height */}
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto py-8 flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold heading-gradient mb-4">AI Movie Picker</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Get personalized movie recommendations from our AI assistant.
            </p>
          </div>
          
          <div className="flex-1">
            <ChatDemo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
