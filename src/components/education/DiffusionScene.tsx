'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Stars, Line, Html, OrbitControls, Sphere, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';

// --- Types ---
export interface Certificate {
  id: string;
  title: string;
  date: string;
  image: string;
  link: string;
}

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

// Advanced Perlin-like noise for organic brain folds
function simpleNoise(x: number, y: number, z: number) {
    return Math.sin(x) * Math.cos(y) * Math.sin(z);
}

function BrainParticles({ count = 15000, isHovered }: BrainParticlesProps) {
  const mesh = useRef<THREE.Points>(null);
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null);

  // 1. Generate Main Cortex Cloud
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Rejection sampling for brain volume
      let x = 0, y = 0, z = 0, d = 100;
      // Loop until we find a point inside our "Brain Shape"
      while (true) {
         x = Math.random() * 2 - 1;
         y = Math.random() * 2 - 1;
         z = Math.random() * 2 - 1;
         
         // Base Ellipsoid
         d = x*x*0.5 + y*y + z*z*0.8;
         
         // Reject if outside base
         if (d > 1) continue;

         // Brain Sculpting Logic
         // 1. Hemisphere Split (Sagittal fissure)
         if (Math.abs(x) < 0.05) continue; 

         // 2. Flatten Bottom (Base of brain)
         if (y < -0.6) continue;

         // 3. Cerebellum tuck (Back bottom)
         if (z < -0.4 && y < -0.2) {
            if (x*x + (y+0.4)*(y+0.4) + (z+0.6)*(z+0.6) > 0.4) continue;
         }

         // 4. Temporal Lobes (Side bulges)
         // Make sides slightly fatter
         if (y < 0 && z > -0.2 && z < 0.5) {
             // Keep these points
         } else {
             // Slight narrowing for frontal/parietal
             if (Math.abs(x) > 0.8) continue; 
         }
         
         break; // Point accepted
      }

      // Apply Gyri/Sulci (Wrinkles)
      // We displace points based on noise to create "folds"
      const freq = 8.0;
      const noiseVal = simpleNoise(x * freq, y * freq, z * freq);
      const displacement = 1 + noiseVal * 0.1;
      
      // Hemisphere gap separation visual
      const hemiSep = x > 0 ? 0.1 : -0.1;

      // Apply scaling
      const scale = 2.2;
      const finalX = (x * displacement + hemiSep) * scale;
      const finalY = (y * displacement) * scale;
      const finalZ = (z * displacement) * scale;

      const i3 = i * 3;
      positions[i3] = finalX;
      positions[i3 + 1] = finalY;
      positions[i3 + 2] = finalZ;

      // Color Mapping: Complex Red/Pink/White Gradient
      // Core: Dark Red (#7f1d1d)
      // Surface: Pink (#f472b6)
      // Activity: White/Cyan
      
      const distFromCenter = Math.sqrt(x*x + y*y + z*z);
      const c = new THREE.Color();
      
      if (Math.random() > 0.97) {
           // "Firing" Neuron (Cyan/White)
           c.setHex(0x22d3ee);
      } else {
           // Organic Gradient
           const tissueDark = new THREE.Color('#9f1239'); // Rose 800
           const tissueLight = new THREE.Color('#f472b6'); // Pink 400
           c.lerpColors(tissueDark, tissueLight, distFromCenter * 0.8 + Math.random() * 0.2);
      }
      
      colors[i3] = c.r;
      colors[i3+1] = c.g;
      colors[i3+2] = c.b;

      randoms[i3] = Math.random();
      randoms[i3+1] = Math.random();
      randoms[i3+2] = Math.random();
    }
    return { positions, colors, randoms };
  }, [count]);

  // 2. Generate Synapse Lines (The "Complex" Network)
  // We pick a subset of particles to connect
  const network = useMemo(() => {
      const pointsCount = 200; // Connect 200 random points
      const indices = new Uint16Array(pointsCount * 2); // Line segments
      const linePos = new Float32Array(pointsCount * 3); // Positions
      
      // Pick random points from the main cloud
      for(let i=0; i<pointsCount; i++) {
          const pickIndex = Math.floor(Math.random() * count);
          linePos[i*3] = particles.positions[pickIndex*3];
          linePos[i*3+1] = particles.positions[pickIndex*3+1];
          linePos[i*3+2] = particles.positions[pickIndex*3+2];
          
          // Connect to next point (creating a chain)
          if (i < pointsCount - 1) {
              indices[i*2] = i;
              indices[i*2+1] = i+1;
          }
      }
      return { positions: linePos, indices };
  }, [particles, count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes.position.array as Float32Array;
    const cols = mesh.current.geometry.attributes.color.array as Float32Array;
    
    // Pulse Animation
    // Waves of activity passing through Z axis
    const waveZ = Math.sin(t * 2) * 3;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const z = pos[i3+2];
        
        // Neuron Firing Logic
        // If point is near the wave Z plane, brighten it
        const distToWave = Math.abs(z - waveZ);
        if (distToWave < 0.5) {
            // Flash color
            if (Math.random() > 0.9) {
                cols[i3] = 1;   // R
                cols[i3+1] = 1; // G
                cols[i3+2] = 1; // B
            }
        } else {
            // Return to base color slowly (decay)
            // This is hard without storing base colors, so we just re-compute or keep static
            // Optimization: Just dynamic jitter
        }
        
        // Micro-jitter for "Alive" feeling
        if (isHovered) {
            pos[i3] += (Math.random() - 0.5) * 0.005;
            pos[i3+1] += (Math.random() - 0.5) * 0.005;
            pos[i3+2] += (Math.random() - 0.5) * 0.005;
        }
    }
    mesh.current.geometry.attributes.color.needsUpdate = true;
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
        {/* The Dense Particle Brain */}
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.positions.length / 3} array={particles.positions} itemSize={3} args={[particles.positions, 3]} />
                <bufferAttribute attach="attributes-color" count={particles.colors.length / 3} array={particles.colors} itemSize={3} args={[particles.colors, 3]} />
            </bufferGeometry>
            <PointMaterial 
                transparent 
                vertexColors 
                size={0.025} 
                sizeAttenuation={true} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
                opacity={0.6} 
            />
        </points>

        {/* Synapse Network Lines (The "Complex" part) */}
        <line>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={network.positions.length / 3} array={network.positions} itemSize={3} args={[network.positions, 3]} />
                <bufferAttribute attach="index" count={network.indices.length} array={network.indices} itemSize={1} args={[network.indices, 1]} />
            </bufferGeometry>
            <lineBasicMaterial color="#f472b6" transparent opacity={0.2} linewidth={1} />
        </line>
    </group>
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
    const bufferPositions = useMemo(() => new Float32Array(count * 3), [count]);

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
                    count={count}
                    array={bufferPositions}
                    itemSize={3}
                    args={[bufferPositions, 3]}
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

function SchoolNode({ data, onSelect, isSelected, index }: { 
    data: typeof SCHOOLS[0]; 
    onSelect: (data: typeof SCHOOLS[0]) => void; 
    isSelected: boolean; 
    index: number 
}) {
    const [hovered, setHover] = useState(false);
    
    return (
        <group position={data.position as [number, number, number]}>
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
        </group>
    );
}

function CertificateCluster({ certificates, onSelect }: { certificates: Certificate[]; onSelect?: (cert: Certificate) => void }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Rotate the entire cluster slowly
            groupRef.current.rotation.y = -state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {certificates.map((cert, i) => {
                // Fibonacci Sphere Distribution
                const phi = Math.acos(1 - 2 * (i + 0.5) / certificates.length);
                const theta = Math.PI * (1 + 5**0.5) * (i + 0.5);
                
                const r = 12; // Radius of the certificate cloud (slightly larger to clear new brain)
                
                const x = r * Math.sin(phi) * Math.cos(theta);
                const y = r * Math.sin(phi) * Math.sin(theta);
                const z = r * Math.cos(phi);

                return (
                    <CertificateNode 
                        key={cert.id} 
                        cert={cert} 
                        position={[x, y, z]} 
                        onSelect={onSelect}
                    />
                );
            })}
        </group>
    );
}

function CertificateNode({ cert, position, onSelect }: { cert: Certificate; position: [number, number, number]; onSelect?: (cert: Certificate) => void }) {
    const [hovered, setHover] = useState(false);
    const [visible, setVisible] = useState(false);
    const meshRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (meshRef.current) {
            // Check distance to camera
            const distance = camera.position.distanceTo(meshRef.current.getWorldPosition(new THREE.Vector3()));
            // Show text if close enough (< 12 units) or hovered
            setVisible(distance < 12);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(cert);
        } else {
            window.open(cert.link, '_blank');
        }
    };

    return (
        <group position={position} ref={meshRef}>
            {/* The Dot (Always Visible) */}
            <mesh
                onPointerOver={() => setHover(true)} 
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
            >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial 
                    color={hovered ? "#22d3ee" : "#0891b2"} 
                    transparent 
                    opacity={0.8} 
                />
            </mesh>

            {/* Glow Sprite */}
            <sprite scale={[0.5, 0.5, 0.5]}>
                <spriteMaterial 
                    transparent 
                    opacity={0.4}
                    color="#06b6d4"
                    blending={THREE.AdditiveBlending}
                />
            </sprite>

            {/* Detail Card - Only visible when zoomed in or hovered */}
            {(visible || hovered) && (
                <Billboard>
                <Html 
                    transform
                    distanceFactor={10}
                    position={[0, 0.5, 0]}
                    style={{ 
                        pointerEvents: 'none',
                        transition: 'opacity 0.3s',
                        opacity: visible || hovered ? 1 : 0 
                    }}
                >
                    <div 
                        className={`
                            relative group cursor-pointer transition-all duration-300 ease-out pointer-events-auto origin-bottom
                            ${hovered ? 'scale-100 z-50' : 'scale-75 opacity-80'}
                        `}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={handleClick}
                    >
                        <div className={`
                            w-40 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden p-2 flex flex-col items-center text-center shadow-2xl
                            transition-colors duration-300
                            ${hovered ? 'border-cyan-500/50 bg-black' : ''}
                        `}>
                            <div className="relative w-10 h-10 mb-1">
                                <img src={cert.image} alt="cert" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-[8px] font-bold text-white leading-tight line-clamp-2">{cert.title}</div>
                        </div>
                        
                        {/* Connector Line */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-4 bg-cyan-500/30" />
                    </div>
                </Html>
                </Billboard>
            )}
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

interface DiffusionSceneProps {
    onSchoolSelect: (data: any) => void;
    onCertificateSelect?: (cert: Certificate) => void;
    certificates?: Certificate[];
}

export default function DiffusionScene({ onSchoolSelect, onCertificateSelect, certificates = [] }: DiffusionSceneProps) {
  const [selectedSchool, setSelected] = useState<typeof SCHOOLS[0] | null>(null);

  const handleSelect = (school: typeof SCHOOLS[0]) => {
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
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#030305']} />
        <fog attach="fog" args={['#030305', 10, 60]} />
        
        <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            autoRotate={!selectedSchool} 
            autoRotateSpeed={0.3}
            dampingFactor={0.1}
            maxDistance={40}
            minDistance={5}
        />

        <group>
            {/* Central Brain */}
            <BrainParticles count={15000} isHovered={!!selectedSchool} />
            
            {/* School System (Inner Ring) */}
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

            {/* Certificates System (Outer Ring) */}
            {certificates.length > 0 && (
                <CertificateCluster certificates={certificates} onSelect={onCertificateSelect} />
            )}
        </group>

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
      </Canvas>
    </div>
  );
}
