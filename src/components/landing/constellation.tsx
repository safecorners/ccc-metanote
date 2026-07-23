/** 히어로 "밤" 밴드의 별자리 필드 — 우상단 클러스터, 기하학적 형태만 (DESIGN.md Decorative Depth) */
export function Constellation() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    >
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="960" cy="220" r="260" fill="url(#hero-glow)" />

      {/* 별 — 우상단 클러스터 */}
      <circle cx="880" cy="200" r="2" fill="#fff" opacity="0.45" />
      <circle cx="980" cy="120" r="2.5" fill="#fff" opacity="0.55" />
      <circle cx="1080" cy="170" r="2" fill="#fff" opacity="0.4" />
      <circle cx="1040" cy="70" r="1.5" fill="#fff" opacity="0.3" />
      <circle cx="920" cy="60" r="1.5" fill="#fff" opacity="0.25" />
      <circle cx="1140" cy="90" r="2" fill="#fff" opacity="0.35" />
      <circle cx="820" cy="110" r="1.5" fill="#fff" opacity="0.3" />
      <circle cx="1120" cy="280" r="2.5" fill="#fff" opacity="0.5" />
      <circle cx="1010" cy="330" r="1.5" fill="#fff" opacity="0.3" />
      <circle cx="760" cy="300" r="1.5" fill="#fff" opacity="0.2" />
      <circle cx="680" cy="90" r="2" fill="#fff" opacity="0.25" />
      <circle cx="1170" cy="400" r="1.5" fill="#fff" opacity="0.25" />
      <circle cx="590" cy="180" r="1.5" fill="#fff" opacity="0.15" />
      <circle cx="860" cy="380" r="2" fill="#fff" opacity="0.3" />

      {/* 희미한 연결선 */}
      <path
        d="M880 200 L980 120 L1080 170"
        stroke="#fff"
        strokeOpacity="0.12"
        fill="none"
      />
      <path
        d="M1080 170 L1120 280 L1010 330"
        stroke="#fff"
        strokeOpacity="0.08"
        fill="none"
      />

      {/* 4포인트 스파클 — 카테고리 색 (일러스트 용도) */}
      <path
        d="M0-9 C1.5-3 3-1.5 9 0 C3 1.5 1.5 3 0 9 C-1.5 3 -3 1.5 -9 0 C-3-1.5 -1.5-3 0-9 Z"
        transform="translate(1050,300)"
        fill="var(--color-accent-sky)"
        opacity="0.8"
      />
      <path
        d="M0-7 C1.2-2.4 2.4-1.2 7 0 C2.4 1.2 1.2 2.4 0 7 C-1.2 2.4 -2.4 1.2 -7 0 C-2.4-1.2 -1.2-2.4 0-7 Z"
        transform="translate(900,140)"
        fill="var(--color-accent-purple)"
        opacity="0.7"
      />
      <path
        d="M0-6 C1-2 2-1 6 0 C2 1 1 2 0 6 C-1 2 -2 1 -6 0 C-2-1 -1-2 0-6 Z"
        transform="translate(1150,210)"
        fill="var(--color-accent-pink)"
        opacity="0.6"
      />
    </svg>
  );
}
