import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookingForm, setBookingForm] = useState({
    service: 'Signature Haircut & Style',
    date: '',
    therapist: 'Any Professional'
  });
  const [myBookings, setMyBookings] = useState([]);

  // Fetch bookings when user changes
  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setMyBookings([]);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const email = user?.email || '';
      const response = await fetch(`http://localhost:5000/api/bookings?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setMyBookings(data);
        localStorage.setItem(`trendtrim_bookings_${user?.email}`, JSON.stringify(data));
      }
    } catch (e) {
      // Local storage fallback for offline use
      const stored = localStorage.getItem(`trendtrim_bookings_${user?.email}`);
      if (stored) {
        setMyBookings(JSON.parse(stored));
      } else {
        // Seed default bookings for demo purposes
        const mock = [
          {
            id: 'BK-8891',
            service: 'Premium Color & Highlights',
            date: '2026-06-15',
            time: '14:00',
            therapist: 'Jessica Monroe',
            status: 'CONFIRMED',
            price: 180
          },
          {
            id: 'BK-4530',
            service: 'Signature Haircut & Style',
            date: '2026-05-20',
            time: '10:30',
            therapist: 'David Chen',
            status: 'COMPLETED',
            price: 95
          }
        ];
        setMyBookings(mock);
        localStorage.setItem(`trendtrim_bookings_${user?.email}`, JSON.stringify(mock));
      }
    }
  };

  const createBooking = async (bookingDetails) => {
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...bookingForm,
      ...bookingDetails,
      status: 'CONFIRMED',
      status: 'CONFIRMED',
      price: bookingDetails.price || bookingForm.price || (bookingForm.service === 'Signature Haircut & Style' ? 95 : bookingForm.service === 'Premium Color & Highlights' ? 180 : 250)
    };

    const notifyAdmin = (booking) => {
      const existingStr = localStorage.getItem('trendtrim_admin_notifications') || '[]';
      let existing = [];
      try { existing = JSON.parse(existingStr); } catch (e) { }
      const newNotif = {
        id: Date.now(),
        type: 'BOOKING',
        booking: booking,
        text: `New Booking: ${booking.service} for ${user?.name || user?.email || 'Guest'}`,
        read: false,
        time: 'Just now'
      };
      existing.unshift(newNotif);
      localStorage.setItem('trendtrim_admin_notifications', JSON.stringify(existing));
      window.dispatchEvent(new Event('trendtrim_booking_created'));
    };

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBooking, userEmail: user?.email }),
      });
      if (response.ok) {
        const saved = await response.json();
        setMyBookings(prev => {
          const updated = [saved, ...prev];
          localStorage.setItem(`trendtrim_bookings_${user?.email}`, JSON.stringify(updated));
          return updated;
        });
        notifyAdmin(saved);
        return saved;
      }
    } catch (e) {
      // Offline fallback
      const updated = [newBooking, ...myBookings];
      setMyBookings(updated);
      localStorage.setItem(`trendtrim_bookings_${user?.email}`, JSON.stringify(updated));
      notifyAdmin(newBooking);
      return newBooking;
    }
  };

  const cancelBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMyBookings(prev => {
          const updated = prev.filter(b => b.id !== id);
          localStorage.setItem(`trendtrim_bookings_${user?.email}`, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      // Offline fallback
      const updated = myBookings.filter(b => b.id !== id);
      setMyBookings(updated);
      localStorage.setItem(`trendtrim_bookings_${user?.email}`, JSON.stringify(updated));
    }
  };

  const updateBookingForm = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BookingContext.Provider value={{
      bookingForm,
      updateBookingForm,
      myBookings,
      createBooking,
      cancelBooking,
      fetchBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
