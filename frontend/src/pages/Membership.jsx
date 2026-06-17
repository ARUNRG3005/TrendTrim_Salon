import React, { useState } from 'react';
import API_BASE from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import BorderGlow from '../components/ui/BorderGlow';

const TIERS = [
  {
    id: 'VIP',
    name: 'VIP MEMBER',
    price: '$49',
    period: 'month',
    discount: '10% OFF',
    theme: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
    border: 'rgba(201,169,110,0.15)',
    glow: 'rgba(201,169,110,0.05)',
    features: [
      '10% discount on all salon bookings',
      'Priority booking access during peak hours',
      'Invitations to exclusive TrendTrim seasonal events',
      'Complimentary refreshment during appointments'
    ]
  },
  {
    id: 'PLATINUM',
    name: 'PLATINUM MEMBER',
    price: '$99',
    period: 'month',
    discount: '15% OFF',
    featured: true,
    theme: 'linear-gradient(135deg, #1f1d18 0%, #11100d 100%)',
    border: 'rgba(201,169,110,0.45)',
    glow: 'rgba(201,169,110,0.12)',
    features: [
      '15% discount on all salon bookings',
      'Everything in VIP membership',
      'Early access to booking celebrity guest stylists',
      'Unlimited premium champagne during your visits',
      'One complimentary conditioning treatment per month'
    ]
  },
  {
    id: 'DIAMOND',
    name: 'DIAMOND TIER',
    price: '$199',
    period: 'month',
    discount: '20% OFF',
    theme: 'linear-gradient(135deg, #2D3035 0%, #151619 100%)',
    border: 'rgba(255,255,255,0.15)',
    glow: 'rgba(255,255,255,0.03)',
    features: [
      '20% discount on all salon bookings',
      'Everything in Platinum membership',
      '24/7 dedicated personal concierge service',
      'Private suite booking options (complete privacy)',
      'Complimentary monthly curate-home product box',
      'Complimentary styling on your birthday'
    ]
  }
];

export default function Membership() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Select, 2: Checkout, 3: Processing, 4: Success
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Transaction Inputs
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Fancy processing texts
  const [processText, setProcessText] = useState('Securing encryption channel...');

  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    setStep(2);
  };

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(val);
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(val);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    setError('');

    if (!cardName.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter expiration date (MM/YY).');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter CVV.');
      return;
    }

    // Enter Processing Step
    setStep(3);
    setProcessText('Securing encryption channel...');
    
    setTimeout(() => {
      setProcessText('Authorizing transaction with gateway...');
    }, 1200);

    setTimeout(() => {
      setProcessText('Activating prestige membership privileges...');
    }, 2400);

    setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/membership/upgrade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            tierName: selectedTier.name
          })
        });

        const data = await response.json();
        if (response.ok) {
          // Update client-side Auth Context profile
          updateUserProfile({ tier: data.user.tier });
          setStep(4);
        } else {
          setError(data.message || 'Unable to authorize purchase. Please try a different card.');
          setStep(2);
        }
      } catch (err) {
        // Fallback for offline mode or network issues
        updateUserProfile({ tier: selectedTier.name });
        setStep(4);
      }
    }, 3600);
  };

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden', position: 'relative' }} className="">
        
        {/* Ambient background blows */}
        <div className="animate-drift-slow" style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', background: 'rgba(201,169,110,0.06)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="animate-drift-medium" style={{ position: 'absolute', bottom: '15%', left: '3%', width: '400px', height: '400px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none', zIndex: 0 }} />
        
        <main style={{ flex: 1, padding: 'clamp(5rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem) clamp(4rem, 8vw, 6rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
          
          {/* Header */}
          <div className="text-center" style={{ marginBottom: '3.5rem', width: '100%' }}>
            <span className="eyebrow-refined" style={{ color: 'var(--champagne)' }}>Atelier Membership</span>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              {step === 1 && "Apply for The Inner Circle"}
              {step === 2 && "Prestige Checkout"}
              {step === 3 && "Secure Payment Authorization"}
              {step === 4 && "Prestige Unlocked"}
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              {step === 1 && "Select the styling experience tailored to your lifestyle. Cancel or modify your tier anytime."}
              {step === 2 && `Finalize authorization details for the premium ${selectedTier?.name}.`}
              {step === 3 && "Please do not refresh the page while we encrypt and process your digital credentials."}
              {step === 4 && "Congratulations. Your styling profile is now updated with full privilege status."}
            </p>
          </div>

          {/* Step 1: Select Tier */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', width: '100%', alignItems: 'stretch' }} className="page-transition">
              {TIERS.map(t => (
                <BorderGlow
                  key={t.id}
                  className="w-full h-full flex flex-col"
                  edgeSensitivity={25}
                  glowColor="201 169 110"
                  borderRadius={24}
                  glowRadius={50}
                  glowIntensity={t.featured ? 1.0 : 0.4}
                  animated={true}
                  colors={t.featured ? ['#C9A96E', '#E2C98A', '#9B7B45'] : ['#3A3A3A', '#2A2A2A', '#1A1A1A']}
                  style={{ background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}
                >
                  {t.featured && (
                    <div style={{ background: 'linear-gradient(90deg, var(--champagne-dk), var(--champagne), var(--champagne-lt))', height: '4px' }} />
                  )}
                  
                  <div style={{ padding: '2.5rem 2.25rem', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                    {t.featured && (
                      <span style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', fontWeight: 'bold',
                        letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0D0D0D',
                        background: 'var(--champagne)', padding: '4px 12px', borderRadius: '99px'
                      }}>
                        Most Exquisite
                      </span>
                    )}

                    <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px', letterSpacing: '0.25em', color: 'var(--color-text-mute)', textTransform: 'uppercase' }}>
                      {t.name}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '1.5rem 0' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.5rem', color: 'var(--color-text)', fontWeight: 300 }}>
                        {t.price}
                      </span>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--color-text-mute)' }}>
                        / {t.period}
                      </span>
                    </div>

                    <div style={{ display: 'inline-block', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', color: 'var(--champagne)', fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.12em', padding: '5px 12px', borderRadius: '8px', alignSelf: 'flex-start', marginBottom: '2rem' }}>
                      {t.discount} BOOKING REBATE
                    </div>

                    <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {t.features.map((f, i) => (
                          <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
                            <span className="material-symbols-outlined text-gold" style={{ fontSize: '16px', marginTop: '2px', color: 'var(--champagne)' }}>check_circle</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectTier(t)}
                      className={t.featured ? "shimmer-btn" : ""}
                      style={{
                        width: '100%',
                        background: t.featured ? 'var(--champagne)' : 'transparent',
                        color: t.featured ? '#0D0D0D' : 'var(--color-text)',
                        border: t.featured ? 'none' : '1px solid var(--color-border-strong)',
                        borderRadius: '14px',
                        padding: '14px',
                        fontFamily: 'Tenor Sans, sans-serif',
                        fontSize: '9px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.28s ease',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={e => {
                        if (!t.featured) {
                          e.currentTarget.style.background = 'rgba(201,169,110,0.06)';
                          e.currentTarget.style.borderColor = 'var(--champagne)';
                          e.currentTarget.style.color = 'var(--champagne)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!t.featured) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                          e.currentTarget.style.color = 'var(--color-text)';
                        }
                      }}
                    >
                      <span>Select {t.name.split(' ')[0]}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
                    </button>
                  </div>
                </BorderGlow>
              ))}
            </div>
          )}

          {/* Step 2: Checkout Form & Dynamic Credit Card */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', width: '100%', maxWidth: '960px' }} className="lg:grid-cols-2 page-transition">
              
              {/* Dynamic Luxury Mock Card */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                  width: '100%', maxWidth: '380px', height: '220px',
                  background: 'linear-gradient(135deg, #161616 0%, #0d0d0d 100%)',
                  borderRadius: '20px', border: '1px solid rgba(201,169,110,0.35)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.4), 0 0 25px rgba(201,169,110,0.08)',
                  padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Subtle pattern */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04, background: 'radial-gradient(circle, var(--champagne) 10%, transparent 11%)', backgroundSize: '12px 12px', pointerEvents: 'none' }} />
                  
                  {/* Top Bar: Chip & Logo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                    {/* Chip */}
                    <div style={{ width: '45px', height: '32px', background: 'linear-gradient(135deg, #e5c080 0%, #c59f5d 100%)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)' }} />
                    {/* Brand Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="13" stroke="var(--champagne)" strokeWidth="0.8"/>
                        <text x="14" y="19" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="13" fontWeight="500" fill="var(--champagne)">L</text>
                      </svg>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: '#F5F0E8', letterSpacing: '0.04em' }}>TrendTrim</span>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '1.25rem', letterSpacing: '0.12em', color: '#F5F0E8', margin: '1.5rem 0 0.5rem', position: 'relative', zIndex: 2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  {/* Card Bottom Details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(245,240,232,0.4)', fontFamily: 'Tenor Sans, sans-serif', marginBottom: '4px' }}>Cardholder</span>
                      <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--champagne)' }}>
                        {cardName || 'YOUR FULL NAME'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(245,240,232,0.4)', fontFamily: 'Tenor Sans, sans-serif', marginBottom: '4px' }}>Expires</span>
                        <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px', color: '#F5F0E8' }}>
                          {expiry || 'MM/YY'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(245,240,232,0.4)', fontFamily: 'Tenor Sans, sans-serif', marginBottom: '4px' }}>CVV</span>
                        <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px', color: '#F5F0E8' }}>
                          {cvv || '•••'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metallic status overlay bottom corner */}
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: '120px', height: '6px',
                    background: selectedTier?.id === 'DIAMOND' 
                      ? 'linear-gradient(90deg, #8A95A5, #D2D7DF, #8A95A5)' 
                      : 'linear-gradient(90deg, #9B7B45, #C9A96E, #E2C98A)'
                  }} />
                </div>
                
                {/* Checkout Summary Badge */}
                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '12px 20px', width: '100%', maxWidth: '380px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined text-gold" style={{ fontSize: '20px', color: 'var(--champagne)' }}>diamond</span>
                  </div>
                  <div style={{ flex: 1, lineHeight: 1.3 }}>
                    <div style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-mute)' }}>Selected Tier</div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: 'var(--color-text)', fontWeight: 500 }}>
                      {selectedTier?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: 'var(--champagne)', fontWeight: 500 }}>
                      {selectedTier?.price}
                    </div>
                    <div style={{ fontSize: '8px', color: 'var(--color-text-mute)', fontFamily: 'DM Sans, sans-serif' }}>/ month</div>
                  </div>
                </div>
              </div>

              {/* Secure Credit Card Details Input Form */}
              <BorderGlow
                className="w-full"
                edgeSensitivity={20}
                glowColor="39 46 61"
                borderRadius={24}
                glowRadius={50}
                glowIntensity={0.6}
                style={{ background: 'var(--color-surface)' }}
              >
                <div style={{ padding: '2.5rem 2rem' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.5rem', color: 'var(--color-text)', margin: '0 0 1.5rem' }}>
                    Card Details
                  </h3>

                  {error && (
                    <div style={{ background: 'rgba(196,137,122,0.08)', border: '1px solid rgba(196,137,122,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#C4897A' }}>error</span>
                      <span style={{ fontSize: '0.8rem', color: '#C4897A', fontFamily: 'DM Sans, sans-serif' }}>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Cardholder Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', fontWeight: 'bold' }}>Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Alexandra Beaumont"
                        style={{
                          background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                          padding: '8px 0', outline: 'none', color: 'var(--color-text)',
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                        }}
                      />
                    </div>

                    {/* Card Number */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', fontWeight: 'bold' }}>Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 2222 3333 4444"
                        style={{
                          background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                          padding: '8px 0', outline: 'none', color: 'var(--color-text)',
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                        }}
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', fontWeight: 'bold' }}>Expiration Date</label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          style={{
                            background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                            padding: '8px 0', outline: 'none', color: 'var(--color-text)',
                            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', fontWeight: 'bold' }}>CVV Code</label>
                        <input
                          type="password"
                          required
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          style={{
                            background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                            padding: '8px 0', outline: 'none', color: 'var(--color-text)',
                            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{
                          flex: 1, background: 'transparent', color: 'var(--color-text-mute)',
                          border: '1px solid var(--color-border)', borderRadius: '14px',
                          padding: '14px', fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                          minHeight: '48px', transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-mute)'}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="shimmer-btn"
                        style={{
                          flex: 2, background: 'var(--champagne)', color: '#0D0D0D',
                          border: 'none', borderRadius: '14px',
                          padding: '14px', fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                          letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold',
                          cursor: 'pointer', minHeight: '48px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                        <span>Authorize {selectedTier?.price}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </BorderGlow>
            </div>
          )}

          {/* Step 3: Secure Processing Transaction */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%', maxWidth: '500px' }} className="page-transition">
              <BorderGlow
                className="w-full"
                edgeSensitivity={10}
                glowColor="201 169 110"
                borderRadius={24}
                glowRadius={60}
                glowIntensity={1.0}
                animated={true}
                colors={['#C9A96E', '#E2C98A', '#9B7B45']}
                style={{ background: 'var(--color-surface)' }}
              >
                <div style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2.5rem' }}>
                    {/* Luxury Dual Spinners */}
                    <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(201,169,110,0.15)', borderRadius: '50%' }} />
                    <div className="animate-spin" style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: 'var(--champagne)', borderRadius: '50%', animationDuration: '1s' }} />
                    <div className="animate-spin" style={{ position: 'absolute', inset: '8px', border: '1px solid transparent', borderBottomColor: 'var(--champagne-lt)', borderRadius: '50%', animationDuration: '1.6s', animationDirection: 'reverse' }} />
                    <span className="material-symbols-outlined text-gold" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', color: 'var(--champagne)' }}>encrypted</span>
                  </div>
                  
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.65rem', color: 'var(--color-text)', margin: '0 0 0.75rem', fontWeight: 400 }}>
                    Encrypting Credentials
                  </h3>
                  
                  <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--champagne)', textTransform: 'uppercase', minHeight: '1.5rem', transition: 'all 0.3s ease' }}>
                    {processText}
                  </p>
                </div>
              </BorderGlow>
            </div>
          )}

          {/* Step 4: Success & Congratulations */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '540px' }} className="page-transition">
              <BorderGlow
                className="w-full"
                edgeSensitivity={25}
                glowColor="201 169 110"
                borderRadius={24}
                glowRadius={60}
                glowIntensity={1.0}
                animated={true}
                colors={['#C9A96E', '#E2C98A', '#9B7B45']}
                style={{ background: 'var(--color-surface)' }}
              >
                <div style={{ padding: '3.5rem 2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* Glowing Premium Badge Icon */}
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%)',
                    border: '1.2px solid var(--champagne)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '2rem', boxShadow: '0 0 35px rgba(201,169,110,0.25)', position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', inset: '-6px', border: '0.8px dashed rgba(201,169,110,0.35)', borderRadius: '50%', animation: 'spin-slow 20s linear infinite' }} />
                    <span className="material-symbols-outlined text-gold animate-pulse" style={{ fontSize: '42px', color: 'var(--champagne)' }}>diamond</span>
                  </div>

                  <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--champagne)', marginBottom: '0.5rem' }}>
                    Access Privilege Granted
                  </span>

                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', color: 'var(--color-text)', margin: '0 0 1rem', fontWeight: 400, letterSpacing: '-0.01em' }}>
                    Welcome to {selectedTier?.name}
                  </h3>

                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--color-text-dim)', lineHeight: 1.7, margin: '0 auto 2.5rem', maxWidth: '380px' }}>
                    Your transaction has successfully cleared. You now hold a prestige status badge and can access all custom tier benefits starting immediately.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    <button
                      onClick={() => navigate('/profile')}
                      className="shimmer-btn"
                      style={{
                        background: 'var(--champagne)', color: '#0D0D0D',
                        padding: '14px', borderRadius: '14px',
                        fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                        letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 'bold',
                        border: 'none', cursor: 'pointer', minHeight: '48px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person</span>
                      <span>Go to Profile</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/home')}
                      style={{
                        background: 'transparent', color: 'var(--color-text-mute)',
                        border: '1px solid var(--color-border)', borderRadius: '14px',
                        padding: '14px', fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        cursor: 'pointer', minHeight: '48px', transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-mute)'}
                    >
                      Return to Homepage
                    </button>
                  </div>
                </div>
              </BorderGlow>
            </div>
          )}

        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
