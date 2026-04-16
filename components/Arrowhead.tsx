import Image from 'next/image'

export default function Arrowhead({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/images/finnoy_arrowhead_2026_mini-blue.png"
      alt=""
      width={size}
      height={size}
      className="inline-block"
      aria-hidden
    />
  )
}
