"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"

// ── Constants ──────────────────────────────────────────────────────────────────
const INK = "#0F0F0F"
const PARCHMENT = "#F0E6CE"

// BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
const FACES = ["AI", "MUSIC", "SPORTS", "CODING", "LIFE", "TSJ"]

const IDLE_VX = 0.002
const IDLE_VY = 0.004
const CUBE_HALF = 0.8 // half-edge of the 1.6-unit box
const MAX_PARTICLES = 300

// ── Shared hover state (plain ref — avoids React re-renders per frame) ─────────
interface HoverState {
  active: boolean
  hasHit: boolean   // true once onPointerMove has fired at least once this hover
  dx: number        // latest mouse movementX
  dy: number        // latest mouse movementY
  hitX: number      // world-space intersection point on mesh surface
  hitY: number
  hitZ: number
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

// ── Cube ───────────────────────────────────────────────────────────────────────
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

  useFrame(() => {
    const h = hover.current

    // When hovered: blend toward mouse-driven speed + a gentle base rotation.
    // When idle: blend back to constant defaults.
    const targetVx = h.active ? h.dy * 0.0018 + IDLE_VX * 0.4 : IDLE_VX
    const targetVy = h.active ? h.dx * 0.0018 + IDLE_VY * 0.4 : IDLE_VY

    vx.current += (targetVx - vx.current) * 0.08
    vy.current += (targetVy - vy.current) * 0.08

    meshRef.current.rotation.x += vx.current
    meshRef.current.rotation.y += vy.current

    // Decay mouse delta so cube coasts to a stop if cursor is stationary
    h.dx *= 0.82
    h.dy *= 0.82
  })

  return (
    <mesh
      ref={meshRef}
      material={materials}
      onPointerEnter={() => {
        hover.current.active = true
      }}
      onPointerLeave={() => {
        hover.current.active = false
        hover.current.hasHit = false
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        hover.current.dx = e.nativeEvent.movementX
        hover.current.dy = e.nativeEvent.movementY
        hover.current.hitX = e.point.x
        hover.current.hitY = e.point.y
        hover.current.hitZ = e.point.z
        hover.current.hasHit = true
      }}
    >
      <boxGeometry args={[1.6, 1.6, 1.6]} />
    </mesh>
  )
}

// ── Pixel fragment particle system ─────────────────────────────────────────────
interface Particle {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  life: number; maxLife: number
  active: boolean
}

// Fragment shader renders every gl.POINT as a solid square (no circle discard),
// with per-particle alpha fed through a custom attribute.
// INK #0F0F0F → vec3(0.059, 0.059, 0.059) — dark on parchment background = visible
const VERT = `
  attribute float alpha;
  varying float vAlpha;
  void main() {
    vAlpha = alpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 6.0;
  }
`
const FRAG = `
  varying float vAlpha;
  void main() {
    if (vAlpha < 0.02) discard;
    gl_FragColor = vec4(0.059, 0.059, 0.059, vAlpha);
  }
`

function Fragments({ hover }: { hover: React.MutableRefObject<HoverState> }) {
  const spawnAccum = useRef(0)

  const particles = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 0, maxLife: 60,
      active: false,
    })),
  )

  // Build the Points object imperatively so <primitive> can own it cleanly.
  const { points, positions, alphas } = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3)
    const alphas = new Float32Array(MAX_PARTICLES)
    // Park inactive particles off-screen so they never flash on first frame
    for (let i = 0; i < MAX_PARTICLES; i++) positions[i * 3 + 2] = -1000

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1))

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    })

    return { points: new THREE.Points(geo, mat), positions, alphas }
  }, [])

  useFrame(() => {
    const h = hover.current
    const ps = particles.current

    // Spawn new fragments at the cursor's hit point on the cube surface
    if (h.active && h.hasHit) {
      spawnAccum.current += 5
      while (spawnAccum.current >= 1) {
        spawnAccum.current -= 1
        const p = ps.find((p) => !p.active)
        if (!p) break

        // Tight spread around the exact cursor position on the face
        const spread = 0.12
        p.x = h.hitX + (Math.random() - 0.5) * spread
        p.y = h.hitY + (Math.random() - 0.5) * spread
        p.z = h.hitZ + (Math.random() - 0.5) * spread

        // Velocity: outward along the face normal (hit point / CUBE_HALF ≈ normal)
        // + small random scatter for a crumbling pixel look
        const speed = 0.018 + Math.random() * 0.024
        const nx = h.hitX / CUBE_HALF
        const ny = h.hitY / CUBE_HALF
        const nz = h.hitZ / CUBE_HALF
        p.vx = nx * speed + (Math.random() - 0.5) * 0.012
        p.vy = ny * speed + (Math.random() - 0.5) * 0.012
        p.vz = nz * speed + (Math.random() - 0.5) * 0.012

        p.life = 0
        p.maxLife = 30 + Math.floor(Math.random() * 50)
        p.active = true
      }
    }

    // Integrate and write to buffers
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = ps[i]

      if (!p.active) {
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = -1000
        alphas[i] = 0
        continue
      }

      p.life++
      p.x += p.vx
      p.y += p.vy
      p.z += p.vz
      p.vx *= 0.96
      p.vy *= 0.96
      p.vz *= 0.96
      p.vy -= 0.0008 // slight downward drift

      const t = p.life / p.maxLife
      alphas[i] = 1 - t

      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z

      if (p.life >= p.maxLife) p.active = false
    }

    const geo = points.geometry as THREE.BufferGeometry
    ;(geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true
    ;(geo.getAttribute("alpha") as THREE.BufferAttribute).needsUpdate = true
  })

  return <primitive object={points} />
}

// ── Scene root ─────────────────────────────────────────────────────────────────
function Scene() {
  const hover = useRef<HoverState>({ active: false, hasHit: false, dx: 0, dy: 0, hitX: 0, hitY: 0, hitZ: 0 })
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-2, 3, 2]} intensity={0.8} />
      <Cube hover={hover} />
      <Fragments hover={hover} />
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
