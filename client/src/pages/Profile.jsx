import React, { useState, useRef, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import BorderGlow from '../components/ui/BorderGlow';
import { InteractiveProductCard } from '../components/ui/card-7';

export default function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // Complete Profile State (If logged in with no name)
  const [completeName, setCompleteName] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  // Profile Image Upload (Base64 file reader)
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      updateUserProfile({ avatar: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      updateUserProfile({ avatar: '' });
    }
  };

  // Save Name & Phone changes
  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Name field cannot be left blank.');
      return;
    }
    updateUserProfile({ name: editName, phone: editPhone });
    setIsEditing(false);
  };

  // Initial prompt save for users logged in with blank names
  const handleCompleteProfileSubmit = (e) => {
    e.preventDefault();
    if (!completeName.trim()) return;
    updateUserProfile({ name: completeName });
  };

  // Change Password Submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordStatus('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('New passwords do not match.');
      return;
    }

    // Mock successful password update
    setPasswordStatus('SUCCESS');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Access Denied / Guest View
  if (!user) {
    return (
      <SidebarProvider>
        <Navigation />
        <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden', position: 'relative' }} className="">

          {/* Dynamic drifting background ambient glows */}
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', background: 'rgba(201,169,110,0.06)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
          <div className="animate-drift-medium" style={{ position: 'absolute', bottom: '10%', left: '3%', width: '350px', height: '350px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

          <main style={{ flex: 1, padding: 'clamp(7rem, 12vw, 10rem) clamp(1.25rem, 5vw, 4rem) clamp(4rem, 8vw, 6rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '480px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>

            <BorderGlow
              className="w-full page-transition"
              edgeSensitivity={35}
              glowColor="39 46 61"
              borderRadius={24}
              glowRadius={50}
              glowIntensity={1.0}
              animated={true}
              colors={['#9B7B45', '#C9A96E', '#E2C98A']}
              style={{ background: 'var(--color-surface)' }}
            >
              <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--champagne-dk), var(--champagne), var(--champagne-lt))' }} />

              <div style={{ padding: 'clamp(2.5rem, 5vw, 3.5rem) 2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span className="material-symbols-outlined text-gold" style={{ fontSize: '32px' }}>lock</span>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                  <span className="eyebrow-refined" style={{ color: 'var(--champagne)' }}>Access Denied</span>
                </div>

                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>
                  Profile Locked
                </h3>

                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-text-dim)', maxWidth: '320px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
                  Please login or create an account to view and configure your profile settings.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => navigate('/login')}
                    className="shimmer-btn"
                    style={{
                      background: 'var(--champagne)', color: '#0D0D0D',
                      padding: '12px 28px', borderRadius: '99px',
                      fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      border: 'none', cursor: 'pointer', minHeight: '44px', fontWeight: 500,
                    }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    style={{
                      background: 'transparent', color: 'var(--champagne)',
                      padding: '12px 28px', borderRadius: '99px',
                      fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      border: '1px solid rgba(201,169,110,0.4)', cursor: 'pointer', minHeight: '44px', fontWeight: 500,
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; e.currentTarget.style.borderColor = 'var(--champagne)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; }}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </BorderGlow>
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Member';

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden', position: 'relative' }} className="">

        {/* Dynamic drifting background ambient glows */}
        <div className="animate-drift-slow" style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', background: 'rgba(201,169,110,0.06)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="animate-drift-medium" style={{ position: 'absolute', bottom: '15%', left: '3%', width: '400px', height: '400px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="animate-drift-slow" style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'rgba(201,169,110,0.03)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none', zIndex: 0 }} />

        <main style={{ flex: 1, padding: 'clamp(6rem, 10vw, 8rem) clamp(1.25rem, 5vw, 4rem) clamp(4rem, 8vw, 6rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1100px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>

          {/* Prestige Hero Header */}
          <div className="page-transition text-center" style={{ marginBottom: '3rem', width: '100%' }}>
            <span className="eyebrow-refined" style={{ color: 'var(--champagne)' }}>Client Atelier</span>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 3.5rem)', letterSpacing: '-0.025em', lineHeight: 1.0, color: 'var(--color-text)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              Prestige Profile
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', maxWidth: '480px', margin: '0 auto' }}>
              Curate your signature preferences, membership status, and secure parameters.
            </p>
          </div>

          {/* Two-Column Cinematic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start page-transition">

            {/* Left Column: Avatar & Prestige Identity Card */}
            <BorderGlow
              className="w-full"
              edgeSensitivity={30}
              glowColor="39 46 61"
              borderRadius={24}
              glowRadius={50}
              glowIntensity={1.0}
              coneSpread={25}
              animated={true}
              colors={['#C9A96E', '#E2C98A', '#9B7B45']}
              style={{ background: 'var(--color-surface)' }}
            >
              <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--champagne-dk), var(--champagne), var(--champagne-lt))' }} />

              <div style={{ padding: '1rem 1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Prestige Profile Card */}
                <div style={{ width: '100%', height: '650px', position: 'relative', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <InteractiveProductCard
                    title={user?.name || 'Prestige Member'}
                    description={user?.email || 'TrendTrim VIP Client'}
                    price={user?.tier || 'PLATINUM MEMBER'}
                    imageUrl={user?.avatar || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    logoUrl="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"
                  />
                </div>

                {/* Photo Upload Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 20 }}>
                  <button
                    onClick={handleAvatarClick}
                    className="shimmer-btn"
                    style={{
                      background: 'var(--champagne)', color: '#0D0D0D',
                      padding: '8px 20px', borderRadius: '99px',
                      fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      border: 'none', cursor: 'pointer', minHeight: '36px', fontWeight: 500,
                    }}
                  >
                    Upload Photo
                  </button>
                  {user.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      style={{
                        background: 'transparent', color: '#C4897A',
                        padding: '8px 20px', borderRadius: '99px',
                        fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px',
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        border: '1px solid rgba(196,137,122,0.3)', cursor: 'pointer', minHeight: '36px', fontWeight: 500,
                        transition: 'all 0.25s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,137,122,0.05)'; e.currentTarget.style.borderColor = 'rgba(196,137,122,0.5)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,137,122,0.3)'; }}
                    >
                      Remove Photo
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Complete Profile Form if name is missing */}
                {!user.name && (
                  <div style={{ width: '100%', background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 20 }}>
                    <span style={{
                      fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', fontWeight: 'bold',
                      letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: 'var(--champagne-dk)', background: 'rgba(201,169,110,0.12)',
                      padding: '4px 12px', borderRadius: '99px', marginBottom: '8px', display: 'inline-block'
                    }}>
                      Complete Your Profile
                    </span>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--color-text-dim)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      Please enter your name below to complete your salon profile.
                    </p>
                    <form onSubmit={handleCompleteProfileSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <input
                        type="text"
                        required
                        value={completeName}
                        onChange={(e) => setCompleteName(e.target.value)}
                        placeholder="Full Name"
                        style={{
                          flex: 1, background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)', borderRadius: '8px',
                          padding: '8px 12px', fontSize: '12px', outline: 'none',
                          color: 'var(--color-text)',
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          background: 'var(--champagne)', color: '#0D0D0D',
                          fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', fontWeight: 'bold',
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          padding: '0 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </form>
                  </div>
                )}

                {/* Logout Button inside the identity card */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', background: 'rgba(196,137,122,0.05)', color: '#C4897A',
                    border: '1px solid rgba(196,137,122,0.2)', padding: '12px', borderRadius: '14px',
                    fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', fontWeight: 'bold',
                    letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.25s ease', marginTop: '0.5rem', position: 'relative', zIndex: 20
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,137,122,0.1)'; e.currentTarget.style.borderColor = 'rgba(196,137,122,0.4)'; e.currentTarget.style.color = '#e09888'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(196,137,122,0.05)'; e.currentTarget.style.borderColor = 'rgba(196,137,122,0.2)'; e.currentTarget.style.color = '#C4897A'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>logout</span>
                  <span>Logout Account</span>
                </button>

              </div>
            </BorderGlow>

            {/* Right Column: Preferences Details & Security Panel */}
            <BorderGlow
              className="w-full lg:col-span-2"
              edgeSensitivity={30}
              glowColor="39 46 61"
              borderRadius={24}
              glowRadius={55}
              glowIntensity={0.8}
              coneSpread={25}
              animated={true}
              colors={['#C9A96E', '#9B7B45', '#E2C98A']}
              style={{ background: 'var(--color-surface)' }}
            >
              <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--champagne-dk), var(--champagne), var(--champagne-lt))' }} />

              <div style={{ padding: '2.25rem 2rem' }}>

                {/* EDIT PROFILE / INFO SECTION */}
                {user.name && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.35rem', color: 'var(--color-text)', margin: 0 }}>
                          Profile Identity
                        </h4>
                        <span style={{
                          fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', fontWeight: 'bold',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: 'var(--champagne)', background: 'rgba(201,169,110,0.08)',
                          padding: '3px 10px', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '99px',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          boxShadow: '0 0 10px rgba(201,169,110,0.1)'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>diamond</span>
                          {user.tier || 'STANDARD'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setEditName(user.name || '');
                          setEditPhone(user.phone || '');
                        }}
                        style={{
                          background: 'none', border: 'none', color: 'var(--champagne)',
                          fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          fontWeight: 500,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                          {isEditing ? 'close' : 'edit'}
                        </span>
                        <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                      </button>
                    </div>

                    {isEditing ? (
                      /* Edit Form */
                      <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', fontWeight: 'bold' }}>Full Name</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Eleanor Vane"
                            className="lux-input"
                            style={{
                              background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)',
                              padding: '6px 0', fontSize: '13px', outline: 'none', color: 'var(--color-text)',
                              fontFamily: 'DM Sans, sans-serif',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', fontWeight: 'bold' }}>Phone Number</label>
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="+1 (555) 0199"
                            className="lux-input"
                            style={{
                              background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)',
                              padding: '6px 0', fontSize: '13px', outline: 'none', color: 'var(--color-text)',
                              fontFamily: 'DM Sans, sans-serif',
                            }}
                          />
                        </div>

                        <button
                          type="submit"
                          className="shimmer-btn"
                          style={{
                            background: 'var(--champagne)', color: '#0D0D0D',
                            padding: '11px 24px', borderRadius: '99px',
                            fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            border: 'none', cursor: 'pointer', minHeight: '40px', fontWeight: 500,
                            alignSelf: 'flex-start', marginTop: '0.5rem',
                          }}
                        >
                          Save Changes
                        </button>
                      </form>
                    ) : (
                      /* Read Only display */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(180,165,140,0.08)', paddingBottom: '0.625rem' }}>
                          <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Full Name</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 400, color: 'var(--color-text)' }}>{user.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(180,165,140,0.08)', paddingBottom: '0.625rem' }}>
                          <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Email Address</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 400, color: 'var(--color-text)' }}>{user.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(180,165,140,0.08)', paddingBottom: '0.625rem' }}>
                          <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Phone Number</span>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 400, color: 'var(--color-text)' }}>
                            {user.phone || <span style={{ fontStyle: 'italic', color: 'var(--color-text-mute)' }}>Not provided</span>}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CHANGE PASSWORD MOCK SECTION */}
                {user.name && (
                  <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.35rem', color: 'var(--color-text)', margin: '0 0 1.25rem' }}>
                      Security Credentials
                    </h4>

                    {passwordStatus && (
                      <div style={{
                        padding: '10px 16px', borderRadius: '12px', fontSize: '11px', textAlign: 'center', marginBottom: '1.25rem',
                        ...(passwordStatus === 'SUCCESS'
                          ? { background: 'rgba(72,199,142,0.1)', color: '#48c78e', border: '1px solid rgba(72,199,142,0.25)' }
                          : { background: 'rgba(196,137,122,0.1)', color: '#C4897A', border: '1px solid rgba(196,137,122,0.25)' }
                        )
                      }}>
                        {passwordStatus === 'SUCCESS' ? 'Password update simulated successfully.' : passwordStatus}
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        style={{
                          background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)',
                          padding: '8px 0', fontSize: '13px', outline: 'none', color: 'var(--color-text)',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        style={{
                          background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)',
                          padding: '8px 0', fontSize: '13px', outline: 'none', color: 'var(--color-text)',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        style={{
                          background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)',
                          padding: '8px 0', fontSize: '13px', outline: 'none', color: 'var(--color-text)',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          background: 'transparent', color: 'var(--champagne)',
                          padding: '10px 24px', borderRadius: '99px',
                          fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          border: '1px solid rgba(201,169,110,0.4)', cursor: 'pointer', minHeight: '40px', fontWeight: 500,
                          alignSelf: 'flex-start', marginTop: '0.5rem', transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; e.currentTarget.style.borderColor = 'var(--champagne)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; }}
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                )}

                {/* ACCOUNT SETTINGS SECTION */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.35rem', color: 'var(--color-text)', margin: '0 0 1.25rem' }}>
                    Prestige Settings
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(180,165,140,0.08)', paddingBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Membership Tier</span>
                      <span style={{
                        fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', fontWeight: 'bold',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--champagne)', background: 'rgba(201,169,110,0.08)',
                        padding: '4px 12px', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '99px'
                      }}>
                        {user.tier || 'MEMBER'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(180,165,140,0.08)', paddingBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>View Booking Portfolio</span>
                      <Link
                        to="/portfolio"
                        style={{
                          fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', fontWeight: 'bold',
                          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--champagne)',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne-lt)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--champagne)'}
                      >
                        <span>My Appointments</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </BorderGlow>
          </div>

          {/* Minimal Luxury Footer Branding */}
          <div style={{ marginTop: '2.5rem', fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-text-mute)', opacity: 0.7, textAlign: 'center' }}>
            Version 2.4.0 — TrendTrim Salon Network
          </div>

        </main>

        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
