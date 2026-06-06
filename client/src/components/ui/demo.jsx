import React from 'react';
import { BorderRotate } from "./animated-gradient-border";

function Default() {
  return (
    <BorderRotate className="w-96 h-65">
    </BorderRotate>
  );
}

function FastAnimation() {
  return (
    <BorderRotate
      animationSpeed={0.8}
      gradientColors={{
        primary: '#7f1d1d',
        secondary: '#dc2626',
        accent: '#f87171'
      }}
      backgroundColor="#410d0dff"
      className="p-6"
    >
      <div className="text-white text-center space-y-4">
        <div className="flex justify-center mb-4">
          {/* Native Shield SVG */}
          <svg className="w-8 h-8 text-red-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Security First</h3>
        <p className="text-gray-300 mb-4">0.5s rotation speed with vivid red theme</p>
        <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-sm" style={{ background: '#dc2626', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            Secure
          </button>
          <button className="px-3 py-2 border border-red-400 hover:border-red-300 rounded-lg transition-colors text-sm" style={{ background: 'transparent', border: '1px solid #f87171', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            Download
          </button>
        </div>
      </div>
    </BorderRotate>
  );
}

function StopOnHover() {
  return (
    <BorderRotate
      animationMode="stop-rotate-on-hover"
      gradientColors={{
        primary: '#581c87',
        secondary: '#7c3aed',
        accent: '#a855f7'
      }}
      backgroundColor="#271832ff"
      className="p-6"
    >
      <div className="text-white text-center space-y-4">
        <div className="flex justify-center mb-4">
          {/* Native User SVG */}
          <svg className="w-8 h-8 text-purple-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">User Profile</h3>
        <p className="text-gray-300 mb-4">Animation pauses on hover - purple theme</p>
        <div className="space-y-3">
          <div className="flex gap-2 justify-center" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors" style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
              Message
            </button>
            <button className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors" style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
              Call
            </button>
          </div>
          <div className="text-sm text-purple-300" style={{ marginTop: '12px' }}>
            Premium Member Since 2024
          </div>
        </div>
      </div>
    </BorderRotate>
  );
}

export {
  Default,
  FastAnimation,
  StopOnHover,
};
