import { Canvas, useFrame } from "@react-three/fiber";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Points } from "three";
import { useLocation } from "react-router-dom";
import { useMemoryStore } from "../store/useMemoryStore";

function seeded(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function ParticleField({ count, spread, size, opacity, color, drift }: { count: number; spread: [number, number, number]; size: number; opacity: number; color: string; drift: number }) {
  const ref = useRef<Points>(null);
  const ambient = useMemoryStore((state) => state.ambient);
  const animation = useMemoryStore((state) => state.animation);
  const ambientLevel = ambient / 100;
  const animationLevel = animation / 100;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (seeded(i + 1) - 0.5) * spread[0];
      values[i * 3 + 1] = (seeded(i + 2) - 0.5) * spread[1];
      values[i * 3 + 2] = (seeded(i + 3) - 0.5) * spread[2];
    }
    return values;
  }, [count, spread]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * drift * (0.35 + ambientLevel) * (0.35 + animationLevel * 1.8);
    ref.current.rotation.x += delta * drift * 0.28 * (0.4 + animationLevel);
  });

  return (
    <points ref={ref} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color={color}
        size={size + ambientLevel * size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity + ambientLevel * opacity}
      />
    </points>
  );
}

export function AmbientField() {
  const location = useLocation();
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const routeTone = location.pathname.includes("timeline")
    ? "timeline"
    : location.pathname.includes("developer") || location.pathname.includes("system")
      ? "system"
      : location.pathname.includes("sync")
        ? "sync"
        : "memory";

  useEffect(() => {
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCursor({
          x: (event.clientX / window.innerWidth - 0.5) * 2,
          y: (event.clientY / window.innerHeight - 0.5) * 2
        });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      className={`ambient-field ambient-${routeTone} pointer-events-none fixed inset-0 z-0`}
      style={{
        "--cursor-x": cursor.x,
        "--cursor-y": cursor.y
      } as CSSProperties}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 70 }}>
        <ParticleField count={900} spread={[12, 8, 8]} size={0.008} opacity={0.2} color="#62f0ff" drift={0.006} />
        <ParticleField count={260} spread={[18, 10, 10]} size={0.02} opacity={0.05} color="#ffc86a" drift={-0.003} />
      </Canvas>
      <div className="nebula-layer nebula-a absolute inset-[-10%]" />
      <div className="nebula-layer nebula-b absolute inset-[-14%]" />
      <div className="memory-fragments absolute inset-0" />
      <div className="tactical-grid absolute inset-0" />
      <div className="scanline absolute inset-0" />
    </div>
  );
}
