'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { PointMaterial, Stars, Html, OrbitControls, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { AboutNode, NodeCategory } from '@/app/about/page';

// --- Types ---
export interface Certificate {
  id: string;
  title: string;
  date: string;
  image: string;
  link: string;
}

// --- Components ---

interface BrainParticlesProps {
  count?: number;
  isHovered: boolean;
  theme: string;
}

// Perlin-like noise for brain surface wrinkles
function noise3D(x: number, y: number, z: number): number {
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    const perm = [...p, ...p];
    
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = x * x * x * (x * (x * 6 - 15) + 10);
    const v = y * y * y * (y * (y * 6 - 15) + 10);
    const w = z * z * z * (z * (z * 6 - 15) + 10);
    
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    
    const grad = (hash: number, x: number, y: number, z: number) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };
    
    const lerp = (t: number, a: number, b: number) => a + t * (b - a);
    
    return lerp(w, lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)),
                           lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))),
                   lerp(v, lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
                           lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1))));
}

function BrainParticles({ count = 15000, isHovered, theme }: BrainParticlesProps) {
  const mesh = useRef<THREE.Points>(null);
  const initialPositions = useRef<Float32Array | null>(null);

  // Generate anatomically-inspired brain shape
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const isLight = theme === 'light';

    const scale = 4.5; // Large brain as dominant focal point
    
    for (let i = 0; i < count; i++) {
      // Spherical coordinates with brain-like deformation
      const theta = Math.random() * Math.PI * 2; // Azimuthal angle
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle
      
      // Base radius
      let r = 1.0;
      
      // Create brain hemispheres - wider horizontally, compressed vertically
      const widthScale = 1.3;  // Wider side-to-side
      const heightScale = 0.9; // Slightly shorter top-to-bottom
      const depthScale = 1.1;  // Elongated front-to-back
      
      // Calculate base position on ellipsoid
      let x = Math.sin(phi) * Math.cos(theta) * widthScale;
      let y = Math.cos(phi) * heightScale;
      let z = Math.sin(phi) * Math.sin(theta) * depthScale;
      
      // Add hemisphere separation (the longitudinal fissure)
      const fissureDepth = 0.15;
      if (Math.abs(x) < 0.3) {
        const fissureFactor = 1 - Math.abs(x) / 0.3;
        y -= fissureFactor * fissureDepth * (y > 0 ? 1 : 0.3);
      }
      
      // Push hemispheres apart slightly
      x += (x > 0 ? 0.08 : -0.08);
      
      // Create cerebellum bulge at the back-bottom
      if (y < -0.3 && z < -0.2) {
        const cerebellumFactor = Math.max(0, 1 - (y + 0.3) / 0.5);
        r += cerebellumFactor * 0.2;
      }
      
      // Create frontal lobe prominence
      if (z > 0.3 && y > -0.2) {
        r += 0.1;
      }
      
      // Add cortical folding (gyri and sulci) using noise
      const noiseScale = 3.0;
      const noiseX = x * noiseScale;
      const noiseY = y * noiseScale;
      const noiseZ = z * noiseScale;
      
      const wrinkle = noise3D(noiseX, noiseY, noiseZ) * 0.15 +
                      noise3D(noiseX * 2, noiseY * 2, noiseZ * 2) * 0.08 +
                      noise3D(noiseX * 4, noiseY * 4, noiseZ * 4) * 0.04;
      
      r += wrinkle;
      
      // Apply radius and add some surface variation
      const surfaceVariation = 0.9 + Math.random() * 0.2;
      const finalR = r * surfaceVariation * scale;
      
      const i3 = i * 3;
      positions[i3] = x * finalR;
      positions[i3 + 1] = y * finalR;
      positions[i3 + 2] = z * finalR;

      // Monochrome color with subtle depth shading
      const c = new THREE.Color();
      const depth = (y + 1) / 2; // 0 at bottom, 1 at top
      
      if (isLight) {
        // Light theme: dark/black particles
        const lightness = 0.0 + depth * 0.15 + Math.random() * 0.08; // 0.0-0.23 (very dark)
        c.setHSL(0, 0, lightness);
      } else {
        // Dark theme: light/white particles
        if (Math.random() > 0.97) {
          c.setHex(0xffffff);
        } else {
          const lightness = 0.25 + depth * 0.2 + Math.random() * 0.1;
          c.setHSL(0, 0, lightness);
        }
      }
      
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    
    initialPositions.current = new Float32Array(positions);
    return { positions, colors };
  }, [count, theme]);

  // Generate neural connection lines
  const network = useMemo(() => {
    const lineCount = 400;
    const linePositions: number[] = [];
    
    // Create connections between nearby particles
    for (let i = 0; i < lineCount; i++) {
      const idx1 = Math.floor(Math.random() * count);
      const idx2 = Math.floor(Math.random() * count);
      
      const x1 = particles.positions[idx1 * 3];
      const y1 = particles.positions[idx1 * 3 + 1];
      const z1 = particles.positions[idx1 * 3 + 2];
      
      const x2 = particles.positions[idx2 * 3];
      const y2 = particles.positions[idx2 * 3 + 1];
      const z2 = particles.positions[idx2 * 3 + 2];
      
      // Only connect if within reasonable distance
      const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
      if (dist < 1.5 && dist > 0.3) {
        linePositions.push(x1, y1, z1, x2, y2, z2);
      }
    }
    
    return new Float32Array(linePositions);
  }, [particles, count]);

  useFrame((state) => {
    if (!mesh.current || !initialPositions.current) return;
    const t = state.clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes.position.array as Float32Array;
    
    // Subtle pulsing animation
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const baseX = initialPositions.current[i3];
      const baseY = initialPositions.current[i3 + 1];
      const baseZ = initialPositions.current[i3 + 2];
      
      // Gentle breathing motion
      const pulse = Math.sin(t * 0.5 + baseY * 2) * 0.01;
      
      if (isHovered) {
        // More active when hovered - synaptic activity
        pos[i3] = baseX * (1 + pulse) + (Math.random() - 0.5) * 0.01;
        pos[i3 + 1] = baseY * (1 + pulse) + (Math.random() - 0.5) * 0.01;
        pos[i3 + 2] = baseZ * (1 + pulse) + (Math.random() - 0.5) * 0.01;
      } else {
        pos[i3] = baseX * (1 + pulse * 0.5);
        pos[i3 + 1] = baseY * (1 + pulse * 0.5);
        pos[i3 + 2] = baseZ * (1 + pulse * 0.5);
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Slow rotation
    mesh.current.rotation.y = t * 0.03;
  });

  return (
    <group>
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particles.positions.length / 3} 
            array={particles.positions} 
            itemSize={3} 
            args={[particles.positions, 3]} 
          />
          <bufferAttribute 
            attach="attributes-color" 
            count={particles.colors.length / 3} 
            array={particles.colors} 
            itemSize={3} 
            args={[particles.colors, 3]} 
          />
        </bufferGeometry>
        <PointMaterial 
          transparent 
          vertexColors 
          size={theme === 'light' ? 0.035 : 0.025} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.NormalBlending} 
          opacity={theme === 'light' ? 1 : 0.6} 
        />
      </points>

      {/* Neural connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={network.length / 3} 
            array={network} 
            itemSize={3} 
            args={[network, 3]} 
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={theme === 'light' ? "#000000" : "#ffffff"} 
          transparent 
          opacity={theme === 'light' ? 0.03 : 0.06} 
        />
      </lineSegments>
    </group>
  );
}

// Floating node for all categories (education, hobby, favorite)
function FloatingNode({ data, onSelect, isSelected, index, theme, totalNodes, category }: { 
    data: AboutNode; 
    onSelect: (data: AboutNode) => void; 
    isSelected: boolean; 
    index: number;
    theme: string;
    totalNodes: number;
    category: NodeCategory;
}) {
    const [hovered, setHover] = useState(false);
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const pulseRef = useRef<THREE.Mesh>(null);
    const [isActive, setIsActive] = useState(false);
    
    // Position based on category - different orbital layers
    const categoryOffsets = {
        education: { radius: 6, yBase: 0, speed: 0.12 },
        hobby: { radius: 8, yBase: 1, speed: 0.08 },
        favorite: { radius: 10, yBase: -0.5, speed: 0.06 },
    };
    
    const settings = categoryOffsets[category];
    const baseAngle = (index / totalNodes) * Math.PI * 2;
    const baseRadius = settings.radius + index * 0.3;
    const baseY = settings.yBase + (index % 3) * 1.5 - 1.5;
    
    // Monochrome colors based on theme
    const nodeColor = theme === 'light' ? '#000000' : '#ffffff';
    const mutedColor = theme === 'light' ? '#555555' : '#aaaaaa';
    
    useFrame((state) => {
        if (!groupRef.current || !meshRef.current) return;
        const t = state.clock.getElapsedTime();
        
        const uniqueOffset = index * 2.5 + (category === 'education' ? 0 : category === 'hobby' ? 100 : 200);
        const orbitSpeed = settings.speed + index * 0.02;
        
        const angle = baseAngle + t * orbitSpeed;
        const radiusVariation = Math.sin(t * 0.3 + uniqueOffset) * 1.2;
        const currentRadius = baseRadius + radiusVariation;
        
        groupRef.current.position.x = Math.cos(angle) * currentRadius + Math.sin(t * 0.4 + uniqueOffset) * 0.6;
        groupRef.current.position.z = Math.sin(angle) * currentRadius * 0.7 + Math.cos(t * 0.5 + uniqueOffset) * 0.5;
        groupRef.current.position.y = baseY + Math.sin(t * 0.6 + uniqueOffset) * 1.0 + Math.cos(t * 0.35) * 0.4;
        
        groupRef.current.rotation.y = t * 0.2 + uniqueOffset;
        groupRef.current.rotation.x = Math.sin(t * 0.25 + uniqueOffset) * 0.12;
        
        if (pulseRef.current) {
            const pulseScale = isActive || isSelected ? 1 + Math.sin(t * 5) * 0.4 : 1;
            pulseRef.current.scale.setScalar(pulseScale);
        }
        
        if (Math.random() < 0.002 && !isActive) {
            setIsActive(true);
            setTimeout(() => setIsActive(false), 600 + Math.random() * 800);
        }
    });
    
    const nodeSize = category === 'education' ? 0.22 : category === 'hobby' ? 0.18 : 0.16;
    
    // Different visual styles per category
    const renderNodeShape = () => {
        if (category === 'education') {
            // Education: Solid sphere with ring orbit
            return (
                <>
                    {/* Main solid sphere */}
                    <mesh 
                        ref={meshRef}
                        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                        onPointerOver={() => setHover(true)}
                        onPointerOut={() => setHover(false)}
                    >
                        <sphereGeometry args={[isSelected || hovered ? nodeSize + 0.06 : nodeSize, 24, 24]} />
                        <meshStandardMaterial 
                            color={isActive || isSelected ? nodeColor : mutedColor} 
                            emissive={nodeColor}
                            emissiveIntensity={isActive ? 0.8 : isSelected ? 0.5 : 0}
                        />
                    </mesh>
                    {/* Inner glowing core */}
                    <mesh scale={0.1}>
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshBasicMaterial color={nodeColor} transparent opacity={0.9} />
                    </mesh>
                </>
            );
        } else if (category === 'hobby') {
            // Hobby: Ring/Torus (donut shape)
            return (
                <mesh 
                    ref={meshRef}
                    onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <torusGeometry args={[isSelected || hovered ? nodeSize : nodeSize - 0.02, 0.05, 16, 32]} />
                    <meshStandardMaterial 
                        color={isActive || isSelected ? nodeColor : mutedColor} 
                        emissive={nodeColor}
                        emissiveIntensity={isActive ? 0.8 : isSelected ? 0.5 : 0.1}
                    />
                </mesh>
            );
        } else {
            // Favorite: Small bright sphere with stronger glow
            return (
                <>
                    <mesh 
                        ref={meshRef}
                        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                        onPointerOver={() => setHover(true)}
                        onPointerOut={() => setHover(false)}
                    >
                        <sphereGeometry args={[isSelected || hovered ? nodeSize + 0.04 : nodeSize, 16, 16]} />
                        <meshBasicMaterial 
                            color={nodeColor}
                            transparent 
                            opacity={isActive || isSelected ? 1 : 0.85}
                        />
                    </mesh>
                    {/* Outer glow sphere */}
                    <mesh scale={1.8}>
                        <sphereGeometry args={[nodeSize, 16, 16]} />
                        <meshBasicMaterial 
                            color={nodeColor}
                            transparent 
                            opacity={0.15}
                        />
                    </mesh>
                </>
            );
        }
    };
    
    return (
        <group ref={groupRef}>
            {/* Outer glow ring - only for education */}
            {category === 'education' && (
                <mesh ref={pulseRef} visible={isActive || isSelected || hovered}>
                    <ringGeometry args={[nodeSize + 0.1, nodeSize + 0.22, 32]} />
                    <meshBasicMaterial 
                        color={nodeColor}
                        transparent 
                        opacity={isActive ? 0.5 : 0.25}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Category-specific node shape */}
            {renderNodeShape()}
            
            {/* Label */}
            <Html 
                position={[0, 0.55, 0]} 
                center 
                distanceFactor={10}
                style={{ pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}
                zIndexRange={[100, 0]}
            >
                <div 
                    className={`
                        flex flex-col items-center transition-all duration-300
                        ${isSelected || hovered ? 'opacity-100 scale-110' : 'opacity-70 scale-95'}
                    `}
                >
                    <div 
                        className={`px-3 py-1.5 rounded-lg backdrop-blur-md border flex items-center gap-2 cursor-pointer pointer-events-auto transition-all shadow-lg
                            ${theme === 'light' 
                                ? 'bg-white/95 border-black/20 hover:border-black/50 hover:shadow-xl' 
                                : 'bg-black/95 border-white/20 hover:border-white/50 hover:shadow-xl'
                            }
                            ${isActive ? 'border-opacity-100 shadow-xl' : ''}
                        `}
                        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                    >
                        <span className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-black' : 'bg-white'} ${isActive ? 'animate-ping' : 'animate-pulse'}`} />
                        <span className={`text-xs font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                            {data.title}
                        </span>
                    </div>
                    {data.period && (
                        <div className={`text-[9px] mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {data.period}
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
}

// Node constellation wrapper with subtle global motion
function NodeConstellation({ children, category }: { children: React.ReactNode; category: NodeCategory }) {
    const ref = useRef<THREE.Group>(null);
    const speedMultiplier = category === 'education' ? 1 : category === 'hobby' ? 0.7 : 0.5;
    
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();
            ref.current.rotation.y = t * 0.015 * speedMultiplier;
        }
    });
    return <group ref={ref}>{children}</group>;
}

function CertificateCluster({ certificates, onSelect, theme }: { certificates: Certificate[]; onSelect?: (cert: Certificate) => void; theme: string }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime();
            // Slow wobbling rotation
            groupRef.current.rotation.y = -t * 0.02;
            groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
            groupRef.current.rotation.z = Math.cos(t * 0.15) * 0.03;
        }
    });

    return (
        <group ref={groupRef}>
            {certificates.map((cert, i) => {
                const phi = Math.acos(1 - 2 * (i + 0.5) / certificates.length);
                const theta = Math.PI * (1 + 5**0.5) * (i + 0.5);
                const r = 12; // Tighter orbit around schools
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
                        index={i}
                    />
                );
            })}
        </group>
    );
}

function CertificateNode({ cert, position, onSelect, theme, index }: { cert: Certificate; position: [number, number, number]; onSelect?: (cert: Certificate) => void; theme: string; index: number }) {
    const [hovered, setHover] = useState(false);
    const [visible, setVisible] = useState(false);
    const meshRef = useRef<THREE.Group>(null);
    const nodeRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    
    // Individual floating motion
    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();
            const offset = index * 0.5;
            
            // Floating motion
            meshRef.current.position.x = position[0] + Math.sin(t * 0.4 + offset) * 0.3;
            meshRef.current.position.y = position[1] + Math.cos(t * 0.5 + offset) * 0.25;
            meshRef.current.position.z = position[2] + Math.sin(t * 0.3 + offset * 1.5) * 0.2;
            
            // Check visibility
            const distance = camera.position.distanceTo(meshRef.current.getWorldPosition(new THREE.Vector3()));
            setVisible(distance < 18);
            
            // Pulse when hovered
            if (nodeRef.current) {
                const scale = hovered ? 1.5 + Math.sin(t * 5) * 0.3 : 1;
                nodeRef.current.scale.setScalar(scale);
            }
        }
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(cert);
        } else {
            window.open(cert.link, '_blank');
        }
    };

    return (
        <group ref={meshRef} position={position}>
            <mesh
                ref={nodeRef}
                onPointerOver={() => setHover(true)} 
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
            >
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshBasicMaterial 
                    color={hovered ? (theme === 'light' ? "#000000" : "#ffffff") : (theme === 'light' ? "#888888" : "#888888")} 
                    transparent 
                    opacity={hovered ? 1 : 0.6} 
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
                        opacity: visible || hovered ? 1 : 0,
                        userSelect: 'none'
                    }}
                >
                    <div 
                        className={`
                            relative group cursor-pointer transition-all duration-300 ease-out pointer-events-auto origin-bottom
                            ${hovered ? 'scale-100 z-50' : 'scale-75 opacity-60'}
                        `}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={() => onSelect ? onSelect(cert) : window.open(cert.link, '_blank')}
                    >
                        <div className={`px-2 py-1 rounded text-center border transition-all ${theme === 'light' ? 'bg-white/90 border-black/10' : 'bg-black/90 border-white/10'} ${hovered ? 'border-opacity-50' : ''}`}>
                            <div className={`text-[7px] ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{cert.title.substring(0, 24)}{cert.title.length > 24 ? '...' : ''}</div>
                        </div>
                    </div>
                </Html>
                </Billboard>
            )}
        </group>
    );
}

// Dynamic synaptic sparks - shoot from brain to floating nodes
function SynapticSparks({ theme, nodeCount }: { theme: string; nodeCount: number }) {
    const sparkCount = 30;
    const sparksRef = useRef<THREE.Points>(null);
    
    const sparkData = useRef<Array<{
        active: boolean;
        targetAngle: number;
        targetRadius: number;
        targetY: number;
        progress: number;
        speed: number;
    }>>(Array.from({ length: sparkCount }, () => ({
        active: false,
        targetAngle: 0,
        targetRadius: 8,
        targetY: 0,
        progress: 0,
        speed: 0.02,
    })));
    
    const positions = useMemo(() => new Float32Array(sparkCount * 3), []);
    const sizes = useMemo(() => new Float32Array(sparkCount).fill(0), []);
    
    useFrame((state) => {
        if (!sparksRef.current) return;
        const t = state.clock.getElapsedTime();
        const posArray = sparksRef.current.geometry.attributes.position.array as Float32Array;
        const sizeArray = sparksRef.current.geometry.attributes.size.array as Float32Array;
        
        for (let i = 0; i < sparkCount; i++) {
            const spark = sparkData.current[i];
            
            if (!spark.active && Math.random() < 0.01) {
                spark.active = true;
                spark.targetAngle = Math.random() * Math.PI * 2;
                spark.targetRadius = 6 + Math.random() * 5;
                spark.targetY = (Math.random() - 0.5) * 4;
                spark.progress = 0;
                spark.speed = 0.015 + Math.random() * 0.025;
            }
            
            if (spark.active) {
                spark.progress += spark.speed;
                
                if (spark.progress >= 1) {
                    spark.active = false;
                    sizeArray[i] = 0;
                } else {
                    const easeProgress = spark.progress * spark.progress * (3 - 2 * spark.progress);
                    const curveOffset = Math.sin(spark.progress * Math.PI) * 1.5;
                    
                    posArray[i * 3] = Math.cos(spark.targetAngle) * spark.targetRadius * easeProgress + curveOffset * Math.cos(t);
                    posArray[i * 3 + 1] = spark.targetY * easeProgress + curveOffset * 0.3;
                    posArray[i * 3 + 2] = Math.sin(spark.targetAngle) * spark.targetRadius * easeProgress + curveOffset * Math.sin(t);
                    
                    const sizeFactor = Math.sin(spark.progress * Math.PI);
                    sizeArray[i] = 0.15 * sizeFactor;
                }
            }
        }
        
        sparksRef.current.geometry.attributes.position.needsUpdate = true;
        sparksRef.current.geometry.attributes.size.needsUpdate = true;
    });
    
    return (
        <points ref={sparksRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={sparkCount} array={positions} itemSize={3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" count={sparkCount} array={sizes} itemSize={1} args={[sizes, 1]} />
            </bufferGeometry>
            <PointMaterial
                color={theme === 'light' ? "#000000" : "#ffffff"}
                size={0.15}
                transparent
                opacity={0.9}
                blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
                sizeAttenuation={true}
            />
        </points>
    );
}

interface MindSceneProps {
    aboutData: AboutNode[];
    onNodeSelect: (data: AboutNode | null) => void;
    onCertificateSelect?: (cert: Certificate) => void;
    certificates?: Certificate[];
    theme?: string;
}

export default function MindScene({ aboutData, onNodeSelect, onCertificateSelect, certificates = [], theme = 'dark' }: MindSceneProps) {
  const [selectedNode, setSelected] = useState<AboutNode | null>(null);

  const handleSelect = (node: AboutNode) => {
      if (selectedNode?.id === node.id) {
          setSelected(null);
          onNodeSelect(null);
      } else {
          setSelected(node);
          onNodeSelect(node);
      }
  };

  // Group data by category
  const educationNodes = aboutData.filter(d => d.category === 'education');
  const hobbyNodes = aboutData.filter(d => d.category === 'hobby');
  const favoriteNodes = aboutData.filter(d => d.category === 'favorite');

  return (
    <div className="absolute inset-0 z-0 bg-background transition-colors duration-500 select-none">
      <Canvas camera={{ position: [0, 0, 22], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={[theme === 'light' ? '#f5f5f5' : '#050505', 18, 65]} />
        
        <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            autoRotate={!selectedNode} 
            autoRotateSpeed={0.25}
            dampingFactor={0.1}
            maxDistance={50}
            minDistance={10}
        />

        <group>
            {/* Central Brain */}
            <BrainParticles count={22000} isHovered={!!selectedNode} theme={theme} />
            
            {/* Dynamic synaptic sparks from brain to nodes */}
            <SynapticSparks theme={theme} nodeCount={aboutData.length} />
            
            {/* Education Nodes - Inner orbit */}
            <NodeConstellation category="education">
                {educationNodes.map((node, index) => (
                    <FloatingNode 
                        key={node.id} 
                        data={node} 
                        index={index}
                        totalNodes={educationNodes.length}
                        category="education"
                        isSelected={selectedNode?.id === node.id}
                        onSelect={handleSelect}
                        theme={theme}
                    />
                ))}
            </NodeConstellation>

            {/* Hobby Nodes - Middle orbit */}
            <NodeConstellation category="hobby">
                {hobbyNodes.map((node, index) => (
                    <FloatingNode 
                        key={node.id} 
                        data={node} 
                        index={index}
                        totalNodes={hobbyNodes.length}
                        category="hobby"
                        isSelected={selectedNode?.id === node.id}
                        onSelect={handleSelect}
                        theme={theme}
                    />
                ))}
            </NodeConstellation>

            {/* Favorite Nodes - Outer orbit */}
            <NodeConstellation category="favorite">
                {favoriteNodes.map((node, index) => (
                    <FloatingNode 
                        key={node.id} 
                        data={node} 
                        index={index}
                        totalNodes={favoriteNodes.length}
                        category="favorite"
                        isSelected={selectedNode?.id === node.id}
                        onSelect={handleSelect}
                        theme={theme}
                    />
                ))}
            </NodeConstellation>

            {/* Certificates System */}
            {certificates.length > 0 && (
                <CertificateCluster certificates={certificates} onSelect={onCertificateSelect} theme={theme} />
            )}
        </group>

        <Stars radius={100} depth={50} count={theme === 'light' ? 500 : 2000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={theme === 'light' ? 0.5 : 0.2} />
        <pointLight position={[10, 10, 10]} intensity={theme === 'light' ? 1 : 0.7} color={theme === 'light' ? "#333333" : "#ffffff"} />
        <pointLight position={[-10, -10, -10]} intensity={theme === 'light' ? 0.6 : 0.4} color={theme === 'light' ? "#333333" : "#ffffff"} />
      </Canvas>
    </div>
  );
}
