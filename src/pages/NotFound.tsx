
import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cinema-bg text-white p-4">
      <div className="film-grain"></div>
      
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative overflow-hidden rounded-full p-0.5 bg-gradient-to-r from-cinema-red to-cinema-red/70">
            <div className="bg-black rounded-full p-3">
              <Film className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 heading-gradient">404</h1>
        <p className="text-xl text-white/70 mb-8">
          Oops! This scene isn't in our collection.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center justify-center"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
