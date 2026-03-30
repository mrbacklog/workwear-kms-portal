import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { KmsLayout } from '../components/KmsLayout';
import { useKmsAuth } from '../hooks/useKmsAuth';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import type { KmsOrderResponse } from '../types';

interface LocationState {
  order?: KmsOrderResponse;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  opacity: number;
}

const CONFETTI_COLORS = [
  kmsColors.orange,
  '#00A0C8', // cyan
  '#008838', // green
  '#F18E00', // orange variant
  '#00C8A0', // teal
  '#FFCC44', // yellow-gold
];

function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = 80 + Math.floor(Math.random() * 40);
    const particles: ConfettiParticle[] = Array.from({ length: count }, () => ({
      x: canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.4,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: -8 - Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      width: 6 + Math.random() * 8,
      height: 4 + Math.random() * 4,
      opacity: 1,
    }));

    let animId: number;
    let startTime: number | null = null;
    const DURATION_MS = 2200;

    function animate(ts: number) {
      if (!ctx || !canvas) return;
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / DURATION_MS, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.35; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - Math.pow(progress, 1.5));

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef]);
}

export default function KmsConfirmPage() {
  const location = useLocation();
  const { customerName } = useKmsAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const state = location.state as LocationState | null;
  const order = state?.order;

  useConfetti(canvasRef);

  function formatPrice(cents: number): string {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
      cents / 100,
    );
  }

  return (
    <>
      <style>{`
        @keyframes kms-check-scale {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.15); }
          80%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes kms-check-ring {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes kms-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kms-badge-pop {
          0%   { transform: scale(0) rotate(-8deg); }
          70%  { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Confetti canvas — full screen, pointer-events none */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          pointerEvents: 'none',
        }}
      />

      <KmsLayout customerName={customerName}>
        <div
          style={{
            paddingTop: 48,
            paddingBottom: 48,
            fontFamily: kmsFont,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* Animated checkmark */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            {/* Pulse ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#E0F5EC',
                animation: 'kms-check-ring 1.2s ease-out 200ms forwards',
              }}
            />
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#E0F5EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: 'kms-check-scale 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke={kmsColors.green}
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: kmsColors.black,
              fontFamily: kmsFont,
              margin: '0 0 12px',
              animation: 'kms-fade-up 400ms ease 300ms both',
            }}
          >
            Bestelling geplaatst!
          </h1>

          {/* Order number badge */}
          {order?.order_number && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: kmsColors.orange,
                color: kmsColors.white,
                borderRadius: 999,
                padding: '6px 18px',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: kmsFont,
                marginBottom: 20,
                animation: 'kms-badge-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 500ms both',
              }}
            >
              Ordernummer #{order.order_number}
            </div>
          )}

          {/* Confirmation message */}
          <p
            style={{
              fontSize: 15,
              color: '#666666',
              fontFamily: kmsFont,
              maxWidth: 360,
              lineHeight: 1.6,
              marginBottom: 8,
              animation: 'kms-fade-up 400ms ease 600ms both',
            }}
          >
            U ontvangt een bevestiging per e-mail. Uw werkkleding wordt zo snel mogelijk
            verwerkt.
          </p>

          {/* Order total (if available) */}
          {order?.total_cents !== undefined && (
            <div
              style={{
                background: '#F5F5F5',
                borderRadius: 12,
                padding: '12px 24px',
                marginTop: 8,
                marginBottom: 8,
                animation: 'kms-fade-up 400ms ease 700ms both',
              }}
            >
              <span style={{ fontSize: 13, color: '#888', fontFamily: kmsFont }}>Totaal: </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: kmsColors.black,
                  fontFamily: kmsFont,
                }}
              >
                {formatPrice(order.total_cents)}
              </span>
            </div>
          )}

          {/* Reference (if available) */}
          {order?.reference && (
            <div
              style={{
                fontSize: 13,
                color: '#888',
                fontFamily: kmsFont,
                marginTop: 4,
                animation: 'kms-fade-up 400ms ease 750ms both',
              }}
            >
              Referentie: <strong style={{ color: '#444' }}>{order.reference}</strong>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 2,
              background: '#F0F0F0',
              borderRadius: 1,
              margin: '28px auto',
              animation: 'kms-fade-up 400ms ease 800ms both',
            }}
          />

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              width: '100%',
              maxWidth: 320,
              animation: 'kms-fade-up 400ms ease 850ms both',
            }}
          >
            <Link
              to="/bestellen"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                background: kmsColors.orange,
                color: kmsColors.white,
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: kmsFont,
                boxShadow: '0 4px 16px rgba(241,142,0,0.35)',
                textDecoration: 'none',
                transition: 'background 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#D97E00';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = kmsColors.orange;
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nieuwe bestelling
            </Link>

            <Link
              to="/bestellen"
              style={{
                padding: '12px 20px',
                background: 'none',
                border: `1.5px solid #E0E0E0`,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                color: '#666',
                fontFamily: kmsFont,
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = kmsColors.cyan;
                (e.currentTarget as HTMLAnchorElement).style.color = kmsColors.cyan;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E0E0E0';
                (e.currentTarget as HTMLAnchorElement).style.color = '#666';
              }}
            >
              Terug naar bestelformulier
            </Link>
          </div>
        </div>
      </KmsLayout>
    </>
  );
}
