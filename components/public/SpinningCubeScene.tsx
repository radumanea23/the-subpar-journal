"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const INK = "#0F0F0F"
const PARCHMENT = "#F0E6CE"

// BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
const FACES = ["AI", "MUSIC", "SPORTS", "STOCKS", "LIFE", "TSJ"]

function makeFaceTexture(label: string): THREE.CanvasTexture {
  const S = 256
  const canvas = document.createElement("canvas")
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext("2d")!

  // Dark background
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, S, S)

  // Inset border
  ctx.strokeStyle = PARCHMENT
  ctx.lineWidth = 3
  ctx.strokeRect(14, 14, S - 28, S - 28)

  // Corner marks
  ctx.lineWidth = 2
  const m = 14
  const t = 14
  const corners: [number, number, number, number][] = [
    [m, m, m + t, m], [m, m, m, m + t],
    [S - m, m, S - m - t, m], [S - m, m, S - m, m + t],
    [m, S - m, m + t, S - m], [m, S - m, m, S - m - t],
    [S - m, S - m, S - m - t, S - m], [S - m, S - m, S - m, S - m - t],
  ]
  corners.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  })

  // Label — auto-size font by character count
  const fontSize = label.length <= 2 ? 96 : label.length <= 3 ? 76 : label.length <= 4 ? 60 : 46
  ctx.fillStyle = PARCHMENT
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `bold ${fontSize}px "IBM Plex Mono", "Courier New", monospace`
  ctx.fillText(label, S / 2, S / 2)

  return new THREE.CanvasTexture(canvas)
}

function Cube() {
  const ref = useRef<THREE.Mesh>(null!)

  const materials = useMemo(
    () =>
      FACES.map(
        (label) =>
          new THREE.MeshStandardMaterial({
            map: makeFaceTexture(label),
            roughness: 0.8,
            metalness: 0.0,
          }),
      ),
    [],
  )

  useFrame(() => {
    ref.current.rotation.x += 0.002
    ref.current.rotation.y += 0.004
  })

  return (
    <mesh ref={ref} material={materials}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
    </mesh>
  )
}

export function SpinningCubeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent", display: "block" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[-2, 3, 2]} intensity={0.8} />
      <Cube />
    </Canvas>
  )
}
