
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Film, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  createThread, 
  processUserMessage,
  warmupFunction
} from '@/services/openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat = () => {
  const { user, profile, loading, incrementMessageCount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isFunctionWarming, setIsFunctionWarming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    warmupAndInitialize();
  }, []);

  useEffect(() => {
    warmupFunction().then(success => {
      setIsFunctionWarming(false);
      console.log('Initial warmup completed:', success);
    });

    const intervalId = setInterval(() => {
      warmupFunction().catch(err => {
        console.warn('Background warmup failed:', err);
      });
    }, 4 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const warmupAndInitialize = async () => {
    setIsInitializing(true);
    setInitError(null);
    setIsFunctionWarming(true);
    
    try {
      const isWarm = await warmupFunction();
      setIsFunctionWarming(false);
      
      if (!isWarm) {
        console.warn('Function may be cold - proceeding with initialization anyway');
      }
      
      const thread = await createThread();
      setThreadId(thread.id);
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setIsInitializing(false);
      setIsFunctionWarming(false);
      
      if (error instanceof Error) {
        setInitError(error.message);
      } else {
        setInitError('Failed to initialize chat. Please try again later.');
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initialize chat',
        variant: 'destructive',
      });
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const getMessageLimit = () => {
    if (!user) return 3;
    return profile?.role === 'free' ? 10 : 100;
  };

  const getCurrentMessageCount = () => {
    if (!user) return messages.filter(m => m.sender === 'user').length;
    return profile?.messages_today || 0;
  };

  const canSendMessage = () => {
    const limit = getMessageLimit();
    const count = getCurrentMessageCount();
    return count < limit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    if (!canSendMessage()) {
      triggerShakeEffect();
      setShowLimitModal(true);
      return;
    }

    if (!threadId) {
      toast({
        title: 'Error',
        description: 'Chat is initializing. Please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    if (user && profile) {
      await incrementMessageCount();
    }
    
    try {
      const assistantMessage = await processUserMessage(threadId, inputValue);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to get a response from the assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShakeEffect = () => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
  };

  const handleInputFocus = () => {
    if (!canSendMessage()) {
      triggerShakeEffect();
      setShowLimitModal(true);
      inputRef.current?.blur();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAuthAction = () => {
    setShowLimitModal(false);
    if (!user) {
      window.location.href = '/auth';
    } else {
      navigate('/#waitlist');
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-screen bg-cinema-bg text-white flex items-center justify-center">
        <div className="film-grain"></div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cinema-red mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  const renderInitializationState = () => {
    if (isFunctionWarming) {
      return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md text-center">
            <Loader2 className="w-10 h-10 text-cinema-red mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold mb-2">Warming Up</h3>
            <p className="text-white/70">
              Just a moment while we warm up the AI system...
            </p>
          </div>
        </div>
      );
    }
    
    if (isInitializing) {
      return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md text-center">
            <Loader2 className="w-10 h-10 text-cinema-red mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold mb-2">Initializing Chat</h3>
            <p className="text-white/70">
              Please wait while we connect to the AI assistant...
            </p>
          </div>
        </div>
      );
    }
    
    if (initError) {
      return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-cinema-red/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-cinema-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Connection Error</h3>
            <p className="text-white/70 mb-4">
              {initError}
            </p>
            <Button 
              onClick={warmupAndInitialize}
              className="bg-cinema-red hover:bg-cinema-red/90"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const messageLimit = getMessageLimit();
  const currentCount = getCurrentMessageCount();
  const remainingMessages = Math.max(0, messageLimit - currentCount);

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
            <span className="text-sm text-white/60">
              {remainingMessages} messages left
            </span>
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

      {/* Full-screen chat interface */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col bg-cinema-darker overflow-hidden">
          {isFunctionWarming || isInitializing || initError ? (
            renderInitializationState()
          ) : (
            <ScrollArea className="flex-1 px-4 py-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-cinema-red/10 mb-4">
                    <svg className="w-6 h-6 text-cinema-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2">Ask for movie recommendations</h4>
                  <p className="text-white/60 max-w-md">
                    Try "Suggest a classic thriller" or "What comedy should I watch tonight?"
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          message.sender === 'user' 
                            ? 'bg-cinema-red text-white rounded-tr-none' 
                            : 'bg-white/10 text-white rounded-tl-none'
                        }`}
                      >
                        {message.sender === 'user' ? (
                          <div className="text-sm break-words">{message.text}</div>
                        ) : (
                          <div 
                            className="text-sm break-words [&_.inline-code]:bg-white/20 [&_.inline-code]:px-1 [&_.inline-code]:py-0.5 [&_.inline-code]:rounded" 
                            dangerouslySetInnerHTML={{ __html: message.text }} 
                          />
                        )}
                        <div 
                          className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-white/70' : 'text-white/50'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                        <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          )}
          
          <form onSubmit={handleSubmit} className="border-t border-white/5 p-4 bg-cinema-darker">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                onClick={handleInputFocus}
                placeholder="Ask for a movie recommendation..."
                className={`flex-1 bg-white/5 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-cinema-red/50 transition-all ${shakeInput ? 'animate-shake' : ''}`}
                disabled={isLoading || !canSendMessage() || !threadId || isInitializing || isFunctionWarming || !!initError}
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading || !canSendMessage() || !threadId || isInitializing || isFunctionWarming || !!initError}
                className="bg-cinema-red hover:bg-cinema-red/90 text-white p-3 rounded-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-cinema-darker max-w-md w-full rounded-xl overflow-hidden glass-card animate-scale-in">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Message Limit Reached</h3>
              <p className="text-white/70 mb-6">
                {user ? 
                  "You've reached your daily message limit. Join our waitlist to get early access to unlimited AI movie recommendations." :
                  "You've used all your free messages! Sign in for more messages or join our waitlist for unlimited access."
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAuthAction}
                  className="btn-primary flex-1"
                >
                  {user ? 'Join Waitlist' : 'Sign In'}
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
