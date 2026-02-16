import { useEffect, useRef } from 'react';

export default function ParticleSphere({ scrollY }) {
  const canvasRef = useRef(null);
  const prevScrollY = useRef(0);
  const scrollYRef = useRef(scrollY);
  
  useEffect(() => {
    scrollYRef.current = scrollY;
  }, [scrollY]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Particle settings - denser at center like the GIF
    const particleCount = 2000;
    const particles = [];
    
    // Create particles with varying density (denser at center)
    for (let i = 0; i < particleCount; i++) {
      // Use exponential distribution for density
      const r = Math.pow(Math.random(), 0.5) * 200;
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      
      // Add noise for irregularity
      const noise = (Math.random() - 0.5) * 20;
      
      particles.push({
        x: (r + noise) * Math.cos(theta) * Math.sin(phi),
        y: (r + noise) * Math.sin(theta) * Math.sin(phi),
        z: (r + noise) * Math.cos(phi),
        size: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.0005 + 0.0002
      });
    }
    
    let animationFrame;
    let rotation = 0;
    let time = 0;
    
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      const currentScroll = scrollYRef.current;
      
      // Track scroll velocity for effects
      const scrollVelocity = Math.abs(currentScroll - prevScrollY.current) * 0.01;
      prevScrollY.current = currentScroll;
      
      // Slow rotation
      rotation += 0.003;
      time += 0.01;
      
      // Sort particles by z-index for proper depth with scroll-responsive movement
      const sortedParticles = particles.map((p, i) => {
        // Add subtle wave motion
        const waveOffset = Math.sin(time + i * 0.01) * 2;
        
        // Scroll-based expansion/contraction
        const scrollEffect = Math.sin(currentScroll * 0.01) * 10;
        const expandFactor = 1 + scrollEffect * 0.02;
        
        const rotatedX = (p.x * expandFactor + waveOffset) * Math.cos(rotation) - p.z * Math.sin(rotation);
        const rotatedZ = (p.x * expandFactor + waveOffset) * Math.sin(rotation) + p.z * Math.cos(rotation);
        const rotatedY = (p.y * expandFactor) * Math.cos(rotation * 0.7) - rotatedZ * Math.sin(rotation * 0.7);
        const finalZ = (p.y * expandFactor) * Math.sin(rotation * 0.7) + rotatedZ * Math.cos(rotation * 0.7);
        
        return {
          x: rotatedX,
          y: rotatedY,
          z: finalZ,
          size: p.size * (1 + scrollVelocity * 0.5),
          baseAlpha: p.baseAlpha
        };
      }).sort((a, b) => b.z - a.z);
      
      // Draw particles
      sortedParticles.forEach(p => {
        const scale = 300 / (300 + p.z);
        const x2d = p.x * scale + width / 2;
        const y2d = p.y * scale + height / 2;
        const size = p.size * scale;
        
        // Distance from center for brightness
        const distance = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const centerBrightness = 1 - (distance / 250);
        
        // Depth-based opacity - much brighter
        const depthAlpha = (p.z + 250) / 500;
        const alpha = Math.min(1, p.baseAlpha * depthAlpha * Math.max(0.6, centerBrightness) * 3);
        
        // Add glow effect
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.1})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={500}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
}
