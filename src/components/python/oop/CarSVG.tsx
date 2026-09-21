export function CarSVG({
  className,
  color = "currentColor",
  bodyClass = "",
}: {
  className?: string;
  color?: string;
  bodyClass?: string;
}) {
  return (
    <svg viewBox="0 0 200 90" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="100" cy="75" rx="90" ry="5" fill="black" opacity="0.1" />

      {/* Car Body */}
      <path
        d="M 20 60 L 15 45 Q 10 35 25 30 L 50 25 L 80 10 Q 95 5 120 10 L 160 25 Q 185 30 190 45 L 195 60 Q 195 70 185 70 L 25 70 Q 15 70 20 60 Z"
        fill={color}
        className={bodyClass}
      />

      {/* Car Roof/Windows */}
      <path
        d="M 55 25 L 82 12 Q 95 8 115 12 L 152 25 L 145 35 L 60 35 Z"
        fill="white"
        opacity="0.3"
      />

      {/* Window Divider */}
      <rect x="100" y="12" width="4" height="23" fill={color} opacity="0.8" />

      {/* Headlight */}
      <path d="M 180 40 L 192 42 L 190 50 L 180 48 Z" fill="#fef08a" />
      {/* Taillight */}
      <path d="M 15 40 L 25 38 L 22 48 L 12 45 Z" fill="#f87171" />

      {/* Rear Wheel Well */}
      <path
        d="M 30 70 A 15 15 0 0 1 60 70"
        fill="none"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="4"
      />
      {/* Rear Wheel */}
      <circle cx="45" cy="70" r="14" fill="#1f2937" />
      <circle cx="45" cy="70" r="6" fill="#9ca3af" />
      <circle cx="45" cy="70" r="3" fill="#e5e7eb" />

      {/* Front Wheel Well */}
      <path
        d="M 140 70 A 15 15 0 0 1 170 70"
        fill="none"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="4"
      />
      {/* Front Wheel */}
      <circle cx="155" cy="70" r="14" fill="#1f2937" />
      <circle cx="155" cy="70" r="6" fill="#9ca3af" />
      <circle cx="155" cy="70" r="3" fill="#e5e7eb" />

      {/* Body Line */}
      <path
        d="M 25 45 L 185 45"
        stroke="black"
        strokeOpacity="0.1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
