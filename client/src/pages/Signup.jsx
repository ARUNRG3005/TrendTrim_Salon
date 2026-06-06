import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register, skipLogin, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/home';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.toLowerCase().trim();
    if (!name || !cleanEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const res = await register(name, cleanEmail, password);
    setLoading(false);

    if (res.success) {
      navigate(redirectPath);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  const handleSkip = () => {
    skipLogin();
    navigate('/home');
  };

  // Google sign in simulation
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await login('user@luxebook.com', 'user');
    setLoading(false);
    if (res.success) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-transparent text-zinc-900 overflow-hidden relative">
      
      {/* Skip Button - Minimal Premium Design */}
      <button 
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 border border-[var(--primary)]/25 hover:border-[var(--primary)] text-[var(--primary)] font-label-caps text-[11px] tracking-widest px-5 py-2 rounded-full transition-all bg-white/40 backdrop-blur-sm shadow-sm hover:shadow active:scale-95 cursor-pointer"
      >
        Skip to browse &rarr;
      </button>

      {/* LEFT PANEL - Muted Sage Green Gradient (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-[#B2C2D4] via-[#D5DBE1] to-[#EBEFF2] items-center justify-center p-xl">
        <div className="absolute inset-0 bg-black/5 opacity-5 pointer-events-none"></div>
        {/* Decorative monogram in left panel background */}
        <div className="text-center text-[var(--primary)]/10 select-none">
          <svg className="w-64 h-64 mx-auto mb-lg" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 20V70C30 75 35 80 40 80H70" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
            <path d="M45 20H60C70 20 75 28 75 35C75 42 70 50 60 50C70 50 78 58 78 67.5C78 77 70 80 60 80H45V20Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
          </svg>
          <span className="font-label-caps text-sm tracking-[0.4em] uppercase">PRIVATE SANCTUARY</span>
        </div>
      </div>

      {/* RIGHT PANEL - Centered Sign Up Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-lg relative bg-transparent">
        
        {/* Subtle decorative mesh in background */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#B2C2D4]/10 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] bg-white rounded-[24px] border border-zinc-200/60 shadow-xl p-lg md:p-xl relative z-10 transition-all">
          
          {/* Logo Section */}
          <div className="text-center mb-md">
            <div className="flex items-center justify-center gap-xs font-serif text-2xl font-semibold text-[var(--primary)]">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#a37f4c" strokeWidth="1.5"/>
                <text x="14" y="19" textAnchor="middle" fontFamily="Playfair Display" fontSize="13" fontWeight="700" fill="#a37f4c">L</text>
              </svg>
              <span>LuxeBook</span>
            </div>
          </div>

          {/* Form Headers */}
          <div className="text-center mb-lg">
            <h2 className="font-serif text-[var(--primary)] text-[28px] font-semibold tracking-tight">
              Create Account
            </h2>
            <p className="text-zinc-500 font-sans text-sm mt-1">
              Experience wellness at its finest.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-md p-sm bg-red-50 border border-red-200 rounded-xl text-red-700 font-sans text-xs text-center flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Social Logins */}
          <div className="space-y-sm mb-md">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-full py-3 px-lg text-sm font-semibold flex items-center justify-center gap-sm transition-all cursor-pointer shadow-sm"
            >
              {/* Google G Logo */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.48 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.2 7.74 8.9 5.04 12 5.04z" />
                <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z" />
                <path fill="#fbbc05" d="M5.28 14.78c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 7.16C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.84l3.89-3.06z" />
                <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.73-2.89c-1.1.74-2.52 1.18-4.23 1.18-3.1 0-5.8-2.7-6.72-5.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-[#a37f4c] hover:bg-[#a37f4c]/5 text-[var(--primary)] rounded-full py-3 px-lg text-sm font-semibold flex items-center justify-center gap-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#a37f4c]">phone_iphone</span>
              <span>Continue with Phone</span>
            </button>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-sm my-lg">
            <span className="h-px bg-zinc-200 flex-1"></span>
            <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400">OR</span>
            <span className="h-px bg-zinc-200 flex-1"></span>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-sm">
            
            {/* Full Name Input */}
            <div className="relative flex items-center bg-[#f7f7f7] rounded-xl px-4 py-2 border border-transparent focus-within:border-[#a37f4c] transition-all">
              <span className="material-symbols-outlined text-[20px] text-zinc-400 mr-sm">person</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-transparent border-none py-2 text-zinc-800 text-sm focus:outline-none placeholder-zinc-400"
              />
            </div>

            {/* Email Input */}
            <div className="relative flex items-center bg-[#f7f7f7] rounded-xl px-4 py-2 border border-transparent focus-within:border-[#a37f4c] transition-all">
              <span className="material-symbols-outlined text-[20px] text-zinc-400 mr-sm">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-transparent border-none py-2 text-zinc-800 text-sm focus:outline-none placeholder-zinc-400"
              />
            </div>

            {/* Password Input */}
            <div className="relative flex items-center bg-[#f7f7f7] rounded-xl px-4 py-2 border border-transparent focus-within:border-[#a37f4c] transition-all">
              <span className="material-symbols-outlined text-[20px] text-zinc-400 mr-sm">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border-none py-2 text-zinc-800 text-sm focus:outline-none placeholder-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px] select-none">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Terms text */}
            <p className="text-[11px] text-zinc-500 font-sans leading-normal py-xs">
              By applying, you agree to our standard membership terms, guest guidelines, and sanctuary code of conduct.
            </p>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white font-label-caps text-xs tracking-widest py-3.5 rounded-full hover:bg-[var(--chart-2)] hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-xs cursor-pointer mt-md min-h-[48px]"
            >
              {loading ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                  <span>SUBMITTING APPLICATION...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <span className="material-symbols-outlined text-[16px]">&rarr;</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-xl text-center">
            <span className="text-zinc-500 font-sans text-xs">Already a member? </span>
            <button
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`)}
              className="text-[#a37f4c] hover:underline text-xs font-bold font-sans cursor-pointer"
            >
              Sign In
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
