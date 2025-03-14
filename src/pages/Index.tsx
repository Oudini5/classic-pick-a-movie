
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ChatDemo from '@/components/ChatDemo';
import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  useEffect(() => {
    // Upload the logo to public folder
    const logoPath = '/lovable-uploads/0b150639-d45b-4146-8a3a-b65b67bf60bd.png';
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
    link.rel = 'icon';
    link.href = logoPath;
    document.head.appendChild(link);
  }, []);

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
