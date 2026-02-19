/** CSS that Tailwind can't express: keyframes, box-shadows, maplibre overrides */
export const MAP_STYLES = `
  .eu-pulse-ring {
    animation: euPulse 3s ease-out infinite;
  }
  .eu-pulse-ring-1 { animation-delay: 0s; }
  .eu-pulse-ring-2 { animation-delay: 1s; }
  .eu-pulse-ring-3 { animation-delay: 2s; }

  @keyframes euPulse {
    0%   { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(6); opacity: 0; }
  }

  .eu-dot {
    box-shadow: 0 0 8px 2px rgba(16, 185, 129, 0.6);
  }

  .eu-label {
    top: calc(100% + 2px);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }

  .eu-data-packet {
    box-shadow: 0 0 12px 3px rgba(52, 211, 153, 0.7),
                0 0 24px 6px rgba(52, 211, 153, 0.3);
  }

  .eu-vignette {
    background: radial-gradient(
      ellipse at center,
      transparent 50%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }

  .eu-map-wrap .maplibregl-ctrl-attrib {
    display: none !important;
  }
  .eu-map-wrap .maplibregl-canvas {
    outline: none;
  }

  @media (max-width: 768px) {
    .eu-label       { font-size: 7px; }
    .eu-dot         { width: 4px; height: 4px; }
    .eu-pulse-ring  { width: 4px; height: 4px; }
  }
`;
