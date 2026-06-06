import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthModalOpen) return null;

  const handleLogin = () => {
    setIsAuthModalOpen(false);
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const handleSignup = () => {
    setIsAuthModalOpen(false);
    navigate(`/signup?redirect=${encodeURIComponent(location.pathname)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setIsAuthModalOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border border-gold/20 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-lg text-center animate-[scaleIn_0.3s_ease-out]">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-on-surface-variant/70 hover:text-primary dark:hover:text-gold transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 bg-[var(--primary)]/10 dark:bg-gold/10 rounded-full flex items-center justify-center text-[var(--primary)] dark:text-gold mb-md">
          <span className="material-symbols-outlined text-[32px]">lock_open</span>
        </div>

        {/* Title */}
        <h3 className="font-headline-lg text-[22px] text-primary dark:text-gold mb-sm font-semibold">
          Membership Required
        </h3>

        {/* Message */}
        <p className="font-body-md text-on-surface-variant dark:text-zinc-300 mb-lg leading-relaxed max-w-xs mx-auto">
          {authModalMessage || 'Please login or create an account to continue booking.'}
        </p>

        {/* Buttons */}
        <div className="space-y-sm">
          <button 
            onClick={handleLogin}
            className="w-full bg-[var(--primary)] text-white py-md rounded-xl font-label-caps tracking-wider font-semibold hover:bg-opacity-95 transition-all shadow-md flex items-center justify-center gap-xs cursor-pointer min-h-[44px]"
          >
            <span>Log In</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
          
          <button 
            onClick={handleSignup}
            className="w-full border-2 border-gold text-[#a37f4c] dark:text-gold py-md rounded-xl font-label-caps tracking-wider font-semibold hover:bg-gold/5 transition-all flex items-center justify-center gap-xs cursor-pointer min-h-[44px]"
          >
            <span>Create Account</span>
            <span className="material-symbols-outlined text-[16px]">person_add</span>
          </button>
        </div>

        {/* Cancel Text */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="mt-md font-label-caps text-xs text-on-surface-variant/80 hover:text-primary dark:hover:text-gold transition-colors inline-block cursor-pointer"
        >
          Cancel and return
        </button>

      </div>
    </div>
  );
}
