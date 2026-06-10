import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Scissors,
  Calendar,
  UserCheck,
  Sliders,
  Moon,
  Sun,
  LogOut,
  User,
  Search,
  Menu,
  X
} from 'lucide-react';

export default function Navigation() {
  const { user, guest, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Dark mode effect ── */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    logout();
    navigate('/home');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Guest';

  const menuItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/services', label: 'Services', icon: Scissors },
    { to: '/booking', label: 'Booking', icon: Calendar },
    { to: '/portfolio', label: 'Portfolio', icon: UserCheck },
  ];

  if (user && user.role === 'ADMIN') {
    menuItems.push({ to: '/admin', label: 'Admin', icon: Sliders });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-sidebar border-b border-sidebar-border shadow-sm transition-colors duration-300">
      <div className="flex h-20 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4">
          <Link to="/home" className="flex items-center gap-3 select-none" style={{ textDecoration: 'none' }}>
            <img 
              src="/favicon.svg" 
              alt="TrendTrim Logo" 
              className="w-20 h-20 transition-transform duration-500 hover:rotate-180 dark:invert drop-shadow-md" 
              style={{ flexShrink: 0 }} 
            />
            <span className="font-serif text-[1.4rem] font-medium tracking-[0.06em] text-sidebar-foreground hidden sm:block">
              TrendTrim
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 mx-6 flex-1 justify-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link 
                key={item.to} 
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  active 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-b-2 border-champagne rounded-b-none' 
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                }`}
                title={item.label}
              >
                <Icon className={`size-4 ${active ? 'text-champagne' : 'text-sidebar-foreground/60'}`} />
                <span className="font-sans text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Dark Mode, Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sidebar-accent/60 text-sidebar-foreground/75 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="size-4 text-champagne" /> : <Moon className="size-4 text-champagne" />}
          </button>

          <div className="h-6 w-px bg-sidebar-border/50 mx-1"></div>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-3 group relative">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex flex-col items-end hidden lg:flex">
                  <span className="font-sans text-xs font-semibold text-sidebar-foreground">{displayName}</span>
                  <span style={{
                    fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', fontWeight: 'bold',
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--champagne)',
                    display: 'flex', alignItems: 'center', gap: '2px'
                  }}>
                    {user.tier || 'STANDARD'}
                  </span>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--champagne)', flexShrink: 0 }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <User className="size-5 text-champagne" />
                    </div>
                  )}
                </div>
              </Link>
              <button 
                onClick={handleLogoutClick}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/10 text-sidebar-foreground/75 hover:text-red-500 transition-colors"
                title="Log Out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-champagne/30 text-sidebar-foreground hover:bg-champagne/10 transition-colors font-sans text-xs uppercase tracking-wider font-semibold"
            >
              <User className="size-4 text-champagne" />
              {guest ? 'Guest' : 'Log In'}
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-sidebar-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-sidebar border-b border-sidebar-border shadow-lg py-4 px-4 flex flex-col gap-4 z-40 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-champagne' 
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60'
                  }`}
                >
                  <Icon className={`size-5 ${active ? 'text-champagne' : 'text-sidebar-foreground/60'}`} />
                  <span className="font-sans text-sm tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-px w-full bg-sidebar-border/50 my-1"></div>

          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-3 text-sidebar-foreground/75 hover:text-sidebar-foreground"
            >
              {darkMode ? <Sun className="size-5 text-champagne" /> : <Moon className="size-5 text-champagne" />}
              <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            {user ? (
              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-red-500 hover:opacity-80"
              >
                <span className="text-sm font-semibold">Log Out</span>
                <LogOut className="size-4" />
              </button>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-champagne hover:opacity-80 uppercase tracking-widest">
                Log In
              </Link>
            )}
          </div>
          
          {user && (
            <Link to="/profile" className="flex items-center gap-3 mt-2 px-2">
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--champagne)' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User className="size-4 text-champagne" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">{displayName}</span>
                  <span className="text-xs text-sidebar-foreground/60">{user.email}</span>
                </div>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
