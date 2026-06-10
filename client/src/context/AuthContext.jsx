import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(() => {
    return localStorage.getItem('trendtrim_guest') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('trendtrim_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('trendtrim_user');
      }
    }
    setLoading(false);
  }, []);

  const skipLogin = () => {
    setGuest(true);
    localStorage.setItem('trendtrim_guest', 'true');
  };

  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setGuest(false);
        localStorage.removeItem('trendtrim_guest');
        localStorage.setItem('trendtrim_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      // Offline fallback
      let authedUser;
      if (cleanEmail === 'admin@gmail.com') {
        if (password === 'adminlb123') {
          authedUser = { email: cleanEmail, name: 'TrendTrim Admin', role: 'ADMIN', tier: 'DIAMOND TIER' };
        } else {
          return { success: false, error: 'Invalid credentials' };
        }
      } else {
        // Look up in our mock local storage database
        const registered = JSON.parse(localStorage.getItem('trendtrim_registered_users') || '[]');
        const found = registered.find(u => u.email.toLowerCase() === cleanEmail);
        if (found) {
          authedUser = { 
            email: found.email, 
            name: found.name || '', 
            phone: found.phone || '', 
            avatar: found.avatar || '',
            role: found.role || 'USER', 
            tier: found.tier || 'PLATINUM MEMBER' 
          };
        } else {
          // If user logged in offline without registering first, we do NOT auto-assign name.
          // We return an empty name session to trigger profile completeness prompt.
          authedUser = { email: cleanEmail, name: '', phone: '', avatar: '', role: 'USER', tier: 'PLATINUM MEMBER' };
          
          // Seed the mock database for future logins
          registered.push({ email: cleanEmail, name: '', phone: '', avatar: '', role: 'USER', tier: 'PLATINUM MEMBER' });
          localStorage.setItem('trendtrim_registered_users', JSON.stringify(registered));
        }
      }
      setUser(authedUser);
      setGuest(false);
      localStorage.removeItem('trendtrim_guest');
      localStorage.setItem('trendtrim_user', JSON.stringify(authedUser));
      return { success: true, user: authedUser };
    }
  };

  const register = async (name, email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    
    // Case-insensitive check for reserved admin email
    if (cleanEmail === 'admin@gmail.com') {
      return { success: false, error: 'Admin account is pre-registered' };
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setGuest(false);
        localStorage.removeItem('trendtrim_guest');
        localStorage.setItem('trendtrim_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      const newUser = { name, email: cleanEmail, role: 'USER', tier: 'PLATINUM MEMBER', phone: '', avatar: '' };
      
      // Save in mock registration database list
      const registered = JSON.parse(localStorage.getItem('trendtrim_registered_users') || '[]');
      const existsIdx = registered.findIndex(u => u.email.toLowerCase() === cleanEmail);
      if (existsIdx !== -1) {
        registered[existsIdx] = { ...registered[existsIdx], name, password };
      } else {
        registered.push({ name, email: cleanEmail, password, role: 'USER', tier: 'PLATINUM MEMBER', phone: '', avatar: '' });
      }
      localStorage.setItem('trendtrim_registered_users', JSON.stringify(registered));

      setUser(newUser);
      setGuest(false);
      localStorage.removeItem('trendtrim_guest');
      localStorage.setItem('trendtrim_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    setGuest(false);
    localStorage.removeItem('trendtrim_user');
    localStorage.removeItem('trendtrim_guest');
  };

  const updateUserProfile = (details) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...details };
      localStorage.setItem('trendtrim_user', JSON.stringify(updated));

      // Update mock database of registered users
      const registered = JSON.parse(localStorage.getItem('trendtrim_registered_users') || '[]');
      const idx = registered.findIndex(u => u.email === updated.email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...details };
        localStorage.setItem('trendtrim_registered_users', JSON.stringify(registered));
      }
      return updated;
    });
  };

  const triggerAuthRequired = (onSuccess, message = 'Please login or create an account to continue booking.') => {
    if (user) {
      onSuccess();
    } else {
      setAuthModalMessage(message);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      guest,
      skipLogin,
      login,
      register,
      logout,
      loading,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalMessage,
      setAuthModalMessage,
      triggerAuthRequired,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
