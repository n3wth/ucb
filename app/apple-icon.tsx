import { ImageResponse } from 'next/og'
import { UCB_BRAND, ucbMarkDataUrl } from '@/lib/ucb-mark'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2e3036',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ucbMarkDataUrl(UCB_BRAND.light)} width={140} height={140} alt="" />
      </div>
    ),
    { ...size }
  )
}
