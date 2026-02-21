'use client';

export default function ScanlineOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
          animation: 'scanlineScroll 8s linear infinite',
        }}
      />
      {/* Film grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.02,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '128px 128px',
          animation: 'grainShift 0.1s steps(4) infinite',
        }}
      />
      <style>{`
        @keyframes scanlineScroll {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
        @keyframes grainShift {
          0% { background-position: 0 0; }
          25% { background-position: -64px 32px; }
          50% { background-position: 32px -64px; }
          75% { background-position: -32px -32px; }
          100% { background-position: 64px 64px; }
        }
      `}</style>
    </div>
  );
}
