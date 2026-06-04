import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, background: '#F2F0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #1C1C1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 5l2.5 2.5L8 2.5" stroke="#1C1C1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
