
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  createThread, 
  processUserMessage,
  hasApiKey,
  getAssistantId
} from '@/services/openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const MAX_FREE_MESSAGES = 3;

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeThread();
  }, []);

  const initializeThread = async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      if (!hasApiKey()) {
        throw new Error('Chat is unavailable. Please contact the site administrator.');
      }
      
      if (!getAssistantId()) {
        throw new Error('Chat assistant is not configured. Please contact the site administrator.');
      }
      
      const thread = await createThread();
      setThreadId(thread.id);
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to create thread:', error);
      setIsInitializing(false);
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Check if user has reached the free message limit
    if (messageCount >= MAX_FREE_MESSAGES) {
      triggerShakeEffect();
      setShowLimitModal(true);
      return;
    }

    // Check if thread is created
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
    setMessageCount(prev => prev + 1);
    
    try {
      // Process the user message and get the assistant's response
      const assistantMessage = await processUserMessage(threadId, inputValue);
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add an error message to the chat
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
    if (messageCount >= MAX_FREE_MESSAGES) {
      triggerShakeEffect();
      setShowLimitModal(true);
      // Remove focus from the input
      inputRef.current?.blur();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleWaitlistJoin = () => {
    setShowLimitModal(false);
    toast({
      title: "Redirecting to waitlist",
      description: "Taking you to the waitlist form",
    });
    
    // Scroll to waitlist section
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderInitializationState = () => {
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
              onClick={initializeThread}
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

  return (
    <section id="demo" className="py-20 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold heading-gradient mb-4">Try the AI Movie Picker</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Ask for movie recommendations based on genre, mood, or specific preferences.
            Try a few queries for free, then join our waitlist for unlimited access.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cinema-red/40 to-cinema-red/20 rounded-xl blur-sm"></div>
          <div className="relative bg-cinema-darker rounded-xl shadow-xl overflow-hidden glass-card flex flex-col" style={{ height: "550px" }}>
            <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cinema-red"></div>
                <h3 className="text-sm font-medium">Classic Sh*t AI</h3>
              </div>
              <div className="text-xs text-white/50">
                {MAX_FREE_MESSAGES - messageCount} free messages left
              </div>
            </div>
            
            {isInitializing || initError ? (
              renderInitializationState()
            ) : (
              <ScrollArea 
                className="flex-1 px-4 py-4 overflow-y-auto" 
                ref={scrollAreaRef}
              >
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
                  <div className="space-y-4">
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
            
            <form onSubmit={handleSubmit} className="border-t border-white/5 p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleInputFocus}
                  onClick={handleInputFocus}
                  placeholder="Ask for a movie recommendation..."
                  className={`w-full bg-white/5 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-cinema-red/50 transition-all ${shakeInput ? 'animate-shake' : ''}`}
                  disabled={isLoading || messageCount >= MAX_FREE_MESSAGES || !threadId || isInitializing || !!initError}
                />
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading || messageCount >= MAX_FREE_MESSAGES || !threadId || isInitializing || !!initError}
                  className="bg-cinema-red hover:bg-cinema-red/90 text-white p-3 rounded-lg h-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-white/70 mb-4">Want unlimited AI movie recommendations?</p>
          <a href="#waitlist" className="btn-primary">
            Join the Waitlist
          </a>
        </div>
      </div>
      
      {/* Message Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-cinema-darker max-w-md w-full rounded-xl overflow-hidden glass-card animate-scale-in">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Message Limit Reached</h3>
              <p className="text-white/70 mb-6">
                You've used all your free messages! Join our waitlist to get early access to unlimited AI movie recommendations.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleWaitlistJoin}
                  className="btn-primary flex-1"
                >
                  Join Waitlist
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="btn-secondary flex-1"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ChatDemo;
