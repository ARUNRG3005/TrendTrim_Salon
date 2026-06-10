import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--color-bg)',
      borderTop: '1px solid var(--color-border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow at top */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem clamp(1.25rem, 5vw, 4rem) 2.5rem' }}>
        {/* Top Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) repeat(3, minmax(0, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem',
        }} className="footer-grid">
          {/* Brand */}
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <img src="/favicon.svg" alt="TrendTrim" className="h-6 w-auto" />
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.25rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                color: 'var(--color-text)',
              }}>TrendTrim</span>
            </div>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: '0.875rem',
              lineHeight: 1.8,
              color: 'var(--color-text-dim)',
              maxWidth: '260px',
              marginBottom: '1.75rem',
            }}>
              The pinnacle of personal beauty &amp; grooming, curated for those who expect nothing less than extraordinary.
            </p>
            {/* Social links (decorative) */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {['language', 'camera', 'favorite'].map(icon => (
                <button key={icon}
                  style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-dim)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'; e.currentTarget.style.color = 'var(--champagne)'; e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {[
            { heading: 'Experiences', links: ['Signature Services', 'Premium Styling', 'Membership', 'Gift Cards'] },
            { heading: 'Company',     links: ['About', 'Portfolio', 'Press', 'Careers'] },
            { heading: 'Legal',       links: ['Privacy', 'Terms', 'Accessibility', 'Concierge'] },
          ].map(col => (
            <div key={col.heading}>
              <p style={{
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: '9px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--champagne)',
                marginBottom: '1.375rem',
              }}>
                {col.heading}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {col.links.map(l => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 300,
                        fontSize: '0.875rem',
                        color: 'var(--color-text-dim)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--champagne)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-dim)'; }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)', marginBottom: '1.75rem' }} />

        {/* Bottom Row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center',
          gap: '1rem',
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 300,
            fontSize: '0.75rem',
            color: 'var(--color-text-mute)',
            letterSpacing: '0.04em',
          }}>
            © {currentYear} TrendTrim. All rights reserved.
          </p>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '0.9375rem',
            color: 'var(--champagne)',
            letterSpacing: '0.02em',
            opacity: 0.7,
          }}>
            The Pinnacle of Personal Service.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
