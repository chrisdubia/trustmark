import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: '#F2F0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 36 }}>
        <div style={{ width: 110, height: 110, borderRadius: '50%', border: '5px solid #1C1C1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <path d="M12 28l10 10 22-22" stroke="#1C1C1A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
