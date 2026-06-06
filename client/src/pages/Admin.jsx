import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // overview, appointments, customers, specialists, services, analytics, settings

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeClients: 0,
    totalRevenue: 0,
    salesDistribution: { facials: 0, spa: 0, aesthetics: 0 },
    recentBookings: []
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Interactive Filters
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form states for creating items (Mock database updates)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', tier: 'PLATINUM MEMBER' });
  const [newService, setNewService] = useState({ name: '', category: 'AESTHETICS', price: '', duration: '' });

  // Mock list databases
  const [customers, setCustomers] = useState([
    { name: 'Eleanor Vance', email: 'user@luxebook.com', tier: 'PLATINUM MEMBER', bookings: 3, joined: '2026-04-10' },
    { name: 'Marcus Sterling', email: 'marcus@sterling.co', tier: 'DIAMOND TIER', bookings: 8, joined: '2026-01-15' },
    { name: 'Sophia Laurent', email: 'sophia@laurent.fr', tier: 'DIAMOND TIER', bookings: 5, joined: '2026-03-22' },
    { name: 'Jameson Locke', email: 'jameson.locke@unsc.org', tier: 'PLATINUM MEMBER', bookings: 2, joined: '2026-05-01' },
    { name: 'Aria Montgomery', email: 'aria@rosewood.net', tier: 'MEMBER', bookings: 1, joined: '2026-05-18' }
  ]);

  const [specialists, setSpecialists] = useState([
    { name: 'Dr. Sarah Sterling', title: 'Facial & Skin Expert', rating: 5.0, status: 'Available', img: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80' },
    { name: 'Master Julian', title: 'Deep Tissue Specialist', rating: 4.8, status: 'In Session', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80' },
    { name: 'Dr. Aris Thorne', title: 'Aesthetic Practitioner', rating: 4.9, status: 'Available', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80' },
    { name: 'Elena Rostova', title: 'Skin Glow therapist', rating: 4.7, status: 'Off Duty', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' }
  ]);

  const [servicesList, setServicesList] = useState([
    { name: 'Signature Facial', category: 'FACIAL THERAPY', price: 195, duration: '60 MIN' },
    { name: 'Sculpting Facial', category: 'FACIAL THERAPY', price: 240, duration: '75 MIN' },
    { name: 'Deep Tissue Spa', category: 'BODY & SPA', price: 180, duration: '90 MIN' },
    { name: 'The Sanctuary Spa', category: 'BODY & SPA', price: 210, duration: '90 MIN' },
    { name: 'Aesthetic Ritual', category: 'AESTHETICS', price: 220, duration: '60 MIN' },
    { name: 'Precision Skin Care', category: 'AESTHETICS', price: 250, duration: '60 MIN' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New booking BK-8891 by Eleanor Vance', read: false, time: '10 mins ago' },
    { id: 2, text: 'Booking BK-4530 status updated to COMPLETED', read: true, time: '2 hours ago' },
    { id: 3, text: 'Monthly revenue threshold achieved: $42,500', read: true, time: '1 day ago' },
    { id: 4, text: 'New member signup: Sophia Laurent', read: true, time: '3 days ago' }
  ]);

  // Fetch Data
  const fetchData = async () => {
    const apiHeaders = {};
    if (user) {
      apiHeaders['x-user-email'] = user.email;
      apiHeaders['x-user-role'] = user.role;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/analytics', { headers: apiHeaders });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }

      const bookingsResponse = await fetch('http://localhost:5000/api/bookings', { headers: apiHeaders });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }
      setLoading(false);
    } catch (e) {
      // Offline fallback state
      const mockBookings = [
        { id: 'BK-8891', userEmail: 'user@luxebook.com', service: 'Sculpting Facial', date: '2026-06-15', time: '14:00', therapist: 'Dr. Sarah Sterling', status: 'Approved', price: 240 },
        { id: 'BK-4530', userEmail: 'user@luxebook.com', service: 'Deep Tissue Spa', date: '2026-05-20', time: '10:30', therapist: 'Master Therapist Julian', status: 'Completed', price: 180 },
        { id: 'BK-1234', userEmail: 'marcus@sterling.co', service: 'Signature Facial', date: '2026-06-08', time: '11:00', therapist: 'Elena Rostova', status: 'Pending', price: 195 },
        { id: 'BK-5678', userEmail: 'sophia@laurent.fr', service: 'Aesthetic Ritual', date: '2026-06-24', time: '16:00', therapist: 'Dr. Aris Thorne', status: 'Approved', price: 220 }
      ];
      setBookings(mockBookings);
      setStats({
        totalBookings: mockBookings.length + 1280,
        activeClients: 850,
        totalRevenue: 42500,
        salesDistribution: { facials: 19125, spa: 12750, aesthetics: 10625 },
        recentBookings: mockBookings
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Booking Status via API
  const updateBookingStatus = async (bookingId, newStatus) => {
    const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updatedBookings);

    const apiHeaders = { 'Content-Type': 'application/json' };
    if (user) {
      apiHeaders['x-user-email'] = user.email;
      apiHeaders['x-user-role'] = user.role;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (e) {
      // Local fallback updates
      const updatedStats = { ...stats };
      if (newStatus === 'Cancelled') {
        updatedStats.totalBookings = Math.max(0, stats.totalBookings - 1);
      }
      setStats(updatedStats);
      
      // Add notification
      const newNotif = {
        id: Date.now(),
        text: `Booking ${bookingId} status updated to ${newStatus.toUpperCase()}`,
        read: false,
        time: 'Just now'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email) return;
    const added = {
      ...newCustomer,
      bookings: 0,
      joined: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [added, ...prev]);
    setNewCustomer({ name: '', email: '', tier: 'PLATINUM MEMBER' });
    alert('Customer successfully registered.');
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    const added = {
      ...newService,
      price: parseFloat(newService.price),
      duration: newService.duration ? `${newService.duration} MIN` : '60 MIN'
    };
    setServicesList(prev => [...prev, added]);
    setNewService({ name: '', category: 'AESTHETICS', price: '', duration: '' });
    alert('Service successfully added to catalog.');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Calendar Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const changeMonth = (offset) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(nextDate);
  };

  // Filters application
  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter;
    const bookingDateFormatted = b.date; // YYYY-MM-DD
    const matchDate = !selectedDate || bookingDateFormatted === selectedDate;
    const matchQuery = !searchQuery || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.therapist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchDate && matchQuery;
  });

  return (
    <div className="min-h-screen w-full flex bg-transparent text-zinc-800 font-sans">
      
      {/* SIDEBAR NAVIGATION - Luxury Console theme */}
      <aside className="w-64 bg-[var(--card)]/85 backdrop-blur-md border-r border-[var(--border)] flex flex-col justify-between p-lg relative z-20 flex-shrink-0">
        <div className="space-y-xl">
          {/* Brand Logo & Console Header */}
          <div className="text-left border-b border-[var(--border)] pb-md">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--primary)]">
              Lumière Wellness
            </h2>
            <p className="font-label-caps text-[9px] text-[#a37f4c] tracking-[0.25em] uppercase font-bold mt-1">
              LUXURY ADMIN CONSOLE
            </p>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-xs">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'appointments', label: 'Appointments', icon: 'calendar_month' },
              { id: 'customers', label: 'Customers', icon: 'group' },
              { id: 'specialists', label: 'Specialists', icon: 'face' },
              { id: 'services', label: 'Services', icon: 'spa' },
              { id: 'analytics', label: 'Analytics', icon: 'analytics' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setNotificationOpen(false); }}
                className={`flex items-center gap-md py-3 px-lg rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer
                  ${activeTab === item.id
                    ? 'bg-[var(--secondary)] text-[var(--primary)] border-l-4 border-[#a37f4c]'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'text-[#a37f4c]' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="border-t border-[var(--border)] pt-md">
          {/* Settings */}
          <button
            onClick={() => { setActiveTab('settings'); setNotificationOpen(false); }}
            className={`w-full flex items-center gap-md py-3 px-lg rounded-xl text-sm font-semibold tracking-wide transition-all text-left mb-sm cursor-pointer
              ${activeTab === 'settings'
                ? 'bg-[var(--secondary)] text-[var(--primary)]'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </button>

          {/* Profile Card */}
          <div className="flex items-center gap-sm p-sm bg-[var(--secondary)]/40 rounded-xl">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-300">
              <img
                src="https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&q=80"
                alt="Manager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate flex-1">
              <h4 className="text-xs font-bold text-[var(--primary)] truncate">Jane Doe</h4>
              <p className="text-[10px] text-zinc-500 truncate">Manager</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-zinc-400 hover:text-red-600 transition-colors"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        
        {/* HEADER */}
        <header className="h-20 border-b border-[var(--border)] flex items-center justify-between px-lg relative z-10 flex-shrink-0 bg-white/80 backdrop-blur-md">
          {/* Title based on tab */}
          <div>
            <h1 className="font-serif text-[var(--primary)] text-xl font-semibold leading-tight">
              {activeTab === 'overview' && 'Lumière Salon Management'}
              {activeTab === 'appointments' && 'Appointment Scheduler'}
              {activeTab === 'customers' && 'Customer Base'}
              {activeTab === 'specialists' && 'Specialists & Practitioners'}
              {activeTab === 'services' && 'Services Catalog'}
              {activeTab === 'analytics' && 'Operational Analytics'}
              {activeTab === 'settings' && 'Console Configuration'}
            </h1>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-md">
            {/* Search */}
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings, customers..."
                className="bg-[var(--card)] border border-zinc-200 focus:border-[#a37f4c] focus:outline-none rounded-full pl-9 pr-4 py-1.5 text-xs w-60 text-zinc-800 transition-all placeholder-zinc-400"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors relative cursor-pointer"
                aria-label="Open notifications"
              >
                <span className="material-symbols-outlined text-[20px] text-zinc-600">
                  notifications
                </span>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 mt-sm w-80 bg-white border border-[var(--border)] rounded-2xl shadow-xl p-md z-40 animate-[scaleIn_0.2s_ease-out]">
                    <div className="flex justify-between items-center pb-sm border-b border-zinc-100 mb-sm">
                      <h4 className="text-xs font-bold text-[var(--primary)]">Notifications</h4>
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-bold text-[#a37f4c] hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    
                    <div className="space-y-sm max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-sm rounded-lg text-xs leading-normal flex gap-sm ${n.read ? 'bg-zinc-50 text-zinc-500' : 'bg-gold/5 border-l-2 border-gold text-zinc-800 font-medium'}`}>
                          <div className="flex-1">
                            <p>{n.text}</p>
                            <span className="text-[9px] text-zinc-400 block mt-xs">{n.time}</span>
                          </div>
                          {!n.read && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gold self-center" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Help Button */}
            <button className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-zinc-600">help</span>
            </button>

            {/* Profile settings link */}
            <button 
              onClick={() => setActiveTab('settings')}
              className="text-xs font-label-caps tracking-widest text-[#a37f4c] font-bold hover:underline"
            >
              Profile Settings
            </button>
          </div>
        </header>

        {/* VIEW PANELS */}
        <div className="flex-1 overflow-y-auto p-lg relative">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-lg page-transition text-left">
              
              {/* Executive Header Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                <div>
                  <h2 className="font-serif text-[var(--primary)] text-[26px] font-bold tracking-tight">Executive Overview</h2>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">Monitor daily operations and high-level metrics.</p>
                </div>
                
                <div className="flex items-center gap-sm">
                  <div className="flex items-center gap-xs px-md py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-600 shadow-sm font-medium">
                    <span className="material-symbols-outlined text-[16px] text-zinc-400">calendar_month</span>
                    <span>Oct 1 - Oct 31, 2023</span>
                  </div>
                  <button 
                    onClick={() => alert('Exporting PDF dashboard report...')}
                    className="bg-[#a37f4c] text-white hover:bg-opacity-95 text-xs font-label-caps tracking-wider px-md py-2.5 rounded-xl font-bold shadow-sm cursor-pointer"
                  >
                    Export Report
                  </button>
                </div>
              </div>

              {/* Statistics Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                
                {/* Total Bookings */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider font-bold">TOTAL BOOKINGS</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-zinc-500 border border-zinc-200">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      </div>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-[var(--primary)] mt-sm">
                      {stats.totalBookings.toLocaleString()}
                    </h3>
                  </div>
                  <p className="text-[11px] text-green-600 font-semibold flex items-center gap-xs mt-md">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    <span>+12% vs last month</span>
                  </p>
                </div>

                {/* Today's Appointments */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider font-bold">TODAY'S APPOINTMENTS</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-zinc-500 border border-zinc-200">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                      </div>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-[var(--primary)] mt-sm">24</h3>
                  </div>
                  <p className="text-[11px] text-[#a37f4c] font-semibold flex items-center gap-xs mt-md">
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    <span>+3 added today</span>
                  </p>
                </div>

                {/* Active Customers */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider font-bold">ACTIVE CUSTOMERS</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-zinc-500 border border-zinc-200">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                      </div>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-[var(--primary)] mt-sm">
                      {stats.activeClients}
                    </h3>
                  </div>
                  <p className="text-[11px] text-green-600 font-semibold flex items-center gap-xs mt-md">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    <span>+5% vs last month</span>
                  </p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider font-bold">MONTHLY REVENUE</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-zinc-500 border border-zinc-200">
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                      </div>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-[var(--primary)] mt-sm">
                      ${stats.totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                  <p className="text-[11px] text-green-600 font-semibold flex items-center gap-xs mt-md">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    <span>+5% vs last month</span>
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
                
                {/* Revenue trends SVG Chart */}
                <div className="lg:col-span-8 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                  <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-sm">Revenue Trends</h3>
                  <p className="text-xs text-zinc-400 mb-lg">Weekly performance indicator comparing with target.</p>
                  
                  {/* SVG Spline Chart */}
                  <div className="w-full h-64 relative flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="var(--secondary)" strokeWidth="1" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="var(--secondary)" strokeWidth="1" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="var(--secondary)" strokeWidth="1" />
                      
                      {/* Dotted Target Line */}
                      <path 
                        d="M0 150 Q125 180 250 110 T500 90" 
                        fill="none" 
                        stroke="#9FA6AD" 
                        strokeWidth="2" 
                        strokeDasharray="4"
                      />

                      {/* Solid Golden Revenue Line */}
                      <path 
                        d="M0 160 Q125 130 250 95 T500 40" 
                        fill="none" 
                        stroke="#a37f4c" 
                        strokeWidth="3.5"
                        style={{
                          animation: 'borderDraw 2s ease forwards'
                        }}
                      />

                      {/* Area Fill Gradient under Revenue */}
                      <path
                        d="M0 160 Q125 130 250 95 T500 40 L500 200 L0 200 Z"
                        fill="url(#goldGradient)"
                        opacity="0.08"
                      />

                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#a37f4c" />
                          <stop offset="100%" stopColor="var(--card)" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-[var(--card)] border border-gold/30 rounded-full px-md py-1 text-[10px] font-label-caps text-[#a37f4c] font-bold shadow">
                        Chart Visualization Component
                      </span>
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex justify-center gap-lg mt-md text-[11px] font-sans">
                    <div className="flex items-center gap-xs">
                      <span className="w-3 h-1 bg-[#a37f4c] rounded-full"></span>
                      <span className="text-zinc-600 font-medium">Actual Sales</span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="w-3 h-1 border-t-2 border-dashed border-[#9FA6AD]"></span>
                      <span className="text-zinc-400">Target Estimate</span>
                    </div>
                  </div>
                </div>

                {/* Popular Services Progress Indicators */}
                <div className="lg:col-span-4 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-sm">Popular Services</h3>
                    <p className="text-xs text-zinc-400 mb-lg">Treatment booking distributions.</p>
                  </div>

                  <div className="space-y-md">
                    {[
                      { name: 'Signature Hair Styling', pct: 45, color: 'bg-[var(--primary)]' },
                      { name: 'VIP Skin Treatment', pct: 30, color: 'bg-[#a37f4c]' },
                      { name: 'Luxury Manicure', pct: 15, color: 'bg-[#c8af88]' },
                      { name: 'Deep Tissue Massage', pct: 10, color: 'bg-zinc-300' }
                    ].map(item => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-700">{item.name}</span>
                          <span className="text-zinc-950 font-bold">{item.pct}%</span>
                        </div>
                        <div className="w-full bg-[var(--secondary)] h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-sm"></div>
                </div>
              </div>

              {/* Recent Appointments table */}
              <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                <div className="flex justify-between items-center mb-md">
                  <h3 className="font-serif text-[var(--primary)] text-lg font-semibold">Recent Appointments</h3>
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-label-caps tracking-widest text-[#a37f4c] font-bold flex items-center gap-xs hover:underline cursor-pointer"
                  >
                    <span>View All</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                        <th className="pb-sm font-bold">CUSTOMER</th>
                        <th className="pb-sm font-bold">SERVICE</th>
                        <th className="pb-sm font-bold">SPECIALIST</th>
                        <th className="pb-sm font-bold">DATE & TIME</th>
                        <th className="pb-sm font-bold">STATUS</th>
                        <th className="pb-sm font-bold text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.slice(0, 4).map((b, i) => (
                        <tr key={b.id || i} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50/50 transition-colors">
                          <td className="py-md font-bold text-[var(--primary)]">
                            {b.userEmail === 'user@luxebook.com' ? 'Eleanor Vance' : b.userEmail.split('@')[0]}
                            <span className="block text-[10px] text-zinc-400 font-normal">{b.userEmail}</span>
                          </td>
                          <td className="py-md font-medium text-zinc-700">{b.service}</td>
                          <td className="py-md text-zinc-600">{b.therapist}</td>
                          <td className="py-md text-zinc-600">{b.date} at {b.time}</td>
                          <td className="py-md">
                            <span className={`inline-block font-label-caps text-[9px] font-bold px-sm py-1 rounded-full border
                              ${b.status === 'Approved' || b.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                              ${b.status === 'Pending' || b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : ''}
                              ${b.status === 'Completed' || b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                              ${b.status === 'Cancelled' || b.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                            `}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-md text-right">
                            <div className="flex justify-end gap-sm">
                              {(b.status === 'Pending' || b.status === 'PENDING') && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'Approved')}
                                  className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center border border-green-200/50 transition-colors cursor-pointer"
                                  title="Approve Booking"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                </button>
                              )}
                              {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                                <>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'Completed')}
                                    className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200/50 transition-colors cursor-pointer"
                                    title="Mark Completed"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                                    className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center border border-red-200/50 transition-colors cursor-pointer"
                                    title="Cancel Booking"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APPOINTMENTS SCHEDULER & CALENDAR */}
          {activeTab === 'appointments' && (
            <div className="space-y-lg page-transition text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                <div>
                  <h2 className="font-serif text-[var(--primary)] text-[26px] font-bold tracking-tight">Appointments Booking Manager</h2>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">Filter, search, and approve appointments.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-sm items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-sm py-2 text-xs focus:outline-none focus:border-gold"
                  />

                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate('')}
                      className="text-xs text-[#a37f4c] font-bold hover:underline"
                    >
                      Clear Date
                    </button>
                  )}
                </div>
              </div>

              {/* Split Calendar & Table list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
                
                {/* Calendar grid widget */}
                <div className="lg:col-span-4 bg-white border border-[var(--border)] rounded-2xl p-md shadow-sm">
                  <div className="flex justify-between items-center mb-md pb-xs border-b border-zinc-100">
                    <h3 className="font-serif text-[var(--primary)] font-semibold text-sm">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-xs">
                      <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      </button>
                      <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-xs text-zinc-400">
                    <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty starting cells */}
                    {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                      const dayNumber = i + 1;
                      const dayDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                      const hasAppointments = bookings.some(b => b.date === dayDateString);
                      const isSelected = selectedDate === dayDateString;
                      
                      return (
                        <button
                          key={dayNumber}
                          onClick={() => setSelectedDate(isSelected ? '' : dayDateString)}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center relative hover:bg-gold/15 transition-all text-xs font-semibold cursor-pointer
                            ${isSelected ? 'bg-[var(--primary)] text-white' : 'text-zinc-700 bg-[var(--card)]/40'}
                          `}
                        >
                          <span>{dayNumber}</span>
                          {hasAppointments && (
                            <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-gold'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <p className="text-[10px] text-zinc-400 font-sans mt-md text-center leading-normal">
                    Golden dots indicate scheduled wellness rituals. Click a day to view bookings.
                  </p>
                </div>

                {/* Table appointments list */}
                <div className="lg:col-span-8 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                  <div className="flex justify-between items-center mb-md">
                    <h3 className="font-serif text-[var(--primary)] font-semibold">
                      Bookings Catalog ({filteredBookings.length})
                    </h3>
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-xl text-zinc-400 font-sans text-xs">
                      <span className="material-symbols-outlined text-4xl block mb-sm text-zinc-300">event_busy</span>
                      No appointments found matching current filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                            <th className="pb-sm font-bold">BOOKING ID</th>
                            <th className="pb-sm font-bold">CLIENT</th>
                            <th className="pb-sm font-bold">TREATMENT & SPECIALIST</th>
                            <th className="pb-sm font-bold">SCHEDULE</th>
                            <th className="pb-sm font-bold">STATUS</th>
                            <th className="pb-sm font-bold text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((b) => (
                            <tr key={b.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                              <td className="py-md font-bold text-[var(--primary)]">{b.id}</td>
                              <td className="py-md text-zinc-700">
                                {b.userEmail}
                              </td>
                              <td className="py-md">
                                <span className="font-semibold text-zinc-800 block">{b.service}</span>
                                <span className="text-[10px] text-zinc-400">{b.therapist}</span>
                              </td>
                              <td className="py-md text-zinc-600">{b.date} at {b.time}</td>
                              <td className="py-md">
                                <span className={`inline-block font-label-caps text-[9px] font-bold px-sm py-1 rounded-full border
                                  ${b.status === 'Approved' || b.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                  ${b.status === 'Pending' || b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                  ${b.status === 'Completed' || b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                  ${b.status === 'Cancelled' || b.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                `}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-md text-right">
                                <div className="flex justify-end gap-xs">
                                  {(b.status === 'Pending' || b.status === 'PENDING') && (
                                    <button
                                      onClick={() => updateBookingStatus(b.id, 'Approved')}
                                      className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center border border-green-200/50 transition-colors cursor-pointer"
                                      title="Approve Booking"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check</span>
                                    </button>
                                  )}
                                  {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                                    <>
                                      <button
                                        onClick={() => updateBookingStatus(b.id, 'Completed')}
                                        className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200/50 transition-colors cursor-pointer"
                                        title="Complete Appointment"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">done_all</span>
                                      </button>
                                      <button
                                        onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                                        className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center border border-red-200/50 transition-colors cursor-pointer"
                                        title="Cancel Appointment"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMERS SECTION */}
          {activeTab === 'customers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start page-transition text-left">
              
              {/* Customer registry table */}
              <div className="lg:col-span-8 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-lg">Customer Directory</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                        <th className="pb-sm font-bold">CLIENT NAME</th>
                        <th className="pb-sm font-bold">EMAIL ADDRESS</th>
                        <th className="pb-sm font-bold">MEMBERSHIP</th>
                        <th className="pb-sm font-bold">RITUALS BOOKED</th>
                        <th className="pb-sm font-bold">JOINED DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <tr key={i} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50/50 transition-colors">
                          <td className="py-md font-bold text-[var(--primary)]">{c.name}</td>
                          <td className="py-md text-zinc-600">{c.email}</td>
                          <td className="py-md">
                            <span className="font-label-caps text-[9px] font-bold bg-[var(--primary)]/10 text-primary px-sm py-0.5 rounded-full border border-primary/20">
                              {c.tier}
                            </span>
                          </td>
                          <td className="py-md font-bold text-center pl-lg">{c.bookings}</td>
                          <td className="py-md text-zinc-500">{c.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Mock Customer Form */}
              <div className="lg:col-span-4 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-sm">Register Client</h3>
                <p className="text-xs text-zinc-400 mb-lg">Create a guest member dossier.</p>

                <form onSubmit={handleCreateCustomer} className="space-y-md">
                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">CLIENT NAME</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Alexander Hamilton"
                      className="w-full bg-[var(--card)] border border-zinc-200 focus:border-gold rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="alexander@hamilton.com"
                      className="w-full bg-[var(--card)] border border-zinc-200 focus:border-gold rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">MEMBERSHIP TIER</label>
                    <select
                      value={newCustomer.tier}
                      onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value })}
                      className="w-full bg-[var(--card)] border border-zinc-200 rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800 cursor-pointer"
                    >
                      <option>MEMBER</option>
                      <option>PLATINUM MEMBER</option>
                      <option>DIAMOND TIER</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl font-label-caps text-xs tracking-wider font-bold hover:bg-opacity-95 transition-all shadow-sm cursor-pointer mt-md"
                  >
                    Add dossier
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 4: SPECIALISTS */}
          {activeTab === 'specialists' && (
            <div className="space-y-md page-transition text-left">
              <div>
                <h2 className="font-serif text-[var(--primary)] text-[26px] font-bold tracking-tight">Specialists Roster</h2>
                <p className="text-xs text-zinc-500 font-sans mt-0.5">Manage practitioner shifts and scheduling status.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                {specialists.map((s, i) => (
                  <div key={i} className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-gold/25 mb-md">
                      <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-serif text-[var(--primary)] font-bold text-sm">{s.name}</h4>
                    <p className="text-xs text-zinc-400 font-sans mt-xs">{s.title}</p>
                    
                    <div className="flex items-center gap-xs mt-sm text-xs font-semibold text-gold">
                      <span className="material-symbols-outlined text-gold text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{s.rating}</span>
                    </div>

                    <div className="mt-md pt-sm border-t border-zinc-100 w-full flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Status:</span>
                      <span className={`font-semibold font-label-caps text-[9px] px-sm py-1 rounded-full border
                        ${s.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${s.status === 'In Session' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${s.status === 'Off Duty' ? 'bg-zinc-50 text-zinc-500 border-zinc-200' : ''}
                      `}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES CATALOG */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start page-transition text-left">
              
              {/* Catalog list */}
              <div className="lg:col-span-8 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-lg">Active Services Catalog</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] font-label-caps text-[10px] text-zinc-400">
                        <th className="pb-sm font-bold">RITUAL NAME</th>
                        <th className="pb-sm font-bold">CATEGORY</th>
                        <th className="pb-sm font-bold">DURATION</th>
                        <th className="pb-sm font-bold">RATE FEE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicesList.map((s, i) => (
                        <tr key={i} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50/50 transition-colors">
                          <td className="py-md font-bold text-[var(--primary)]">{s.name}</td>
                          <td className="py-md text-zinc-500">{s.category}</td>
                          <td className="py-md text-zinc-600">{s.duration}</td>
                          <td className="py-md font-bold text-[#a37f4c]">${s.price}.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add New Service Form */}
              <div className="lg:col-span-4 bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                <h3 className="font-serif text-[var(--primary)] text-lg font-semibold mb-sm">Add New Ritual</h3>
                <p className="text-xs text-zinc-400 mb-lg">Expand the Lumière wellness catalog.</p>

                <form onSubmit={handleCreateService} className="space-y-md">
                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">RITUAL NAME</label>
                    <input
                      type="text"
                      required
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="Royal Ayurvedic Massage"
                      className="w-full bg-[var(--card)] border border-zinc-200 focus:border-gold rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">SERVICE CATEGORY</label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      className="w-full bg-[var(--card)] border border-zinc-200 rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800 cursor-pointer"
                    >
                      <option value="FACIAL THERAPY">FACIAL THERAPY</option>
                      <option value="BODY & SPA">BODY & SPA</option>
                      <option value="AESTHETICS">AESTHETICS</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-sm">
                    <div className="space-y-1">
                      <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">RATE FEE ($)</label>
                      <input
                        type="number"
                        required
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        placeholder="280"
                        className="w-full bg-[var(--card)] border border-zinc-200 focus:border-gold rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-caps text-[9px] text-zinc-400 block font-bold">DURATION (MIN)</label>
                      <input
                        type="number"
                        required
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                        placeholder="90"
                        className="w-full bg-[var(--card)] border border-zinc-200 focus:border-gold rounded-xl px-sm py-2 text-xs focus:outline-none text-zinc-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl font-label-caps text-xs tracking-wider font-bold hover:bg-opacity-95 transition-all shadow-sm cursor-pointer mt-md"
                  >
                    Add Service
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 6: DETAILED ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-lg page-transition text-left">
              <div>
                <h2 className="font-serif text-[var(--primary)] text-[26px] font-bold tracking-tight">Business Intelligence Analytics</h2>
                <p className="text-xs text-zinc-500 font-sans mt-0.5">Explore detailed distribution charts and monthly comparisons.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {/* Sales distribution split */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                  <h3 className="font-serif text-[var(--primary)] text-sm font-bold mb-md">Sales Distribution Split</h3>
                  
                  <div className="space-y-md py-sm">
                    {[
                      { category: 'Facials & Skincare', amount: stats.salesDistribution.facials, fill: 'w-[45%]', color: 'bg-[var(--primary)]' },
                      { category: 'Thermal Spa Sessions', amount: stats.salesDistribution.spa, fill: 'w-[35%]', color: 'bg-[#a37f4c]' },
                      { category: 'Aesthetics Clinics', amount: stats.salesDistribution.aesthetics, fill: 'w-[20%]', color: 'bg-zinc-300' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-sans text-xs">
                          <span className="font-semibold text-zinc-700">{item.category}</span>
                          <span className="font-bold text-[var(--primary)]">${item.amount.toLocaleString()}.00</span>
                        </div>
                        <div className="w-full bg-[var(--card)] h-3 rounded-full overflow-hidden border border-zinc-100">
                          <div className={`h-full ${item.color} ${item.fill}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Busy Days indicator graph */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm">
                  <h3 className="font-serif text-[var(--primary)] text-sm font-bold mb-md">Weekly Bookings Load</h3>
                  
                  {/* SVG Bar Chart representing week load */}
                  <div className="w-full h-40 flex items-end justify-between px-md pt-lg relative">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 160">
                      <line x1="0" y1="40" x2="400" y2="40" stroke="var(--secondary)" strokeWidth="1" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="var(--secondary)" strokeWidth="1" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="var(--secondary)" strokeWidth="1" />
                    </svg>

                    {[
                      { day: 'Mon', count: 12 },
                      { day: 'Tue', count: 18 },
                      { day: 'Wed', count: 22 },
                      { day: 'Thu', count: 35 },
                      { day: 'Fri', count: 48 },
                      { day: 'Sat', count: 52 },
                      { day: 'Sun', count: 30 }
                    ].map((item, idx) => {
                      const pct = Math.max(10, (item.count / 60) * 100);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-sm relative z-10 w-8">
                          <div className="w-3 bg-[#a37f4c] rounded-t-full transition-all duration-1000" style={{ height: `${pct * 1.2}px` }}></div>
                          <span className="text-[10px] font-semibold text-zinc-500 font-sans">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-[10px] text-zinc-400 font-sans text-center mt-md leading-normal">
                    Peak booking days lie on Friday and Saturday. AI concierge suggests early-week promotions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS SECTION */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[var(--border)] rounded-2xl p-lg shadow-sm max-w-xl mx-auto page-transition text-left space-y-md">
              <h3 className="font-serif text-[var(--primary)] text-lg font-semibold border-b border-zinc-100 pb-sm">Console Preferences</h3>
              
              <div className="space-y-md font-sans text-xs">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h4 className="font-bold text-zinc-700">Automatic Booking Approval</h4>
                    <p className="text-[11px] text-zinc-400 mt-xs">Approve new bookings instantly without reviewing.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)] cursor-pointer" />
                </div>

                <div className="flex justify-between items-center py-2 border-t border-zinc-100">
                  <div>
                    <h4 className="font-bold text-zinc-700">Notification Sound Alert</h4>
                    <p className="text-[11px] text-zinc-400 mt-xs">Play sound for new incoming sanctuary bookings.</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-[var(--primary)] cursor-pointer" />
                </div>

                <div className="flex justify-between items-center py-2 border-t border-zinc-100">
                  <div>
                    <h4 className="font-bold text-zinc-700">Lumière System Status</h4>
                    <p className="text-[11px] text-zinc-400 mt-xs">Check current database and server status.</p>
                  </div>
                  <span className="font-label-caps text-[9px] font-bold px-sm py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                    OPERATIONAL
                  </span>
                </div>

                <div className="pt-md border-t border-zinc-100">
                  <button 
                    onClick={() => alert('Preferences successfully updated.')}
                    className="bg-[var(--primary)] text-white hover:bg-opacity-95 text-xs font-label-caps tracking-widest px-lg py-2.5 rounded-xl font-bold transition-all w-full text-center cursor-pointer"
                  >
                    Save settings
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
