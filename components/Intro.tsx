'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated splash screen: a reticle locks on, the monogram draws itself,
 * then the overlay fades away to reveal the page.
 *
 * - Shown once per browser session, only if the boot script in the layout set
 *   html[data-intro] before the first paint (so returning visitors never see a flash).
 * - The whole timeline is CSS; this component only handles skip + cleanup.
 * - Skipped entirely for people who prefer reduced motion.
 * - Click, tap or any key skips it.
 */
export default function Intro({ name, role }: { name: string; role: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || !root.hasAttribute('data-intro')) return;

    const finish = () => {
      root.removeAttribute('data-intro');
      try {
        sessionStorage.setItem('intro-seen', '1');
      } catch {
        /* storage unavailable */
      }
      cleanup();
    };
    const skip = () => el.classList.add('intro-skip');
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && (e.animationName === 'intro-out' || e.animationName === 'intro-skip')) finish();
    };

    el.addEventListener('animationend', onEnd);
    el.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    // Safety net: never leave the overlay up, whatever happens to the animation.
    const timer = window.setTimeout(finish, 6000);

    function cleanup() {
      el?.removeEventListener('animationend', onEnd);
      el?.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.clearTimeout(timer);
    }
    return cleanup;
  }, []);

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro-stage">
        <svg className="intro-mark" viewBox="0 0 200 200" fill="none">
          <defs>
            <clipPath id="intro-clip">
              <circle cx="100" cy="100" r="80" />
            </clipPath>
            <radialGradient id="intro-dot-glow">
              <stop offset="0" stopColor="var(--intro-accent)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--intro-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Reticle */}
          <circle className="intro-ring" cx="100" cy="100" r="80" />
          <circle className="intro-ring-inner" cx="100" cy="100" r="62" />
          <path className="intro-cross intro-cross-t" d="M100 6V44" pathLength={1} />
          <path className="intro-cross intro-cross-b" d="M100 194V156" pathLength={1} />
          <path className="intro-cross intro-cross-l" d="M6 100H40" pathLength={1} />
          <path className="intro-cross intro-cross-r" d="M194 100H160" pathLength={1} />

          {/* Scan line sweeping through the reticle */}
          <g clipPath="url(#intro-clip)">
            <rect className="intro-scan" x="20" y="0" width="160" height="2" />
          </g>

          {/* Monogram "A" — draws its outline, then fills */}
          <path
            className="intro-letter"
            pathLength={1}
            fillRule="evenodd"
            d="M57 152 L91 54 H109 L143 152 H119 L112.5 132 H87.5 L81 152 Z M93 113 H107 L100 90 Z"
          />

          {/* Detail bars, like a HUD readout */}
          <rect className="intro-bar intro-bar-1" x="52" y="54" width="26" height="7" />
          <rect className="intro-bar intro-bar-2" x="52" y="66" width="10" height="3" />
          <rect className="intro-bar intro-bar-3" x="128" y="146" width="18" height="3" />

          {/* Glowing target dot on the crosshair, above the apex */}
          <circle className="intro-dot-glow" cx="100" cy="34" r="20" fill="url(#intro-dot-glow)" />
          <circle className="intro-dot" cx="100" cy="34" r="7" />
          <circle className="intro-dot-core" cx="100" cy="34" r="3" />
        </svg>
        <p className="intro-caption">
          <span className="intro-name">{name}</span>
          {role && <span className="intro-role">{role}</span>}
        </p>
      </div>
    </div>
  );
}
