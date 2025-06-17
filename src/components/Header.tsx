
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4',
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative overflow-hidden rounded-full p-0.5 bg-gradient-to-r from-cinema-red to-cinema-red/70">
            <div className="bg-black rounded-full p-1">
              <Film className="w-6 h-6 text-white group-hover:text-cinema-red transition-colors duration-300" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            <span className="text-white">classic</span>
            <span className="text-cinema-red">shit.com</span>
          </span>
        </a>
        
        <nav className="flex items-center gap-6">
          <a href="#home" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Home</a>
          <a href="#demo" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Demo</a>
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  {profile && (
                    <span className="text-sm text-white/70 hidden sm:block">
                      Hi, {profile.username}
                    </span>
                  )}
                  <Button
                    onClick={() => navigate('/account')}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <a href="#waitlist" className="text-sm font-medium bg-cinema-red/90 hover:bg-cinema-red text-white py-2 px-4 rounded-md transition-all">
                    Join Waitlist
                  </a>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
