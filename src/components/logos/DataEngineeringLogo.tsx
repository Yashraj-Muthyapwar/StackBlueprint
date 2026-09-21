import React from "react";

export function DataEngineeringLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 110"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="mintGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="tankBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Background Pipes */}
      <path
        d="M 0 55 L 240 55"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Pipe connectors */}
      <rect x="18" y="43" width="5" height="24" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="73" y="43" width="5" height="24" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="88" y="43" width="5" height="24" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="143" y="43" width="5" height="24" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="158" y="43" width="5" height="24" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="213" y="43" width="5" height="24" rx="2" fill="currentColor" opacity="0.5" />

      {/* Directional Arrows */}
      <path
        d="M 77 48 L 84 55 L 77 62"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M 147 48 L 154 55 L 147 62"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Tank 1: Ingestion */}
      <g>
        <path d="M 38 90 L 33 100 L 59 100 L 54 90 Z" fill="currentColor" opacity="0.2" />
        <rect
          x="26"
          y="20"
          width="40"
          height="70"
          rx="10"
          fill="url(#tankBg)"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M 34 35 L 58 35 L 49 47 L 49 55 L 43 55 L 43 47 Z" fill="url(#mintGradient)" />
        <circle cx="41" cy="63" r="2.5" fill="url(#mintGradient)" />
        <circle cx="46" cy="68" r="2.5" fill="url(#mintGradient)" />
        <circle cx="51" cy="63" r="2.5" fill="url(#mintGradient)" />
      </g>

      {/* Tank 2: Processing */}
      <g>
        <path d="M 108 90 L 103 100 L 129 100 L 124 90 Z" fill="currentColor" opacity="0.2" />
        <rect
          x="96"
          y="20"
          width="40"
          height="70"
          rx="10"
          fill="url(#tankBg)"
          stroke="currentColor"
          strokeWidth="3"
        />
        <g stroke="url(#violetGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <circle cx="110" cy="45" r="5" />
          <path d="M 110 36 L 110 38 M 110 52 L 110 54 M 101 45 L 103 45 M 117 45 L 119 45 M 104 39 L 105 40 M 115 50 L 116 51 M 116 39 L 115 40 M 105 51 L 104 50" />
        </g>
        <g stroke="url(#violetGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <circle cx="122" cy="60" r="5" />
          <path d="M 122 51 L 122 53 M 122 67 L 122 69 M 113 60 L 115 60 M 129 60 L 131 60 M 116 54 L 117 55 M 127 65 L 128 66 M 128 54 L 127 55 M 117 66 L 116 65" />
        </g>
      </g>

      {/* Tank 3: Serving */}
      <g>
        <path d="M 178 90 L 173 100 L 199 100 L 194 90 Z" fill="currentColor" opacity="0.2" />
        <rect
          x="166"
          y="20"
          width="40"
          height="70"
          rx="10"
          fill="url(#tankBg)"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M 174 70 L 198 70"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <rect x="176" y="57" width="5" height="13" rx="1.5" fill="url(#amberGradient)" />
        <rect x="184" y="47" width="5" height="23" rx="1.5" fill="url(#amberGradient)" />
        <rect x="192" y="37" width="5" height="33" rx="1.5" fill="url(#amberGradient)" />
      </g>
    </svg>
  );
}
