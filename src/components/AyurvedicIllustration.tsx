"use client";

/**
 * AyurvedicIllustration — inline SVG botanical art
 * Renders a hand-crafted Ayurvedic mandala/botanical composition.
 * Zero network calls, fully self-contained.
 */

interface Props {
  variant?: "hero" | "botanical" | "manuscript" | "formulation";
  className?: string;
}

export default function AyurvedicIllustration({ variant = "hero", className = "" }: Props) {
  if (variant === "hero") {
    return (
      <svg
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Background deep glow */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14532d" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#052e16" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lotusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#14532d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0" />
          </radialGradient>
          <filter id="soft-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-gold">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background ambient glow */}
        <ellipse cx="250" cy="250" rx="230" ry="230" fill="url(#bgGlow)" />

        {/* Outer mandala ring */}
        <circle cx="250" cy="250" r="210" fill="none" stroke="#166534" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4" />
        <circle cx="250" cy="250" r="190" fill="none" stroke="#15803d" strokeWidth="0.3" strokeDasharray="2 6" opacity="0.3" />
        <circle cx="250" cy="250" r="165" fill="none" stroke="#166534" strokeWidth="0.5" opacity="0.25" />

        {/* Mandala petal rings */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x = 250 + 170 * Math.cos(angle);
          const y = 250 + 170 * Math.sin(angle);
          const rx = 250 + 150 * Math.cos(angle);
          const ry = 250 + 150 * Math.sin(angle);
          return (
            <line key={i} x1={rx} y1={ry} x2={x} y2={y}
              stroke="#16a34a" strokeWidth="0.6" opacity="0.3" />
          );
        })}

        {/* Outer petal ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const cx = 250 + 150 * Math.cos(angle);
          const cy = 250 + 150 * Math.sin(angle);
          const nx = 250 + 190 * Math.cos(angle);
          const ny = 250 + 190 * Math.sin(angle);
          return (
            <ellipse key={i}
              cx={(cx + nx) / 2} cy={(cy + ny) / 2}
              rx="8" ry="22"
              fill="#14532d" stroke="#166534" strokeWidth="0.5"
              transform={`rotate(${(angle * 180) / Math.PI + 90}, ${(cx + nx) / 2}, ${(cy + ny) / 2})`}
              opacity="0.5"
            />
          );
        })}

        {/* Inner petal ring (lotus) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const cx = 250 + 90 * Math.cos(angle);
          const cy = 250 + 90 * Math.sin(angle);
          const nx = 250 + 130 * Math.cos(angle);
          const ny = 250 + 130 * Math.sin(angle);
          return (
            <ellipse key={i}
              cx={(cx + nx) / 2} cy={(cy + ny) / 2}
              rx="14" ry="30"
              fill="#166534" stroke="#22c55e" strokeWidth="0.8"
              transform={`rotate(${(angle * 180) / Math.PI + 90}, ${(cx + nx) / 2}, ${(cy + ny) / 2})`}
              opacity="0.6"
            />
          );
        })}

        {/* Lotus bloom (innermost petals) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const cx = 250 + 48 * Math.cos(angle);
          const cy = 250 + 48 * Math.sin(angle);
          const nx = 250 + 80 * Math.cos(angle);
          const ny = 250 + 80 * Math.sin(angle);
          return (
            <ellipse key={i}
              cx={(cx + nx) / 2} cy={(cy + ny) / 2}
              rx="12" ry="25"
              fill="#15803d" stroke="#4ade80" strokeWidth="1"
              transform={`rotate(${(angle * 180) / Math.PI + 90}, ${(cx + nx) / 2}, ${(cy + ny) / 2})`}
              opacity="0.75"
            />
          );
        })}

        {/* Center glow + lotus core */}
        <circle cx="250" cy="250" r="45" fill="url(#lotusGlow)" />
        <circle cx="250" cy="250" r="30" fill="#052e16" stroke="#16a34a" strokeWidth="1.5" opacity="0.9" />
        <circle cx="250" cy="250" r="20" fill="#14532d" stroke="#4ade80" strokeWidth="1" opacity="0.8" />

        {/* Gold inner center */}
        <circle cx="250" cy="250" r="12" fill="#78350f" stroke="#fbbf24" strokeWidth="1" filter="url(#glow-gold)" opacity="0.9" />
        <circle cx="250" cy="250" r="6" fill="#fbbf24" opacity="0.85" filter="url(#glow-gold)" />

        {/* Herb sprigs — Tulsi branches */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const sx = 250 + 100 * Math.cos(rad);
          const sy = 250 + 100 * Math.sin(rad);
          const ex = 250 + 200 * Math.cos(rad);
          const ey = 250 + 200 * Math.sin(rad);
          return (
            <g key={i} opacity="0.5" filter="url(#soft-glow)">
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#22c55e" strokeWidth="1" />
              {/* Leaves on branch */}
              <ellipse cx={250 + 155 * Math.cos(rad) + 12 * Math.cos(rad + 1.4)}
                cy={250 + 155 * Math.sin(rad) + 12 * Math.sin(rad + 1.4)}
                rx="6" ry="12"
                fill="#16a34a"
                transform={`rotate(${deg + 60}, ${250 + 155 * Math.cos(rad) + 12 * Math.cos(rad + 1.4)}, ${250 + 155 * Math.sin(rad) + 12 * Math.sin(rad + 1.4)})`}
              />
              <ellipse cx={250 + 155 * Math.cos(rad) - 12 * Math.cos(rad + 1.4)}
                cy={250 + 155 * Math.sin(rad) - 12 * Math.sin(rad + 1.4)}
                rx="6" ry="12"
                fill="#15803d"
                transform={`rotate(${deg - 60}, ${250 + 155 * Math.cos(rad) - 12 * Math.cos(rad + 1.4)}, ${250 + 155 * Math.sin(rad) - 12 * Math.sin(rad + 1.4)})`}
              />
            </g>
          );
        })}

        {/* Decorative corner dots */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const r = 207;
          return (
            <circle key={i}
              cx={250 + r * Math.cos(angle)}
              cy={250 + r * Math.sin(angle)}
              r="2"
              fill="#22c55e"
              opacity="0.4"
            />
          );
        })}
      </svg>
    );
  }

  if (variant === "botanical") {
    return (
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
        <defs>
          <radialGradient id="bgBotanical" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#14532d" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bgBotanical)" />
        {/* Large herb stem */}
        <line x1="200" y1="290" x2="200" y2="60" stroke="#16a34a" strokeWidth="2" opacity="0.7" />
        {/* Leaves pair 1 */}
        <ellipse cx="170" cy="230" rx="12" ry="30" fill="#166534" stroke="#22c55e" strokeWidth="0.5" transform="rotate(-25 170 230)" opacity="0.8" />
        <ellipse cx="230" cy="230" rx="12" ry="30" fill="#14532d" stroke="#22c55e" strokeWidth="0.5" transform="rotate(25 230 230)" opacity="0.8" />
        {/* Leaves pair 2 */}
        <ellipse cx="160" cy="170" rx="14" ry="35" fill="#15803d" stroke="#4ade80" strokeWidth="0.5" transform="rotate(-35 160 170)" opacity="0.75" />
        <ellipse cx="240" cy="170" rx="14" ry="35" fill="#166534" stroke="#4ade80" strokeWidth="0.5" transform="rotate(35 240 170)" opacity="0.75" />
        {/* Top flower bud */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          return (
            <ellipse key={i} cx={200 + 20 * Math.cos(a)} cy={80 + 20 * Math.sin(a)} rx="7" ry="18"
              fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"
              transform={`rotate(${(a * 180) / Math.PI + 90} ${200 + 20 * Math.cos(a)} ${80 + 20 * Math.sin(a)})`}
              opacity="0.7"
            />
          );
        })}
        <circle cx="200" cy="80" r="10" fill="#92400e" stroke="#fbbf24" strokeWidth="1" opacity="0.9" />
        {/* Dewdrops */}
        {[[155, 200], [245, 195], [165, 150], [235, 155]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="3" ry="4" fill="#93c5fd" opacity="0.5" />
        ))}
      </svg>
    );
  }

  if (variant === "manuscript") {
    return (
      <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="parchment" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>
          <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Palm leaf shape */}
        <rect x="40" y="60" width="320" height="160" rx="6" fill="url(#parchment)" stroke="#78350f" strokeWidth="1.5" />
        {/* Spine line */}
        <line x1="200" y1="60" x2="200" y2="220" stroke="#78350f" strokeWidth="1" opacity="0.4" />
        {/* Text lines (Sanskrit-esque) */}
        {[90, 115, 140, 165, 190].map((y, i) => (
          <line key={i} x1="70" y1={y} x2="330" y2={y} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray={i % 2 === 0 ? "8 4 2 4" : "12 3 4 3"} opacity="0.45" />
        ))}
        {/* Decorative header border */}
        <rect x="55" y="70" width="290" height="18" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4" />
        {/* Om symbol (simplified) */}
        <text x="192" y="84" fill="url(#goldText)" fontSize="12" fontFamily="serif" opacity="0.7" textAnchor="middle">ॐ</text>
        {/* Corner flourishes */}
        {[[55, 68], [335, 68], [55, 215], [335, 215]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
        ))}
        {/* Lotus at center bottom */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = ((i / 5) * Math.PI) - Math.PI / 2;
          return (
            <ellipse key={i} cx={200 + 18 * Math.cos(a)} cy={240 + 10 * Math.sin(a)} rx="6" ry="14"
              fill="#166534" stroke="#22c55e" strokeWidth="0.5"
              transform={`rotate(${(a * 180) / Math.PI + 90} ${200 + 18 * Math.cos(a)} ${240 + 10 * Math.sin(a)})`}
              opacity="0.6"
            />
          );
        })}
        <circle cx="200" cy="240" r="6" fill="#14532d" stroke="#4ade80" strokeWidth="0.8" opacity="0.7" />
      </svg>
    );
  }

  if (variant === "formulation") {
    return (
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
        <defs>
          <radialGradient id="vesselGlow" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="oilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#vesselGlow)" />
        {/* Mortar */}
        <ellipse cx="140" cy="210" rx="55" ry="18" fill="#44403c" stroke="#78350f" strokeWidth="1.5" />
        <path d="M85 210 Q85 260 140 265 Q195 260 195 210" fill="#292524" stroke="#78350f" strokeWidth="1.5" />
        {/* Pestle */}
        <rect x="130" y="150" width="16" height="65" rx="8" fill="#57534e" stroke="#a8a29e" strokeWidth="1" transform="rotate(15 138 183)" />
        {/* Herbs in mortar */}
        <ellipse cx="145" cy="207" rx="30" ry="6" fill="#16a34a" opacity="0.7" />
        {/* Brass vessel */}
        <ellipse cx="280" cy="210" rx="40" ry="12" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
        <path d="M240 210 Q240 255 280 260 Q320 255 320 210" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
        {/* Oil drip */}
        <path d="M270 180 Q272 195 273 210" stroke="url(#oilGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="273" cy="212" rx="6" ry="3" fill="#fbbf24" opacity="0.6" />
        {/* Herb powders — colored mounds */}
        {[[60, 240, "#16a34a"], [100, 248, "#ca8a04"], [340, 245, "#dc2626"], [365, 238, "#7c3aed"]].map(([x, y, c], i) => (
          <ellipse key={i} cx={x as number} cy={y as number} rx="18" ry="8" fill={c as string} opacity="0.55" />
        ))}
        {/* Spice seeds */}
        {[[195, 270], [215, 265], [225, 275], [205, 278]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="4" ry="2" fill="#92400e" opacity="0.6" transform={`rotate(${i * 45} ${x} ${y})`} />
        ))}
        {/* Cinnamon sticks */}
        <rect x="350" y="200" width="6" height="50" rx="3" fill="#92400e" opacity="0.6" transform="rotate(-20 353 225)" />
        <rect x="358" y="205" width="5" height="45" rx="2" fill="#78350f" opacity="0.5" transform="rotate(-15 360 227)" />
      </svg>
    );
  }

  return null;
}
