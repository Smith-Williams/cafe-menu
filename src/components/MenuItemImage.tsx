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
          <span className="menu-card-image__icon">☕</span>
          <span className="menu-card-image__hint">صورة المنتج</span>
        </div>
      )}
      <div className="menu-card-image__shade" aria-hidden />
    </div>
  )
}
