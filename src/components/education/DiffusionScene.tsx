'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { PointMaterial, Stars, Line, Html, OrbitControls, Billboard } from '@react-three/drei';
import * as THREE from 'three';

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
        color: '#ffffff', // White
        description: 'Base parameter setup.'
    },
    {
        id: 'cmb',
        name: 'SMA Cahaya Madani',
        program: 'Science & STEM',
        period: '2019-2022',
        coords: [106.1093, -6.1200],
        position: [-2, -1, 5],
        color: '#e5e5e5', // Light Gray
        description: 'Initial weights initialization & Algorithmic foundations.'
    },
    {
        id: 'uad',
        name: 'Universitas Ahmad Dahlan',
        program: 'Informatics (AI Focus)',
        period: '2022-2028',
        coords: [110.3695, -7.7956],
        position: [3, 2, 3],
        color: '#d4d4d4', // Grey
        description: 'Fine-tuning Deep Learning architectures & Computer Vision.'
    },
    {
        id: 'ump',
        name: 'Universiti Malaysia Pahang',
        program: 'Software Engineering',
        period: '2024-2025',
        coords: [103.3256, 3.5437],
        position: [6, 4, -1],
        color: '#ffffff', // White
        description: 'Cross-border Transfer Learning & Large Scale Systems.'
    }
];

// --- Components ---

interface BrainParticlesProps {
  count?: number;
  isHovered: boolean;
  theme: string;
}

function simpleNoise(x: number, y: number, z: number) {
    return Math.sin(x) * Math.cos(y) * Math.sin(z);
}

function BrainParticles({ count = 15000, isHovered, theme }: BrainParticlesProps) {
  const mesh = useRef<THREE.Points>(null);

  // 1. Generate Main Cortex Cloud
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const isLight = theme === 'light';

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0, d = 100;
      while (true) {
         x = Math.random() * 2 - 1;
         y = Math.random() * 2 - 1;
         z = Math.random() * 2 - 1;
         d = x*x*0.5 + y*y + z*z*0.8;
         if (d > 1) continue;
         if (Math.abs(x) < 0.05) continue; 
         if (y < -0.6) continue;
         if (z < -0.4 && y < -0.2) {
            if (x*x + (y+0.4)*(y+0.4) + (z+0.6)*(z+0.6) > 0.4) continue;
         }
         if (y < 0 && z > -0.2 && z < 0.5) {
         } else {
             if (Math.abs(x) > 0.8) continue; 
         }
         break;
      }

      const freq = 8.0;
      const noiseVal = simpleNoise(x * freq, y * freq, z * freq);
      const displacement = 1 + noiseVal * 0.1;
      const hemiSep = x > 0 ? 0.1 : -0.1;
      const scale = 2.2;
      const finalX = (x * displacement + hemiSep) * scale;
      const finalY = (y * displacement) * scale;
      const finalZ = (z * displacement) * scale;

      const i3 = i * 3;
      positions[i3] = finalX;
      positions[i3 + 1] = finalY;
      positions[i3 + 2] = finalZ;

      // Monochrome Color Mapping
      const c = new THREE.Color();
      if (Math.random() > 0.98) {
           c.setHex(isLight ? 0x000000 : 0xffffff); // Spark
      } else {
           // Grey Gradient
           if (isLight) {
             c.setHSL(0, 0, 0.1 + Math.random() * 0.3); // Dark grey for light mode
           } else {
             c.setHSL(0, 0, 0.2 + Math.random() * 0.3); // Light grey for dark mode
           }
      }
      
      colors[i3] = c.r;
      colors[i3+1] = c.g;
      colors[i3+2] = c.b;
    }
    return { positions, colors };
  }, [count, theme]);

  // 2. Generate Synapse Lines (Technical)
  const network = useMemo(() => {
      const pointsCount = 300;
      const indices = new Uint16Array(pointsCount * 2);
      const linePos = new Float32Array(pointsCount * 3);
      
      for(let i=0; i<pointsCount; i++) {
          const pickIndex = Math.floor(Math.random() * count);
          linePos[i*3] = particles.positions[pickIndex*3];
          linePos[i*3+1] = particles.positions[pickIndex*3+1];
          linePos[i*3+2] = particles.positions[pickIndex*3+2];
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
    
    // Technical Pulse
    if (isHovered) {
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3] += (Math.random() - 0.5) * 0.002;
            pos[i3+1] += (Math.random() - 0.5) * 0.002;
            pos[i3+2] += (Math.random() - 0.5) * 0.002;
        }
        mesh.current.geometry.attributes.position.needsUpdate = true;
    }
    
    mesh.current.rotation.y = t * 0.05;
  });

  return (
    <group>
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.positions.length / 3} array={particles.positions} itemSize={3} args={[particles.positions, 3]} />
                <bufferAttribute attach="attributes-color" count={particles.colors.length / 3} array={particles.colors} itemSize={3} args={[particles.colors, 3]} />
            </bufferGeometry>
            <PointMaterial 
                transparent 
                vertexColors 
                size={0.02} 
                sizeAttenuation={true} 
                depthWrite={false} 
                blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending} 
                opacity={0.5} 
            />
        </points>

        <line>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={network.positions.length / 3} array={network.positions} itemSize={3} args={[network.positions, 3]} />
                <bufferAttribute attach="index" count={network.indices.length} array={network.indices} itemSize={1} args={[network.indices, 1]} />
            </bufferGeometry>
            <lineBasicMaterial color={theme === 'light' ? "#000000" : "#ffffff"} transparent opacity={0.1} linewidth={1} />
        </line>
    </group>
  );
}

function JourneyPath({ theme }: { theme: string }) {
    const points = useMemo(() => {
        return SCHOOLS.map(s => new THREE.Vector3(...s.position));
    }, []);

    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    }, [points]);

    const lineGeometry = useMemo(() => {
        const curvePoints = curve.getPoints(100);
        return new THREE.BufferGeometry().setFromPoints(curvePoints);
    }, [curve]);

    return (
        <group>
            <line>
                <primitive object={lineGeometry} attach="geometry" />
                <lineBasicMaterial color={theme === 'light' ? "#000000" : "#ffffff"} opacity={0.2} transparent linewidth={1} />
            </line>
            <DataFlowParticles curve={curve} count={20} theme={theme} />
        </group>
    );
}

function DataFlowParticles({ curve, count, theme }: { curve: THREE.CatmullRomCurve3; count: number; theme: string }) {
    const particles = useRef<THREE.Points>(null);
    const progress = useMemo(() => new Float32Array(count).map(() => Math.random()), [count]);
    const bufferPositions = useMemo(() => new Float32Array(count * 3), [count]);

    useFrame(() => {
        if (!particles.current) return;
        const positions = particles.current.geometry.attributes.position.array as Float32Array;
        
        for(let i=0; i<count; i++) {
            progress[i] += 0.002;
            if(progress[i] > 1) progress[i] = 0;
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
                <bufferAttribute attach="attributes-position" count={count} array={bufferPositions} itemSize={3} args={[bufferPositions, 3]} />
            </bufferGeometry>
            <PointMaterial color={theme === 'light' ? "#000000" : "#ffffff"} size={0.1} transparent opacity={0.8} blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending} />
        </points>
    );
}

function SchoolNode({ data, onSelect, isSelected, index, theme }: { 
    data: typeof SCHOOLS[0]; 
    onSelect: (data: typeof SCHOOLS[0]) => void; 
    isSelected: boolean; 
    index: number;
    theme: string;
}) {
    const [hovered, setHover] = useState(false);
    
    return (
        <group position={data.position as [number, number, number]}>
            {/* Connection Line Segment */}
            {index > 0 && (
                <Line 
                    points={[ [0,0,0], new THREE.Vector3(...SCHOOLS[index-1].position).sub(new THREE.Vector3(...data.position)) ]}
                    color={theme === 'light' ? "#000000" : "#ffffff"}
                    lineWidth={1}
                    opacity={0.1}
                    transparent
                />
            )}

            <mesh 
                onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <sphereGeometry args={[isSelected || hovered ? 0.25 : 0.15, 16, 16]} />
                <meshStandardMaterial 
                    color={isSelected ? (theme === 'light' ? "#000000" : "#ffffff") : (theme === 'light' ? "#666666" : "#808080")} 
                    emissive={isSelected ? (theme === 'light' ? "#000000" : "#ffffff") : "#000000"}
                    emissiveIntensity={isSelected ? 0.5 : 0}
                    wireframe={!isSelected && !hovered}
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
                        ${isSelected || hovered ? 'opacity-100 scale-110' : 'opacity-60 scale-90'}
                    `}
                >
                    <div 
                        className={`px-2 py-1 rounded-sm backdrop-blur-md border flex items-center gap-2 cursor-pointer pointer-events-auto
                            ${theme === 'light' 
                                ? 'bg-white/80 border-black/20 hover:border-black/50' 
                                : 'bg-black/80 border-white/20 hover:border-white/50'
                            }
                        `}
                        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                    >
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-black' : 'bg-white'} animate-pulse`} />
                        <span className={`text-[10px] font-bold ${theme === 'light' ? 'text-black' : 'text-white'} font-mono uppercase`}>{data.name}</span>
                    </div>
                </div>
            </Html>
        </group>
    );
}

function CertificateCluster({ certificates, onSelect, theme }: { certificates: Certificate[]; onSelect?: (cert: Certificate) => void; theme: string }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = -state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {certificates.map((cert, i) => {
                const phi = Math.acos(1 - 2 * (i + 0.5) / certificates.length);
                const theta = Math.PI * (1 + 5**0.5) * (i + 0.5);
                const r = 12;
                const x = r * Math.sin(phi) * Math.cos(theta);
                const y = r * Math.sin(phi) * Math.sin(theta);
                const z = r * Math.cos(phi);

                return (
                    <CertificateNode 
                        key={cert.id} 
                        cert={cert} 
                        position={[x, y, z]} 
                        onSelect={onSelect}
                        theme={theme}
                    />
                );
            })}
        </group>
    );
}

function CertificateNode({ cert, position, onSelect, theme }: { cert: Certificate; position: [number, number, number]; onSelect?: (cert: Certificate) => void; theme: string }) {
    const [hovered, setHover] = useState(false);
    const [visible, setVisible] = useState(false);
    const meshRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (meshRef.current) {
            const distance = camera.position.distanceTo(meshRef.current.getWorldPosition(new THREE.Vector3()));
            setVisible(distance < 14);
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <mesh
                onPointerOver={() => setHover(true)} 
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
            >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial 
                    color={hovered ? (theme === 'light' ? "#000000" : "#ffffff") : (theme === 'light' ? "#999999" : "#666666")} 
                    transparent 
                    opacity={0.8} 
                />
            </mesh>

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
                            ${hovered ? 'scale-100 z-50' : 'scale-75 opacity-60'}
                        `}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={handleClick}
                    >
                        <div className={`px-2 py-1 rounded-sm text-center border ${theme === 'light' ? 'bg-white/90 border-black/10' : 'bg-black/90 border-white/10'}`}>
                            <div className={`text-[6px] font-mono uppercase tracking-wider ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{cert.title.substring(0, 20)}</div>
                        </div>
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 w-px h-4 ${theme === 'light' ? 'bg-black/20' : 'bg-white/20'}`} />
                    </div>
                </Html>
                </Billboard>
            )}
        </group>
    );
}

function SchoolConstellation({ children }: { children: React.ReactNode }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
        }
    });
    return <group ref={ref}>{children}</group>;
}

interface DiffusionSceneProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSchoolSelect: (data: any) => void;
    onCertificateSelect?: (cert: Certificate) => void;
    certificates?: Certificate[];
    theme?: string;
}

export default function DiffusionScene({ onSchoolSelect, onCertificateSelect, certificates = [], theme = 'dark' }: DiffusionSceneProps) {
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
    <div className="absolute inset-0 z-0 bg-background transition-colors duration-500">
      <Canvas camera={{ position: [0, 0, 22], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={[theme === 'light' ? '#ffffff' : '#050505', 10, 60]} />
        
        <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            autoRotate={!selectedSchool} 
            autoRotateSpeed={0.5}
            dampingFactor={0.1}
            maxDistance={40}
            minDistance={5}
        />

        <group>
            {/* Central Brain */}
            <BrainParticles count={12000} isHovered={!!selectedSchool} theme={theme} />
            
            {/* School System */}
            <SchoolConstellation>
                <JourneyPath theme={theme} />
                {SCHOOLS.map((school, index) => (
                    <SchoolNode 
                        key={school.id} 
                        data={school} 
                        index={index}
                        isSelected={selectedSchool?.id === school.id}
                        onSelect={handleSelect}
                        theme={theme}
                    />
                ))}
            </SchoolConstellation>

            {/* Certificates System */}
            {certificates.length > 0 && (
                <CertificateCluster certificates={certificates} onSelect={onCertificateSelect} theme={theme} />
            )}
        </group>

        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color={theme === 'light' ? "#000000" : "#ffffff"} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={theme === 'light' ? "#000000" : "#ffffff"} />
      </Canvas>
    </div>
  );
}
