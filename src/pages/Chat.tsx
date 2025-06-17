
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
    <div className="h-screen w-screen bg-cinema-bg text-white flex flex-col overflow-hidden">
      <div className="film-grain"></div>
      
      {/* Fixed header at top */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md flex-shrink-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
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

      {/* Full-screen chat body that fills remaining viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Title section - compact */}
        <div className="px-4 py-6 text-center flex-shrink-0">
          <h1 className="text-3xl font-bold heading-gradient mb-2">AI Movie Picker</h1>
          <p className="text-white/70">
            Get personalized movie recommendations from our AI assistant.
          </p>
        </div>
        
        {/* Chat interface fills remaining space */}
        <div className="flex-1 overflow-hidden">
          <ChatDemo />
        </div>
      </div>
    </div>
  );
};

export default Chat;
