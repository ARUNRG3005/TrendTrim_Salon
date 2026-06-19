import React, { useState, useEffect } from 'react';
import API_BASE from '../api';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import NumberFlow from '@number-flow/react';
import SpotlightCard from '../components/ui/SpotlightCard';
import { CalendarWithTimePresets } from '../components/ui/calendar-with-time-presets';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

/* ─── Floating Label Field ───────────────────────────────────────────────── */
function FloatField({ label, type = 'text', value, onChange, min, children, as = 'input' }) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;

  const sharedStyle = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid',
    borderColor: focused ? 'var(--champagne)' : 'var(--color-border)',
    borderRadius: '14px',
    padding: '22px 16px 10px',
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.0625rem',
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    boxShadow: focused ? '0 0 0 3px rgba(201,169,110,0.1)' : 'none',
    appearance: 'none',
    cursor: as === 'select' ? 'pointer' : 'text',
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        position: 'absolute', left: '16px',
        transition: 'all 0.2s ease',
        pointerEvents: 'none', zIndex: 10,
        fontFamily: 'Tenor Sans, sans-serif',
        ...(active
          ? { top: '9px', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: focused ? 'var(--champagne)' : 'var(--color-text-mute)' }
          : { top: '50%', transform: 'translateY(-50%)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }
        ),
      }}>
        {label}
      </label>

      {as === 'select' ? (
        <select value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={sharedStyle}
        >
          {children}
        </select>
      ) : (
        <input type={type} value={value} min={min} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...sharedStyle, colorScheme: type === 'date' ? 'dark' : undefined }}
        />
      )}

      {as === 'select' && (
        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none', color: focused ? 'var(--champagne)' : 'var(--color-text-mute)', transition: 'color 0.25s ease' }}>
          expand_more
        </span>
      )}
    </div>
  );
}

/* ─── Time Chip ─────────────────────────────────────────────────────────── */
function TimeChip({ time, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        padding: '12px 6px',
        borderRadius: '12px',
        fontFamily: 'Tenor Sans, sans-serif',
        fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
        border: selected ? '1px solid var(--champagne)' : '1px solid var(--color-border)',
        background: selected ? 'var(--champagne)' : 'var(--color-surface)',
        color: selected ? '#0D0D0D' : 'var(--color-text-dim)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: selected ? 'scale(0.97)' : 'scale(1)',
        boxShadow: selected ? '0 4px 16px rgba(201,169,110,0.25)' : 'none',
        minHeight: '46px',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.45)'; e.currentTarget.style.color = 'var(--champagne)'; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-dim)'; } }}
    >
      {time}
    </button>
  );
}

/* ─── Data ──────────────────────────────────────────────────────────────── */
const DEFAULT_STYLISTS = [
  { name: 'Any Professional', title: 'Best Available', rating: 4.9, img: null, icon: 'groups' },
  { name: 'Jessica Monroe', title: 'Senior Hair Stylist', rating: 5.0, img: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80' },
  { name: 'David Chen', title: 'Color Specialist', rating: 4.8, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80' },
];

const DEFAULT_SERVICES = [
  // HAIR
  { name: 'Signature Haircut & Style', duration: '60 MIN', price: '$95', icon: 'content_cut', category: 'Hair' },
  { name: 'Luxury Blowout', duration: '45 MIN', price: '$65', icon: 'air', category: 'Hair' },
  { name: 'Deep Conditioning Keratin Therapy', duration: '75 MIN', price: '$120', icon: 'spa', category: 'Hair' },
  { name: 'Silk Press & Scalp Care', duration: '90 MIN', price: '$110', icon: 'dry', category: 'Hair' },
  { name: 'Custom Extension Fitting', duration: '150 MIN', price: '$300', icon: 'extension', category: 'Hair' },
  { name: 'Olaplex Restructuring Ritual', duration: '45 MIN', price: '$85', icon: 'medical_services', category: 'Hair' },
  { name: 'Scalp Detox & High-Frequency Massage', duration: '60 MIN', price: '$90', icon: 'wash', category: 'Hair' },
  { name: 'Editorial Event Hair Updo', duration: '75 MIN', price: '$135', icon: 'event', category: 'Hair' },
  { name: 'Brazilian Blowout Treatment', duration: '120 MIN', price: '$280', icon: 'bolt', category: 'Hair' },
  { name: 'Premium Hair Botox Styling', duration: '90 MIN', price: '$190', icon: 'health_and_safety', category: 'Hair' },

  // COLOR
  { name: 'Premium Color & Highlights', duration: '90 MIN', price: '$180', icon: 'palette', category: 'Color' },
  { name: 'Signature French Balayage', duration: '150 MIN', price: '$240', icon: 'brush', category: 'Color' },
  { name: 'Platinum Double Process Blonde', duration: '180 MIN', price: '$290', icon: 'color_lens', category: 'Color' },
  { name: 'Full Head Foil Highlights', duration: '120 MIN', price: '$195', icon: 'grid_view', category: 'Color' },
  { name: 'Root Touch-Up & Shine Glaze', duration: '60 MIN', price: '$115', icon: 'opacity', category: 'Color' },
  { name: 'Creative Fashion Color', duration: '150 MIN', price: '$220', icon: 'auto_awesome', category: 'Color' },
  { name: 'Color Correction Consultation', duration: '180 MIN', price: '$320', icon: 'build', category: 'Color' },
  { name: 'Ombre Hair Graduation', duration: '120 MIN', price: '$210', icon: 'gradient', category: 'Color' },
  { name: 'Pastel Hair Tone Glazing', duration: '45 MIN', price: '$95', icon: 'invert_colors', category: 'Color' },
  { name: 'Sun-Kissed Babylights', duration: '90 MIN', price: '$165', icon: 'wb_sunny', category: 'Color' },

  // BEAUTY
  { name: 'Bridal Makeup Package', duration: '120 MIN', price: '$250', icon: 'face_retouching_natural', category: 'Beauty' },
  { name: 'Editorial Photographic Glamour', duration: '75 MIN', price: '$140', icon: 'photo_camera', category: 'Beauty' },
  { name: 'Airbrush High-Definition Makeup', duration: '60 MIN', price: '$125', icon: 'blur_on', category: 'Beauty' },
  { name: 'Classic Lash Extension Full Set', duration: '90 MIN', price: '$180', icon: 'visibility', category: 'Beauty' },
  { name: 'Brow Lamination & Henna Shaping', duration: '60 MIN', price: '$95', icon: 'brush', category: 'Beauty' },
  { name: 'Organic Hydration Facial Treatment', duration: '60 MIN', price: '$110', icon: 'spa', category: 'Beauty' },
  { name: 'Anti-Aging Collagen Therapy', duration: '75 MIN', price: '$145', icon: 'health_and_safety', category: 'Beauty' },
  { name: 'Custom Spray Tanning Sessions', duration: '30 MIN', price: '$60', icon: 'wb_sunny', category: 'Beauty' },
  { name: 'Luxury Eye Contour Lifting', duration: '45 MIN', price: '$80', icon: 'remove_red_eye', category: 'Beauty' },
  { name: 'Express Glow Makeup Application', duration: '45 MIN', price: '$75', icon: 'flash_on', category: 'Beauty' },

  // NAILS
  { name: 'Classic Manicure & Pedicure', duration: '75 MIN', price: '$85', icon: 'spa', category: 'Nails' },
  { name: 'Gel Bottle Extensions Set', duration: '90 MIN', price: '$120', icon: 'construction', category: 'Nails' },
  { name: 'Signature Champagne Pedicure', duration: '60 MIN', price: '$95', icon: 'wine_bar', category: 'Nails' },
  { name: 'Luxury Paraffin Wax Mani-Pedi', duration: '90 MIN', price: '$110', icon: 'waves', category: 'Nails' },
  { name: 'Gel Polish Change & Shaping', duration: '45 MIN', price: '$55', icon: 'clean_hands', category: 'Nails' },
  { name: 'Custom Accent Nail Artistry', duration: '60 MIN', price: '$75', icon: 'brush', category: 'Nails' },
  { name: 'Organic Spa Citrus Hand Treatment', duration: '45 MIN', price: '$65', icon: 'eco', category: 'Nails' },
  { name: 'IBX Strength Repair Therapy', duration: '30 MIN', price: '$45', icon: 'healing', category: 'Nails' },
  { name: 'Detox Charcoal Foot Spa', duration: '60 MIN', price: '$80', icon: 'filter_alt', category: 'Nails' },
  { name: 'Luxury Matte Gel Manicure', duration: '45 MIN', price: '$70', icon: 'back_hand', category: 'Nails' },

  // GROOMING
  { name: "Gentleman's Grooming", duration: '45 MIN', price: '$70', icon: 'face_6', category: 'Grooming' },
  { name: 'Executive Beard Sculpting', duration: '30 MIN', price: '$50', icon: 'content_cut', category: 'Grooming' },
  { name: 'Hot Towel Facial Shave Ritual', duration: '45 MIN', price: '$60', icon: 'hot_tub', category: 'Grooming' },
  { name: "Premium Men's Charcoal Facial", duration: '60 MIN', price: '$85', icon: 'cleaning_services', category: 'Grooming' },
  { name: "Classic Men's Haircut & Wash", duration: '45 MIN', price: '$65', icon: 'content_cut', category: 'Grooming' },
  { name: 'Sport Pedicure for Men', duration: '45 MIN', price: '$75', icon: 'directions_run', category: 'Grooming' },
  { name: 'Nose & Ear Premium Waxing', duration: '20 MIN', price: '$35', icon: 'hearing_disabled', category: 'Grooming' },
  { name: "Gentleman's Express Mani-Pedi", duration: '60 MIN', price: '$90', icon: 'dry_cleaning', category: 'Grooming' },
  { name: 'Scalp Stimulation Treatment', duration: '30 MIN', price: '$55', icon: 'waves', category: 'Grooming' },
  { name: 'Grey Blending Color Treatment', duration: '45 MIN', price: '$80', icon: 'color_lens', category: 'Grooming' },
];

const categories = ['All', 'Hair', 'Color', 'Beauty', 'Nails', 'Grooming'];

const times = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

const STEPS = ['Service & Stylist', 'Date & Time', 'Review'];

const getNumericPrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
};

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function Booking() {
  const navigate = useNavigate();
  const { bookingForm, updateBookingForm } = useBooking();
  const { triggerAuthRequired } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState(bookingForm.time || '');
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [pricePeriod, setPricePeriod] = useState(0); // 0 = Standard, 1 = VIP

  const [servicesList, setServicesList] = useState(DEFAULT_SERVICES);
  const [stylistsList, setStylistsList] = useState(DEFAULT_STYLISTS);

  useEffect(() => {
    const fetchServicesAndStylists = async () => {
      try {
        const resServices = await fetch(`${API_BASE}/api/services`);
        if (resServices.ok) {
          const data = await resServices.json();
          if (data && data.length > 0) {
            const mappedServices = data.map(s => ({
              name: s.name,
              duration: `${s.duration_minutes} MIN`,
              price: `$${s.price}`,
              icon: s.category === 'Color' ? 'palette' : s.category === 'Beauty' ? 'face_retouching_natural' : s.category === 'Nails' ? 'spa' : s.category === 'Grooming' ? 'face_6' : 'content_cut',
              category: s.category
            }));
            setServicesList(mappedServices);
            
            // Set initial form state for service if not set
            const savedService = localStorage.getItem('pref_service');
            if (savedService && mappedServices.some(s => s.name === savedService)) {
              updateBookingForm('service', savedService);
            } else {
              updateBookingForm('service', mappedServices[0].name);
            }
          }
        }

        const resStylists = await fetch(`${API_BASE}/api/stylists`);
        if (resStylists.ok) {
          const data = await resStylists.json();
          if (data && data.length > 0) {
            const mappedStylists = data.map(s => ({
              name: s.name,
              title: s.specialization || 'Stylist',
              rating: s.average_rating || 5.0,
              img: s.profile_photo_url ? getImageUrl(s.profile_photo_url) : null,
              icon: 'person'
            }));
            const anyProfessional = { name: 'Any Professional', title: 'Best Available', rating: 4.9, img: null, icon: 'groups' };
            const fullList = [anyProfessional, ...mappedStylists];
            setStylistsList(fullList);
            
            // Set initial form state for therapist if not set
            const savedTherapist = localStorage.getItem('pref_therapist');
            if (savedTherapist && fullList.some(t => t.name === savedTherapist)) {
              updateBookingForm('therapist', savedTherapist);
            } else {
              updateBookingForm('therapist', fullList[0].name);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching services or stylists:', err);
      }
    };
    fetchServicesAndStylists();
  }, []);

  const calendarDate = React.useMemo(() => {
    if (!bookingForm.date) return undefined;
    const d = new Date(bookingForm.date + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  }, [bookingForm.date]);

  const handleSelectDate = (date) => {
    if (!date) {
      updateBookingForm('date', '');
      return;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    updateBookingForm('date', `${yyyy}-${mm}-${dd}`);
  };

  useEffect(() => {
    if (bookingForm.time) {
      setSelectedTime(bookingForm.time);
    }
  }, [bookingForm.time]);

  const selectedService = servicesList.find(s => s.name === bookingForm.service) || servicesList[0] || DEFAULT_SERVICES[0];
  const selectedPriceVal = pricePeriod === 0 
    ? getNumericPrice(selectedService.price) 
    : Math.round(getNumericPrice(selectedService.price) * 1.3);
 
  // Synchronize price and tier to context
  useEffect(() => {
    if (selectedService) {
      const basePrice = getNumericPrice(selectedService.price);
      const computedPrice = pricePeriod === 0 ? basePrice : Math.round(basePrice * 1.3);
      updateBookingForm('price', computedPrice);
      updateBookingForm('tier', pricePeriod === 0 ? 'Standard' : 'VIP');
    }
  }, [bookingForm.service, pricePeriod, selectedService]);
 
  // When active category changes, auto-select the first service of that category if current is not in it
  useEffect(() => {
    const filtered = servicesList.filter(svc => activeCategory === 'All' || svc.category === activeCategory);
    const exists = filtered.some(svc => svc.name === bookingForm.service);
    if (!exists && filtered.length > 0) {
      updateBookingForm('service', filtered[0].name);
    }
  }, [activeCategory, servicesList]);
 
  // Automatically switch category based on pre-selected service
  useEffect(() => {
    if (bookingForm.service) {
      const svc = servicesList.find(s => s.name === bookingForm.service);
      if (svc && svc.category) {
        setActiveCategory(svc.category);
      }
    }
  }, [bookingForm.service, servicesList]);
 
  useEffect(() => { if (bookingForm.service) localStorage.setItem('pref_service', bookingForm.service); }, [bookingForm.service]);
  useEffect(() => { if (bookingForm.therapist) localStorage.setItem('pref_therapist', bookingForm.therapist); }, [bookingForm.therapist]);

  const goNext = () => {
    setError('');
    if (step === 0) {
      if (!bookingForm.service) { setError('Please select a service.'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!bookingForm.date) { setError('Please select a date.'); return; }
      if (!selectedTime) { setError('Please select a time slot.'); return; }
      updateBookingForm('time', selectedTime);
      setStep(2);
    } else {
      triggerAuthRequired(() => navigate('/checkout'), 'Please login or create an account to continue booking.');
    }
  };
  const goBack = () => { setError(''); setStep(s => s - 1); };

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }} className="">

      {/* Page hero */}
      <section style={{ paddingTop: '110px', paddingBottom: 'clamp(2.5rem, 5vw, 4rem)', paddingLeft: 'clamp(1.25rem, 5vw, 4rem)', paddingRight: 'clamp(1.25rem, 5vw, 4rem)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '250px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div className="page-transition" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '0.875rem', display: 'flex', justifyContent: 'center' }}>
            <span className="eyebrow-refined">Appointment Scheduler</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: 1.0, color: 'var(--color-text)', margin: '0 0 0.875rem' }}>
            Reserve Your Spot
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)' }}>
            Your bespoke beauty experience begins here.
          </p>
        </div>
      </section>

      <main style={{ flex: 1, padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 4rem)', maxWidth: '720px', width: '100%', margin: '0 auto' }}>

        {/* Breadcrumbs */}
        <div style={{ marginBottom: '2rem' }}>
          <Breadcrumbs />
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '3rem' }}>
          {STEPS.map((label, idx) => (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: `1px solid ${idx <= step ? 'var(--champagne)' : 'var(--color-border)'}`,
                  background: idx < step ? 'var(--champagne)' : idx === step ? 'rgba(201,169,110,0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.35s ease',
                }}>
                  {idx < step ? (
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#0D0D0D' }}>check</span>
                  ) : (
                    <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.1em', color: idx === step ? 'var(--champagne)' : 'var(--color-text-mute)' }}>
                      0{idx + 1}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: idx === step ? 'var(--champagne)' : 'var(--color-text-mute)', transition: 'color 0.35s ease', textAlign: 'center' }}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{ height: '1px', flex: 1, background: idx < step ? 'var(--champagne)' : 'var(--color-border)', marginBottom: '22px', transition: 'background 0.35s ease' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(196,137,122,0.08)', border: '1px solid rgba(196,137,122,0.28)', borderRadius: '12px', color: '#C4897A' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', flexShrink: 0 }}>error</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 300 }}>{error}</span>
          </div>
        )}

        {/* ─── Step 0: Service + Stylist ─── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeUp 0.4s ease' }}>
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)', marginBottom: '1.25rem' }}>Choose Your Service</h2>
              
              {/* Category Filter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                      style={{
                        fontFamily: 'Tenor Sans, sans-serif',
                        fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
                        padding: '9px 20px', borderRadius: '99px',
                        border: isActive ? '1px solid var(--champagne)' : '1px solid var(--color-border-strong, rgba(255,255,255,0.07))',
                        background: isActive ? 'var(--champagne)' : 'transparent',
                        color: isActive ? 'var(--obsidian, #0D0D0D)' : 'var(--color-text-dim)',
                        cursor: 'pointer',
                        transition: 'all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fontWeight: isActive ? 500 : 400,
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'rgba(201,169,110,0.55)';
                          e.currentTarget.style.color = 'var(--champagne)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'var(--color-border-strong, rgba(255,255,255,0.07))';
                          e.currentTarget.style.color = 'var(--color-text-dim)';
                        }
                      }}
                    >{cat}</button>
                  );
                })}
              </div>

              {/* Standard vs VIP Toggle (PricingInteraction Style) */}
              <div 
                style={{ 
                  borderRadius: '99px', 
                  position: 'relative', 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--color-border-strong, rgba(255,255,255,0.07))',
                  padding: '5px', 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '1.75rem'
                }}
              >
                <button
                  type="button"
                  style={{
                    fontFamily: 'Tenor Sans, sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '99px',
                    width: '50%',
                    padding: '10px 0',
                    border: 'none',
                    background: 'transparent',
                    color: pricePeriod === 0 ? '#0D0D0D' : 'var(--color-text-dim)',
                    zIndex: 20,
                    cursor: 'pointer',
                    transition: 'color 0.3s',
                  }}
                  onClick={() => setPricePeriod(0)}
                >
                  Standard Service
                </button>
                <button
                  type="button"
                  style={{
                    fontFamily: 'Tenor Sans, sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '99px',
                    width: '50%',
                    padding: '10px 0',
                    border: 'none',
                    background: 'transparent',
                    color: pricePeriod === 1 ? '#0D0D0D' : 'var(--color-text-dim)',
                    zIndex: 20,
                    cursor: 'pointer',
                    transition: 'color 0.3s',
                  }}
                  onClick={() => setPricePeriod(1)}
                >
                  VIP Service (+30%)
                </button>
                <div
                  style={{
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '50%',
                    zIndex: 10,
                    transform: `translateX(${pricePeriod * 100}%)`,
                    transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                >
                  <div style={{ background: 'var(--champagne)', borderRadius: '99px', width: '100%', height: '100%' }}></div>
                </div>
              </div>

              {/* Services List with Sliding Highlight */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const filteredServices = servicesList.filter(svc => activeCategory === 'All' || svc.category === activeCategory);
                  const selectedIndex = filteredServices.findIndex(svc => svc.name === bookingForm.service);
                  return (
                    <>
                      {filteredServices.map((svc) => {
                        const sel = bookingForm.service === svc.name;
                        const priceVal = pricePeriod === 0 ? getNumericPrice(svc.price) : Math.round(getNumericPrice(svc.price) * 1.3);
                        return (
                          <button key={svc.name} type="button" onClick={() => updateBookingForm('service', svc.name)}
                            style={{
                              height: '96px',
                              width: '100%', display: 'flex', alignItems: 'center', gap: '1.25rem',
                              padding: '1rem 1.25rem',
                              borderRadius: '18px',
                              border: `1px solid ${sel ? 'transparent' : 'var(--color-border)'}`,
                              background: sel ? 'rgba(201,169,110,0.04)' : 'var(--color-surface)',
                              cursor: 'pointer', textAlign: 'left',
                              transition: 'all 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
                            }}
                            onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; } }}
                            onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = 'var(--color-border)'; } }}
                          >
                            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: sel ? 'var(--champagne)' : 'rgba(201,169,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.25s ease' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: sel ? '#0D0D0D' : 'var(--champagne)' }}>{svc.icon}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.05rem', color: 'var(--color-text)', margin: '0 0 0.15rem' }}>{svc.name}</h3>
                              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                                  {svc.duration}
                                </span>
                                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.05rem', color: 'var(--champagne)' }}>
                                  $&nbsp;
                                  <NumberFlow value={priceVal} format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }} />
                                </span>
                              </div>
                            </div>
                            <div
                              style={{
                                border: '2px solid',
                                borderColor: sel ? 'var(--champagne)' : 'var(--color-border-strong, rgba(255,255,255,0.15))',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                padding: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'border-color 0.3s',
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  background: 'var(--champagne)',
                                  borderRadius: '50%',
                                  opacity: sel ? 1 : 0,
                                  transform: sel ? 'scale(1)' : 'scale(0.5)',
                                  transition: 'opacity 0.3s, transform 0.3s',
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}

                      {/* Sliding Border Overlay */}
                      {selectedIndex >= 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: '96px',
                            border: '2px solid var(--champagne)',
                            borderRadius: '18px',
                            pointerEvents: 'none',
                            transform: `translateY(${selectedIndex * (96 + 12)}px)`,
                            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            boxShadow: '0 0 16px rgba(201,169,110,0.12)',
                            zIndex: 10,
                          }}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)', marginBottom: '1.25rem' }}>Choose Your Stylist</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '1rem' }}>
                {stylistsList.map((t) => {
                  const sel = bookingForm.therapist === t.name;
                  return (
                    <SpotlightCard
                      key={t.name}
                      spotlightColor="rgba(201, 169, 110, 0.14)"
                      onClick={() => updateBookingForm('therapist', t.name)}
                      role="button"
                      tabIndex={0}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '1.375rem 1rem',
                        borderRadius: '18px',
                        border: `1px solid ${sel ? 'var(--champagne)' : 'var(--color-border)'}`,
                        background: sel ? 'rgba(201,169,110,0.06)' : 'var(--color-surface)',
                        cursor: 'pointer', textAlign: 'center',
                        boxShadow: sel ? '0 0 0 3px rgba(201,169,110,0.1)' : 'none',
                        outline: 'none',
                      }}
                      onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
                      onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'none'; } }}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateBookingForm('therapist', t.name); } }}
                    >
                      <div style={{ width: '58px', height: '58px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,169,110,0.08)', marginBottom: '0.875rem', border: `2px solid ${sel ? 'var(--champagne)' : 'transparent'}`, transition: 'border-color 0.25s ease', flexShrink: 0 }}>
                        {t.img
                          ? <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--champagne)' }}>{t.icon}</span></div>
                        }
                      </div>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '0.9375rem', color: 'var(--color-text)', margin: '0 0 2px' }}>{t.name}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.75rem', color: 'var(--color-text-dim)', margin: '0 0 6px' }}>{t.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--champagne)', fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.1em', color: 'var(--color-text-dim)' }}>{t.rating}</span>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 1: Date + Time ─── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}>Pick Your Date &amp; Time</h2>

            <CalendarWithTimePresets
              selectedDate={calendarDate}
              onSelectDate={handleSelectDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              onContinue={goNext}
            />
          </div>
        )}

        {/* ─── Step 2: Review ─── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}>Review Your Booking</h2>

            <div style={{ borderRadius: '20px', border: '1px solid var(--color-border)', overflow: 'hidden', background: 'var(--color-surface)' }}>
              {/* Hero header */}
              <div style={{ background: 'linear-gradient(135deg, var(--champagne-dk), var(--champagne))', padding: '1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(13,13,13,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#0D0D0D' }}>content_cut</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(13,13,13,0.6)', margin: '0 0 3px' }}>Your Service</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', color: '#0D0D0D', margin: 0 }}>{bookingForm.service}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'rgba(13,13,13,0.65)', margin: '2px 0 0' }}>
                    {selectedService.duration} · ${selectedPriceVal} {bookingForm.tier === 'VIP' && '(VIP Tier)'}
                  </p>
                </div>
              </div>

              {/* Detail rows */}
              {[
                { icon: 'person', label: 'Professional', value: bookingForm.therapist },
                { icon: 'calendar_month', label: 'Date', value: bookingForm.date },
                { icon: 'schedule', label: 'Time', value: bookingForm.time || selectedTime },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--champagne)', width: '20px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', margin: 0 }}>{label}</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.0625rem', color: 'var(--color-text)', margin: '2px 0 0' }}>{value || '—'}</p>
                  </div>
                </div>
              ))}

              {/* Price row */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,169,110,0.03)' }}>
                <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>
                  Total Due Today {bookingForm.tier === 'VIP' && '(incl. VIP Upgrade)'}
                </span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.625rem', color: 'var(--champagne)' }}>
                  ${selectedPriceVal}
                </span>
              </div>
            </div>

            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: 'var(--color-text-mute)', textAlign: 'center' }}>
              Free cancellation up to 24 hours before your appointment.
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: step > 0 ? 'space-between' : 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {step > 0 && (
            <button type="button" onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--color-text-dim)',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s ease',
                padding: '10px 0',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back
            </button>
          )}
          <button type="button" onClick={goNext}
            className="shimmer-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--champagne)', color: '#0D0D0D',
              fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              padding: '14px 32px', borderRadius: '99px',
              border: 'none', cursor: 'pointer', minHeight: '50px', fontWeight: 500,
            }}
          >
            {step < 2 ? 'Continue' : 'Proceed to Checkout'}
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{step < 2 ? 'arrow_forward' : 'lock'}</span>
          </button>
        </div>
      </main>

      <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
