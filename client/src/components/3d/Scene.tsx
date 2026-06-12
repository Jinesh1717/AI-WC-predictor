import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Float, Sphere, Cylinder, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const GoldenTrophyPlaceholder = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow 360° rotation
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
        {/* Base / Body */}
        <Cylinder args={[0.5, 0.8, 2, 32]} position={[0, -0.5, 0]}>
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.2} 
            envMapIntensity={2} 
          />
        </Cylinder>
        
        {/* Top Globe */}
        <Sphere args={[0.7, 64, 64]} position={[0, 1, 0]}>
          <MeshDistortMaterial
            color="#FFD700"
            attach="material"
            distort={0.2}
            speed={1.5}
            roughness={0.1}
            metalness={1}
          />
        </Sphere>
      </Float>
    </group>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#FFD700" />
      <pointLight position={[0, 2, 0]} intensity={3} color="#FFD700" distance={5} /> {/* Golden Glow */}
      
      <GoldenTrophyPlaceholder />
      
      {/* Floating Light Particles */}
      <Sparkles count={150} scale={8} size={2} speed={0.4} opacity={0.6} color="#FFD700" />
      <Sparkles count={50} scale={10} size={3} speed={0.2} opacity={0.3} color="#ffffff" />
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
};

export default Scene;
