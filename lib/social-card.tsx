import { ImageResponse } from 'next/og'
import { UCB_BRAND, ucbWordmarkDataUrl } from '@/lib/ucb-mark'

export const SOCIAL_ALT = 'UCB Bookings — staff tools for confirming shows.'

export function socialCard({
  width,
  height,
}: {
  width: number
  height: number
}) {
  // Wordmark is wide (~1.66:1); height drives layout
  const markH = Math.round(height * 0.16)
  const markW = Math.round(markH * 1.66)
  const titleSize = Math.round(height * 0.11)
  const subtitleSize = Math.round(height * 0.045)
  const eyebrowSize = Math.round(height * 0.028)

  const edge = Math.round(width * 0.006)
  const pad = Math.round(height * 0.11)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          // Solid fill — Satori does not support complex gradients in all builds
          background: '#2e3036',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: pad,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: edge,
            background: UCB_BRAND.accent,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: markW * 0.2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ucbWordmarkDataUrl(UCB_BRAND.light)}
            width={markW}
            height={markH}
            alt=""
          />
          <div
            style={{
              color: UCB_BRAND.light,
              fontSize: eyebrowSize,
              fontWeight: 500,
              letterSpacing: eyebrowSize * 0.18,
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            Upright Citizens Brigade
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: subtitleSize * 0.5 }}>
          <div
            style={{
              color: UCB_BRAND.light,
              fontSize: titleSize,
              fontWeight: 700,
              letterSpacing: -titleSize * 0.025,
              lineHeight: 1,
              display: 'flex',
            }}
          >
            UCB Bookings
          </div>
          <div
            style={{
              color: UCB_BRAND.accent,
              fontSize: Math.round(eyebrowSize * 1.05),
              fontWeight: 600,
              letterSpacing: eyebrowSize * 0.12,
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            Internal staff tools
          </div>
          <div
            style={{
              color: UCB_BRAND.light,
              fontSize: subtitleSize,
              lineHeight: 1.35,
              opacity: 0.78,
              maxWidth: width * 0.72,
              display: 'flex',
            }}
          >
            Staff tools for confirming shows.
          </div>
        </div>
      </div>
    ),
    { width, height }
  )
}
