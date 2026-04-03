'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Types ────────────────────────────────────────────────── */
export interface DepotCargoItem {
  id: string;
  name: string;
  type: string;
  weight: number;
  status: string;
}

/* ─── Constants ────────────────────────────────────────────── */
const SLOT  = 0.88;   // box size
const GAP   = 0.14;   // gap between boxes
const STEP  = SLOT + GAP;

const STATUS_COLOR: Record<string, string> = {
  depolarda: '#3b82f6',
  çıkışta:   '#f97316',
  beklemede: '#94a3b8',
};

function gridDims(capacity: number) {
  const cols = Math.max(2, Math.ceil(Math.sqrt(capacity * 1.4)));
  const rows = Math.ceil(capacity / cols);
  return { cols, rows };
}

/* ─── Single slot box ──────────────────────────────────────── */
function SlotBox({
  position,
  item,
  slotKey,
  hovered,
  onEnter,
  onLeave,
}: {
  position: [number, number, number];
  item: DepotCargoItem | null;
  slotKey: string;
  hovered: string | null;
  onEnter: (key: string) => void;
  onLeave: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const isHovered = hovered === slotKey;
  const filled = item !== null;

  const geo     = useMemo(() => new THREE.BoxGeometry(SLOT, SLOT, SLOT), []);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame(() => {
    if (!meshRef.current || !filled) return;
    const t = isHovered ? 1.08 : 1.0;
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(s + (t - s) * 0.18);
  });

  if (!filled) {
    return (
      <mesh position={position} geometry={geo}>
        <meshBasicMaterial color="#1e3a5f" wireframe transparent opacity={0.25} />
      </mesh>
    );
  }

  const color = STATUS_COLOR[item!.status] ?? '#3b82f6';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geo}
        castShadow
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onEnter(slotKey); }}
        onPointerLeave={onLeave}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.97 : 0.82}
          roughness={0.28}
          metalness={0.1}
        />
      </mesh>

      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial
          color={isHovered ? '#ffffff' : '#000000'}
          transparent
          opacity={isHovered ? 0.9 : 0.12}
        />
      </lineSegments>

      {isHovered && (
        <Html
          center
          distanceFactor={5}
          zIndexRange={[100, 0]}
          position={[0, SLOT * 0.75, 0]}
        >
          <div className="bg-gray-900/95 border border-white/10 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-xl pointer-events-none whitespace-nowrap backdrop-blur-sm">
            <p className="font-bold text-sm mb-0.5">{item!.name}</p>
            <p className="text-gray-400">{item!.type} · {item!.weight} kg</p>
            <p className={`mt-1 font-semibold text-xs ${
              item!.status === 'depolarda'  ? 'text-blue-400' :
              item!.status === 'çıkışta'   ? 'text-orange-400' :
                                              'text-gray-400'
            }`}>
              {item!.status}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Scene ─────────────────────────────────────────────────── */
function Scene({ capacity, cargo }: { capacity: number; cargo: DepotCargoItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { cols, rows } = gridDims(capacity);

  const slots = useMemo(() => {
    const list: { pos: [number, number, number]; item: DepotCargoItem | null; key: string }[] = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx >= capacity) break;
        list.push({
          pos: [c * STEP, SLOT / 2, -r * STEP],
          item: cargo[idx] ?? null,
          key:  `${r}-${c}`,
        });
        idx++;
      }
    }
    return list;
  }, [capacity, cargo, cols, rows]);

  const tw = (cols - 1) * STEP;  // total width span
  const td = (rows - 1) * STEP;  // total depth span
  const cx = tw / 2;
  const cz = -td / 2;

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[tw * 1.5, 8, td * 1.5]} intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-tw, 5, -td]} intensity={0.3} />
      <pointLight position={[cx, 4, cz]} intensity={0.25} color="#60a5fa" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.01, cz]} receiveShadow>
        <planeGeometry args={[tw + STEP * 1.4, td + STEP * 1.4]} />
        <meshStandardMaterial color="#0c1628" roughness={1} />
      </mesh>

      {/* Grid */}
      <Grid
        position={[cx, 0, cz]}
        args={[tw + STEP * 1.4, td + STEP * 1.4]}
        cellSize={STEP}
        cellThickness={0.3}
        cellColor="#1e3a5f"
        sectionSize={STEP * 3}
        sectionThickness={0.6}
        sectionColor="#2563eb22"
        fadeDistance={30}
        infiniteGrid={false}
      />

      {/* Slots */}
      {slots.map(({ pos, item, key }) => (
        <SlotBox
          key={key}
          position={pos}
          item={item}
          slotKey={key}
          hovered={hovered}
          onEnter={setHovered}
          onLeave={() => setHovered(null)}
        />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={1}
        maxDistance={28}
        target={[cx, 0, cz]}
      />
    </>
  );
}

/* ─── Camera init ──────────────────────────────────────────── */
function getCameraPos(capacity: number) {
  const { cols, rows } = gridDims(capacity);
  const tw = (cols - 1) * STEP;
  const td = (rows - 1) * STEP;
  const dist = Math.max(tw, td) * 1.2 + 4;
  return [tw / 2 + dist * 0.35, dist * 0.55, td / 2 + dist * 0.55] as [number, number, number];
}

/* ─── Legend ────────────────────────────────────────────────── */
function Legend({ filled, capacity }: { filled: number; capacity: number }) {
  const pct = Math.round((filled / Math.max(capacity, 1)) * 100);
  const bar  = pct >= 90 ? 'bg-red-500' : pct >= 65 ? 'bg-amber-400' : 'bg-blue-500';

  return (
    <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white space-y-2 pointer-events-none">
      {/* Fill bar */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 w-12">Doluluk</span>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="font-bold w-8 text-right">{pct}%</span>
      </div>
      {/* Status key */}
      <div className="flex items-center gap-3">
        {[
          { label: 'Depolarda', color: '#3b82f6' },
          { label: 'Çıkışta',   color: '#f97316' },
          { label: 'Beklemede', color: '#94a3b8' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-gray-300">{label}</span>
          </div>
        ))}
      </div>
      <div className="text-gray-500 text-[10px]">
        {filled} / {capacity} kapasite · hover ile detay
      </div>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────── */
export default function DepotViewer3D({
  capacity,
  cargo,
}: {
  capacity: number;
  cargo: DepotCargoItem[];
}) {
  const camPos = useMemo(() => getCameraPos(capacity), [capacity]);

  return (
    <div className="relative w-full" style={{ height: 380 }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)' }}
        camera={{ fov: 42, near: 0.01, far: 100, position: camPos }}
      >
        <Scene capacity={capacity} cargo={cargo} />
      </Canvas>

      <Legend filled={cargo.length} capacity={capacity} />
    </div>
  );
}
