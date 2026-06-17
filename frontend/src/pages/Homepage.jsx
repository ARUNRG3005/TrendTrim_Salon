import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';
import { BorderRotate } from '../components/ui/animated-gradient-border';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';
import { LocationMap } from '../components/ui/expand-map';
import MagicBento from '../components/ui/MagicBento';
import Carousel from '../components/ui/Carousel';
import { ExpandableCard } from '../components/ui/expandable-card';
import BorderGlow from '../components/ui/BorderGlow';

/* ─── Ripple helper ──────────────────────────────────────────── */
function addRipple(e) {
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const rect = btn.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
  circle.style.top  = `${e.clientY - rect.top  - diameter / 2}px`;
  circle.classList.add('ripple');
  btn.querySelector('.ripple')?.remove();
  btn.appendChild(circle);
}

/* ─── Hero parallax hook ─────────────────────────────────────── */
function useParallax() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.scrollY * 0.35);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return offset;
}

export default function Homepage() {
  const navigate = useNavigate();
  const { bookingForm, updateBookingForm } = useBooking();
  const { triggerAuthRequired } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState({});
  const parallaxOffset = useParallax();

  useScrollReveal();

  const handleBook     = () => triggerAuthRequired(() => navigate('/booking'), "Please login to continue.");
  const handleServices = () => navigate('/services');
  const handleImageLoad = (id) => setImagesLoaded(p => ({ ...p, [id]: true }));

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }} className="">

      <div className="page-transition" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ════════════════════════════════════ HERO ════════════════════════════════════ */}
        <ScrollExpandMedia
          mediaType="video"
          mediaSrc="https://assets.mixkit.co/videos/preview/mixkit-hair-stylist-washes-clients-hair-in-salon-46132-large.mp4"
          posterSrc="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80"
          bgImageSrc="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"
          title="Luxury Salon Services, Effortlessly Yours"
          date="The TrendTrim Archive"
          scrollToExpand="Scroll to Explore"
          textBlend
        >
          {/* Subheading, CTAs and Booking Widget */}
          <div style={{ textAlign: 'center', padding: '4rem clamp(1.25rem, 5vw, 4rem) 2rem', maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontWeight: 300,
              fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
              color: 'var(--color-text-dim)',
              maxWidth: '520px', margin: '0 auto 2.75rem',
              lineHeight: 1.85,
            }}>
              A private concierge network matching you with elite salon professionals. Your style, whenever you desire it.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
              <button
                onClick={(e) => { addRipple(e); handleBook(); }}
                className="ripple-btn shimmer-btn"
                style={{
                  background: 'var(--champagne)',
                  color: '#0D0D0D',
                  padding: '15px 38px',
                  borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 500, minHeight: '50px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
                Book Appointment
              </button>
              <button
                onClick={handleServices}
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-dim)',
                  padding: '14px 34px',
                  borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--color-border-strong)',
                  cursor: 'pointer',
                  minHeight: '50px',
                  transition: 'all 0.28s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.55)'; e.currentTarget.style.color = 'var(--champagne)'; e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-dim)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>spa</span>
                Explore Services
              </button>
            </div>

            {/* Quick Booking Widget */}
            <div
              className="hero-booking-widget"
              style={{
                padding: 'clamp(1.25rem, 3vw, 1.875rem)',
                maxWidth: '880px', margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1.5rem',
                alignItems: 'end',
              }}
            >
              {[
                {
                  label: 'Service',
                  el: (
                    <div style={{ position: 'relative' }}>
                      <select
                        value={bookingForm.service}
                        onChange={(e) => updateBookingForm('service', e.target.value)}
                        style={{
                          width: '100%', background: 'transparent',
                          border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                          color: 'var(--color-text)',
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '1.0625rem',
                          padding: '6px 22px 8px 0',
                          cursor: 'pointer', appearance: 'none', outline: 'none',
                          transition: 'border-color 0.25s ease',
                        }}
                        onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--champagne)'}
                        onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--color-border-strong)'}
                      >
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Signature Haircut &amp; Style</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Luxury Blowout</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Premium Color &amp; Highlights</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Signature French Balayage</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Bridal Makeup Package</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Editorial Photographic Glamour</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Classic Manicure &amp; Pedicure</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Signature Champagne Pedicure</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Gentleman\'s Grooming</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Hot Towel Facial Shave Ritual</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--champagne)', pointerEvents: 'none' }}>expand_more</span>
                    </div>
                  )
                },
                {
                  label: 'Date',
                  el: (
                    <input
                      type="date"
                      value={bookingForm.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateBookingForm('date', e.target.value)}
                      style={{
                        width: '100%', background: 'transparent',
                        border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                        color: 'var(--color-text)',
                        fontFamily: 'Cormorant Garamond, serif', fontSize: '1.0625rem',
                        padding: '6px 0 8px', outline: 'none',
                        transition: 'border-color 0.25s ease',
                      }}
                      onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--champagne)'}
                      onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--color-border-strong)'}
                    />
                  )
                },
                {
                  label: 'Stylist',
                  el: (
                    <div style={{ position: 'relative' }}>
                      <select
                        value={bookingForm.therapist}
                        onChange={(e) => updateBookingForm('therapist', e.target.value)}
                        style={{
                          width: '100%', background: 'transparent',
                          border: 'none', borderBottom: '1px solid var(--color-border-strong)',
                          color: 'var(--color-text)',
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '1.0625rem',
                          padding: '6px 22px 8px 0',
                          cursor: 'pointer', appearance: 'none', outline: 'none',
                          transition: 'border-color 0.25s ease',
                        }}
                        onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--champagne)'}
                        onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--color-border-strong)'}
                      >
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Any Professional</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>Jessica Monroe</option>
                        <option style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>David Chen</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--champagne)', pointerEvents: 'none' }}>expand_more</span>
                    </div>
                  )
                },
              ].map(field => (
                <div key={field.label} style={{ textAlign: 'left' }}>
                  <span className="hero-field-label">{field.label}</span>
                  {field.el}
                </div>
              ))}
              <button
                onClick={handleBook}
                className="shimmer-btn"
                style={{
                  background: 'var(--champagne)',
                  color: '#0D0D0D',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer',
                  minHeight: '46px', fontWeight: 500,
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>search</span>
                Check Availability
              </button>
            </div>
          </div>
        </ScrollExpandMedia>

        {/* ════════════════════════════════════ SALON LOCATION ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '50%', right: '12%', width: '360px', height: '360px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '740px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <div className="reveal">
              <span className="eyebrow-refined">Location</span>
            </div>
            <h2 className="reveal" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: 1.05, color: 'var(--color-text)', margin: 0 }}>
              Visit Our Salon
            </h2>
            <p className="reveal" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'var(--color-text-dim)', maxWidth: '500px', lineHeight: 1.75, margin: 0 }}>
              Our flagship salon is located in the heart of Mayfair, London. Stop by for an immersive luxury experience or explore our coordinates below.
            </p>
            <div className="reveal" style={{ marginTop: '1rem' }}>
              <LocationMap location="Mayfair, London" coordinates="51.5095° N, 0.1410° W" />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════ CHAPTER I: CURATED SERVICES ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '8%', left: '4%', width: '300px', height: '300px', background: 'rgba(201,169,110,0.03)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Section header */}
            <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.25rem', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="eyebrow-refined">Chapter I</span>
                </div>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: 1.0, color: 'var(--color-text)', margin: 0 }}>
                  Curated Services
                </h2>
              </div>
              <button
                onClick={handleServices}
                style={{
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--champagne)', background: 'none',
                  border: 'none', borderBottom: '1px solid rgba(201,169,110,0.5)',
                  paddingBottom: '3px', cursor: 'pointer',
                  transition: 'opacity 0.2s ease, border-color 0.2s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                View Service Catalog
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
              </button>
            </div>

            {/* MagicBento Grid */}
            <MagicBento onClickCard={handleServices} />
          </div>
        </section>

        {/* ════════════════════════════════════ CHAPTER II: PINNACLE OF SERVICE ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', bottom: '8%', right: '6%', width: '320px', height: '320px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <span className="eyebrow-refined">Chapter II</span>
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: 1.0, color: 'var(--color-text)', margin: '0 0 1.75rem' }}>
                The Pinnacle of Service
              </h2>
              <div className="gold-line" style={{ maxWidth: '80px', margin: '0 auto' }} />
            </div>

            {/* Centered Carousel */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Carousel baseWidth={350} autoplay={true} loop={true} />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════ CHAPTER III: THE ART OF BEAUTY ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', background: 'var(--obsidian, #0D0D0D)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '50%', left: '18%', width: '420px', height: '420px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '5rem', alignItems: 'center' }}>
            <div className="reveal-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <span className="eyebrow-refined">Chapter III</span>
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)', letterSpacing: '-0.025em', color: '#F5F0E8', lineHeight: 1.0, margin: 0 }}>
                The Art of<br /><em style={{ fontStyle: 'italic', color: 'var(--champagne-lt)' }}>Beauty</em>
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(0.9rem, 1.5vw, 1.0625rem)', color: 'rgba(245,240,232,0.62)', lineHeight: 1.85, margin: 0 }}>
                We believe beauty is an art form. Our curators scour the industry for the most advanced styling techniques, the most premium products, and the most gifted stylists — ensuring every TrendTrim experience is a masterpiece.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ height: '1px', width: '28px', background: 'rgba(201,169,110,0.5)' }} />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--champagne)', fontSize: '1.0625rem', letterSpacing: '0.04em' }}>Pure Excellence</span>
              </div>
              <button
                onClick={handleBook}
                className="shimmer-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  background: 'var(--champagne)', color: '#0D0D0D',
                  padding: '14px 30px', borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
                  minHeight: '46px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>content_cut</span>
                Reserve Your Appointment
              </button>
            </div>

            {/* Offset expandable card grid */}
            <div className="reveal-right" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
              <ExpandableCard
                title="The Art of Styling"
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
                description="Signature Hair Design"
                classNameExpanded="[&_h4]:text-[#C9A96E] [&_h4]:font-normal [&_h4]:text-xl [&_h4]:mt-4 [&_h4]:mb-1 [&_p]:text-[#F5F0E8]/70 [&_p]:text-sm [&_p]:leading-7"
              >
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif' }}>Precision Hair Design</h4>
                <p>
                  Every haircut at TrendTrim is a tailored experience. Our stylists study your face shape, hair texture, and natural fall to design a cut that is uniquely yours. We believe that a great haircut is the foundation of style.
                </p>
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif' }}>Signature Blowouts</h4>
                <p>
                  Completed with our signature blowout technique, we use premium botanical products that nourish your hair while providing lasting volume, bounce, and a brilliant glossy finish.
                </p>
              </ExpandableCard>

              <div style={{ marginTop: '2.5rem' }}>
                <ExpandableCard
                  title="Luxurious Makeovers"
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80"
                  description="Editorial Beauty & Glamour"
                  classNameExpanded="[&_h4]:text-[#C9A96E] [&_h4]:font-normal [&_h4]:text-xl [&_h4]:mt-4 [&_h4]:mb-1 [&_p]:text-[#F5F0E8]/70 [&_p]:text-sm [&_p]:leading-7"
                >
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif' }}>Editorial Makeup Artistry</h4>
                  <p>
                    Whether for a bridal party, a red-carpet event, or a personal transformation, our makeup artists create flawless, high-contrast, and glowing aesthetics customized to your style preferences.
                  </p>
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif' }}>Skin-First Philosophy</h4>
                  <p>
                    We prep your skin with luxury organic serums and hydration masks, ensuring your makeup looks natural, remains smudge-proof, and feels lightweight throughout your special event.
                  </p>
                </ExpandableCard>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════ CHAPTER IV: ELOWEN'S INTELLIGENCE ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-medium" style={{ position: 'absolute', right: '4%', top: '8%', width: '380px', height: '380px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Visualizer orb */}
            <div className="reveal" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,169,110,0.07)', borderRadius: '50%', filter: 'blur(48px)', animation: 'pulse 3s infinite ease-in-out' }} />
                <div className="spin-slow" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.2)' }} />
                <div className="spin-slow" style={{ position: 'absolute', inset: '14%', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.1)', animationDirection: 'reverse', animationDuration: '20s' }} />
                <div className="spin-slow" style={{ position: 'absolute', inset: '28%', borderRadius: '50%', border: '1px dashed rgba(201,169,110,0.07)', animationDuration: '30s' }} />
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.125rem' }}>
                  <span className="material-symbols-outlined float-anim" style={{ fontSize: '60px', color: 'var(--champagne)' }}>cognition</span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '38px', width: '120px' }}>
                    {[1.2, 0.8, 1.5, 0.9, 1.4, 0.7, 1.3, 1.0, 1.6, 0.8, 1.2, 1.4, 0.7, 1.1, 0.9].map((dur, i) => (
                      <span key={i} className="visualizer-bar" style={{ width: '4px', height: '100%', background: 'var(--champagne)', borderRadius: '2px', animationDuration: `${dur}s`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="champ-glow" style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--champagne)', marginTop: '1.25rem' }}>Elowen System Active</span>
            </div>

            <div className="reveal-right" style={{ flex: '1 1 320px' }}>
              <div style={{ marginBottom: '0.875rem' }}>
                <span className="eyebrow-refined">Chapter IV</span>
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 4.5vw, 3.125rem)', color: 'var(--color-text)', letterSpacing: '-0.025em', margin: '0 0 1.125rem' }}>
                Elowen's Intelligence
              </h2>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.175rem', color: 'var(--color-text-dim)', marginBottom: '2rem', lineHeight: 1.65 }}>
                "Tell me your style goals, and I will curate your perfect salon experience."
              </p>
              <div className="glass-ivory" style={{ padding: '1.875rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.375rem', flexWrap: 'wrap' }}>
                  {['AI Concierge', 'Adaptive Intelligence'].map(tag => (
                    <span key={tag} style={{
                      padding: '4px 14px',
                      borderRadius: '99px',
                      border: '1px solid rgba(201,169,110,0.35)',
                      fontFamily: 'Tenor Sans, sans-serif',
                      fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'var(--champagne)',
                    }}>{tag}</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', lineHeight: 1.75, marginBottom: '1.625rem' }}>
                  Elowen analyzes your style goals, hair texture, and schedule to recommend the most suitable services in real-time.
                </p>
                <button
                  onClick={(e) => { addRipple(e); handleBook(); }}
                  className="ripple-btn shimmer-btn"
                  style={{
                    width: '100%', padding: '14px',
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    border: 'none', borderRadius: '14px',
                    fontFamily: 'Tenor Sans, sans-serif',
                    fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
                    cursor: 'pointer', minHeight: '48px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>chat</span>
                  Chat with Elowen
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════ TESTIMONIALS ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <span className="eyebrow-refined">Testimonials</span>
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 3.5rem)', letterSpacing: '-0.025em', color: 'var(--color-text)', margin: '0 0 1.75rem' }}>
                Voices of the Inner Circle
              </h2>
              <div className="gold-line" style={{ maxWidth: '80px', margin: '0 auto' }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.75rem' }} className="stagger">
              {[
                { quote: 'TrendTrim has transformed how I manage my styling. The quality of stylists is simply unmatched in the city.', name: 'Eleanor Vane', tier: 'Platinum Member', img: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80' },
                { quote: "The AI concierge Elowen suggested a styling package I didn't even know I needed. It was life-changing. Pure effortless beauty.", name: 'Julian Cross', tier: 'Diamond Tier', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80', featured: true },
              ].map(t => (
                <BorderGlow
                  key={t.name}
                  className="reveal testimonial-glow-wrapper"
                  edgeSensitivity={30}
                  glowColor="39 46 61"
                  borderRadius={22}
                  glowRadius={45}
                  glowIntensity={1.0}
                  coneSpread={25}
                  animated={false}
                  colors={['#C9A96E', '#E2C98A', '#9B7B45']}
                  style={{
                    flex: '1 1 320px',
                    maxWidth: '440px',
                  }}
                >
                  <div
                    className="testimonial-card-inner"
                    style={{ padding: '2.25rem' }}
                  >
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '1.5rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--champagne)', fontVariationSettings: "'FILL' 1", animationDelay: `${i * 0.08}s` }}>star</span>
                      ))}
                    </div>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--color-text-dim)', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                      "{t.quote}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(201,169,110,0.3)', boxShadow: '0 0 0 3px rgba(201,169,110,0.08)' }}>
                        <img alt={t.name} src={t.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.0625rem', color: 'var(--color-text)', margin: 0 }}>{t.name}</p>
                        <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--champagne)', margin: '3px 0 0' }}>{t.tier}</p>
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════ CHAPTER V: THE INNER CIRCLE ════════════════════════════════════ */}
        <section style={{ padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 4rem)', background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.09) 0%, transparent 55%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="reveal" style={{ marginBottom: '1.125rem', display: 'flex', justifyContent: 'center' }}>
              <span className="eyebrow-refined">Chapter V</span>
            </div>
            <h2 className="reveal" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', letterSpacing: '-0.025em', color: '#F5F0E8', margin: '0 0 4rem', lineHeight: 1.0 }}>
              The Inner Circle
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: '980px', margin: '0 auto 3.5rem' }} className="stagger">
              {[
                { title: 'Priority Concierge', desc: "Skip the wait with 24/7 priority access to the world's most sought-after stylists." },
                { title: 'Platinum Events', desc: 'Exclusive invitations to private fashion showcases and high-society styling masterclasses.', featured: true },
                { title: 'Global Access', desc: 'Seamless beauty continuity as you travel between our partner suites in 20+ capitals.' },
              ].map(m => (
                <div key={m.title} className="reveal membership-tier-card"
                  style={{
                    border: m.featured ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    background: m.featured ? 'rgba(201,169,110,0.06)' : 'rgba(255,255,255,0.02)',
                    transform: m.featured ? 'scale(1.04)' : 'none',
                    boxShadow: m.featured ? '0 0 48px rgba(201,169,110,0.1)' : 'none',
                  }}
                >
                  {m.featured && (
                    <div style={{ marginBottom: '1.125rem' }}>
                      <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--champagne)', padding: '3px 12px', border: '1px solid rgba(201,169,110,0.45)', borderRadius: '99px' }}>Featured</span>
                    </div>
                  )}
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.375rem', background: 'rgba(201,169,110,0.06)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--champagne)' }}>
                      {m.featured ? 'hotel_class' : m.title === 'Priority Concierge' ? 'headset_mic' : 'travel_explore'}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: '1.4375rem', color: 'var(--champagne)', marginBottom: '0.875rem', letterSpacing: '-0.01em' }}>{m.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'rgba(245,240,232,0.57)', lineHeight: 1.75, margin: 0 }}>{m.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={(e) => { addRipple(e); navigate('/membership'); }}
              className="ripple-btn shimmer-btn"
              style={{
                background: 'var(--champagne)', color: '#0D0D0D',
                padding: '15px 42px', borderRadius: '99px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', minHeight: '50px', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>diamond</span>
              Apply for Membership
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════ FINAL CTA ════════════════════════════════════ */}
        <section style={{ position: 'relative', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* Parallax background */}
          <img alt="Serene salon" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"
            loading="lazy" className="animate-ken-burns"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: 0.55,
              transform: `translateY(${parallaxOffset * 0.4}px) scale(1.1)`,
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)', zIndex: 10 }} />
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '25%', left: '22%', width: '300px', height: '300px', background: 'rgba(201,169,110,0.08)', borderRadius: '50%', filter: 'blur(90px)', zIndex: 10, pointerEvents: 'none' }} />

          <div className="reveal" style={{ position: 'relative', zIndex: 20, textAlign: 'center', padding: '0 clamp(1.25rem, 5vw, 4rem)', maxWidth: '700px' }}>
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <span className="eyebrow-refined" style={{ color: 'rgba(201,169,110,0.9)' }}>Your Style Awaits</span>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 4rem)', color: '#F5F0E8', letterSpacing: '-0.025em', lineHeight: 1.0, margin: '0 0 2.75rem' }}>
              Begin Your Beauty<br /><em style={{ fontStyle: 'italic', color: 'var(--champagne-lt)' }}>Journey Today</em>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={(e) => { addRipple(e); handleBook(); }}
                className="ripple-btn shimmer-btn"
                style={{
                  background: '#F5F0E8', color: '#0D0D0D',
                  padding: '16px 46px', borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '11px',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer', minHeight: '54px', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
                Book Your Appointment
              </button>
              <button
                onClick={handleServices}
                style={{
                  background: 'transparent', color: 'rgba(245,240,232,0.85)',
                  padding: '15px 34px', borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  border: '1px solid rgba(245,240,232,0.25)',
                  cursor: 'pointer', minHeight: '54px',
                  transition: 'all 0.28s ease',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'; e.currentTarget.style.color = 'var(--champagne)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.25)'; e.currentTarget.style.color = 'rgba(245,240,232,0.85)'; }}
              >
                Explore Services
              </button>
            </div>
          </div>
        </section>

        <Footer />

      </div>

      </SidebarInset>
    </SidebarProvider>
  );
}
