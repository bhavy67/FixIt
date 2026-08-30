import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #c026d3)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <svg width="108" height="108" viewBox="0 0 22 22" fill="none">
          {/* F stem */}
          <rect x="3" y="2" width="3.2" height="18" rx="1.6" fill="white" />
          {/* F top bar */}
          <rect x="3" y="2" width="14" height="3.2" rx="1.6" fill="white" />
          {/* F crossbar — rising diagonal */}
          <path d="M 3 14.5 L 17 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
