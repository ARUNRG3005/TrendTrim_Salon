import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import useScrollReveal from '../hooks/useScrollReveal';
import { CardStack } from '../components/ui/card-stack';

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateBookingForm } = useBooking();
  const { triggerAuthRequired } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');

  const [cardWidth, setCardWidth] = useState(520);
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCardWidth(w - 48);
      } else if (w < 1024) {
        setCardWidth(460);
      } else {
        setCardWidth(520);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parse search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';

  useScrollReveal([activeCategory, searchQuery]);

  const services = [
    // --- HAIR ---
    {
      name: 'Signature Haircut & Style',
      category: 'Hair',
      price: '$95',
      duration: '60 MIN',
      description: 'Precision cutting and personalized styling by our expert hair stylists. Includes consultation, shampoo, and professional blowdry finish.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      icon: 'content_cut',
      badge: 'Most Popular',
    },
    {
      name: 'Luxury Blowout',
      category: 'Hair',
      price: '$65',
      duration: '45 MIN',
      description: 'Volumizing blowdry and heat styling for effortless, salon-perfect waves, curls, or sleek straight looks that last for days.',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
      icon: 'air',
    },
    {
      name: 'Deep Conditioning Keratin Therapy',
      category: 'Hair',
      price: '$120',
      duration: '75 MIN',
      description: 'Deeply nourishing keratin protein infusion to repair structural damage, eliminate frizz, and restore radiant elasticity.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'spa',
    },
    {
      name: 'Silk Press & Scalp Care',
      category: 'Hair',
      price: '$110',
      duration: '90 MIN',
      description: 'Ultra-smoothing heat straightening process for natural hair textures, prioritizing thermal defense and deep follicle hydration.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
      icon: 'dry',
    },
    {
      name: 'Custom Extension Fitting',
      category: 'Hair',
      price: '$300',
      duration: '150 MIN',
      description: 'Premium human hair weft integration, matched perfectly to your natural color and texture for thickness and length.',
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=600&q=80',
      icon: 'extension',
    },
    {
      name: 'Olaplex Restructuring Ritual',
      category: 'Hair',
      price: '$85',
      duration: '45 MIN',
      description: 'Patented active bond-rebuilding chemistry that heals hair from chemical, thermal, and mechanical stress.',
      image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=600&q=80',
      icon: 'medical_services',
    },
    {
      name: 'Scalp Detox & High-Frequency Massage',
      category: 'Hair',
      price: '$90',
      duration: '60 MIN',
      description: 'Charcoal exfoliation, customized clarifying mask, and high-frequency wave massage to stimulate hair growth follicles.',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
      icon: 'wash',
    },
    {
      name: 'Editorial Event Hair Updo',
      category: 'Hair',
      price: '$135',
      duration: '75 MIN',
      description: 'Sophisticated event hairstyling, from minimalist sleek buns to complex braided updos suited for galas.',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
      icon: 'event',
    },
    {
      name: 'Brazilian Blowout Treatment',
      category: 'Hair',
      price: '$280',
      duration: '120 MIN',
      description: 'Liquid keratin formula that forms a protective protein layer around each strand, locking out frizz for 12+ weeks.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
      icon: 'bolt',
    },
    {
      name: 'Premium Hair Botox Styling',
      category: 'Hair',
      price: '$190',
      duration: '90 MIN',
      description: 'Deep-acting thermal moisturizer using caviar oil, B5, and E vitamins to revitalize aging or damaged fibers.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'health_and_safety',
    },

    // --- COLOR ---
    {
      name: 'Premium Color & Highlights',
      category: 'Color',
      price: '$180',
      duration: '90 MIN',
      description: 'Full spectrum color services including balayage, ombré, and highlights using premium ammonia-free formulas for vibrant, lasting results.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'palette',
      badge: 'Best Seller',
    },
    {
      name: 'Signature French Balayage',
      category: 'Color',
      price: '$240',
      duration: '150 MIN',
      description: 'Hand-painted dimensional highlights that grow out seamlessly, customized for soft and luminous transitions.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
      icon: 'brush',
    },
    {
      name: 'Platinum Double Process Blonde',
      category: 'Color',
      price: '$290',
      duration: '180 MIN',
      description: 'All-over lightening process followed by custom high-gloss toners for the perfect ice, pearl, or champagne blonde.',
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=600&q=80',
      icon: 'color_lens',
    },
    {
      name: 'Full Head Foil Highlights',
      category: 'Color',
      price: '$195',
      duration: '120 MIN',
      description: 'Micro-woven foil patterns throughout the entire head, giving maximum brightness, dimension, and coverage.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      icon: 'grid_view',
    },
    {
      name: 'Root Touch-Up & Shine Glaze',
      category: 'Color',
      price: '$115',
      duration: '60 MIN',
      description: 'Grey coverage regrowth refresh paired with a high-shine clear glaze to seal the cuticle and add natural shine.',
      image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=600&q=80',
      icon: 'opacity',
    },
    {
      name: 'Creative Fashion Color',
      category: 'Color',
      price: '$220',
      duration: '150 MIN',
      description: 'Vibrant direct dyes in custom pastels, vivid neons, or jewel tones. Includes pre-lightening process.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'auto_awesome',
    },
    {
      name: 'Color Correction Consultation',
      category: 'Color',
      price: '$320',
      duration: '180 MIN',
      description: 'Advanced color repair styling to eliminate unwanted bands, patchiness, or mineral deposits. Scalp protecting mask included.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      icon: 'build',
    },
    {
      name: 'Ombre Hair Graduation',
      category: 'Color',
      price: '$210',
      duration: '120 MIN',
      description: 'Gradient color transitions blending a darker shadow root to lighter mid-lengths and tips.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
      icon: 'gradient',
    },
    {
      name: 'Pastel Hair Tone Glazing',
      category: 'Color',
      price: '$95',
      duration: '45 MIN',
      description: 'Translucent acid-balanced color tone glazing to neutralize brassy copper hues or add soft peach/lavender sheen.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'invert_colors',
    },
    {
      name: 'Sun-Kissed Babylights',
      category: 'Color',
      price: '$165',
      duration: '90 MIN',
      description: 'Delicate, baby-fine highlights framed around the hairline to replicate natural sun light-lightening.',
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=600&q=80',
      icon: 'wb_sunny',
    },

    // --- BEAUTY ---
    {
      name: 'Bridal Makeup Package',
      category: 'Beauty',
      price: '$250',
      duration: '120 MIN',
      description: 'Full glam bridal makeup with airbrush finish, lash application, and touchup kit. Includes pre-wedding trial session.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
      icon: 'face_retouching_natural',
      badge: 'Premium',
    },
    {
      name: 'Editorial Photographic Glamour',
      category: 'Beauty',
      price: '$140',
      duration: '75 MIN',
      description: 'High-contrast contouring, dramatic eyes, and studio-grade textures configured for photography and event lighting.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'photo_camera',
    },
    {
      name: 'Airbrush High-Definition Makeup',
      category: 'Beauty',
      price: '$125',
      duration: '60 MIN',
      description: 'Mist-applied silicone-based foundation for a flawless, lightweight matte finish that stays smudge-proof for 18 hours.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
      icon: 'blur_on',
    },
    {
      name: 'Classic Lash Extension Full Set',
      category: 'Beauty',
      price: '$180',
      duration: '90 MIN',
      description: 'Premium silk lash extensions applied 1:1 to your natural lashes for an elegant, defined, and lengthened gaze.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=600&q=80',
      icon: 'visibility',
    },
    {
      name: 'Brow Lamination & Henna Shaping',
      category: 'Beauty',
      price: '$95',
      duration: '60 MIN',
      description: 'Chemical restructuring to set brow hairs in a full shape, finished with plant-based henna dye shading.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'brush',
    },
    {
      name: 'Organic Hydration Facial Treatment',
      category: 'Beauty',
      price: '$110',
      duration: '60 MIN',
      description: 'Clean botanicals, volcanic clay scrubs, and aloe hyaluronic acid masks for deep dermal hydration.',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430f23?auto=format&fit=crop&w=600&q=80',
      icon: 'spa',
    },
    {
      name: 'Anti-Aging Collagen Therapy',
      category: 'Beauty',
      price: '$145',
      duration: '75 MIN',
      description: 'Active collagen serum infusion coupled with micro-current muscle toning to lift, tighten, and smooth lines.',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80',
      icon: 'health_and_safety',
    },
    {
      name: 'Custom Spray Tanning Sessions',
      category: 'Beauty',
      price: '$60',
      duration: '30 MIN',
      description: 'Rapid-developing DHA spray tan, airbrushed evenly for a streak-free, golden sun-kissed bronze.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
      icon: 'wb_sunny',
    },
    {
      name: 'Luxury Eye Contour Lifting',
      category: 'Beauty',
      price: '$80',
      duration: '45 MIN',
      description: 'Targeted cooling masks, peptides, and lymph drainage massage to depuff dark circles and tighten lids.',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430f23?auto=format&fit=crop&w=600&q=80',
      icon: 'remove_red_eye',
    },
    {
      name: 'Express Glow Makeup Application',
      category: 'Beauty',
      price: '$75',
      duration: '45 MIN',
      description: 'Quick skin preparation, soft dewy foundation, subtle cheek highlights, and gloss for an immediate radiant look.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      icon: 'flash_on',
    },

    // --- NAILS ---
    {
      name: 'Classic Manicure & Pedicure',
      category: 'Nails',
      price: '$85',
      duration: '75 MIN',
      description: 'Premium nail care featuring cuticle treatment, shaping, exfoliation, moisturizing massage, and flawless polish application.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      icon: 'spa',
      badge: 'Bestseller',
    },
    {
      name: 'Gel Bottle Extensions Set',
      category: 'Nails',
      price: '$120',
      duration: '90 MIN',
      description: 'Full extension sculpting using high-grade, soak-off building gel to add light and resilient length.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      icon: 'construction',
    },
    {
      name: 'Signature Champagne Pedicure',
      category: 'Nails',
      price: '$95',
      duration: '60 MIN',
      description: 'Champagne and rose extract foot soak, sugar scrubs, oil massages, and hot stone therapy.',
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
      icon: 'wine_bar',
    },
    {
      name: 'Luxury Paraffin Wax Mani-Pedi',
      category: 'Nails',
      price: '$110',
      duration: '90 MIN',
      description: 'Warm, nutrient-rich paraffin wax dipping for hands and feet to soften rough skin and soothe muscle tension.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      icon: 'waves',
    },
    {
      name: 'Gel Polish Change & Shaping',
      category: 'Nails',
      price: '$55',
      duration: '45 MIN',
      description: 'Gently buffing off old gel coatings, cleaning up nail shape, and applying fresh layers of UV LED gel.',
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
      icon: 'clean_hands',
    },
    {
      name: 'Custom Accent Nail Artistry',
      category: 'Nails',
      price: '$75',
      duration: '60 MIN',
      description: 'Detailed hand-painted designs, gold leafing, marble patterns, or swarovski crystal embeds on focus nails.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      icon: 'brush',
    },
    {
      name: 'Organic Spa Citrus Hand Treatment',
      category: 'Nails',
      price: '$65',
      duration: '45 MIN',
      description: 'Lemon and grapefruit vitamin-C hand peels, organic sugar exfoliation, and intense shea butter masks.',
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
      icon: 'eco',
    },
    {
      name: 'IBX Strength Repair Therapy',
      category: 'Nails',
      price: '$45',
      duration: '30 MIN',
      description: 'Natural nail strengthening system that penetrates the upper layers of nail plates to repair splits and peeling.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      icon: 'healing',
    },
    {
      name: 'Detox Charcoal Foot Spa',
      category: 'Nails',
      price: '$80',
      duration: '60 MIN',
      description: 'Activated charcoal soak, mud masks to extract impurities, and refreshing mint oil leg massages.',
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
      icon: 'filter_alt',
    },
    {
      name: 'Luxury Matte Gel Manicure',
      category: 'Nails',
      price: '$70',
      duration: '45 MIN',
      description: 'Precision cuticle work, structural base gel, matte top-coat finishing, and organic jojoba oil massages.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      icon: 'back_hand',
    },

    // --- GROOMING ---
    {
      name: "Gentleman's Grooming",
      category: 'Grooming',
      price: '$70',
      duration: '45 MIN',
      description: 'Precision beard sculpting, hot towel treatment, and classic straight-razor shave with premium grooming products.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'face_6',
      badge: 'Classic',
    },
    {
      name: 'Executive Beard Sculpting',
      category: 'Grooming',
      price: '$50',
      duration: '30 MIN',
      description: 'Symmetric beard trimming, cheek line detailing, straight-razor clean ups, and organic beard oil treatment.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'content_cut',
    },
    {
      name: 'Hot Towel Facial Shave Ritual',
      category: 'Grooming',
      price: '$60',
      duration: '45 MIN',
      description: 'Pre-shave essential oils, double hot steam towels, rich lather soap, straight-razor shave, and soothing balm.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'hot_tub',
    },
    {
      name: "Premium Men's Charcoal Facial",
      category: 'Grooming',
      price: '$85',
      duration: '60 MIN',
      description: 'Deep clay clearing facial, blackhead extraction, cold stone massage, and botanical moisturizers for men.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'cleaning_services',
    },
    {
      name: "Classic Men's Haircut & Wash",
      category: 'Grooming',
      price: '$65',
      duration: '45 MIN',
      description: 'Precision clipper and scissors scissor cut, relaxing peppermint shampoo wash, and styling with matte clay.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'content_cut',
    },
    {
      name: 'Sport Pedicure for Men',
      category: 'Grooming',
      price: '$75',
      duration: '45 MIN',
      description: 'Nail clipping, rough skin sanding, epsom salt soak, and tension-relief lower leg massages.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'directions_run',
    },
    {
      name: 'Nose & Ear Premium Waxing',
      category: 'Grooming',
      price: '$35',
      duration: '20 MIN',
      description: 'Quick and gentle removal of unwanted nose and ear hair using specialized skin-soothing hard waxes.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'hearing_disabled',
    },
    {
      name: "Gentleman's Express Mani-Pedi",
      category: 'Grooming',
      price: '$90',
      duration: '60 MIN',
      description: 'Hand and foot nail cleanup, cuticle hydration, matte buff finish, and tension-relief oil massage.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'dry_cleaning',
    },
    {
      name: 'Scalp Stimulation Treatment',
      category: 'Grooming',
      price: '$55',
      duration: '30 MIN',
      description: 'Tea tree oil scalp massage, micro-needle stimulation, and premium density serums to encourage thicker hair growth.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'waves',
    },
    {
      name: 'Grey Blending Color Treatment',
      category: 'Grooming',
      price: '$80',
      duration: '45 MIN',
      description: 'Subtle semi-permanent coloring to blend grey hair naturally, fading out smoothly over 4 weeks.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      icon: 'color_lens',
    },
  ];

  const categories = ['All', ...new Set(services.map(s => s.category))];

  const filtered = services.filter(s => {
    const categoryMatch = activeCategory === 'All' || s.category.toLowerCase() === activeCategory.toLowerCase();
    if (!searchQuery) return categoryMatch;

    const searchLower = searchQuery.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(searchLower);
    const descMatch = s.description.toLowerCase().includes(searchLower);
    const catMatch = s.category.toLowerCase().includes(searchLower) ||
                     (searchLower === 'colour' && s.category.toLowerCase() === 'color') ||
                     (searchLower === 'nails' && s.category.toLowerCase() === 'nails') ||
                     (searchLower === 'nail' && s.category.toLowerCase() === 'nails');
    return categoryMatch && (nameMatch || descMatch || catMatch);
  });

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (searchQuery) {
      navigate('/services', { replace: true });
    }
  };

  const handleBook = (serviceName) => {
    triggerAuthRequired(() => {
      updateBookingForm('service', serviceName);
      navigate('/booking');
    }, 'Please login or create an account to continue booking.');
  };

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }} className="">

      {/* ─── Page Hero ─── */}
      <section style={{ paddingTop: '120px', paddingBottom: 'clamp(3.5rem, 7vw, 6rem)', paddingLeft: 'clamp(1.25rem, 5vw, 4rem)', paddingRight: 'clamp(1.25rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'rgba(201,169,110,0.04)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div className="page-transition" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <span className="eyebrow-refined">Curated Offerings</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.75rem, 7vw, 5rem)', letterSpacing: '-0.025em', lineHeight: 0.95, color: 'var(--color-text)', margin: '0 0 1.5rem' }}>
            Our Salon Services
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)', color: 'var(--color-text-dim)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.85 }}>
            Each service is crafted to enhance your natural beauty. From signature cuts to bridal transformations, excellence is our standard.
          </p>
        </div>
      </section>

      <main style={{ flex: 1, padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>

        {/* ─── Category Filter ─── */}
        <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '3.5rem', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
              style={{
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
                padding: '9px 22px', borderRadius: '99px',
                border: activeCategory === cat ? '1px solid var(--champagne)' : '1px solid var(--color-border-strong)',
                background: activeCategory === cat ? 'var(--champagne)' : 'transparent',
                color: activeCategory === cat ? 'var(--obsidian)' : 'var(--color-text-dim)',
                cursor: 'pointer',
                transition: 'all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fontWeight: activeCategory === cat ? 500 : 400,
              }}
            >{cat}</button>
          ))}
        </div>

        {/* ─── Service Cards Grid ─── */}
        {filtered.length === 0 ? (
          <div className="reveal" style={{ textAlign: 'center', padding: '5rem 1.5rem', border: '1px dashed var(--color-border)', borderRadius: '24px', background: 'var(--color-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--champagne)', marginBottom: '1.25rem' }}>search_off</span>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.625rem', color: 'var(--color-text)', margin: '0 0 0.5rem', fontWeight: 400 }}>No Offerings Found</h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', maxWidth: '400px', margin: '0 auto' }}>
              We couldn't find any services matching your selection. Try adjusting your search query or choosing another category.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'visible', margin: '0 auto' }} className="reveal">
            <CardStack
              items={filtered.map((svc, idx) => ({
                id: svc.name,
                title: svc.name,
                description: svc.description,
                imageSrc: svc.image,
                ...svc
              }))}
              key={activeCategory + searchQuery}
              cardWidth={cardWidth}
              cardHeight={450}
              autoAdvance={false}
              loop={true}
              showDots={true}
              renderCard={(item) => (
                <div
                  style={{
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: 'var(--color-bg)' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                      }}
                      draggable={false}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />

                    {/* Category badge */}
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: 'rgba(13,13,13,0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '99px',
                      padding: '4px 10px',
                      fontFamily: 'Tenor Sans, sans-serif',
                      fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: 'var(--champagne)',
                    }}>
                      {item.category}
                    </div>

                    {/* Featured badge */}
                    {item.badge && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'var(--champagne)',
                        borderRadius: '99px',
                        padding: '4px 10px',
                        fontFamily: 'Tenor Sans, sans-serif',
                        fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase',
                        color: '#0D0D0D', fontWeight: 500,
                      }}>
                        {item.badge}
                      </div>
                    )}

                    {/* Bottom icon + price */}
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(201,169,110,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--champagne)' }}>{item.icon}</span>
                      </div>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.5rem', color: '#F5F0E8', lineHeight: 1 }}>
                        {item.price}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: '1.2rem', color: 'var(--color-text)', margin: 0 }}>{item.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--champagne)' }}>schedule</span>
                          <span style={{ fontFamily: 'Tenor Sans, sans-serif', fontSize: '8px', letterSpacing: '0.16em', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>{item.duration}</span>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'var(--color-text-dim)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(item.name);
                      }}
                      className="shimmer-btn"
                      style={{
                        width: '100%', padding: '11px',
                        background: 'var(--color-text)', color: 'var(--color-bg)',
                        borderRadius: '10px',
                        fontFamily: 'Tenor Sans, sans-serif', fontSize: '9px',
                        letterSpacing: '0.22em', textTransform: 'uppercase',
                        border: 'none', cursor: 'pointer',
                        minHeight: '40px', fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--champagne)'; e.currentTarget.style.color = '#0D0D0D'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-text)'; e.currentTarget.style.color = 'var(--color-bg)'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_month</span>
                      Book Appointment
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* ─── Bottom CTA ─── */}
        <div className="reveal" style={{ marginTop: '5rem', textAlign: 'center', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)', borderRadius: '24px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '300px', background: 'rgba(201,169,110,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <span className="eyebrow-refined">Bespoke Experience</span>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(1.875rem, 4vw, 3rem)', letterSpacing: '-0.025em', color: 'var(--color-text)', margin: '0 0 1rem' }}>
              Can't Find What You're Looking For?
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: '0.9375rem', color: 'var(--color-text-dim)', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.75 }}>
              Our concierge team curates bespoke beauty experiences tailored precisely to your vision.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="shimmer-btn"
              style={{
                background: 'var(--champagne)', color: '#0D0D0D',
                padding: '14px 36px', borderRadius: '99px',
                fontFamily: 'Tenor Sans, sans-serif', fontSize: '10px',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', minHeight: '48px', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>chat</span>
              Request Bespoke Service
            </button>
          </div>
        </div>
      </main>

      <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
