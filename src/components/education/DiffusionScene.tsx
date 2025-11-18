'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Stars, Line, Html, OrbitControls, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- Data (Chronological Order) ---
const SCHOOLS = [
    {
        id: 'smp',
        name: 'SMP Negeri 08 Tangsel',
        program: 'Junior High',
        period: '2016-2019',
        coords: [106.6916, -6.3150],
        position: [-4, -3, 2], 
        color: '#fbbf24',
        description: 'Base parameter setup.'
    },
    {
        id: 'cmb',
        name: 'SMA Cahaya Madani',
        program: 'Science & STEM',
        period: '2019-2022',
        coords: [106.1093, -6.1200],
        position: [-2, -1, 5],
        color: '#34d399',
        description: 'Initial weights initialization & Algorithmic foundations.'
    },
    {
        id: 'uad',
        name: 'Universitas Ahmad Dahlan',
        program: 'Informatics (AI Focus)',
        period: '2022-2028',
        coords: [110.3695, -7.7956],
        position: [3, 2, 3],
        color: '#22d3ee',
        description: 'Fine-tuning Deep Learning architectures & Computer Vision.'
    },
    {
        id: 'ump',
        name: 'Universiti Malaysia Pahang',
        program: 'Software Engineering',
        period: '2024-2025',
        coords: [103.3256, 3.5437],
        position: [6, 4, -1],
        color: '#a855f7',
        description: 'Cross-border Transfer Learning & Large Scale Systems.'
    }
];

// --- Components ---

interface BrainParticlesProps {
  count?: number;
  isHovered: boolean;
}

function BrainParticles({ count = 6000, isHovered }: BrainParticlesProps) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Brain shape logic (Ellipsoids)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.cbrt(Math.random());
      
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);

      x *= 2.5; y *= 2.0; z *= 3.0; // Compact brain size

      if (x > 0) x += 0.1;
      if (x < 0) x -= 0.1;

      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      randoms[i3] = Math.random();
      randoms[i3+1] = Math.random();
      randoms[i3+2] = Math.random();

      const c = new THREE.Color();
      c.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6); // Cyan-Blue-Purple
      
      colors[i3] = c.r;
      colors[i3+1] = c.g;
      colors[i3+2] = c.b;
    }
    return { positions, colors, randoms };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes.position.array as Float32Array;
    const rands = particles.randoms;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const intensity = isHovered ? 0.015 : 0.003;
        
        // Neural Jitter
        pos[i3] += Math.sin(t * 3 + rands[i3] * 10) * intensity;
        pos[i3+1] += Math.cos(t * 2 + rands[i3+1] * 10) * intensity;
        pos[i3+2] += Math.sin(t * 4 + rands[i3+2] * 10) * intensity;

        // Elastic return
        const ox = particles.positions[i3];
        const oy = particles.positions[i3+1];
        const oz = particles.positions[i3+2];
        
        pos[i3] += (ox - pos[i3]) * 0.1;
        pos[i3+1] += (oy - pos[i3+1]) * 0.1;
        pos[i3+2] += (oz - pos[i3+2]) * 0.1;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
      </bufferGeometry>
      <PointMaterial transparent vertexColors size={0.04} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.6} />
    </points>
  );
}

// Connects schools in sequence: SMP -> SMA -> UAD -> UMP
function JourneyPath() {
    const points = useMemo(() => {
        return SCHOOLS.map(s => new THREE.Vector3(...s.position));
    }, []);

    const curve = useMemo(() => {
        // Create a smooth curve passing through all school points
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    }, [points]);

    // Create gradient line geometry
    const lineGeometry = useMemo(() => {
        const curvePoints = curve.getPoints(100);
        return new THREE.BufferGeometry().setFromPoints(curvePoints);
    }, [curve]);

    return (
        <group>
            {/* The Path Line */}
            <line>
                <primitive object={lineGeometry} attach="geometry" />
                <lineBasicMaterial color="#ffffff" opacity={0.15} transparent linewidth={1} />
            </line>
            
            {/* Flowing Data Particles along the path */}
            <DataFlowParticles curve={curve} count={20} />
        </group>
    );
}

function DataFlowParticles({ curve, count }: { curve: THREE.CatmullRomCurve3; count: number }) {
    const particles = useRef<THREE.Points>(null);
    
    // Initial random positions along the curve (0..1)
    const progress = useMemo(() => new Float32Array(count).map(() => Math.random()), [count]);

    useFrame((state) => {
        if (!particles.current) return;
        const positions = particles.current.geometry.attributes.position.array as Float32Array;
        
        for(let i=0; i<count; i++) {
            // Move progress forward
            progress[i] += 0.002; // Speed
            if(progress[i] > 1) progress[i] = 0;

            // Get point on curve
            const point = curve.getPoint(progress[i]);
            positions[i*3] = point.x;
            positions[i*3+1] = point.y;
            positions[i*3+2] = point.z;
        }
        particles.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={particles}>
            <bufferGeometry>
                <bufferAttribute 
                    attach="attributes-position" 
                    args={[new Float32Array(count * 3), 3]}
                />
            </bufferGeometry>
            <PointMaterial 
                color="#22d3ee" 
                size={0.15} 
                transparent 
                opacity={0.8} 
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function SchoolNode({ data, onSelect, isSelected, index }: { data: any; onSelect: (data: any) => void; isSelected: boolean; index: number }) {
    const [hovered, setHover] = useState(false);
    
    return (
        <group position={data.position}>
            {/* Connection to previous node (Straight line segment) */}
            {index > 0 && (
                <Line 
                    points={[ [0,0,0], new THREE.Vector3(...SCHOOLS[index-1].position).sub(new THREE.Vector3(...data.position)) ]}
                    color={data.color}
                    lineWidth={1}
                    opacity={0.1}
                    transparent
                />
            )}

            {/* Node Sphere */}
            <mesh 
                onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <sphereGeometry args={[isSelected || hovered ? 0.3 : 0.15, 32, 32]} />
                <meshStandardMaterial 
                    color={data.color} 
                    emissive={data.color}
                    emissiveIntensity={isSelected || hovered ? 2 : 0.8}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Label */}
            <Html 
                position={[0, 0.4, 0]} 
                center 
                distanceFactor={12}
                style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
                zIndexRange={[100, 0]}
            >
                <div 
                    className={`
                        flex flex-col items-center transition-all duration-300
                        ${isSelected || hovered ? 'opacity-100 scale-110' : 'opacity-70 scale-90'}
                    `}
                >
                    <div 
                        className="px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 bg-black/60 flex items-center gap-2 cursor-pointer pointer-events-auto"
                        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                        style={{ borderColor: isSelected ? data.color : 'rgba(255,255,255,0.1)' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: data.color }} />
                        <span className="text-xs font-bold text-white font-mono">{data.name}</span>
                    </div>
                    {/* Year Tag */}
                    <div className="mt-1 text-[8px] text-gray-400 font-mono bg-black/40 px-1 rounded">
                        {data.period}
                    </div>
                </div>
            </Html>

            {/* Synapse to Brain Center when selected */}
            {isSelected && (
                <ActiveSynapse color={data.color} />
            )}
        </group>
    );
}

function ActiveSynapse({ color }: { color: string }) {
    const lineRef = useRef<THREE.Line>(null);
    // Allocate buffer for 2 points (start and end)
    const positions = useMemo(() => new Float32Array(6), []);

    useFrame((state) => {
        if (lineRef.current && lineRef.current.parent) {
             const parent = lineRef.current.parent;
             
             // Start point is always (0,0,0) in local space (the Node itself)
             positions[0] = 0;
             positions[1] = 0;
             positions[2] = 0;

             // End point is World (0,0,0) transformed into Local Space
             // We use a temp vector to avoid allocations
             const target = new THREE.Vector3(0,0,0);
             parent.worldToLocal(target);
             
             positions[3] = target.x;
             positions[4] = target.y;
             positions[5] = target.z;
             
             // Update geometry
             lineRef.current.geometry.attributes.position.needsUpdate = true;
             
             // Pulse animation
             const mat = lineRef.current.material as THREE.LineBasicMaterial;
             mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.4;
        }
    });

    return (
        // @ts-ignore
        <line ref={lineRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={0.8} linewidth={2} />
        </line>
    );
}

function HolographicEarth({ coords, isVisible }: { coords: number[]; isVisible: boolean }) {
    const earthRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.005;
        }
    });

    const lat = coords[1];
    const lon = coords[0];
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = 1.2;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = (r * Math.sin(phi) * Math.sin(theta));
    const y = (r * Math.cos(phi));

    return (
        <group position={[5, -2.5, 0]} scale={isVisible ? 1 : 0} visible={isVisible}>
            <group ref={earthRef}>
                <Sphere args={[1, 32, 32]}>
                    <meshBasicMaterial color="#0f172a" wireframe transparent opacity={0.2} />
                </Sphere>
                <Sphere args={[0.95, 32, 32]}>
                    <meshBasicMaterial color="#000" transparent opacity={0.9} />
                </Sphere>
                <mesh position={[x, y, z]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="#ef4444" />
                </mesh>
                <pointLight position={[x*1.5, y*1.5, z*1.5]} color="#ef4444" intensity={2} distance={2} />
            </group>
            <Html position={[0, -1.5, 0]} center transform={false}>
                <div className="text-[10px] font-mono text-cyan-500 tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-cyan-500/30">
                    GEOLOCATION_LOCKED
                </div>
            </Html>
        </group>
    );
}

// Main Scene Container that rotates slowly
function SchoolConstellation({ children }: { children: React.ReactNode }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            // Slow rotation of the entire school system to show 3D depth
            ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
        }
    });
    return <group ref={ref}>{children}</group>;
}

export default function DiffusionScene({ onSchoolSelect }: { onSchoolSelect: (school: any) => void }) {
  const [selectedSchool, setSelected] = useState<any>(null);
  
  const handleSelect = (school: any) => {
      if (selectedSchool?.id === school.id) {
          setSelected(null);
          onSchoolSelect(null);
      } else {
          setSelected(school);
          onSchoolSelect(school);
      }
  };

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#030305']} />
        <fog attach="fog" args={['#030305', 10, 40]} />
        
        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={!selectedSchool} 
            autoRotateSpeed={0.5}
            dampingFactor={0.1}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
        />

        <group>
            {/* Central Brain */}
            <BrainParticles count={8000} isHovered={!!selectedSchool} />
            
            {/* School System */}
            <SchoolConstellation>
                <JourneyPath />
                {SCHOOLS.map((school, index) => (
                    <SchoolNode 
                        key={school.id} 
                        data={school} 
                        index={index}
                        isSelected={selectedSchool?.id === school.id}
                        onSelect={handleSelect}
                    />
                ))}
            </SchoolConstellation>
        </group>

        {selectedSchool && (
            <HolographicEarth coords={selectedSchool.coords} isVisible={true} />
        )}

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
      </Canvas>
    </div>
  );
}
