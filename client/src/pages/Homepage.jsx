import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';
import { BorderRotate } from '../components/ui/animated-gradient-border';


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

export default function Homepage() {
  const navigate = useNavigate();
  const { bookingForm, updateBookingForm } = useBooking();
  const { triggerAuthRequired } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);

  useScrollReveal();

  const slides = [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1600&q=80",
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide(p => (p + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, []);

  const handleBook = () => triggerAuthRequired(() => navigate('/booking'), "Please login to continue.");
  const handleServices = () => navigate('/services');
  const handleImageLoad = (id) => setImagesLoaded(p => ({ ...p, [id]: true }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }}>
      <Navigation />

      <div className="page-transition" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ─── HERO ─── */}
        <header style={{
          position: 'relative', width: '100%',
          minHeight: '100svh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: '#0D0D0D',
        }}>
          {/* Slideshow */}
          {slides.map((src, i) => (
            <img key={src} src={src} alt=""
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'opacity 2.2s ease',
                opacity: i === activeSlide ? 0.55 : 0,
              }}
              className={i === activeSlide ? 'animate-ken-burns' : ''}
            />
          ))}

          {/* Overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 100%)', zIndex: 2 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.75) 100%)', zIndex: 2 }} />

          {/* Subtle golden drifts */}
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '20%', left: '25%', width: '400px', height: '400px', background: 'rgba(201,169,110,0.06)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 2, pointerEvents: 'none' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', width: '100%', padding: '0 clamp(1.25rem, 5vw, 4rem)', textAlign: 'center', marginTop: '80px' }}>
            <p className="type-eyebrow" style={{ opacity: 0, animation: 'fadeUp 1.2s ease 0.3s forwards', marginBottom: '1.5rem', display: 'block' }}>
              THE LUXEBOOK ARCHIVE
            </p>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 400,
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              lineHeight: 1.0,
              color: '#F5F0E8',
              letterSpacing: '-0.02em',
              marginBottom: '1.75rem',
              opacity: 0, animation: 'fadeUp 1.2s ease 0.55s forwards',
            }}>
              Luxury Wellness,<br />
              <em style={{ fontStyle: 'italic', color: 'var(--champagne-lt)' }}>Effortlessly Yours</em>
            </h1>
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontWeight: 300,
              fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
              color: 'rgba(245,240,232,0.75)',
              maxWidth: '560px', margin: '0 auto 2.5rem',
              lineHeight: 1.8,
              opacity: 0, animation: 'fadeUp 1.2s ease 0.8s forwards',
            }}>
              A private concierge network matching you with elite wellness practitioners. Your sanctuary, whenever you desire it.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0, animation: 'fadeUp 1.2s ease 1.05s forwards' }}>
              <button
                onClick={(e) => { addRipple(e); handleBook(); }}
                className="ripple-btn shimmer-btn"
                style={{
                  background: 'var(--champagne)',
                  color: '#0D0D0D',
                  padding: '14px 36px',
                  borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 500,
                  minHeight: '48px',
                }}
              >
                Book Appointment
              </button>
              <button
                onClick={handleServices}
                style={{
                  background: 'transparent',
                  color: 'rgba(245,240,232,0.85)',
                  padding: '13px 32px',
                  borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(245,240,232,0.25)',
                  cursor: 'pointer',
                  minHeight: '48px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'; e.currentTarget.style.color = 'var(--champagne)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.25)'; e.currentTarget.style.color = 'rgba(245,240,232,0.85)'; }}
              >
                Explore Services
              </button>
            </div>

            {/* Quick Booking Widget */}
            <div style={{
              marginTop: '3.5rem',
              background: 'rgba(245,240,232,0.07)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(201,169,110,0.18)',
              borderRadius: '20px',
              padding: 'clamp(1rem, 3vw, 1.75rem)',
              maxWidth: '860px', margin: '3.5rem auto 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.25rem',
              alignItems: 'end',
              opacity: 0, animation: 'scaleIn 1.1s ease 1.4s forwards',
            }}>
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
                          border: 'none', borderBottom: '1px solid rgba(245,240,232,0.25)',
                          color: '#F5F0E8',
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem',
                          padding: '6px 20px 6px 0',
                          cursor: 'pointer', appearance: 'none', outline: 'none',
                        }}
                      >
                        <option style={{ background: '#111' }}>Signature Facial</option>
                        <option style={{ background: '#111' }}>Deep Tissue Spa</option>
                        <option style={{ background: '#111' }}>Aesthetic Ritual</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--champagne)', pointerEvents: 'none' }}>expand_more</span>
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
                        border: 'none', borderBottom: '1px solid rgba(245,240,232,0.25)',
                        color: '#F5F0E8',
                        fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem',
                        padding: '6px 0', outline: 'none',
                        colorScheme: 'dark',
                      }}
                    />
                  )
                },
                {
                  label: 'Therapist',
                  el: (
                    <div style={{ position: 'relative' }}>
                      <select
                        value={bookingForm.therapist}
                        onChange={(e) => updateBookingForm('therapist', e.target.value)}
                        style={{
                          width: '100%', background: 'transparent',
                          border: 'none', borderBottom: '1px solid rgba(245,240,232,0.25)',
                          color: '#F5F0E8',
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem',
                          padding: '6px 20px 6px 0',
                          cursor: 'pointer', appearance: 'none', outline: 'none',
                        }}
                      >
                        <option style={{ background: '#111' }}>Any Professional</option>
                        <option style={{ background: '#111' }}>Dr. Sarah Sterling</option>
                        <option style={{ background: '#111' }}>Master Therapist Julian</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--champagne)', pointerEvents: 'none' }}>expand_more</span>
                    </div>
                  )
                },
              ].map(field => (
                <div key={field.label} style={{ textAlign: 'left' }}>
                  <p style={{
                    fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px',
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.45)', marginBottom: '0.6rem',
                  }}>
                    {field.label}
                  </p>
                  {field.el}
                </div>
              ))}
              <button
                onClick={handleBook}
                className="shimmer-btn"
                style={{
                  background: 'var(--champagne)',
                  color: '#0D0D0D',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer',
                  minHeight: '44px', fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                Check Availability
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            opacity: 0, animation: 'fadeIn 1.2s ease 2s forwards', pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>SCROLL</span>
            <div style={{ width: '18px', height: '30px', borderRadius: '9px', border: '1px solid rgba(245,240,232,0.2)', display: 'flex', justifyContent: 'center', padding: '4px' }}>
              <div className="scroll-mouse-wheel" style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--champagne)' }} />
            </div>
          </div>

          {/* Slide dots */}
          <div style={{ position: 'absolute', bottom: '2.5rem', right: 'clamp(1.25rem, 5vw, 4rem)', zIndex: 20, display: 'flex', gap: '8px' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActiveSlide(i)}
                style={{
                  width: i === activeSlide ? '24px' : '6px', height: '6px',
                  borderRadius: '3px',
                  background: i === activeSlide ? 'var(--champagne)' : 'rgba(245,240,232,0.3)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        </header>

        {/* ─── PROLOGUE ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '50%', right: '15%', width: '320px', height: '320px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '740px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span className="reveal type-eyebrow" style={{ display: 'block', marginBottom: '1.25rem' }}>Prologue</span>
            <h2 className="reveal" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '2rem', color: 'var(--color-text)' }}>
              A Sanctuary for<br /><em style={{ fontStyle: 'italic', color: 'var(--champagne)' }}>Mind, Body, & Spirit</em>
            </h2>
            <div className="reveal lux-divider" style={{ marginBottom: '2rem' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.9375rem', color: 'var(--champagne)', letterSpacing: '0.08em' }}>✦</span>
            </div>
            <blockquote className="reveal" style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              lineHeight: 1.7,
              color: 'var(--color-text-dim)',
              margin: 0, padding: 0, border: 'none',
              maxWidth: '580px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              "Sanctuary is not merely a place; it is a sacred state of being. We create environments where time slows, allowing your journey back to complete rejuvenation."
            </blockquote>
            <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '1.75rem' }}>
              <div style={{ width: '32px', height: '1px', background: 'rgba(201,169,110,0.5)' }} />
              <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--champagne)' }}>Elowen Sterling, Founder</span>
              <div style={{ width: '32px', height: '1px', background: 'rgba(201,169,110,0.5)' }} />
            </div>
          </div>
        </section>

        {/* ─── CHAPTER I: CURATED RITUALS ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '10%', left: '5%', width: '280px', height: '280px', background: 'rgba(201,169,110,0.03)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Section header */}
            <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="type-eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>Chapter I</span>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--color-text)', margin: 0 }}>
                  Curated Rituals
                </h2>
              </div>
              <button
                onClick={handleServices}
                style={{
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--champagne)', background: 'none',
                  border: 'none', borderBottom: '1px solid var(--champagne)',
                  paddingBottom: '2px', cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
              >
                View Ritual Catalog
              </button>
            </div>

            {/* Card grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }} className="stagger">
              {/* Feature 1 — large left */}
              <BorderRotate
                onClick={handleServices}
                className="reveal service-card"
                style={{ gridColumn: 'span 7', height: '480px' }}
                animationMode="rotate-on-hover"
                animationSpeed={5}
                gradientColors={{
                  primary: 'var(--champagne-dk)',
                  secondary: 'var(--champagne)',
                  accent: 'var(--champagne-lt)'
                }}
                backgroundColor="#1a1a1a"
                borderWidth={2}
                borderRadius={14}
              >
                {!imagesLoaded['feat1'] && <div className="absolute inset-0 skeleton-pulse" style={{ position: 'absolute', inset: 0 }} />}
                <img
                  alt="Sculpting Facial"
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                  loading="lazy" onLoad={() => handleImageLoad('feat1')}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imagesLoaded['feat1'] ? 1 : 0, transition: 'opacity 0.7s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--champagne)', marginBottom: '0.5rem', display: 'block' }}>Signature Facial</span>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#F5F0E8', marginBottom: '0.625rem', lineHeight: 1.1 }}>Sculpting Facial</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'rgba(245,240,232,0.7)', lineHeight: 1.65, maxWidth: '380px' }}>Revitalize your skin with our signature lymphatic drainage and non-invasive lifting ritual.</p>
                </div>
              </BorderRotate>

              {/* Feature 2 — right */}
              <BorderRotate
                onClick={handleServices}
                className="reveal service-card"
                style={{ gridColumn: 'span 5', height: '480px' }}
                animationMode="rotate-on-hover"
                animationSpeed={5}
                gradientColors={{
                  primary: 'var(--champagne-dk)',
                  secondary: 'var(--champagne)',
                  accent: 'var(--champagne-lt)'
                }}
                backgroundColor="#1a1a1a"
                borderWidth={2}
                borderRadius={14}
              >
                {!imagesLoaded['feat2'] && <div style={{ position: 'absolute', inset: 0 }} className="skeleton-pulse" />}
                <img
                  alt="Sanctuary Spa"
                  src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80"
                  loading="lazy" onLoad={() => handleImageLoad('feat2')}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imagesLoaded['feat2'] ? 1 : 0, transition: 'opacity 0.7s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--champagne)', marginBottom: '0.5rem', display: 'block' }}>Thermal Spa</span>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: '#F5F0E8', marginBottom: '0.625rem', lineHeight: 1.1 }}>The Sanctuary Spa</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'rgba(245,240,232,0.7)', lineHeight: 1.65 }}>Mineral-rich thermal waters and bespoke aromatherapy.</p>
                </div>
              </BorderRotate>

              {/* Bottom three */}
              {[
                { id: 'b1', title: 'Deep Ritual Massage', cat: 'Body & Spa', desc: 'Custom oil massage targeting chronic tensions.', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80' },
                { id: 'b2', title: 'Precision Skin Care', cat: 'Aesthetics', desc: 'Vaporized mineral hydrations and clinical peels.', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80' },
                { id: 'b3', title: 'Curated Wellness',   cat: 'Holistic',   desc: 'Alignment and lifestyle concierge plans.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80' },
              ].map(card => (
                <BorderRotate key={card.id} onClick={handleServices}
                  className="reveal service-card"
                  style={{ gridColumn: 'span 4', height: '300px' }}
                  animationMode="rotate-on-hover"
                  animationSpeed={5}
                  gradientColors={{
                    primary: 'var(--champagne-dk)',
                    secondary: 'var(--champagne)',
                    accent: 'var(--champagne-lt)'
                  }}
                  backgroundColor="#1a1a1a"
                  borderWidth={2}
                  borderRadius={14}
                >
                  {!imagesLoaded[card.id] && <div style={{ position: 'absolute', inset: 0 }} className="skeleton-pulse" />}
                  <img alt={card.title} src={card.img} loading="lazy" onLoad={() => handleImageLoad(card.id)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imagesLoaded[card.id] ? 1 : 0, transition: 'opacity 0.7s ease' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--champagne)', marginBottom: '0.375rem', display: 'block' }}>{card.cat}</span>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: '1.375rem', color: '#F5F0E8', marginBottom: '0.25rem', lineHeight: 1.15 }}>{card.title}</h3>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(245,240,232,0.65)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{card.desc}</p>
                  </div>
                </BorderRotate>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CHAPTER II: PINNACLE OF SERVICE ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', bottom: '10%', right: '8%', width: '300px', height: '300px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="type-eyebrow" style={{ display: 'block', marginBottom: '0.75rem' }}>Chapter II</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--color-text)', margin: '0 0 1.5rem' }}>
                The Pinnacle of Service
              </h2>
              <div className="gold-line" style={{ maxWidth: '80px', margin: '0 auto' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }} className="stagger">
              {[
                { icon: 'calendar_month', title: 'Instant Booking',  desc: 'Real-time confirmation for your precious schedule.' },
                { icon: 'verified_user',  title: 'Verified Pros',    desc: 'Top 1% therapists vetted for exceptional skill.' },
                { icon: 'hotel_class',   title: 'Premium Only',     desc: 'Exclusive partners offering white-glove treatment.' },
                { icon: 'auto_awesome',  title: 'AI Concierge',     desc: 'Personalized wellness recommendations by Elowen.' },
                { icon: 'lock',          title: 'Secure Pay',       desc: 'Encrypted transactions for complete peace of mind.' },
              ].map(item => (
                <div key={item.title} className="reveal group"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '2rem 1.5rem', textAlign: 'center',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(26,21,16,0.09)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <div className="why-icon" style={{ width: '52px', height: '52px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--champagne)' }}>{item.icon}</span>
                  </div>
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.125rem', color: 'var(--color-text)', marginBottom: '0.625rem' }}>{item.title}</h4>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: 'var(--color-text-dim)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CHAPTER III: THE ART OF WELLNESS (Dark Band) ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', background: 'var(--obsidian, #0D0D0D)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '50%', left: '20%', width: '400px', height: '400px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div className="reveal-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <span className="type-eyebrow">Chapter III</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', letterSpacing: '-0.02em', color: '#F5F0E8', lineHeight: 1.05, margin: 0 }}>
                The Art of<br /><em style={{ fontStyle: 'italic', color: 'var(--champagne-lt)' }}>Wellness</em>
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(0.875rem, 1.5vw, 1.0625rem)', color: 'rgba(245,240,232,0.65)', lineHeight: 1.8, margin: 0 }}>
                We believe wellness is an art form. Our curators scour the globe for the most profound rituals, the most serene environments, and the most gifted healers — ensuring every LuxeBook experience is a masterpiece.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ height: '1px', width: '28px', background: 'rgba(201,169,110,0.5)' }} />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--champagne)', fontSize: '1rem', letterSpacing: '0.04em' }}>Pure Excellence</span>
              </div>
              <button
                onClick={handleBook}
                className="shimmer-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--champagne)', color: '#0D0D0D',
                  padding: '13px 28px', borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
                  minHeight: '44px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>spa</span>
                Reserve Your Ritual
              </button>
            </div>

            <div className="reveal-right" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <img alt="Therapist" src="https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=400&q=80" loading="lazy"
                style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px', border: '1px solid rgba(201,169,110,0.12)', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              />
              <img alt="Ritual" src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80" loading="lazy"
                style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px', border: '1px solid rgba(201,169,110,0.12)', marginTop: '2rem', transition: 'transform 0.6s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              />
            </div>
          </div>
        </section>

        {/* ─── CHAPTER IV: ELOWEN'S INTELLIGENCE ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div className="animate-drift-medium" style={{ position: 'absolute', right: '5%', top: '10%', width: '350px', height: '350px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Visualizer orb */}
            <div className="reveal" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,169,110,0.06)', borderRadius: '50%', filter: 'blur(40px)', animation: 'pulse 3s infinite ease-in-out' }} />
                <div className="spin-slow" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.2)' }} />
                <div className="spin-slow" style={{ position: 'absolute', inset: '12%', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.1)', animationDirection: 'reverse' }} />
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <span className="material-symbols-outlined float-anim" style={{ fontSize: '56px', color: 'var(--champagne)' }}>cognition</span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px', width: '120px' }}>
                    {[1.2, 0.8, 1.5, 0.9, 1.4, 0.7, 1.3, 1.0, 1.6, 0.8, 1.2, 1.4, 0.7, 1.1, 0.9].map((dur, i) => (
                      <span key={i} className="visualizer-bar" style={{ width: '4px', height: '100%', background: 'var(--champagne)', borderRadius: '2px', animationDuration: `${dur}s`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="champ-glow" style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--champagne)', marginTop: '1rem' }}>Elowen System Active</span>
            </div>

            <div className="reveal-right" style={{ flex: '1 1 320px' }}>
              <span className="type-eyebrow" style={{ display: 'block', marginBottom: '0.75rem' }}>Chapter IV</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>
                Elowen's Intelligence
              </h2>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.125rem', color: 'var(--color-text-dim)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                "Tell me how you're feeling today, and I will curate your perfect sanctuary."
              </p>
              <div className="glass-ivory" style={{ padding: '1.75rem', borderRadius: '18px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  {['AI Concierge', 'Adaptive Intelligence'].map(tag => (
                    <span key={tag} style={{
                      padding: '4px 12px',
                      borderRadius: '99px',
                      border: '1px solid rgba(201,169,110,0.35)',
                      fontFamily: 'Tenor Sans, sans-serif',
                      fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'var(--champagne)',
                    }}>{tag}</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Elowen analyzes your stress levels, skin needs, and schedule to recommend the most effective treatments in real-time.
                </p>
                <button
                  onClick={(e) => { addRipple(e); handleBook(); }}
                  className="ripple-btn shimmer-btn"
                  style={{
                    width: '100%', padding: '13px',
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    border: 'none', borderRadius: '12px',
                    fontFamily: 'Tenor Sans, sans-serif',
                    fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                    cursor: 'pointer', minHeight: '46px',
                  }}
                >
                  Chat with Elowen
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="type-eyebrow" style={{ display: 'block', marginBottom: '0.75rem' }}>Testimonials</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 1.5rem' }}>
                Voices of the Inner Circle
              </h2>
              <div className="gold-line" style={{ maxWidth: '80px', margin: '0 auto' }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }} className="stagger">
              {[
                { quote: 'LuxeBook has transformed how I manage my self-care. The quality of therapists is simply unmatched in the city.', name: 'Eleanor Vane', tier: 'Platinum Member', img: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80' },
                { quote: "The AI concierge Elowen suggested a treatment I didn't even know I needed. It was life-changing. Pure effortless luxury.", name: 'Julian Cross', tier: 'Diamond Tier', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80', featured: true },
              ].map(t => (
                <div key={t.name} className={`reveal testimonial-card glass-ivory ${t.featured ? 'scale-[1.02]' : ''}`}
                  style={{ padding: '2rem', borderRadius: '20px', maxWidth: '420px', flex: '1 1 320px' }}
                >
                  <div style={{ display: 'flex', marginBottom: '1.25rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--champagne)', fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--color-text-dim)', marginBottom: '1.5rem' }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(201,169,110,0.3)' }}>
                      <img alt={t.name} src={t.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1rem', color: 'var(--color-text)', margin: 0 }}>{t.name}</p>
                      <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--champagne)', margin: 0 }}>{t.tier}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CHAPTER V: THE INNER CIRCLE ─── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span className="reveal type-eyebrow" style={{ display: 'block', marginBottom: '0.75rem' }}>Chapter V</span>
            <h2 className="reveal" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.02em', color: '#F5F0E8', margin: '0 0 3.5rem', lineHeight: 1.05 }}>
              The Inner Circle
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: '960px', margin: '0 auto 3rem' }} className="stagger">
              {[
                { title: 'Priority Concierge', desc: 'Skip the wait with 24/7 priority access to the world\'s most sought-after practitioners.' },
                { title: 'Platinum Events',    desc: 'Exclusive invitations to private wellness retreats and high-society aesthetics galas.', featured: true },
                { title: 'Global Access',      desc: 'Seamless wellness continuity as you travel between our partner suites in 20+ capitals.' },
              ].map(m => (
                <div key={m.title} className="reveal membership-card"
                  style={{
                    padding: '2rem 1.5rem',
                    border: m.featured ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    background: m.featured ? 'rgba(201,169,110,0.06)' : 'transparent',
                    transform: m.featured ? 'scale(1.04)' : 'none',
                    boxShadow: m.featured ? '0 0 40px rgba(201,169,110,0.08)' : 'none',
                  }}
                >
                  {m.featured && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--champagne)', padding: '3px 10px', border: '1px solid rgba(201,169,110,0.4)', borderRadius: '99px' }}>Featured</span>
                    </div>
                  )}
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: '1.375rem', color: 'var(--champagne)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>{m.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.875rem', color: 'rgba(245,240,232,0.6)', lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={(e) => { addRipple(e); navigate('/login'); }}
              className="ripple-btn shimmer-btn"
              style={{
                background: 'var(--champagne)', color: '#0D0D0D',
                padding: '14px 40px', borderRadius: '99px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', minHeight: '48px', fontWeight: 500,
              }}
            >
              Apply for Membership
            </button>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section style={{ position: 'relative', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', zIndex: 10 }} />
          <img alt="Serene sunset" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            loading="lazy" className="animate-ken-burns"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
          />
          <div className="animate-drift-slow" style={{ position: 'absolute', top: '30%', left: '25%', width: '280px', height: '280px', background: 'rgba(201,169,110,0.08)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 10, pointerEvents: 'none' }} />

          <div className="reveal" style={{ position: 'relative', zIndex: 20, textAlign: 'center', padding: '0 clamp(1.25rem, 5vw, 4rem)' }}>
            <span className="type-eyebrow" style={{ display: 'block', marginBottom: '1rem' }}>Your Sanctuary Awaits</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.75rem)', color: '#F5F0E8', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 2.5rem', maxWidth: '700px' }}>
              Begin Your Wellness<br /><em style={{ fontStyle: 'italic', color: 'var(--champagne-lt)' }}>Journey Today</em>
            </h2>
            <button
              onClick={(e) => { addRipple(e); handleBook(); }}
              className="ripple-btn shimmer-btn"
              style={{
                background: '#F5F0E8', color: '#0D0D0D',
                padding: '15px 44px', borderRadius: '99px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '11px',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', minHeight: '52px', fontWeight: 500,
              }}
            >
              Book Your Experience
            </button>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
