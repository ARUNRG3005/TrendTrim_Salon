import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function Cinematic() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 py-xl px-lg max-w-container-max mx-auto w-full">
        <div className="text-center mb-xl">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.3em]">THE LUXEBOOK ARCHIVE</span>
          <h1 className="font-display-lg text-display-lg text-primary mt-xs mb-md">Cinematic Evolution</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            A design odyssey exploring the boundary between human ritual and absolute luxury. Here is the chronicle of our wellness heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center mb-xl">
          <div className="space-y-md">
            <span className="font-label-caps text-label-caps text-primary dark:text-gold">CHAPTER I</span>
            <h3 className="font-headline-lg text-headline-lg text-primary">The Quiet Sanctuary</h3>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              LuxeBook began as a private calendar network matching members with elite specialists. Our philosophy is rooted in the quiet richness of absolute silence, providing individuals with breathing space in a hyper-connected world.
            </p>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" 
              alt="Silent massage environment" 
              className="w-full h-[350px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
          <div className="order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80" 
              alt="Luxury resort hot tub" 
              className="w-full h-[350px] object-cover rounded-2xl shadow-xl"
            />
          </div>
          <div className="space-y-md order-1 md:order-2">
            <span className="font-label-caps text-label-caps text-primary dark:text-gold">CHAPTER II</span>
            <h3 className="font-headline-lg text-headline-lg text-primary">Digital Concierge Protocols</h3>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              With the deployment of Elowen, our custom-built adaptive AI system, we entered a new horizon of wellness management—fusing human precision with smart, real-time stress and skin-health analytics.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
