import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg)',
      borderTop: '1px solid var(--color-border)',
      padding: '3rem clamp(1.25rem, 5vw, 4rem)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Top Row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'flex-start',
          gap: '2rem', marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div style={{ maxWidth: '260px' }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.35rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--color-text)',
              marginBottom: '0.75rem',
            }}>
              LuxeBook
            </div>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: '0.8125rem',
              lineHeight: 1.7,
              color: 'var(--color-text-dim)',
            }}>
              The pinnacle of personal wellness, curated for those who expect nothing less than extraordinary.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 'clamp(2rem, 5vw, 5rem)', flexWrap: 'wrap' }}>
            {[
              { heading: 'Experiences', links: ['Signature Rituals', 'Premium Services', 'Membership', 'Gift Cards'] },
              { heading: 'Company',     links: ['About', 'Portfolio', 'Press', 'Careers'] },
              { heading: 'Legal',       links: ['Privacy', 'Terms', 'Accessibility', 'Concierge'] },
            ].map(col => (
              <div key={col.heading}>
                <p style={{
                  fontFamily: 'Tenor Sans, sans-serif',
                  fontSize: '9px',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--champagne)',
                  marginBottom: '1.1rem',
                }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a
                        href="#"
                        style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 300,
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-dim)',
                          textDecoration: 'none',
                          transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--champagne)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '1.5rem' }} />

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
            © 2026 LuxeBook. All rights reserved.
          </p>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '0.875rem',
            color: 'var(--color-text-mute)',
            letterSpacing: '0.02em',
          }}>
            The Pinnacle of Personal Service.
          </p>
        </div>
      </div>
    </footer>
  );
}
