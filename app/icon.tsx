import { ImageResponse } from 'next/og'
import { UCB_BRAND, ucbMarkDataUrl } from '@/lib/ucb-mark'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: UCB_BRAND.dark,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ucbMarkDataUrl(UCB_BRAND.light)} width={26} height={26} alt="" />
      </div>
    ),
    { ...size }
  )
}
