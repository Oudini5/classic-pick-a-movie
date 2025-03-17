
import React, { useEffect, useRef } from 'react';
import { Star, ClapperboardIcon } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      },
      { threshold: 0.1 }
    );
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  // Random stars in the background
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 0.5 + 0.2;
      stars.push(
        <Star
          key={i}
          className="absolute text-white/10 animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${size}rem`,
            height: `${size}rem`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        />
      );
    }
    return stars;
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen pt-28 pb-20 flex flex-col items-center justify-center overflow-hidden"
    >
      {renderStars()}
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 w-64 h-64 bg-cinema-red/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-32 bottom-1/4 w-64 h-64 bg-cinema-red/5 rounded-full blur-3xl"></div>
      </div>
      
      <div 
        ref={heroRef}
        className="container mx-auto text-center relative z-10 opacity-0 translate-y-10 transition-all duration-1000 ease-out"
      >
        <div className="inline-flex items-center justify-center mb-6 py-1 px-4 rounded-full bg-white/5 border border-white/10 animate-pulse">
          <ClapperboardIcon className="w-4 h-4 mr-2 text-cinema-red" />
          <span className="text-sm font-medium">AI-Powered Movie Recommendations</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
          <span className="heading-gradient block mb-2">Classic Sh*t</span>
          <span className="text-shimmer block text-3xl md:text-4xl lg:text-5xl">
            Let AI pick your movie tonight!
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-white/80 mb-8">
          Unleash our AI to find the perfect film or series for your next watch.
          No more endless scrolling through streaming platforms.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#waitlist" 
            className="btn-primary group"
          >
            <span className="relative z-10">Join the Waitlist</span>
            <span className="absolute inset-0 rounded-md overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-cinema-red to-cinema-red/80"></span>
              <span className="absolute h-full w-0 top-0 left-0 bg-white/10 transform skew-x-12 transition-all duration-500 group-hover:w-full"></span>
            </span>
          </a>
          
          <a 
            href="#demo" 
            className="btn-secondary"
          >
            Try Demo
          </a>
        </div>
        
        <div className="mt-16 max-w-xl mx-auto">
          <div className="p-1 rounded-xl bg-gradient-to-r from-cinema-red/50 via-cinema-red/20 to-cinema-red/50">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/80 border border-white/5 glass-card flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <ClapperboardIcon className="w-12 h-12 text-cinema-red opacity-70" />
                <p className="text-sm text-white/70">Movie Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#demo" className="text-white/50 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default Hero;
