// File: app/api/og/quote/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'Kompres berkas foto, PDF, dan cetak nota thermal kilat & gratis.';
  const author = searchParams.get('author') || 'kompreskilat.site';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#020617',
          padding: '80px 60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '20%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            right: '15%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '24px',
              }}
            >
              ⚡
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.5px' }}>
                KompresKilat
              </span>
              <span style={{ fontSize: '16px', color: '#94a3b8' }}>
                Productivity & Document Tools
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818cf8',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            Daily Insight
          </div>
        </div>

        {/* Middle Quote Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '920px',
            zIndex: 10,
            padding: '20px',
          }}
        >
          <span style={{ fontSize: '72px', color: '#6366f1', marginBottom: '-20px', opacity: 0.6 }}>
            “
          </span>
          <p
            style={{
              fontSize: text.length > 120 ? '34px' : '44px',
              fontWeight: '700',
              lineHeight: 1.35,
              color: '#f8fafc',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}
          >
            {text}
          </p>
          <span style={{ fontSize: '72px', color: '#06b6d4', marginTop: '-30px', opacity: 0.6 }}>
            ”
          </span>
        </div>

        {/* Bottom Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '30px',
            borderTop: '1px solid rgba(51, 65, 85, 0.6)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '20px' }}>
            <span>🌐</span>
            <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{author}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '18px' }}>
            <span>Instagram: @kompreskilat</span>
            <span>•</span>
            <span>Facebook: Kompres Kilat</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
