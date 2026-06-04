/** Luxury hero graphic — no stock photo */
export function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden>
      <div className="hero-visual__glow" />
      <div className="hero-visual__ring hero-visual__ring--outer" />
      <div className="hero-visual__ring hero-visual__ring--mid" />
      <div className="hero-visual__ring hero-visual__ring--inner" />
      <svg
        className="hero-visual__cup"
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M48 88h88c0 52-18 88-44 88s-44-36-44-88z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M136 96h12c14 0 22 10 22 24 0 18-12 28-28 28h-6"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <ellipse cx="92" cy="88" rx="44" ry="6" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M72 52c0-12 8-20 20-20s20 8 20 20"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M80 36c4-10 12-16 20-16s16 6 20 16"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M88 24c2-8 8-12 14-12s12 4 14 12"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.22"
        />
        <path
          d="M64 176h56"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
      <div className="hero-visual__beans">
        <span className="hero-visual__bean hero-visual__bean--1" />
        <span className="hero-visual__bean hero-visual__bean--2" />
        <span className="hero-visual__bean hero-visual__bean--3" />
      </div>
      <p className="hero-visual__caption">حِرفة · جودة · أناقة</p>
    </div>
  )
}
