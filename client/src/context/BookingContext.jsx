import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookingForm, setBookingForm] = useState({
    service: 'Signature Facial',
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
      }
    } catch (e) {
      // Local storage fallback for offline use
      const stored = localStorage.getItem(`luxebook_bookings_${user?.email}`);
      if (stored) {
        setMyBookings(JSON.parse(stored));
      } else {
        // Seed default bookings for demo purposes
        const mock = [
          {
            id: 'BK-8891',
            service: 'Sculpting Facial',
            date: '2026-06-15',
            time: '14:00',
            therapist: 'Dr. Sarah Sterling',
            status: 'CONFIRMED',
            price: 240
          },
          {
            id: 'BK-4530',
            service: 'Deep Tissue Spa',
            date: '2026-05-20',
            time: '10:30',
            therapist: 'Master Therapist Julian',
            status: 'COMPLETED',
            price: 180
          }
        ];
        setMyBookings(mock);
        localStorage.setItem(`luxebook_bookings_${user?.email}`, JSON.stringify(mock));
      }
    }
  };

  const createBooking = async (bookingDetails) => {
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...bookingForm,
      ...bookingDetails,
      status: 'CONFIRMED',
      price: bookingForm.service === 'Signature Facial' ? 195 : bookingForm.service === 'Deep Tissue Spa' ? 180 : 220
    };

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBooking, userEmail: user?.email }),
      });
      if (response.ok) {
        const saved = await response.json();
        setMyBookings(prev => [saved, ...prev]);
        return saved;
      }
    } catch (e) {
      // Offline fallback
      const updated = [newBooking, ...myBookings];
      setMyBookings(updated);
      localStorage.setItem(`luxebook_bookings_${user?.email}`, JSON.stringify(updated));
      return newBooking;
    }
  };

  const cancelBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMyBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      // Offline fallback
      const updated = myBookings.filter(b => b.id !== id);
      setMyBookings(updated);
      localStorage.setItem(`luxebook_bookings_${user?.email}`, JSON.stringify(updated));
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
