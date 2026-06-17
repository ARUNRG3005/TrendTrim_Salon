import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, skipLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || location.state?.from?.pathname || '/home';

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    const res = await login(cleanEmail, password);
    setLoading(false);
    if (res.success) {
      navigate(res.user?.role === 'ADMIN' ? '/admin' : redirectPath);
    } else {
      setError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSkip = () => { skipLogin(); navigate('/home'); };
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await login('user@trendtrim.com', 'user');
    setLoading(false);
    if (res.success) navigate(redirectPath);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '3%', width: '350px', height: '350px', background: 'rgba(201,169,110,0.03)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Skip */}
      <button onClick={handleSkip} style={{
        position: 'absolute', top: '1.5rem', right: '1.75rem', zIndex: 20,
        fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--champagne)', background: 'transparent',
        border: '1px solid rgba(201,169,110,0.3)', borderRadius: '99px',
        padding: '8px 20px', cursor: 'pointer', transition: 'all 0.25s ease',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.6)'; e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; e.currentTarget.style.background = 'transparent'; }}
      >
        Browse
        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
      </button>

      {/* LEFT — cinematic image panel */}
      <div className="auth-left-panel" style={{ flex: '1', display: 'none', position: 'relative', overflow: 'hidden' }}>
        <style>{`.auth-left-panel { display: none; } @media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }`}</style>
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Multi-layer overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(13,13,13,0.82) 0%, rgba(13,13,13,0.45) 60%, rgba(13,13,13,0.8) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 70%, rgba(201,169,110,0.08) 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 10, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="var(--champagne)" strokeWidth="0.8"/>
              <circle cx="14" cy="14" r="10" stroke="var(--champagne)" strokeWidth="0.4" opacity="0.4"/>
              <text x="14" y="19" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="14" fontWeight="500" fill="var(--champagne)">L</text>
            </svg>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 500, color: '#F5F0E8', letterSpacing: '0.05em' }}>TrendTrim</span>
          </Link>

          {/* Bottom quote */}
          <div>
            <div style={{ width: '36px', height: '1px', background: 'rgba(201,169,110,0.5)', marginBottom: '1.5rem' }} />
            <blockquote style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)', color: '#F5F0E8', lineHeight: 1.45, marginBottom: '1.5rem', maxWidth: '400px' }}>
              "Where luxury meets the art of beauty."
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '24px', height: '1px', background: 'rgba(201,169,110,0.5)' }} />
              <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>Premium Salon</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(2rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo (mobile only) */}
          <div className="auth-mobile-logo" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <style>{`.auth-mobile-logo { display: block; } @media (min-width: 1024px) { .auth-mobile-logo { display: none !important; } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="var(--champagne)" strokeWidth="0.8"/>
                <text x="14" y="19" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="14" fontWeight="500" fill="var(--champagne)">L</text>
              </svg>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.35rem', fontWeight: 500, letterSpacing: '0.04em', color: 'var(--color-text)' }}>TrendTrim</span>
            </div>
          </div>

          {/* Eyebrow + Heading */}
          <div style={{ marginBottom: '0.625rem' }}>
            <span className="eyebrow-refined">Welcome Back</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', color: 'var(--color-text)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0.625rem 0 2.5rem' }}>
            Enter Your Salon
          </h1>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(196,137,122,0.08)', border: '1px solid rgba(196,137,122,0.28)', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#C4897A', flexShrink: 0 }}>error</span>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: '#C4897A', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                style={{
                  background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                  padding: '9px 0',
                  fontFamily: 'Cormorant Garamond, serif', fontSize: '1.0625rem',
                  color: 'var(--color-text)', outline: 'none',
                  transition: 'border-color 0.25s ease',
                  width: '100%',
                }}
                onFocus={e => e.target.style.borderBottomColor = 'var(--champagne)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--color-border-strong)'}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                    padding: '9px 36px 9px 0',
                    fontFamily: 'Cormorant Garamond, serif', fontSize: '1.0625rem',
                    color: 'var(--color-text)', outline: 'none',
                    transition: 'border-color 0.25s ease',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--champagne)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--color-border-strong)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-mute)', padding: 0, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-mute)'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="shimmer-btn"
              style={{
                background: 'var(--color-text)', color: 'var(--color-bg)',
                padding: '15px', borderRadius: '14px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                border: 'none', cursor: loading ? 'wait' : 'pointer',
                minHeight: '50px', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.25s ease',
              }}
            >
              {loading ? (
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin-slow 0.8s linear infinite' }}>progress_activity</span>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Google */}
          <button onClick={handleGoogleSignIn} disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: 'transparent', border: '1px solid var(--color-border-strong)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--color-text)', transition: 'all 0.25s ease',
              marginBottom: '1.75rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'; e.currentTarget.style.background = 'rgba(201,169,110,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/></svg>
            Continue with Google
          </button>

          {/* Links */}
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: 'var(--color-text-dim)', textAlign: 'center', lineHeight: 1.8 }}>
            No account?{' '}
            <Link to="/signup" style={{ color: 'var(--champagne)', textDecoration: 'none', fontWeight: 400 }}>Create one</Link>
            {' · '}
            <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: 'var(--color-text-mute)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 300, transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-mute)'}
            >Browse as guest</button>
          </p>

          {/* Demo hint */}
          <div style={{ marginTop: '2.25rem', padding: '14px 18px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.14)', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(to bottom, var(--champagne-dk), var(--champagne))' }} />
            <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--champagne)', margin: '0 0 5px' }}>Demo Access</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.7 }}>
              user@trendtrim.com / user &nbsp;·&nbsp; admin@trendtrim.com / admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
