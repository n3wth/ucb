import { ImageResponse } from 'next/og'
import { UCB_BRAND, ucbWordmarkDataUrl } from '@/lib/ucb-mark'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2e3036',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ucbWordmarkDataUrl(UCB_BRAND.light)}
          width={28}
          height={17}
          alt=""
        />
      </div>
    ),
    { ...size }
  )
}
