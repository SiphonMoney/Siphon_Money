"use client";

import { useEffect, useRef, useState } from "react";

const map = (s: number, a1: number, a2: number, b1: number, b2: number) => 
  b1 + (s - a1) * (b2 - b1) / (a2 - a1);

interface AsciiMakerProps {
  image: string;
  fontSize?: number;
  spacing?: number;
  characterSet?: string;
}

export default function AsciiMaker({ 
  image, 
  fontSize = 4, 
  spacing = 5,
  characterSet = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^'. "
}: AsciiMakerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const original = new Image();
    original.crossOrigin = 'Anonymous';
    
    original.onload = () => {
      if (!canvas) return;
      
      const dataCtx = document.createElement('canvas').getContext('2d');
      if (!dataCtx) return;
      
      // Set up canvas dimensions - make it much smaller
      const scaledWidth = original.width / spacing;
      const scaledHeight = original.height / spacing;
      const scaleFactor = 10;
      
      canvas.width = dataCtx.canvas.width = original.width / scaleFactor;
      canvas.height = dataCtx.canvas.height = original.height / scaleFactor;
      
      // Draw image at reduced resolution
      dataCtx.drawImage(original, 0, 0, scaledWidth, scaledHeight);
      const data = dataCtx.getImageData(0, 0, original.width, original.height).data;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#fff';

      // Process each pixel and convert to ASCII - sample every 3rd pixel to scale down
      const smallWidth = original.width / scaleFactor;
      const smallHeight = original.height / scaleFactor;
      
      for (let y = 0; y < smallHeight; y++) {
        for (let x = 0; x < smallWidth; x++) {
          const origX = x * scaleFactor;
          const origY = y * scaleFactor;
          const idx = (origY * original.width + origX) * 4;
          
          if (idx < data.length) {
            const grayscale = Math.floor((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
            const charIndex = Math.floor(map(grayscale, 255, 0, 0, characterSet.length - 1));
            const char = characterSet[charIndex];

            ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`;
            ctx.font = `${fontSize}px Courier New`;
            ctx.fillText(char, x * spacing, y * spacing);
          }
        }
      }

      setIsLoaded(true);
    };

    original.onerror = () => {
      console.error('Failed to load image');
    };

    original.src = image;

    return () => {
      // Cleanup
    };
  }, [image, fontSize, spacing, characterSet]);

  return (
    <div 
      className="ascii-container"
      style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        zIndex: 10,
        pointerEvents: 'none',
        maxWidth: '400px',
        maxHeight: '400px',
        transform: 'scale(0.1)',
        transformOrigin: 'top left'
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

