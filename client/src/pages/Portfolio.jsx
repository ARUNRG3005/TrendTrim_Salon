import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function Portfolio() {
  const { user } = useAuth();
  const { myBookings, cancelBooking } = useBooking();

  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-transparent text-on-surface dark:text-zinc-100 font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 py-xl px-lg max-w-container-max mx-auto w-full">
        
        {/* User Card */}
        <div className="glass-card-light dark:bg-zinc-900/60 rounded-2xl p-lg border border-gold/10 dark:border-zinc-800/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-md mb-xl">
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full bg-primary-fixed-dim/30 dark:bg-gold/10 flex items-center justify-center text-primary dark:text-gold">
              <span className="material-symbols-outlined text-[36px]">account_circle</span>
            </div>
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary dark:text-gold">{user?.name || 'Eleanor Vane'}</h2>
              <p className="font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400">{user?.email || 'eleanor@luxebook.com'}</p>
            </div>
          </div>
          <div className="flex gap-lg text-center">
            <div>
              <span className="font-headline-md text-gold text-2xl font-bold">{user?.tier || 'PLATINUM'}</span>
              <p className="font-label-caps text-[9px] text-on-surface-variant dark:text-zinc-400">MEMBERSHIP STATUS</p>
            </div>
            <div className="border-l border-outline-variant/30 dark:border-zinc-800/40 pl-lg">
              <span className="font-headline-md text-primary dark:text-zinc-100 text-2xl font-bold">{myBookings.length}</span>
              <p className="font-label-caps text-[9px] text-on-surface-variant dark:text-zinc-400">TOTAL APPOINTMENTS</p>
            </div>
          </div>
        </div>

        {/* Scheduled Appointments */}
        <div className="space-y-md">
          <h3 className="font-headline-lg text-headline-lg text-primary dark:text-gold">Scheduled Treatments</h3>
          
          {myBookings.length === 0 ? (
            <div className="text-center py-lg glass-card-light dark:bg-zinc-900/60 rounded-2xl border border-outline-variant/20 dark:border-zinc-800/40 text-on-surface-variant dark:text-zinc-300 font-body-sm">
              No appointments reserved. Click "Booking" above to schedule a treatment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {myBookings.map((b) => (
                <div key={b.id} className="glass-card-light dark:bg-zinc-900/60 rounded-2xl p-lg border border-gold/10 dark:border-zinc-800/80 shadow-md flex flex-col justify-between">
                  <div className="space-y-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-label-caps text-[9px] bg-primary/10 text-primary dark:bg-gold/10 dark:text-gold px-sm py-0.5 rounded-full">
                          {b.id}
                        </span>
                        <h4 className="font-headline-md text-headline-md text-primary dark:text-gold mt-xs">{b.service}</h4>
                      </div>
                      <span className={`font-label-caps text-[10px] font-bold px-sm py-1 rounded-full ${
                        b.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-sm text-body-sm pt-sm border-t border-outline-variant/10 dark:border-zinc-800/20">
                      <div>
                        <p className="text-on-surface-variant dark:text-zinc-400 text-[11px] font-label-caps">SPECIALIST</p>
                        <p className="font-semibold">{b.therapist}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant dark:text-zinc-400 text-[11px] font-label-caps">SCHEDULE</p>
                        <p className="font-semibold">{b.date} at {b.time}</p>
                      </div>
                    </div>
                  </div>

                  {b.status === 'CONFIRMED' && (
                    <div className="flex justify-end pt-md border-t border-outline-variant/10 dark:border-zinc-800/20 mt-md">
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="text-red-600 hover:text-red-800 font-label-caps text-label-caps text-xs border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 px-md py-1.5 rounded-lg transition-all"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
