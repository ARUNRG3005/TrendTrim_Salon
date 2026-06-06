import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    const updateLoading = () => {
      if (currentProgress < 100) {
        const increment = Math.random() * (currentProgress > 80 ? 2 : 6) + 4;
        currentProgress = Math.min(100, currentProgress + increment);
        setProgress(Math.floor(currentProgress));

        const nextTick = Math.random() * 20 + 50;
        setTimeout(updateLoading, nextTick);
      } else {
        // Redirect to homepage if user/guest is already stored, otherwise to login page
        setTimeout(() => {
          const storedUser = localStorage.getItem('luxebook_user');
          const storedGuest = localStorage.getItem('luxebook_guest') === 'true';
          if (storedUser || storedGuest) {
            navigate('/home');
          } else {
            navigate('/login');
          }
        }, 250);
      }
    };

    // Start loading sequence after initial animation delay
    const startTimeout = setTimeout(updateLoading, 350);
    return () => clearTimeout(startTimeout);
  }, [navigate]);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-primary">
      {/* Subtle Shimmer Overlay */}
      <div className="absolute inset-0 shimmer-effect pointer-events-none opacity-40"></div>
      
      {/* Ambient Background Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Logo/Monogram Section */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-lg gold-glow">
          {/* SVG Monogram 'LB' */}
          <svg className="w-24 h-24 md:w-32 md:h-32" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* Stylized L */}
            <path className="monogram-path" d="M30 20V70C30 75 35 80 40 80H70" stroke="#D4AF37" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            {/* Stylized B */}
            <path className="monogram-path" d="M45 20H60C70 20 75 28 75 35C75 42 70 50 60 50C70 50 78 58 78 67.5C78 77 70 80 60 80H45V20Z" stroke="#D4AF37" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" style={{ animationDelay: '0.5s' }}></path>
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="text-center space-y-md">
          <h1 className="font-headline-xl text-headline-xl text-on-primary tracking-[0.2em] opacity-0 animate-[fadeIn_1.5s_ease-out_1s_forwards]">
            LUXEBOOK
          </h1>
          <p className="font-label-caps text-label-caps text-tertiary-fixed-dim/70 uppercase tracking-[0.4em] opacity-0 animate-[fadeIn_1.5s_ease-out_1.5s_forwards]">
            Elevating Excellence
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="absolute bottom-xl flex flex-col items-center gap-base">
        <div className="loading-bar-container">
          <div className="loading-progress" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="font-label-caps text-[10px] text-tertiary-fixed-dim/50 tracking-widest">
          {progress}%
        </span>
      </div>

      {/* Bottom Footer Branding */}
      <div className="absolute bottom-md opacity-30">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-[14px] text-on-primary">workspace_premium</span>
          <span className="font-label-caps text-[10px] text-on-primary tracking-widest">PRIVATE CONCIERGE NETWORK</span>
        </div>
      </div>
    </main>
  );
}
