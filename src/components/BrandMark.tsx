import { useId } from "react";

/**
 * StackBlueprint brand mark: a cube (building blocks, stacks, systems) with a
 * play button cut into one face (concepts you watch run).
 * Draws in currentColor, so it follows whatever text color it sits in.
 */
export function BrandMark({ className }: { className?: string }) {
  const maskId = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#fff" stroke="none" />
          <path
            d="M27.06 43.76L27.06 65.76L45.26 65.26Z"
            fill="#000"
            stroke="#000"
            strokeWidth={3}
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <path d="M50 17.35L75.38 32L50 46.65L24.62 32Z" />
        <path d="M78.28 37.02L78.28 66.33L52.9 80.98L52.9 51.67Z" />
        <path d="M21.72 37.02L47.1 51.67L47.1 80.98L21.72 66.33Z" />
      </g>
    </svg>
  );
}
