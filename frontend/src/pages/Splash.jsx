import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import introVideo from '../assets/intro.mp4';

export default function Splash() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [showSkip, setShowSkip] = useState(false);

  const handleNext = () => {
    const storedUser = localStorage.getItem('trendtrim_user');
    const storedGuest = localStorage.getItem('trendtrim_guest') === 'true';
    if (storedUser || storedGuest) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    // Show Skip button after 1.5 seconds
    const skipTimeout = setTimeout(() => {
      setShowSkip(true);
    }, 1500);

    // Fallback: in case the video fails to load or play, auto-navigate after 12 seconds
    const fallbackTimeout = setTimeout(() => {
      handleNext();
    }, 12000);

    // Attempt to play the video explicitly (robust handling for browser autoplay policies)
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay prevented or waiting for interaction:", err);
      });
    }

    return () => {
      clearTimeout(skipTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [navigate]);

  return (
    <main className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleNext}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Luxury Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none z-10" />

      {/* Skip Button */}
      {showSkip && (
        <button
          onClick={handleNext}
          className="absolute bottom-10 right-10 z-20 px-6 py-2.5 bg-black/40 hover:bg-black/80 border border-gold/40 hover:border-gold text-gold text-xs font-semibold uppercase tracking-[0.2em] rounded-full backdrop-blur-md transition-all duration-300 animate-[fadeIn_0.5s_ease-out_forwards]"
        >
          Skip
        </button>
      )}
    </main>
  );
}
