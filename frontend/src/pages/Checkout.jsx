import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';

/* ─── Premium Float Field ────────────────────────────────────────────────── */
function FloatField({ label, type = 'text', value, onChange, placeholder, maxLength }) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        position: 'absolute', left: '16px', zIndex: 10,
        fontFamily: 'Tenor Sans, sans-serif',
        pointerEvents: 'none',
        transition: 'all 0.2s ease',
        ...(active
          ? { top: '10px', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: focused ? 'var(--champagne)' : 'var(--color-text-mute)' }
          : { top: '50%', transform: 'translateY(-50%)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }
        ),
      }}>
        {label}
      </label>
      <input
        type={type} value={value} maxLength={maxLength} onChange={onChange}
        placeholder={focused ? placeholder : ''}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: 'var(--color-surface)',
          border: `1px solid ${focused ? 'var(--champagne)' : 'var(--color-border)'}`,
          borderRadius: '14px',
          padding: '22px 16px 10px',
          fontFamily: 'Cormorant Garamond, serif', fontSize: '1.0625rem',
          color: 'var(--color-text)', outline: 'none',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          boxShadow: focused ? '0 0 0 3px rgba(201,169,110,0.1)' : 'none',
        }}
      />
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingForm, createBooking } = useBooking();
  const { triggerAuthRequired } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');
  const [cardName, setCardName]     = useState('');
  const [error, setError]           = useState('');
  const [processing, setProcessing] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);

  const price = bookingForm.price || (bookingForm.service === 'Signature Haircut & Style' ? 95 : bookingForm.service === 'Premium Color & Highlights' ? 180 : 250);
  const serviceCharge = 15;
  const total = price + serviceCharge;

  const handlePay = async (e) => {
    e.preventDefault();
    triggerAuthRequired(async () => {
      if (!cardNumber || !expiry || !cvv || !cardName) { setError('Please complete all payment fields.'); return; }
      setError('');
      setProcessing(true);
      setTimeout(async () => {
        const confirmedBooking = await createBooking({ time: bookingForm.time, price: total });
        setProcessing(false);
        navigate('/confirmed', { state: { booking: confirmedBooking } });
      }, 1500);
    }, 'Please login or create an account to continue booking.');
  };

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }} className="">

      {/* Page hero */}
      <section style={{ paddingTop: '110px', paddingBottom: 'clamp(2.5rem, 5vw, 4rem)', paddingLeft: 'clamp(1.25rem, 5vw, 4rem)', paddingRight: 'clamp(1.25rem, 5vw, 4rem)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div className="page-transition" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
            <span className="eyebrow-refined">Secure Transaction</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', letterSpacing: '-0.025em', lineHeight: 1.0, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
            Checkout Summary
          </h1>
        </div>
      </section>

      <main style={{ flex: 1, padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 4rem)', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <Breadcrumbs />
        </div>

        {/* Back link */}
        <Link to="/booking" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--color-text-dim)', textDecoration: 'none',
          marginBottom: '2rem', transition: 'color 0.2s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Back to Scheduler
        </Link>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(196,137,122,0.08)', border: '1px solid rgba(196,137,122,0.28)', borderRadius: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#C4897A', flexShrink: 0 }}>error</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 300, color: '#C4897A' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>

          {/* ─── Order Summary ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '1.375rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.1875rem', color: 'var(--champagne)', margin: 0 }}>Itinerary Details</h3>
              </div>
              {/* Items */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Service', value: bookingForm.service ? `${bookingForm.service} (${bookingForm.tier || 'Standard'})` : 'Not Selected' },
                  { label: 'Stylist', value: bookingForm.therapist || 'Not Selected' },
                  { label: 'Date', value: bookingForm.date || 'Not Selected' },
                  { label: 'Time', value: bookingForm.time || 'Not Selected' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'var(--color-text-dim)', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '0.9375rem', color: 'var(--color-text)', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>
              {/* Price breakdown */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Service Fee', val: `$${price}.00` },
                  { label: 'Booking Fee', val: `$${serviceCharge}.00` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'var(--color-text-dim)' }}>{r.label}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'var(--color-text-dim)' }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>Total Amount</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.5rem', color: 'var(--champagne)' }}>${total}.00</span>
                </div>
              </div>
            </div>

            {/* Cancellation policy */}
            <div style={{ borderRadius: '16px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
              <button type="button" onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--color-text-dim)',
                }}
              >
                <span>Cancellation Policy</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--champagne)', transition: 'transform 0.3s ease', transform: showCancellationPolicy ? 'rotate(180deg)' : 'none' }}>expand_more</span>
              </button>
              {showCancellationPolicy && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--color-border)', animation: 'fadeIn 0.3s ease' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: 'var(--color-text-dim)', lineHeight: 1.75, marginTop: '12px' }}>
                    Cancel or reschedule for free up to 24 hours prior. Cancellations within 24 hours are subject to a 50% service fee. No-shows are charged at the full reserved rate.
                  </p>
                </div>
              )}
            </div>

            {/* Security badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--champagne)', flexShrink: 0 }}>shield</span>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.6 }}>
                256-bit SSL encryption protects every transaction on TrendTrim.
              </p>
            </div>
          </div>

          {/* ─── Payment Form ─── */}
          <div>
            <form onSubmit={handlePay} style={{ borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '1.375rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--champagne)' }}>credit_card</span>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.1875rem', color: 'var(--champagne)', margin: 0 }}>Credit Card Payment</h3>
              </div>

              {/* Card logos */}
              <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                {['visa', 'mastercard', 'amex'].map(card => (
                  <div key={card} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>
                    {card}
                  </div>
                ))}
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <FloatField label="Cardholder Name" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Alexandra Beaumont" />
                <FloatField label="Card Number" value={cardNumber} maxLength="19"
                  onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  placeholder="0000 0000 0000 0000"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FloatField label="Expiry Date" value={expiry} maxLength="5" onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" />
                  <FloatField label="CVV / CVC" type="password" value={cvv} maxLength="3" onChange={e => setCvv(e.target.value)} placeholder="000" />
                </div>

                <button type="submit" disabled={processing}
                  className="shimmer-btn"
                  style={{
                    width: '100%', padding: '15px',
                    background: processing ? 'rgba(201,169,110,0.7)' : 'var(--champagne)',
                    color: '#0D0D0D',
                    borderRadius: '14px',
                    fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    border: 'none', cursor: processing ? 'wait' : 'pointer',
                    minHeight: '52px', fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                    transition: 'all 0.25s ease',
                    marginTop: '0.25rem',
                  }}
                >
                  {processing ? (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin-slow 0.8s linear infinite' }}>progress_activity</span>
                      Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                      Authorize Charge &amp; Reserve
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
