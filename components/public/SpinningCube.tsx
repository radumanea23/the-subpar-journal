"use client"

// Phase 2: replace this CSS placeholder with @react-three/fiber implementation.
// The real cube spins on a diagonal axis with one category icon per face.

export default function SpinningCube() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 96, height: 96 }}
      aria-hidden="true"
    >
      {/* CSS cube placeholder — replaced by Three.js canvas in Phase 2 */}
      <div
        className="w-16 h-16 border-2 border-ink bg-parchment-dark"
        style={{
          animation: "spin-diagonal 8s linear infinite",
          transform: "rotate3d(1, 1, 0, 45deg)",
        }}
      />
      <style>{`
        @keyframes spin-diagonal {
          from { transform: rotate3d(1, 1, 0, 0deg); }
          to   { transform: rotate3d(1, 1, 0, 360deg); }
        }
      `}</style>
    </div>
  )
}
