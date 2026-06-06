import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Confirmed() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const booking = location.state?.booking || {
    id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
    service: 'Signature Facial',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // tomorrow
    time: '10:30',
    therapist: 'Dr. Sarah Sterling',
    price: 210
  };

  // Generate and download a standard .ics calendar invite
  const handleAddToCalendar = () => {
    const summary = `LuxeBook Wellness Ritual: ${booking.service}`;
    const description = `Your appointment with ${booking.therapist} is confirmed. Booking ID: ${booking.id}. Total Rate: $${booking.price}.00.`;
    
    const bookingDate = booking.date && booking.date !== 'Select date' ? booking.date : new Date().toISOString().split('T')[0];
    const bookingTime = booking.time || '10:30';
    
    // YYYYMMDD
    const dateStr = bookingDate.replace(/-/g, '');
    // HHMMSS
    const timeStr = bookingTime.replace(/:/g, '') + '00';
    const startDateTime = `${dateStr}T${timeStr}`;
    
    // Add 1 hour duration
    const [hours, minutes] = bookingTime.split(':');
    const endHours = String((parseInt(hours, 10) + 1) % 24).padStart(2, '0');
    const endDateTime = `${dateStr}T${endHours}${minutes}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LuxeBook//Wellness Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${booking.id}@luxebook.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'LOCATION:LuxeBook Wellness Concierge Sanctuary',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `luxebook-appointment-${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-on-surface dark:text-zinc-100 font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 py-xl px-lg max-w-2xl mx-auto w-full flex flex-col items-center justify-center page-transition">
        
        {/* Breadcrumbs funnel visual tracker */}
        <div className="w-full mb-md">
          <Breadcrumbs />
        </div>

        <div className="glass-card-light dark:bg-zinc-900 rounded-2xl p-lg shadow-2xl border border-gold/10 dark:border-zinc-800 text-center space-y-md w-full">
          
          {/* Drawing SVG Checkmark Check Animation */}
          <div className="flex items-center justify-center py-sm">
            <div className="w-20 h-20 bg-primary/10 dark:bg-gold/10 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-primary dark:text-gold" viewBox="0 0 52 52" fill="none">
                <circle
                  className="stroke-primary dark:stroke-gold"
                  cx="26"
                  cy="26"
                  r="23"
                  strokeWidth="2"
                  strokeDasharray="145"
                  strokeDashoffset="145"
                  style={{
                    animation: 'strokeDraw 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards'
                  }}
                />
                <path
                  className="stroke-primary dark:stroke-gold"
                  d="M16 27l6.5 6.5 14-14"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  strokeDashoffset="40"
                  style={{
                    animation: 'strokeDraw 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards'
                  }}
                />
              </svg>
            </div>
          </div>

          <h1 className="font-display-lg text-display-lg text-primary dark:text-gold">Ritual Reserved</h1>
          <p className="font-body-md text-on-surface-variant dark:text-zinc-400 max-w-md mx-auto">
            Your spot has been successfully locked in our schedule. A luxury concierge will coordinate therapist arrival protocols.
          </p>

          <div className="bg-white dark:bg-zinc-950/60 border border-outline-variant/30 dark:border-zinc-800 rounded-2xl p-md text-left space-y-sm">
            <div className="flex justify-between border-b border-outline-variant/10 dark:border-zinc-800/60 pb-xs">
              <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">BOOKING ID</span>
              <span className="font-bold text-primary dark:text-gold">{booking.id}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 dark:border-zinc-800/60 pb-xs">
              <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">SERVICE TREATMENT</span>
              <span className="font-semibold dark:text-zinc-200">{booking.service}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 dark:border-zinc-800/60 pb-xs">
              <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">SPECIALIST</span>
              <span className="font-semibold dark:text-zinc-200">{booking.therapist}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 dark:border-zinc-800/60 pb-xs">
              <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">DATE & TIME</span>
              <span className="font-semibold dark:text-zinc-200">{booking.date} at {booking.time}</span>
            </div>
            <div className="flex justify-between pt-xs font-bold text-primary dark:text-gold">
              <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">TOTAL RESERVED RATE</span>
              <span>${booking.price}.00</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
            <button
              onClick={handleAddToCalendar}
              className="bg-primary dark:bg-gold text-on-primary dark:text-zinc-950 font-label-caps text-label-caps px-lg py-md rounded-xl hover:bg-primary-container dark:hover:bg-yellow-500 hover:shadow-lg transition-all min-h-[44px]"
            >
              ADD TO CALENDAR
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="border border-outline dark:border-zinc-700 font-label-caps text-label-caps px-lg py-md rounded-xl hover:bg-black/5 dark:hover:bg-white/5 dark:text-zinc-300 transition-all min-h-[44px]"
            >
              VIEW MY RITUALS
            </button>
          </div>

          <div className="pt-sm">
            <Link
              to="/home"
              className="font-label-caps text-xs text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-gold transition-colors inline-block"
            >
              RETURN TO CONCIERGE HOME
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
