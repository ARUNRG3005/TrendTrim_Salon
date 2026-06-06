import React from 'react';
import Navigation from '../components/Navigation1';
import Footer from '../components/Footer1';

export default function Shader() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md overflow-x-hidden pt-20">
      <Navigation />

      <main className="flex-1 flex flex-col items-center justify-center py-xl px-lg max-w-container-max mx-auto w-full">
        <div className="text-center mb-xl">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.3em]">VISUAL SYSTEM</span>
          <h1 className="font-display-lg text-display-lg text-primary mt-xs mb-md">Aesthetic Shaders</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Deep color fields representing quiet luxury. The dynamic background simulation reflects warmth, sanctuary, and prestige.
          </p>
        </div>

        {/* Dynamic color canvas card */}
        <div className="w-full max-w-4xl h-[450px] relative rounded-3xl overflow-hidden shadow-2xl border border-gold/20 bg-primary flex items-center justify-center text-center">
          <div className="absolute inset-0 shimmer-effect opacity-50 pointer-events-none"></div>
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-gold/15 rounded-full blur-[90px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary/15 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

          <div className="relative z-10 p-lg space-y-md">
            <span className="material-symbols-outlined text-[80px] text-gold gold-glow">blur_on</span>
            <h3 className="font-headline-lg text-headline-lg text-white">Visualizer Active</h3>
            <p className="font-label-caps text-[10px] text-tertiary-fixed-dim tracking-widest">
              RGB: ROYAL BLUE (var(--primary)) & LUXURY GOLD (#D4AF37)
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
