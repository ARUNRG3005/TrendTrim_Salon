import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user, guest, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/home',      label: 'Home'      },
    { to: '/services',  label: 'Services'  },
    { to: '/booking',   label: 'Booking'   },
    { to: '/portfolio', label: 'Portfolio' },
  ];
  if (user && user.role === 'ADMIN') {
    navLinks.push({ to: '/admin', label: 'Admin' });
  }

  const handleLogoutClick = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/home');
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Guest';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between nav-appear
          transition-all duration-500
          ${scrolled
            ? 'h-[68px] bg-[var(--color-bg)]/97 dark:bg-[var(--obsidian)]/97 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(180,165,140,0.2)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]'
            : 'h-[80px] bg-transparent'
          }`}
        style={{ padding: '0 clamp(1.25rem, 5vw, 4rem)' }}
      >
        {/* ── Logo ── */}
        <Link to="/home" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="transition-transform duration-500 group-hover:rotate-[15deg]">
            <circle cx="13" cy="13" r="12" stroke="var(--champagne)" strokeWidth="1"/>
            <text x="13" y="18" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="13" fontWeight="500" fill="var(--champagne)">L</text>
          </svg>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 500,
            fontSize: '1.2rem',
            letterSpacing: '0.04em',
            color: scrolled ? 'var(--color-text)' : (location.pathname === '/home' ? '#fff' : 'var(--color-text)'),
          }}>
            LuxeBook
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center" style={{ gap: '2.5rem' }}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                position: 'relative',
                color: isActive(to)
                  ? 'var(--champagne)'
                  : (scrolled
                      ? 'var(--color-text-dim)'
                      : (location.pathname === '/home' ? 'rgba(245,240,232,0.65)' : 'var(--color-text-dim)')),
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={e => !isActive(to) && (e.currentTarget.style.color = 'var(--champagne)')}
              onMouseLeave={e => !isActive(to) && (e.currentTarget.style.color = scrolled ? 'var(--color-text-dim)' : (location.pathname === '/home' ? 'rgba(245,240,232,0.65)' : 'var(--color-text-dim)'))}
            >
              {label}
              {isActive(to) && (
                <span style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '16px',
                  height: '1px',
                  background: 'var(--champagne)',
                  borderRadius: '1px',
                  display: 'block',
                }} />
              )}
            </Link>
          ))}
        </div>

        {/* ── Right Side ── */}
        <div className="hidden md:flex items-center" style={{ gap: '1rem' }}>
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--color-border-strong)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: scrolled ? 'var(--color-text-dim)' : (location.pathname === '/home' ? 'rgba(245,240,232,0.7)' : 'var(--color-text-dim)'),
              transition: 'all 0.25s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Profile / Auth */}
          {(user || guest) ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'transparent',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '99px',
                  padding: '5px 14px 5px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                <span style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: 'var(--champagne)',
                  color: 'var(--obsidian)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                  flexShrink: 0,
                }}>
                  {user ? initials : 'G'}
                </span>
                <span style={{
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: scrolled ? 'var(--color-text)' : (location.pathname === '/home' ? 'rgba(245,240,232,0.9)' : 'var(--color-text)'),
                }}>
                  {user ? displayName : 'Guest'}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--champagne)' }}>
                  {profileDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  minWidth: '180px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {user && (
                    <>
                      <Link to="/profile" style={dropItemStyle}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--champagne)' }}>person</span>
                        Profile
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" style={dropItemStyle}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--champagne)' }}>admin_panel_settings</span>
                          Admin
                        </Link>
                      )}
                    </>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    style={{ ...dropItemStyle, width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--blush, #C4897A)', borderTop: '1px solid var(--color-border)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    {user ? 'Sign Out' : 'Exit Guest'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '8px 22px',
                borderRadius: '99px',
                border: '1px solid var(--champagne)',
                color: 'var(--champagne)',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--champagne)'; e.currentTarget.style.color = 'var(--obsidian)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--champagne)'; }}
            >
              Enter
            </Link>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{
            width: '40px', height: '40px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '5px',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: 'block',
              width: i === 1 ? '16px' : '24px',
              height: '1px',
              background: scrolled ? 'var(--color-text)' : (location.pathname === '/home' ? '#fff' : 'var(--color-text)'),
              transition: 'all 0.3s ease',
              transformOrigin: 'center',
              transform: mobileMenuOpen
                ? (i === 0 ? 'rotate(45deg) translate(4px, 4px)' : i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'scaleX(0)')
                : 'none',
            }} />
          ))}
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'var(--color-bg)',
          display: 'flex', flexDirection: 'column',
          padding: '100px 2rem 2rem',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2rem',
                fontWeight: 400,
                color: isActive(to) ? 'var(--champagne)' : 'var(--color-text)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s ease',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '1.5rem',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontFamily: 'Tenor Sans, sans-serif',
              fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--champagne)' }}>
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          {user ? (
            <button
              onClick={handleLogoutClick}
              style={{
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--blush, #C4897A)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              Sign Out
            </button>
          ) : !guest && (
            <Link
              to="/login"
              style={{
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--champagne)', textDecoration: 'none',
              }}
            >
              Enter →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

const dropItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '11px 16px',
  fontFamily: 'Tenor Sans, sans-serif',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--color-text)',
  textDecoration: 'none',
  transition: 'background 0.2s ease',
  background: 'transparent',
  border: 'none',
};
