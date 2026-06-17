import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import { ChromaGrid } from '../components/ui/ChromaGrid';

const signatureStyles = [
  {
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
    title: "Golden Balayage",
    subtitle: "By David Chen",
    handle: "@davidchen_color",
    borderColor: "var(--champagne)",
    gradient: "linear-gradient(145deg, var(--champagne-dk), #0D0D0D)",
    url: "/booking"
  },
  {
    image: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=600&q=80",
    title: "Editorial Event Updo",
    subtitle: "By Jessica Monroe",
    handle: "@jessica_monroe",
    borderColor: "#C4897A",
    gradient: "linear-gradient(145deg, #C4897A, #0D0D0D)",
    url: "/booking"
  },
  {
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80",
    title: "Glass Gel Nail Art",
    subtitle: "By Nail Artistry Lab",
    handle: "@trendtrim_nails",
    borderColor: "#7A8C7E",
    gradient: "linear-gradient(145deg, #7A8C7E, #0D0D0D)",
    url: "/booking"
  },
  {
    image: "https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?auto=format&fit=crop&w=600&q=80",
    title: "Precision Bob Cut",
    subtitle: "By David Chen",
    handle: "@david_hair",
    borderColor: "#E2C98A",
    gradient: "linear-gradient(145deg, #E2C98A, #0D0D0D)",
    url: "/booking"
  },
  {
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
    title: "Photographic Glamour",
    subtitle: "By Jessica Monroe",
    handle: "@jessica_glam",
    borderColor: "#9B7B45",
    gradient: "linear-gradient(145deg, #9B7B45, #0D0D0D)",
    url: "/booking"
  },
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    title: "Executive Grooming",
    subtitle: "By Grooming Atelier",
    handle: "@grooming_luxe",
    borderColor: "#6E6860",
    gradient: "linear-gradient(145deg, #6E6860, #0D0D0D)",
    url: "/booking"
  }
];

const getServiceImage = (serviceName) => {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('color') || name.includes('balayage') || name.includes('blonde') || name.includes('highlight') || name.includes('glaze')) {
    return "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80";
  }
  if (name.includes('nail') || name.includes('manicure') || name.includes('pedicure') || name.includes('mani')) {
    return "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80";
  }
  if (name.includes('makeup') || name.includes('glamour') || name.includes('brow') || name.includes('facial') || name.includes('eyebrow')) {
    return "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80";
  }
  if (name.includes('grooming') || name.includes('shave') || name.includes('beard') || name.includes('men')) {
    return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?auto=format&fit=crop&w=600&q=80";
};

const getServiceCategoryColors = (serviceName) => {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('color') || name.includes('balayage') || name.includes('blonde') || name.includes('highlight') || name.includes('glaze')) {
    return {
      border: 'var(--champagne)',
      gradient: 'linear-gradient(145deg, var(--champagne-dk), #0D0D0D)'
    };
  }
  if (name.includes('nail') || name.includes('manicure') || name.includes('pedicure') || name.includes('mani')) {
    return {
      border: '#7A8C7E',
      gradient: 'linear-gradient(145deg, #7A8C7E, #0D0D0D)'
    };
  }
  if (name.includes('makeup') || name.includes('glamour') || name.includes('brow') || name.includes('facial') || name.includes('eyebrow')) {
    return {
      border: '#C4897A',
      gradient: 'linear-gradient(145deg, #C4897A, #0D0D0D)'
    };
  }
  if (name.includes('grooming') || name.includes('shave') || name.includes('beard') || name.includes('men')) {
    return {
      border: '#6E6860',
      gradient: 'linear-gradient(145deg, #6E6860, #0D0D0D)'
    };
  }
  return {
    border: '#E2C98A',
    gradient: 'linear-gradient(145deg, #E2C98A, #0D0D0D)'
  };
};

export default function Portfolio() {
  const { user } = useAuth();
  const { myBookings, fetchBookings, cancelBooking } = useBooking();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  useScrollReveal();

  const displayName = user?.name || 'Eleanor Vane';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }} className="">

      {/* Page hero */}
      <section style={{ paddingTop: '110px', paddingBottom: 'clamp(2.5rem, 5vw, 4rem)', paddingLeft: 'clamp(1.25rem, 5vw, 4rem)', paddingRight: 'clamp(1.25rem, 5vw, 4rem)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '450px', height: '220px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div className="page-transition" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '0.875rem', display: 'flex', justifyContent: 'center' }}>
            <span className="eyebrow-refined">My Portfolio</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', letterSpacing: '-0.025em', lineHeight: 1.0, color: 'var(--color-text)', margin: 0 }}>
            Your Appointments
          </h1>
        </div>
      </section>

      <main style={{ flex: 1, padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* User card */}
        <div className="reveal" style={{
          borderRadius: '22px', border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: 'clamp(1.5rem, 3vw, 2.25rem)',
          marginBottom: '3rem',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle glow */}
          <div style={{ position: 'absolute', top: '-30%', right: '5%', width: '250px', height: '250px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.125rem', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--champagne-dk), var(--champagne))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D0D0D', fontFamily: 'Tenor Sans', fontSize: '18px', letterSpacing: '0.05em', fontWeight: 600, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--champagne)', margin: 0 }}>
                {displayName}
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.8125rem', color: 'var(--color-text-dim)', margin: '2px 0 0' }}>
                {user?.email || 'member@trendtrim.com'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.625rem', color: 'var(--champagne)', margin: 0 }}>{user?.tier || 'PLATINUM'}</p>
              <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', margin: '3px 0 0' }}>Membership Status</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '2.5rem' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.625rem', color: 'var(--color-text)', margin: 0 }}>{myBookings.length}</p>
              <p style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)', margin: '3px 0 0' }}>Total Appointments</p>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', color: 'var(--color-text)', margin: 0 }}>
            Scheduled Appointments
          </h3>
          <button onClick={() => navigate('/booking')}
            className="nav-cta-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add</span>
            New Appointment
          </button>
        </div>

        {/* Bookings */}
        {myBookings.length === 0 ? (
          <div className="reveal" style={{ textAlign: 'center', padding: 'clamp(3rem, 6vw, 5rem)', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.375rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--champagne)' }}>calendar_month</span>
            </div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: '1.5rem', color: 'var(--color-text)', margin: '0 0 0.75rem' }}>No Appointments Yet</h4>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-text-dim)', maxWidth: '300px', margin: '0 auto 1.75rem', lineHeight: 1.7 }}>
              Ready to indulge? Reserve your first luxury salon experience.
            </p>
            <button onClick={() => navigate('/booking')}
              className="shimmer-btn"
              style={{
                background: 'var(--champagne)', color: '#0D0D0D',
                padding: '13px 28px', borderRadius: '99px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', minHeight: '46px', fontWeight: 500,
              }}
            >
              Book Now
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', minHeight: '380px', paddingBottom: '1rem' }} className="reveal">
            <ChromaGrid 
              className="appointments-grid"
              items={myBookings.map((b) => {
                const colors = getServiceCategoryColors(b.service);
                return {
                  image: null,
                  title: b.service,
                  subtitle: `${b.therapist} (${b.status})`,
                  handle: b.id,
                  location: `${b.date} at ${b.time}`,
                  borderColor: colors.border,
                  gradient: colors.gradient,
                  url: null,
                  onCancel: b.status === 'CONFIRMED' ? () => cancelBooking(b.id) : null,
                };
              })}
              radius={280}
              columns={Math.min(3, myBookings.length)}
              rows={Math.ceil(myBookings.length / 3)}
              damping={0.4}
              fadeOut={0.5}
            />
          </div>
        )}

        {/* Curated Style Showcase Section */}
        <div className="reveal" style={{ marginTop: '5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="eyebrow-refined" style={{ color: 'var(--champagne)' }}>Signature Creations</span>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--color-text)', margin: '0.5rem 0 0.75rem' }}>
              Curated Style Showcase
            </h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-text-dim)', maxWidth: '500px', margin: 0, lineHeight: 1.6 }}>
              Explore our master stylists' latest creations. Hover to reveal the vibrant colors, and click to reserve a style for your next session.
            </p>
          </div>

          <div style={{ position: 'relative', minHeight: '520px', paddingBottom: '2rem' }}>
            <ChromaGrid 
              items={signatureStyles}
              radius={280}
              columns={3}
              rows={2}
              damping={0.4}
              fadeOut={0.5}
            />
          </div>
        </div>
      </main>

      <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
