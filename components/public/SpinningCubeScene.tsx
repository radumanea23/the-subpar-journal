"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"

// ── Constants ──────────────────────────────────────────────────────────────────
const INK = "#0F0F0F"
const PARCHMENT = "#F0E6CE"

// BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
const FACES = ["AI", "MUSIC", "SPORTS", "DATA", "LIFE", "TSJ"]

const IDLE_VX = 0.002
const IDLE_VY = 0.004

const EDGE_OPACITY_REST   = 0.12
const EDGE_OPACITY_HOVER  = 0.75
const LERP = 0.08

// ── Shared hover state (plain ref — avoids React re-renders per frame) ─────────
interface HoverState {
  active: boolean
  dx: number
  dy: number
}

// ── Face texture ───────────────────────────────────────────────────────────────
function makeFaceTexture(label: string): THREE.CanvasTexture {
  const S = 256
  const canvas = document.createElement("canvas")
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = INK
  ctx.fillRect(0, 0, S, S)

  // Inset border
  ctx.strokeStyle = PARCHMENT
  ctx.lineWidth = 3
  ctx.strokeRect(14, 14, S - 28, S - 28)

  // Corner tick marks
  ctx.lineWidth = 2
  const M = 14
  const T = 14
  const ticks: [number, number, number, number][] = [
    [M, M, M + T, M], [M, M, M, M + T],
    [S - M, M, S - M - T, M], [S - M, M, S - M, M + T],
    [M, S - M, M + T, S - M], [M, S - M, M, S - M - T],
    [S - M, S - M, S - M - T, S - M], [S - M, S - M, S - M, S - M - T],
  ]
  ticks.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  })

  // Label — auto-scale font by character count
  const fontSize =
    label.length <= 2 ? 96
    : label.length <= 3 ? 76
    : label.length <= 4 ? 60
    : 46
  ctx.fillStyle = PARCHMENT
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `bold ${fontSize}px "IBM Plex Mono", "Courier New", monospace`
  ctx.fillText(label, S / 2, S / 2)

  return new THREE.CanvasTexture(canvas)
}

// ── Cube with edge reveal ───────────────────────────────────────────────────────
function Cube({ hover }: { hover: React.MutableRefObject<HoverState> }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const vx = useRef(IDLE_VX)
  const vy = useRef(IDLE_VY)

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

  // Build edge lines imperatively so we can mutate opacity each frame
  const { edges, edgeMat } = useMemo(() => {
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.64, 1.64, 1.64))
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(PARCHMENT),
      transparent: true,
      opacity: EDGE_OPACITY_REST,
    })
    const lines = new THREE.LineSegments(edgeGeo, mat)
    return { edges: lines, edgeMat: mat }
  }, [])

  useFrame(() => {
    const h = hover.current

    // Rotation velocity: blend toward mouse-driven speed when hovered
    const targetVx = h.active ? h.dy * 0.0018 + IDLE_VX * 0.4 : IDLE_VX
    const targetVy = h.active ? h.dx * 0.0018 + IDLE_VY * 0.4 : IDLE_VY

    vx.current += (targetVx - vx.current) * LERP
    vy.current += (targetVy - vy.current) * LERP

    meshRef.current.rotation.x += vx.current
    meshRef.current.rotation.y += vy.current

    // Sync edge overlay rotation with the mesh
    edges.rotation.copy(meshRef.current.rotation)

    // Decay mouse delta so cube coasts to a stop if cursor is stationary
    h.dx *= 0.82
    h.dy *= 0.82

    // Lerp edge opacity: faint at rest → bright on hover
    const targetOpacity = h.active ? EDGE_OPACITY_HOVER : EDGE_OPACITY_REST
    edgeMat.opacity += (targetOpacity - edgeMat.opacity) * LERP
  })

  return (
    <>
      <mesh
        ref={meshRef}
        material={materials}
        onPointerEnter={() => { hover.current.active = true }}
        onPointerLeave={() => { hover.current.active = false }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          hover.current.dx = e.nativeEvent.movementX
          hover.current.dy = e.nativeEvent.movementY
        }}
      >
        <boxGeometry args={[1.6, 1.6, 1.6]} />
      </mesh>
      <primitive object={edges} />
    </>
  )
}

// ── Scene root ─────────────────────────────────────────────────────────────────
function Scene() {
  const hover = useRef<HoverState>({ active: false, dx: 0, dy: 0 })
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-2, 3, 2]} intensity={0.8} />
      <Cube hover={hover} />
    </>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────────
export function SpinningCubeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent", display: "block" }}
    >
      <Scene />
    </Canvas>
  )
}
