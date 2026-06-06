import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

import Splash from './pages/Splash';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Checkout from './pages/Checkout';
import Confirmed from './pages/Confirmed';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AuthModal from './components/AuthModal';

// Scroll to Top on Page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Onboarding Guard - Ensures users choose to Login, Signup, or Skip to browse before accessing main pages
function OnboardingGuard({ children }) {
  const { user, guest, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
        <span className="animate-spin material-symbols-outlined text-gold text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!user && !guest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Admin Guard - Protects admin panel from unauthorized users
function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
        <span className="animate-spin material-symbols-outlined text-gold text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Client Pages */}
            <Route path="/home" element={<OnboardingGuard><Homepage /></OnboardingGuard>} />
            <Route path="/services" element={<OnboardingGuard><Services /></OnboardingGuard>} />
            <Route path="/booking" element={<OnboardingGuard><Booking /></OnboardingGuard>} />
            <Route path="/checkout" element={<OnboardingGuard><Checkout /></OnboardingGuard>} />
            <Route path="/confirmed" element={<OnboardingGuard><Confirmed /></OnboardingGuard>} />
            <Route path="/portfolio" element={<OnboardingGuard><Portfolio /></OnboardingGuard>} />
            <Route path="/profile" element={<OnboardingGuard><Profile /></OnboardingGuard>} />
            
            {/* Protected Admin Console */}
            <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AuthModal />
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}
