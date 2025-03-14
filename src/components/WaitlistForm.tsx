
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the data into Supabase
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, name }]);
      
      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already on our waitlist. Thanks for your enthusiasm!",
            variant: "destructive",
          });
        } else {
          console.error('Supabase error:', error);
          toast({
            title: "Something went wrong",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
        return;
      }
      
      // Success
      setIsSubmitting(false);
      setSuccess(true);
      setEmail('');
      setName('');
      
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll notify you when we launch!",
      });
      
      // Reset success state after a delay
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting to waitlist:', err);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="waitlist" className="py-20 relative overflow-hidden bg-cinema-darker">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 w-96 h-96 bg-cinema-red/5 rounded-full blur-[100px] -translate-x-1/2"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold heading-gradient mb-4">Join the Waitlist</h2>
          <p className="text-white/70">
            Be the first to know when Classic Sh*t launches. Get early access to unlimited AI-powered movie recommendations personalized just for you.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
            {success ? (
              <div className="py-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-scale-in">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-2">Thanks for joining!</h3>
                <p className="text-white/70">
                  We'll notify you when we launch. Get ready for amazing movie recommendations!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cinema-red/50"
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cinema-red/50"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full btn-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span>Join the Waitlist</span>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-white/50 text-center pt-2">
                  By joining, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-cinema-red/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cinema-red">
                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
                <path d="M16.5 9.4 7.55 4.24"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
                <circle cx="18.5" cy="15.5" r="2.5"></circle>
                <path d="M20.27 17.27 22 19"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Personalized Picks</h3>
            <p className="text-white/70 text-sm">
              Get AI-generated movie suggestions tailored to your unique taste and preferences.
            </p>
          </div>
          
          <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-cinema-red/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cinema-red">
                <path d="M12 3c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41 0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59-.53 0-1.04-.21-1.41-.59C10.21 6.04 10 5.53 10 5c0-.53.21-1.04.59-1.41C10.96 3.21 11.47 3 12 3z"></path>
                <path d="M12 14c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41 0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59-.53 0-1.04-.21-1.41-.59-.38-.37-.59-.88-.59-1.41 0-.53.21-1.04.59-1.41.37-.38.88-.59 1.41-.59z"></path>
                <path d="M12 21c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41 0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59-.53 0-1.04-.21-1.41-.59-.38-.37-.59-.88-.59-1.41 0-.53.21-1.04.59-1.41.37-.38.88-.59 1.41-.59z"></path>
                <path d="M19 6a2 2 0 1 1 .001-4.001A2 2 0 0 1 19 6z"></path>
                <path d="M5 6a2 2 0 1 1 .001-4.001A2 2 0 0 1 5 6z"></path>
                <path d="M5 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
                <path d="M19 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
                <path d="M12 14V3"></path>
                <path d="M12 21v-7"></path>
                <path d="M5 8v8"></path>
                <path d="M19 8v8"></path>
                <path d="M12 6h7"></path>
                <path d="M5 6h5"></path>
                <path d="M5 16h5"></path>
                <path d="M19 16h-7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Discover Hidden Gems</h3>
            <p className="text-white/70 text-sm">
              Find lesser-known movies and series you'd never discover on your own.
            </p>
          </div>
          
          <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-cinema-red/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cinema-red">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Early Access</h3>
            <p className="text-white/70 text-sm">
              Get exclusive early access to new features and updates before anyone else.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
