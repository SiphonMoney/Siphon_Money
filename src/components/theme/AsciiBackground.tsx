"use client";

import { useEffect, useRef, useState } from "react";

interface AsciiBackgroundProps {
  fontSize?: number;
  spacing?: number;
  characterSet?: string;
  opacity?: number;
}

export default function AsciiBackground({ 
  fontSize = 12, 
  spacing = 14,
  characterSet = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^'. ",
  opacity = 0.1
}: AsciiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = `${fontSize}px Courier New`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      
      // Calculate how many characters fit
      const charsPerRow = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);
      
      // Generate random ASCII characters across the background
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < charsPerRow; col++) {
          // Use a pseudo-random pattern based on position for consistency
          const seed = (row * 1000 + col) % characterSet.length;
          const char = characterSet[seed];
          
          ctx.fillText(char, col * spacing, row * spacing + fontSize);
        }
      }
      
      setIsLoaded(true);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fontSize, spacing, characterSet, opacity]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
}

