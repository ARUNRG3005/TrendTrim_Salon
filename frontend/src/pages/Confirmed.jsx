import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import { Balloons } from '../components/ui/balloons';

export default function Confirmed() {
  const location = useLocation();
  const navigate = useNavigate();
  const balloonsRef = React.useRef(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (balloonsRef.current) {
        balloonsRef.current.launchAnimation();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const booking = location.state?.booking || {
    id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
    service: 'Signature Haircut & Style',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:30',
    therapist: 'Jessica Monroe',
    price: 110
  };

  const handleAddToCalendar = () => {
    const summary = `TrendTrim Salon Appointment: ${booking.service}`;
    const description = `Your appointment with ${booking.therapist} is confirmed. Booking ID: ${booking.id}. Total: $${booking.price}.00.`;
    const bookingDate = booking.date && booking.date !== 'Select date' ? booking.date : new Date().toISOString().split('T')[0];
    const bookingTime = booking.time || '10:30';
    const dateStr = bookingDate.replace(/-/g, '');
    const timeStr = bookingTime.replace(/:/g, '') + '00';
    const startDateTime = `${dateStr}T${timeStr}`;
    const [hours, minutes] = bookingTime.split(':');
    const endHours = String((parseInt(hours, 10) + 1) % 24).padStart(2, '0');
    const endDateTime = `${dateStr}T${endHours}${minutes}00`;

    const icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TrendTrim//Salon Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@trendtrim.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateTime}`, `DTEND:${endDateTime}`,
      `SUMMARY:${summary}`, `DESCRIPTION:${description}`,
      'LOCATION:TrendTrim Premium Salon', 'STATUS:CONFIRMED',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trendtrim-appointment-${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }} className="">

      <main style={{ flex: 1, padding: 'clamp(7rem, 12vw, 10rem) clamp(1.25rem, 5vw, 4rem) clamp(4rem, 8vw, 6rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '680px', margin: '0 auto', width: '100%' }}>

        <div style={{ width: '100%', marginBottom: '1.75rem' }}>
          <Breadcrumbs />
        </div>

        {/* Confirmation Card */}
        <div className="page-transition" style={{ width: '100%', borderRadius: '24px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden', position: 'relative' }}>
          {/* Gold top stripe */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--champagne-dk), var(--champagne), var(--champagne-lt))' }} />

          {/* Success icon */}
          <div style={{ padding: 'clamp(2.5rem, 5vw, 3.5rem) 2rem 2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '1px solid rgba(201,169,110,0.12)' }} />
                <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="23" stroke="var(--champagne)" strokeWidth="1.5"
                    strokeDasharray="145" strokeDashoffset="145"
                    style={{ animation: 'strokeDraw 0.7s cubic-bezier(0.65,0,0.45,1) 0.1s forwards' }}
                  />
                  <path d="M16 27l6.5 6.5 14-14" stroke="var(--champagne)" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="40" strokeDashoffset="40"
                    style={{ animation: 'strokeDraw 0.5s cubic-bezier(0.65,0,0.45,1) 0.65s forwards' }}
                  />
                </svg>
              </div>
            </div>

            {/* Eyebrow */}
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
              <span className="eyebrow-refined" style={{ color: 'var(--champagne)' }}>Booking Confirmed</span>
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-text)', letterSpacing: '-0.025em', margin: '0 0 1rem', lineHeight: 1.0 }}>
              Your Appointment is Set
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
              Your spot has been locked in our schedule. Our team will prepare your personalized salon experience.
            </p>

            {/* Details card */}
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '18px', overflow: 'hidden', marginBottom: '2.5rem', textAlign: 'left' }}>
              {[
                { label: 'Booking ID', value: booking.id, highlight: true },
                { label: 'Service Booked', value: booking.service },
                { label: 'Stylist', value: booking.therapist },
                { label: 'Date & Time', value: `${booking.date} at ${booking.time}` },
                { label: 'Total Reserved Rate', value: `$${booking.price}.00`, highlight: true },
              ].map(({ label, value, highlight }, idx, arr) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  gap: '1rem',
                }}>
                  <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1rem', color: highlight ? 'var(--champagne)' : 'var(--color-text)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1.75rem' }}>
              <button onClick={handleAddToCalendar}
                className="shimmer-btn"
                style={{
                  background: 'var(--champagne)', color: '#0D0D0D',
                  padding: '13px 28px', borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer', minHeight: '46px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>event_available</span>
                Add to Calendar
              </button>
              <button onClick={() => navigate('/portfolio')}
                style={{
                  background: 'transparent', color: 'var(--color-text-dim)',
                  padding: '12px 28px', borderRadius: '99px',
                  fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  border: '1px solid var(--color-border-strong)', cursor: 'pointer', minHeight: '46px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.45)'; e.currentTarget.style.color = 'var(--champagne)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-dim)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>calendar_month</span>
                View Appointments
              </button>
            </div>

            <Link to="/home" style={{
              fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--color-text-mute)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px',
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-mute)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>home</span>
              Return to Home
            </Link>
          </div>
        </div>
        <Balloons ref={balloonsRef} type="default" />
      </main>

      <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
