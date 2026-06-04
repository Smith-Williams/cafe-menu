import { useState } from 'react'

type Props = {
  src: string | null
  alt: string
  /** Shown in placeholder when no image (first letter) */
  title?: string
}

function placeholderLetter(title?: string): string {
  const t = title?.trim()
  if (!t) return '☕'
  return t.charAt(0)
}

export function MenuItemImage({ src, alt, title }: Props) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src?.trim()) && !failed
  const letter = placeholderLetter(title)

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
          <span className="menu-card-image__letter">{letter}</span>
        </div>
      )}
      <div className="menu-card-image__shade" aria-hidden />
    </div>
  )
}
