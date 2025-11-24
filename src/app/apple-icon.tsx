import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#06b6d4',
          borderRadius: '20%',
          border: '8px solid #22d3ee',
          position: 'relative',
        }}
      >
        {/* Abstract Neural Node */}
        <div
          style={{
            position: 'absolute',
            width: '60px',
            height: '60px',
            background: '#06b6d4',
            borderRadius: '50%',
            top: '60px',
            left: '60px',
            boxShadow: '0 0 40px #22d3ee',
          }}
        />
        {/* Circuit Lines */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <path
            d="M90 90 L90 30 M90 90 L140 140 M90 90 L40 140"
            stroke="#22d3ee"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
