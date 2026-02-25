"use client"

import dynamic from "next/dynamic"

// The Three.js canvas requires browser APIs (WebGL, document.createElement).
// ssr: false ensures it never renders on the server.
const Scene = dynamic(
  () => import("./SpinningCubeScene").then((m) => m.SpinningCubeScene),
  { ssr: false },
)

export default function SpinningCube() {
  return (
    <div style={{ width: 300, height: 300 }} aria-hidden="true">
      <Scene />
    </div>
  )
}
