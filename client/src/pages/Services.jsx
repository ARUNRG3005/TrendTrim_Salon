import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function Services() {
  const navigate = useNavigate();
  const { updateBookingForm } = useBooking();
  const { triggerAuthRequired } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState({});

  const services = [
    {
      name: 'Signature Facial',
      category: 'FACIAL THERAPY',
      price: '$195',
      duration: '60 MIN',
      description: 'Our classic deep cleansing treatment featuring organic flower extracts and essential peptide infusion for a natural, healthy glow.',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Sculpting Facial',
      category: 'FACIAL THERAPY',
      price: '$240',
      duration: '75 MIN',
      description: 'Revitalize and lift your facial muscles through our signature manual lymphatic drainage and non-invasive microcurrent lift.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Deep Tissue Spa',
      category: 'BODY & SPA',
      price: '$180',
      duration: '90 MIN',
      description: 'Release deep-seated muscle tension and reset your body using therapeutic massage strokes combined with bespoke warm organic oils.',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'The Sanctuary Spa',
      category: 'BODY & SPA',
      price: '$210',
      duration: '90 MIN',
      description: 'Immerse yourself in our mineral-rich thermal bath treatment followed by custom volcanic hot stone massage and aromatherapy.',
      image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Aesthetic Ritual',
      category: 'AESTHETICS',
      price: '$220',
      duration: '60 MIN',
      description: 'Premium anti-aging skincare session incorporating laser toning and cooling collagen masks for high-society skin glow.',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Precision Skin Care',
      category: 'AESTHETICS',
      price: '$250',
      duration: '60 MIN',
      description: 'Highly customized clinical dermal assessment followed by ultrasonic exfoliation and direct vitamin nourishment infusion.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const handleBook = (serviceName) => {
    triggerAuthRequired(() => {
      // Standardize to matching dropdown options
      let val = 'Signature Facial';
      if (serviceName.includes('Spa')) val = 'Deep Tissue Spa';
      if (serviceName.includes('Aesthetic') || serviceName.includes('Skin')) val = 'Aesthetic Ritual';

      updateBookingForm('service', val);
      navigate('/booking');
    }, "Please login or create an account to continue booking.");
  };

  const handleImageLoad = (index) => {
    setImagesLoaded((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-on-surface dark:text-zinc-100 font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 py-xl px-lg max-w-container-max mx-auto w-full page-transition">
        
        {/* Header */}
        <div className="text-center mb-xl">
          <span className="font-label-caps text-label-caps text-primary dark:text-gold tracking-[0.2em]">CURATED OFFERINGS</span>
          <h1 className="font-display-lg text-display-lg text-on-background dark:text-white mt-xs mb-md">Our Wellness Rituals</h1>
          <p className="font-body-lg text-on-surface-variant dark:text-zinc-400 max-w-2xl mx-auto">
            Each experience is designed to restore balance and cultivate a state of quiet luxury. Book individual services below or connect with our concierge.
          </p>
        </div>

        {/* Services Showcase (Mobile Scroll Carousel, Desktop Grid) */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-lg pb-md md:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gold/20">
          {services.map((svc, i) => (
            <div
              key={i}
              className="w-[85vw] sm:w-[50vw] md:w-auto flex-shrink-0 snap-center glass-card-light dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-gold/10 dark:border-zinc-800 flex flex-col group hover:shadow-2xl transition-all duration-300 custom-cursor-hover"
            >
              {/* Card Image with shimmer loading placeholder */}
              <div className="relative h-60 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                {!imagesLoaded[i] && (
                  <div className="absolute inset-0 skeleton-pulse" />
                )}
                <img 
                  src={svc.image} 
                  alt={svc.name} 
                  loading="lazy"
                  onLoad={() => handleImageLoad(i)}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                    imagesLoaded[i] ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="absolute top-md left-md bg-primary dark:bg-gold text-white dark:text-zinc-950 font-label-caps text-[10px] px-sm py-1 rounded-full">
                  {svc.category}
                </div>
              </div>
              
              <div className="p-lg flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-sm gap-sm">
                    <h3 className="font-headline-md text-headline-md text-primary dark:text-gold">{svc.name}</h3>
                    <span className="font-headline-md text-gold dark:text-amber-500 text-xl font-bold flex-shrink-0">{svc.price}</span>
                  </div>
                  <div className="flex items-center gap-xs font-label-caps text-[10px] text-on-surface-variant dark:text-zinc-400 mb-md">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>{svc.duration}</span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant dark:text-zinc-400 mb-lg leading-relaxed">{svc.description}</p>
                </div>
                
                <button 
                  onClick={() => handleBook(svc.name)}
                  className="w-full py-sm bg-primary dark:bg-gold text-white dark:text-zinc-950 font-label-caps text-label-caps rounded-xl hover:bg-primary-container dark:hover:bg-yellow-500 transition-all font-bold min-h-[44px] cursor-pointer"
                >
                  Schedule Treatment
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
