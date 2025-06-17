
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ChatDemo from '@/components/ChatDemo';
import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Set favicon to the Classic Shit logo
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
    link.rel = 'icon';
    link.href = '/lovable-uploads/0b150639-d45b-4146-8a3a-b65b67bf60bd.png';
    document.head.appendChild(link);
  }, []);

  // Redirect authenticated users to chat page
  useEffect(() => {
    if (!loading && user) {
      navigate('/chat', { replace: true });
    }
  }, [user, loading, navigate]);

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

  // Don't render the landing page if user is authenticated (they'll be redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cinema-bg text-white relative">
      {/* Film grain overlay */}
      <div className="film-grain"></div>
      
      <Header />
      <Hero />
      <ChatDemo />
      <WaitlistForm />
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
