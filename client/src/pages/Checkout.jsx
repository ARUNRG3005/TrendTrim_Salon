import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─── Floating Label Input ──────────────────────────────────────────────── */
function FloatField({ label, type = 'text', value, onChange, placeholder, maxLength }) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;

  return (
    <div className="relative">
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 font-label-caps
          ${active
            ? 'top-2 text-[9px] tracking-[0.12em] text-primary dark:text-gold'
            : 'top-1/2 -translate-y-1/2 text-[11px] tracking-widest text-on-surface-variant/70 dark:text-zinc-400'
          }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        placeholder={focused ? placeholder : ''}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-white dark:bg-zinc-900 rounded-xl px-4 pt-6 pb-3 text-on-surface dark:text-zinc-100 font-body-md border-2 transition-all duration-200 focus:outline-none
          ${focused ? 'border-primary dark:border-gold shadow-[0_0_0_4px_rgba(212,175,55,0.08)]' : 'border-outline-variant/40 dark:border-zinc-800 hover:border-outline/60'}`}
      />
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingForm, createBooking } = useBooking();
  const { triggerAuthRequired } = useAuth();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);

  // Price calculations
  const price = bookingForm.service === 'Signature Facial' ? 195 : bookingForm.service === 'Deep Tissue Spa' ? 180 : 220;
  const serviceCharge = 15;
  const total = price + serviceCharge;

  const handlePay = async (e) => {
    e.preventDefault();
    triggerAuthRequired(async () => {
      if (!cardNumber || !expiry || !cvv || !cardName) {
        setError('Please complete all payment fields.');
        return;
      }
      setError('');
      setProcessing(true);

      // Simulate luxury API payment delay
      setTimeout(async () => {
        const confirmedBooking = await createBooking({
          time: bookingForm.time,
          price: total
        });
        setProcessing(false);
        navigate('/confirmed', { state: { booking: confirmedBooking } });
      }, 1500);
    }, "Please login or create an account to continue booking.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-on-surface dark:text-zinc-100 font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 py-xl px-lg max-w-4xl mx-auto w-full page-transition">
        
        {/* Header */}
        <div className="text-center mb-xl">
          <span className="font-label-caps text-label-caps text-primary dark:text-gold tracking-[0.2em]">SECURE TRANSACTION</span>
          <h1 className="font-display-lg text-display-lg text-on-background dark:text-white mt-xs">Checkout Summary</h1>
        </div>

        {/* Funnel Tracker */}
        <div className="mb-md">
          <Breadcrumbs />
        </div>

        {/* Back navigation option */}
        <div className="mb-md">
          <Link
            to="/booking"
            className="flex items-center gap-xs text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-gold transition-colors duration-200 font-label-caps text-xs group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
            Back to Scheduler
          </Link>
        </div>

        {error && (
          <div className="mb-md p-sm bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 font-body-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          
          {/* Order Summary */}
          <div className="md:col-span-5 space-y-md">
            <div className="glass-card-light dark:bg-zinc-900 rounded-2xl p-lg border border-gold/10 dark:border-zinc-800 shadow-lg space-y-sm">
              <h3 className="font-headline-md text-headline-md text-primary dark:text-gold pb-sm border-b border-outline-variant/30 dark:border-zinc-800">
                Itinerary Details
              </h3>
              
              <div className="flex justify-between font-body-sm">
                <span className="text-on-surface-variant dark:text-zinc-400">Treatment:</span>
                <span className="font-semibold text-primary dark:text-gold">{bookingForm.service || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between font-body-sm">
                <span className="text-on-surface-variant dark:text-zinc-400">Therapist:</span>
                <span className="font-semibold dark:text-zinc-200">{bookingForm.therapist || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between font-body-sm">
                <span className="text-on-surface-variant dark:text-zinc-400">Date:</span>
                <span className="font-semibold dark:text-zinc-200">{bookingForm.date || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between font-body-sm">
                <span className="text-on-surface-variant dark:text-zinc-400">Time:</span>
                <span className="font-semibold dark:text-zinc-200">{bookingForm.time || 'Not Selected'}</span>
              </div>
              
              <div className="pt-md border-t border-outline-variant/30 dark:border-zinc-800 space-y-xs">
                <div className="flex justify-between text-body-sm text-on-surface-variant dark:text-zinc-400">
                  <span>Ritual Fee</span>
                  <span>${price}.00</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant dark:text-zinc-400">
                  <span>Concierge Surcharge</span>
                  <span>${serviceCharge}.00</span>
                </div>
                <div className="flex justify-between text-body-md font-bold text-primary dark:text-gold pt-xs border-t border-outline-variant/10 dark:border-zinc-800">
                  <span>Total Amount</span>
                  <span>${total}.00</span>
                </div>
              </div>

            </div>

            {/* Inline Collapsible Cancellation Policy */}
            <div className="bg-white dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-800 rounded-2xl p-sm">
              <button
                type="button"
                onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
                className="w-full flex items-center justify-between text-left font-label-caps text-xs text-on-surface-variant dark:text-zinc-300 py-1 px-2 focus:outline-none"
              >
                <span>CANCELLATION POLICY</span>
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${showCancellationPolicy ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {showCancellationPolicy && (
                <div className="mt-2 p-2 border-t border-outline-variant/10 dark:border-zinc-800/60 text-[12px] text-on-surface-variant dark:text-zinc-400 font-body-sm leading-relaxed animate-[fadeIn_0.3s_ease]">
                  We value our specialist's time. Cancel or reschedule for free up to 24 hours prior. Cancellations within 24 hours are subject to a 50% ritual fee surcharge. No-shows will be charged at the full reserved rate.
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="md:col-span-7">
            <form onSubmit={handlePay} className="glass-card-light dark:bg-zinc-900 rounded-2xl p-lg border border-gold/10 dark:border-zinc-800 shadow-lg space-y-md">
              <h3 className="font-headline-md text-headline-md text-primary dark:text-gold pb-sm border-b border-outline-variant/30 dark:border-zinc-800">
                Credit Card Payment
              </h3>

              {/* Floating Labels Inputs */}
              <FloatField
                label="CARDHOLDER NAME"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Eleanor Vane"
              />

              <FloatField
                label="CARD NUMBER"
                value={cardNumber}
                maxLength="19"
                onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                placeholder="0000 0000 0000 0000"
              />

              <div className="grid grid-cols-2 gap-md">
                <FloatField
                  label="EXPIRY DATE"
                  value={expiry}
                  maxLength="5"
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                />
                
                <FloatField
                  label="CVV / CVC"
                  type="password"
                  value={cvv}
                  maxLength="3"
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="000"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-primary dark:bg-gold text-on-primary dark:text-zinc-950 font-label-caps text-label-caps py-md rounded-xl hover:bg-primary-container dark:hover:bg-yellow-500 transition-all shadow-xl font-bold flex items-center justify-center gap-xs cursor-pointer min-h-[48px]"
              >
                {processing ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                    <span>AUTHORIZING PAYMENT...</span>
                  </>
                ) : (
                  <span>AUTHORIZE CHARGE & RESERVE</span>
                )}
              </button>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
