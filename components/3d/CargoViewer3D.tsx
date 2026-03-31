'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Types (mirrored from optimizer page) ───────────────── */
export interface PlacedBox {
  uid: string;
  cargoId: number;
  name: string;
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  colorIdx: number;
  instance: number;
}

export interface ContainerDims {
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
}

export interface CoGPoint {
  x: number; y: number; z: number;
}

/* ─── Color palette ──────────────────────────────────────── */
const BOX_COLORS = [
  '#60a5fa', '#34d399', '#c084fc', '#fb923c',
  '#f472b6', '#fbbf24', '#38bdf8', '#a3e635',
];

/* ─── Single box mesh ────────────────────────────────────── */
function CargoBox({
  box,
  containerH,
  scale,
  onHover,
  onLeave,
  isHovered,
}: {
  box: PlacedBox;
  containerH: number;
  scale: number;
  onHover: (box: PlacedBox | null) => void;
  onLeave: () => void;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const edgesRef = useRef<THREE.LineSegments>(null!);

  const color = BOX_COLORS[box.colorIdx % BOX_COLORS.length];

  // Center position (Three.js BoxGeometry is centered on its origin)
  const cx = (box.x + box.w / 2) * scale;
  const cy = (box.y + box.h / 2) * scale;
  const cz = -(box.z + box.d / 2) * scale; // flip z so front faces camera

  const sw = box.w * scale;
  const sh = box.h * scale;
  const sd = box.d * scale;

  const geo = useMemo(() => new THREE.BoxGeometry(sw, sh, sd), [sw, sh, sd]);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame(() => {
    if (meshRef.current) {
      const target = isHovered ? 1.04 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
    }
  });

  return (
    <group position={[cx, cy, cz]}>
      <mesh
        ref={meshRef}
        geometry={geo}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(box); }}
        onPointerLeave={() => onLeave()}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.95 : 0.82}
          roughness={0.35}
          metalness={0.08}
          envMapIntensity={0.5}
        />
      </mesh>
      <lineSegments ref={edgesRef} geometry={edgesGeo}>
        <lineBasicMaterial color={isHovered ? '#ffffff' : '#000000'} transparent opacity={isHovered ? 1 : 0.2} linewidth={1} />
      </lineSegments>
    </group>
  );
}

/* ─── Container wireframe ────────────────────────────────── */
function ContainerFrame({ dims, scale }: { dims: ContainerDims; scale: number }) {
  const { width: W, height: H, depth: D } = dims;
  const sw = W * scale, sh = H * scale, sd = D * scale;

  const geo = useMemo(() => {
    const box = new THREE.BoxGeometry(sw, sh, sd);
    return new THREE.EdgesGeometry(box);
  }, [sw, sh, sd]);

  return (
    <group position={[sw / 2, sh / 2, -sd / 2]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

/* ─── Floor plane ────────────────────────────────────────── */
function FloorPlane({ dims, scale }: { dims: ContainerDims; scale: number }) {
  const sw = dims.width * scale;
  const sd = dims.depth * scale;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sw / 2, 0, -sd / 2]} receiveShadow>
      <planeGeometry args={[sw, sd]} />
      <meshStandardMaterial color="#1e293b" transparent opacity={0.6} roughness={1} />
    </mesh>
  );
}

/* ─── CoG sphere ─────────────────────────────────────────── */
function CoGMarker({ cog, scale }: { cog: CoGPoint; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = cog.y * scale + Math.sin(clock.elapsedTime * 2) * 0.015;
    }
  });
  return (
    <mesh ref={meshRef} position={[cog.x * scale, cog.y * scale, -cog.z * scale]} castShadow>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

/* ─── Scene ──────────────────────────────────────────────── */
function Scene({
  placed,
  container,
  cog,
  scale,
}: {
  placed: PlacedBox[];
  container: ContainerDims;
  cog: CoGPoint | null;
  scale: number;
}) {
  const [hoveredBox, setHoveredBox] = useState<PlacedBox | null>(null);

  const sw = container.width * scale;
  const sh = container.height * scale;
  const sd = container.depth * scale;

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[sw * 2, sh * 3, sd * 2]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-sw, sh, -sd]} intensity={0.35} />
      <pointLight position={[sw / 2, sh * 2, -sd / 2]} intensity={0.25} color="#60a5fa" />

      {/* Floor */}
      <FloorPlane dims={container} scale={scale} />

      {/* Grid */}
      <Grid
        position={[sw / 2, 0.001, -sd / 2]}
        args={[sw, sd]}
        cellSize={0.3}
        cellThickness={0.4}
        cellColor="#334155"
        sectionSize={0.9}
        sectionThickness={0.8}
        sectionColor="#475569"
        fadeDistance={20}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Container frame */}
      <ContainerFrame dims={container} scale={scale} />

      {/* Cargo boxes */}
      {placed.map((box) => (
        <CargoBox
          key={box.uid}
          box={box}
          containerH={container.height}
          scale={scale}
          onHover={setHoveredBox}
          onLeave={() => setHoveredBox(null)}
          isHovered={hoveredBox?.uid === box.uid}
        />
      ))}

      {/* Tooltip */}
      {hoveredBox && (() => {
        const hb = hoveredBox;
        const tx = (hb.x + hb.w / 2) * scale;
        const ty = (hb.y + hb.h) * scale + 0.05;
        const tz = -(hb.z + hb.d / 2) * scale;
        return (
          <Html position={[tx, ty, tz]} center distanceFactor={6} zIndexRange={[100, 0]}>
            <div className="bg-gray-900/95 border border-white/10 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap backdrop-blur">
              <p className="font-bold">{hb.name} #{hb.instance}</p>
              <p className="text-gray-400 font-mono mt-0.5">{hb.w}×{hb.h}×{hb.d} cm</p>
              <p className="text-gray-400 font-mono">x:{hb.x} y:{hb.y} z:{hb.z}</p>
            </div>
          </Html>
        );
      })()}

      {/* CoG */}
      {cog && <CoGMarker cog={cog} scale={scale} />}

      {/* Orbit controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={0.5}
        maxDistance={15}
        target={[sw / 2, sh / 3, -sd / 2]}
      />
    </>
  );
}

/* ─── Camera setup ───────────────────────────────────────── */
function CameraSetup({ dims, scale }: { dims: ContainerDims; scale: number }) {
  const { camera } = useThree();
  const sw = dims.width * scale;
  const sh = dims.height * scale;
  const sd = dims.depth * scale;

  useMemo(() => {
    const dist = Math.max(sw, sh, sd) * 1.6;
    camera.position.set(sw * 0.8 + dist * 0.4, sh * 0.8 + dist * 0.3, dist * 0.6);
    camera.lookAt(sw / 2, sh / 3, -sd / 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.width, dims.height, dims.depth]);

  return null;
}

/* ─── Main export ────────────────────────────────────────── */
export default function CargoViewer3D({
  placed,
  container,
  cog,
}: {
  placed: PlacedBox[];
  container: ContainerDims;
  cog?: CoGPoint | null;
}) {
  // Normalize scale so largest dimension ≈ 3 units
  const maxDim = Math.max(container.width, container.height, container.depth);
  const scale = 3 / maxDim;

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
        camera={{ fov: 45, near: 0.01, far: 100 }}
      >
        <CameraSetup dims={container} scale={scale} />
        <Scene placed={placed} container={container} cog={cog ?? null} scale={scale} />
      </Canvas>
    </div>
  );
}
