import { useState } from 'react'

type Props = {
  src: string | null
  alt: string
}

export function MenuItemImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className="menu-card-image">
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="menu-card-image__placeholder" aria-hidden>
          <svg
            className="menu-card-image__svg"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <path d="M14 32h20c0 10-4 16-10 16s-10-6-10-16z" />
            <ellipse cx="24" cy="32" rx="10" ry="2" />
            <path d="M20 18c0-4 2-7 6-7s6 3 6 7" opacity="0.5" />
          </svg>
        </div>
      )}
      <div className="menu-card-image__shade" aria-hidden />
    </div>
  )
}
