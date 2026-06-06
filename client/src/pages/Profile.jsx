import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

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
      <div className="min-h-screen flex flex-col bg-transparent text-zinc-800 dark:text-zinc-100 font-sans pt-20">
        <Navigation />
        <main className="flex-1 max-w-md mx-auto w-full px-md py-xl flex flex-col items-center justify-center page-transition text-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-lg shadow-xl space-y-md w-full">
            <span className="material-symbols-outlined text-gold text-[48px] block select-none">lock</span>
            <h3 className="font-serif text-lg font-bold text-[var(--primary)] dark:text-gold">Profile Locked</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xs mx-auto">
              Please login or create an account to view and configure your profile settings.
            </p>
            <div className="flex gap-sm justify-center pt-xs">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[var(--primary)] text-white hover:bg-opacity-95 font-label-caps text-[10px] font-bold px-lg py-2.5 rounded-xl transition-all cursor-pointer"
              >
                LOG IN
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="border-2 border-gold text-[#a37f4c] hover:bg-gold/5 font-label-caps text-[10px] font-bold px-lg py-2.5 rounded-xl transition-all cursor-pointer"
              >
                SIGN UP
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-800 dark:text-zinc-100 font-sans pt-20">
      <Navigation />

      {/* Main Profile Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-md py-xl flex flex-col items-center page-transition text-center">
        
        {/* Profile Card wrapper */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-lg md:p-xl shadow-xl space-y-lg w-full text-left">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center border-b border-zinc-100 dark:border-zinc-800 pb-md text-center">
            
            {/* Circular Profile Avatar (Strict Data Integrity) */}
            <div className="relative w-24 h-24 rounded-full border border-zinc-200 dark:border-zinc-800 bg-[var(--card)] dark:bg-zinc-950 flex items-center justify-center mb-sm flex-shrink-0 group">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User'} 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <span className="material-symbols-outlined text-[48px] text-zinc-400 select-none">person</span>
              )}

              {/* Upload Pencil Button */}
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#a37f4c] text-white flex items-center justify-center border-2 border-white dark:border-zinc-900 hover:bg-[#8e6c3d] transition-colors cursor-pointer"
                title="Upload Profile Image"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>

              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Remove photo button (only if photo uploaded) */}
            {user.avatar && (
              <button
                onClick={handleRemoveAvatar}
                className="text-[10px] text-red-500 font-bold hover:underline tracking-wide font-label-caps"
              >
                Remove photo
              </button>
            )}

            {/* Name and Email displays */}
            {user.name ? (
              <>
                <h3 className="font-serif text-[var(--primary)] dark:text-gold text-xl font-bold tracking-tight mt-sm">
                  {user.name}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans mt-0.5">
                  {user.email}
                </p>
              </>
            ) : (
              <div className="w-full max-w-xs mt-md bg-amber-50 border border-amber-200 rounded-xl p-md text-center">
                <span className="font-label-caps text-[9px] font-bold text-amber-700 bg-amber-100 px-sm py-0.5 rounded-full mb-xs inline-block">
                  COMPLETE YOUR PROFILE
                </span>
                <p className="text-[11px] text-amber-900 leading-normal mb-sm">
                  Please enter your name below to complete your sanctuary profile.
                </p>
                <form onSubmit={handleCompleteProfileSubmit} className="flex gap-xs">
                  <input
                    type="text"
                    required
                    value={completeName}
                    onChange={(e) => setCompleteName(e.target.value)}
                    placeholder="Full Name"
                    className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-gold text-zinc-800"
                  />
                  <button 
                    type="submit"
                    className="bg-[var(--primary)] text-white font-bold text-[10px] font-label-caps px-sm rounded-lg hover:bg-opacity-95 transition-all"
                  >
                    Save
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* EDIT PROFILE / INFO SECTION */}
          {user.name && (
            <div className="space-y-sm">
              <div className="flex justify-between items-center pb-xs border-b border-zinc-100 dark:border-zinc-800/60">
                <h4 className="font-serif text-sm font-bold text-[var(--primary)] dark:text-gold">User Information</h4>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditName(user.name || '');
                    setEditPhone(user.phone || '');
                  }}
                  className="text-xs font-bold text-[#a37f4c] hover:underline flex items-center gap-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isEditing ? 'close' : 'edit'}
                  </span>
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSaveChanges} className="space-y-sm pt-xs">
                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Eleanor Vane"
                      className="w-full bg-[var(--card)] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">PHONE NUMBER</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 0199"
                      className="w-full bg-[var(--card)] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[var(--primary)] text-white py-2 px-lg rounded-xl text-[10px] font-label-caps font-bold hover:bg-opacity-95 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                /* Read Only display (No auto-generated fake data) */
                <div className="space-y-sm text-xs py-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Full Name</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Email Address</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phone Number</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                      {user.phone || <span className="italic text-zinc-400">Not provided</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHANGE PASSWORD MOCK SECTION */}
          {user.name && (
            <div className="space-y-sm pt-xs border-t border-zinc-100 dark:border-zinc-800/60">
              <h4 className="font-serif text-sm font-bold text-[var(--primary)] dark:text-gold pb-xs border-b border-zinc-100 dark:border-zinc-800/60">
                Change Password
              </h4>

              {passwordStatus && (
                <div className={`p-sm rounded-lg text-[11px] text-center font-sans ${passwordStatus === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {passwordStatus === 'SUCCESS' ? 'Password successfully simulated updated.' : passwordStatus}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-xs pt-xs">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full bg-[var(--card)] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full bg-[var(--card)] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full bg-[var(--card)] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="mt-xs bg-[#a37f4c] text-white py-2 px-lg rounded-xl text-[10px] font-label-caps font-bold hover:bg-opacity-95 transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* ACCOUNT SETTINGS SECTION */}
          <div className="space-y-sm pt-xs border-t border-zinc-100 dark:border-zinc-800/60">
            <h4 className="font-serif text-sm font-bold text-[var(--primary)] dark:text-gold pb-xs border-b border-zinc-100 dark:border-zinc-800/60">
              Account Settings
            </h4>
            <div className="space-y-xs text-xs py-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between items-center py-1">
                <span>Sanctuary Level Tier</span>
                <span className="font-label-caps font-bold text-[10px] bg-gold/10 text-[#a37f4c] px-sm py-0.5 rounded-full border border-gold/20">
                  {user.tier || 'MEMBER'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>View Booking Portfolio</span>
                <Link
                  to="/portfolio"
                  className="text-xs font-bold text-[#a37f4c] hover:underline flex items-center gap-xs"
                >
                  <span>My Rituals</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <div className="pt-md border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleLogout}
              className="w-full bg-[#eae5df] dark:bg-zinc-850 border border-[#dcd7d0] dark:border-zinc-850/60 hover:bg-red-50 hover:border-red-200 hover:text-[#b91c1c] text-zinc-700 dark:text-zinc-300 font-label-caps text-xs tracking-wider py-3.5 rounded-xl font-bold flex items-center justify-center gap-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>LOGOUT ACCOUNT</span>
            </button>
          </div>

        </div>

        {/* Minimal Luxury Footer Branding */}
        <div className="mt-xl font-label-caps text-[9px] tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
          VERSION 2.4.0 — LUXEBOOK WELLNESS NETWORK
        </div>

      </main>

      <Footer />
    </div>
  );
}
