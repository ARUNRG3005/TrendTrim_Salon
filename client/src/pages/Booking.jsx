import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─── Floating Label Input ──────────────────────────────────────────────── */
function FloatField({ label, type = 'text', value, onChange, min, children, as = 'input' }) {
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

      {as === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-white dark:bg-zinc-900 rounded-xl px-4 pt-6 pb-3 text-on-surface dark:text-zinc-100 font-body-md border-2 appearance-none cursor-pointer transition-all duration-200 focus:outline-none
            ${focused ? 'border-primary dark:border-gold shadow-[0_0_0_4px_rgba(212,175,55,0.08)]' : 'border-outline-variant/40 dark:border-zinc-800 hover:border-outline/60'}`}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          min={min}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-white dark:bg-zinc-900 rounded-xl px-4 pt-6 pb-3 text-on-surface dark:text-zinc-100 font-body-md border-2 transition-all duration-200 focus:outline-none
            ${focused ? 'border-primary dark:border-gold shadow-[0_0_0_4px_rgba(212,175,55,0.08)]' : 'border-outline-variant/40 dark:border-zinc-800 hover:border-outline/60'}`}
        />
      )}

      {/* Select arrow icon */}
      {as === 'select' && (
        <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none transition-colors duration-200 ${focused ? 'text-primary dark:text-gold' : 'text-on-surface-variant'}`}>
          expand_more
        </span>
      )}
    </div>
  );
}

/* ─── Time Chip ─────────────────────────────────────────────────────────── */
function TimeChip({ time, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`time-chip relative py-3 rounded-xl font-label-caps text-[11px] tracking-widest border-2 transition-all duration-250 overflow-hidden group
        ${selected
          ? 'bg-primary dark:bg-gold text-white dark:text-zinc-950 border-primary dark:border-gold shadow-lg shadow-primary/20 scale-[0.97]'
          : 'bg-white dark:bg-zinc-900 border-outline-variant/40 dark:border-zinc-800 text-on-surface dark:text-zinc-300 hover:border-primary/60 dark:hover:border-gold/60 hover:shadow-md'
        }`}
    >
      <span className="relative z-10">{time}</span>
      {!selected && (
        <span className="absolute inset-0 bg-primary/5 dark:bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"/>
      )}
    </button>
  );
}

/* ─── Therapist Card ────────────────────────────────────────────────────── */
const therapists = [
  {
    name: 'Any Professional',
    title: 'Best Available',
    rating: 4.9,
    img: null,
    icon: 'groups',
  },
  {
    name: 'Dr. Sarah Sterling',
    title: 'Facial & Skin Expert',
    rating: 5.0,
    img: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Master Julian',
    title: 'Deep Tissue Specialist',
    rating: 4.8,
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
  },
];

const services = [
  { name: 'Signature Facial',  duration: '90 min', price: '$280', icon: 'face_retouching_natural' },
  { name: 'Deep Tissue Spa',   duration: '60 min', price: '$220', icon: 'self_improvement' },
  { name: 'Aesthetic Ritual',  duration: '120 min', price: '$380', icon: 'spa' },
];

const times = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function Booking() {
  const navigate = useNavigate();
  const { bookingForm, updateBookingForm } = useBooking();
  const { triggerAuthRequired } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');

  // ── Load preferences from localStorage on mount ──
  useEffect(() => {
    const savedService = localStorage.getItem('pref_service');
    const savedTherapist = localStorage.getItem('pref_therapist');
    
    if (savedService && !bookingForm.service) {
      updateBookingForm('service', savedService);
    } else if (!bookingForm.service) {
      updateBookingForm('service', services[0].name);
    }
    
    if (savedTherapist && !bookingForm.therapist) {
      updateBookingForm('therapist', savedTherapist);
    } else if (!bookingForm.therapist) {
      updateBookingForm('therapist', therapists[0].name);
    }
  }, []);

  // ── Save preferences to localStorage when values change ──
  useEffect(() => {
    if (bookingForm.service) {
      localStorage.setItem('pref_service', bookingForm.service);
    }
  }, [bookingForm.service]);

  useEffect(() => {
    if (bookingForm.therapist) {
      localStorage.setItem('pref_therapist', bookingForm.therapist);
    }
  }, [bookingForm.therapist]);

  const selectedService  = services.find(s => s.name === bookingForm.service)  || services[0];

  const goNext = () => {
    setError('');
    if (step === 0) {
      if (!bookingForm.service) { setError('Please select a service.'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!bookingForm.date)   { setError('Please select a date.'); return; }
      if (!selectedTime)       { setError('Please select a time slot.'); return; }
      updateBookingForm('time', selectedTime);
      setStep(2);
    } else {
      triggerAuthRequired(() => {
        navigate('/checkout');
      }, "Please login or create an account to continue booking.");
    }
  };
  
  const goBack = () => { setError(''); setStep(s => s - 1); };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-on-surface dark:text-zinc-100 font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 py-xl px-lg max-w-3xl mx-auto w-full page-transition">

        {/* Header */}
        <div className="text-center mb-xl">
          <span className="font-label-caps text-label-caps text-primary dark:text-gold tracking-[0.25em]">RITUAL SCHEDULER</span>
          <h1 className="font-display-lg text-display-lg text-on-background dark:text-white mt-xs">Reserve Sanctuary</h1>
          <p className="font-body-md text-on-surface-variant dark:text-zinc-400 mt-sm">Your bespoke wellness journey begins here.</p>
        </div>

        {/* Breadcrumbs funnel visual tracker */}
        <div className="mb-md">
          <Breadcrumbs />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-md flex items-center gap-sm p-sm bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 font-body-sm animate-[fadeIn_0.3s_ease]">
            <span className="material-symbols-outlined text-[18px] text-red-400">error</span>
            {error}
          </div>
        )}

        {/* ─ Step 0: Choose Service & Specialist ───────────────────── */}
        {step === 0 && (
          <div className="space-y-md animate-[pageFadeIn_0.4s_ease-out]">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-zinc-100 mb-md">Choose Your Ritual</h2>
            
            <div className="space-y-md">
              {services.map((svc) => (
                <button
                  key={svc.name}
                  type="button"
                  onClick={() => updateBookingForm('service', svc.name)}
                  className={`w-full flex items-center gap-lg p-lg rounded-2xl border-2 text-left transition-all duration-300 group custom-cursor-hover
                    ${bookingForm.service === svc.name
                      ? 'border-primary dark:border-gold bg-primary/5 dark:bg-gold/5 shadow-lg shadow-primary/10'
                      : 'border-outline-variant/40 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/50 dark:hover:border-gold/50 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${bookingForm.service === svc.name ? 'bg-primary dark:bg-gold text-white dark:text-zinc-950' : 'bg-surface-container dark:bg-zinc-800 text-primary dark:text-gold group-hover:bg-primary/10'}`}>
                    <span className="material-symbols-outlined text-[28px]">{svc.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline-md text-[18px] dark:text-white mb-xs">{svc.name}</h3>
                    <div className="flex gap-md text-on-surface-variant dark:text-zinc-400 font-body-sm">
                      <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]">schedule</span>{svc.duration}</span>
                      <span className="text-primary dark:text-gold font-label-caps">{svc.price}</span>
                    </div>
                  </div>
                  {bookingForm.service === svc.name && (
                    <span className="material-symbols-outlined text-primary dark:text-gold text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>

            {/* Therapist selection */}
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-zinc-100 pt-md mb-md">Choose Your Professional</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              {therapists.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => updateBookingForm('therapist', t.name)}
                  className={`flex flex-col items-center p-md rounded-2xl border-2 text-center transition-all duration-300 group custom-cursor-hover min-h-[180px] justify-center
                    ${bookingForm.therapist === t.name
                      ? 'border-primary dark:border-gold bg-primary/5 dark:bg-gold/5 shadow-md'
                      : 'border-outline-variant/40 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/50 dark:hover:border-gold/50 hover:shadow-sm'
                    }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container dark:bg-zinc-800 mb-sm ring-2 ring-offset-2 dark:ring-offset-zinc-950 transition-all duration-300
                    ring-transparent group-hover:ring-primary/30 dark:group-hover:ring-gold/30">
                    {t.img
                      ? <img src={t.img} alt={t.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[32px] text-primary dark:text-gold">{t.icon}</span></div>
                    }
                  </div>
                  <p className="font-headline-md text-[13px] dark:text-white leading-tight">{t.name}</p>
                  <p className="font-body-sm text-on-surface-variant dark:text-zinc-400 text-[11px] mt-xs">{t.title}</p>
                  <div className="flex items-center gap-xs mt-xs">
                    <span className="material-symbols-outlined text-gold text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">{t.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─ Step 1: Date & Time ────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-lg animate-[pageFadeIn_0.4s_ease-out]">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-zinc-100">Pick Your Date & Time</h2>

            {/* Floating Label Date Selection */}
            <FloatField
              label="APPOINTMENT DATE"
              type="date"
              value={bookingForm.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => updateBookingForm('date', e.target.value)}
            />

            {/* Time Slot Picker */}
            <div>
              <p className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400 tracking-widest mb-md">AVAILABLE TIME SLOTS</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-sm">
                {times.map((t) => (
                  <TimeChip key={t} time={t} selected={selectedTime === t} onClick={() => setSelectedTime(t)} />
                ))}
              </div>
            </div>

            {/* Summary preview bar */}
            {bookingForm.date && selectedTime && (
              <div className="flex items-center gap-md p-md bg-primary/5 dark:bg-gold/5 border border-primary/15 dark:border-gold/15 rounded-2xl animate-[fadeIn_0.4s_ease]">
                <span className="material-symbols-outlined text-primary dark:text-gold text-[28px]">event_available</span>
                <div>
                  <p className="font-headline-md text-[15px] dark:text-white">{bookingForm.service}</p>
                  <p className="font-body-sm text-on-surface-variant dark:text-zinc-400">
                    {bookingForm.date} at {selectedTime} · {bookingForm.therapist}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ Step 2: Review & Confirm ───────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-md animate-[pageFadeIn_0.4s_ease-out]">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-zinc-100 mb-md">Review Your Booking</h2>

            <div className="glass-card-light dark:bg-zinc-900 rounded-2xl border border-gold/15 dark:border-zinc-800 overflow-hidden shadow-xl">
              {/* Hero summary */}
              <div className="bg-primary dark:bg-gold text-white dark:text-zinc-950 p-lg flex items-center gap-lg">
                <div className="w-16 h-16 rounded-full bg-white/15 dark:bg-zinc-950/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[32px] text-gold dark:text-zinc-950">spa</span>
                </div>
                <div>
                  <p className="font-label-caps text-[10px] text-primary-fixed dark:text-zinc-800 tracking-widest">YOUR RITUAL</p>
                  <h3 className="font-headline-lg text-[22px]">{bookingForm.service}</h3>
                  <p className="font-body-sm opacity-90">{selectedService.duration} · {selectedService.price}</p>
                </div>
              </div>

              {/* Details rows */}
              {[
                { icon: 'person',          label: 'PROFESSIONAL', value: bookingForm.therapist },
                { icon: 'calendar_month',  label: 'DATE',         value: bookingForm.date      },
                { icon: 'schedule',        label: 'TIME',         value: bookingForm.time || selectedTime },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-lg px-lg py-md border-b border-outline-variant/20 dark:border-zinc-800/60 last:border-none">
                  <span className="material-symbols-outlined text-primary dark:text-gold text-[20px] w-6 text-center">{icon}</span>
                  <div>
                    <p className="font-label-caps text-[9px] text-on-surface-variant dark:text-zinc-400 tracking-widest">{label}</p>
                    <p className="font-headline-md text-[15px] dark:text-zinc-100">{value || '—'}</p>
                  </div>
                </div>
              ))}

              {/* Price row */}
              <div className="px-lg py-md flex justify-between items-center bg-surface-container-low dark:bg-zinc-950/40">
                <span className="font-label-caps text-on-surface-variant dark:text-zinc-400">TOTAL DUE TODAY</span>
                <span className="font-headline-lg text-headline-lg text-primary dark:text-gold">{selectedService.price}</span>
              </div>
            </div>

            <p className="text-center font-body-sm text-on-surface-variant dark:text-zinc-400 text-[11px]">
              Free cancellation up to 24 hours before your appointment.
            </p>
          </div>
        )}

        {/* ─ Navigation Buttons ─────────────────────────────────────── */}
        <div className={`mt-xl flex ${step > 0 ? 'justify-between' : 'justify-end'} items-center`}>
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-sm text-on-surface-variant dark:text-zinc-400 font-label-caps hover:text-primary dark:hover:text-gold transition-colors duration-200 group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
              BACK
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="shimmer-btn flex items-center gap-sm bg-primary dark:bg-gold text-white dark:text-zinc-950 font-label-caps px-xl py-md rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container dark:hover:bg-yellow-500 transition-all duration-300"
          >
            {step < 2 ? 'CONTINUE' : 'PROCEED TO CHECKOUT'}
            <span className="material-symbols-outlined text-[18px]">{step < 2 ? 'arrow_forward' : 'lock'}</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
