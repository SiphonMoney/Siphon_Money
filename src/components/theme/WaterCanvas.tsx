"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  simulationVertexShader,
  simulationFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "@/lib/shaders";

export default function SoftHorizonCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const mountTarget = containerRef.current ?? document.body;
    mountTarget.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2();
    let frame = 0;

    const getWidth = () => window.innerWidth * window.devicePixelRatio;
    const getHeight = () => window.innerHeight * window.devicePixelRatio;

    let width = getWidth();
    let height = getHeight();

    const options: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };
    let rtA = new THREE.WebGLRenderTarget(width, height, options);
    let rtB = new THREE.WebGLRenderTarget(width, height, options);

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        mouse: { value: mouse },
        resolution: { value: new THREE.Vector2(width, height) },
        time: { value: 0 },
        frame: { value: 0 },
      },
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
        resolution: { value: new THREE.Vector2(width, height) },
        time: { value: 0 },
      },
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      transparent: true,
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    const renderQuad = new THREE.Mesh(plane, renderMaterial);

    simScene.add(simQuad);
    scene.add(renderQuad);

    const canvas2d = document.createElement("canvas");
    canvas2d.width = width;
    canvas2d.height = height;
    const ctx = canvas2d.getContext("2d", { alpha: true });
    if (!ctx) return () => {};

    // Transparent background - no fill needed

    // Store references for animation
    let asciiDrawFunction: ((time: number) => void) | null = null;
    let textTextureRef: THREE.CanvasTexture | null = null;
    let lastAsciiUpdate = 0;
    
    // Draw ASCII characters background that will be distorted by water effect
    const drawAsciiBackground = (time: number = 0) => {
      // Clear previous ASCII (but keep logo and text)
      const asciiFontSize = Math.round(14 * window.devicePixelRatio);
      const asciiSpacing = Math.round(16 * window.devicePixelRatio);
      const characterSet = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^'. ";
      
      ctx.font = `${asciiFontSize}px Courier New`;
      
      const charsPerRow = Math.ceil(width / asciiSpacing);
      const rows = Math.ceil(height / asciiSpacing);
      
      for (let row = 0; row < rows; row++) {
        // Generate random seed for this row that changes over time
        const rowSeed = Math.floor((row * 7919 + time * 100) % 2147483647);
        let randomState = rowSeed;
        
        for (let col = 0; col < charsPerRow; col++) {
          // Simple PRNG for each character position - truly random per position
          randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
          const charIndex = randomState % characterSet.length;
          const char = characterSet[charIndex];
          
          // Varying opacity that changes with time and position - animated (half transparent)
          const baseOpacity = 0.15;
          const opacityVariation = Math.sin((row * col + time * 2) * 0.1) * 0.05;
          const opacity = Math.max(0.1, Math.min(0.2, baseOpacity + opacityVariation));
          
          // Grey color instead of white
          const greyValue = 180; // Medium grey
          ctx.fillStyle = `rgba(${greyValue}, ${greyValue}, ${greyValue}, ${opacity})`;
          ctx.fillText(char, col * asciiSpacing, row * asciiSpacing + asciiFontSize);
        }
      }
      
      // Update texture if it exists
      if (textTextureRef) {
        textTextureRef.needsUpdate = true;
      }
    };
    
    asciiDrawFunction = drawAsciiBackground;
    drawAsciiBackground(0);

    // Hero text, logo and subtitle are now rendered separately in page.tsx

    const textTexture = new THREE.CanvasTexture(canvas2d);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;
    textTexture.format = THREE.RGBAFormat;
    textTextureRef = textTexture; // Store reference for ASCII updates

    const onResize = () => {
      width = getWidth();
      height = getHeight();
      renderer.setSize(window.innerWidth, window.innerHeight);
      rtA.setSize(width, height);
      rtB.setSize(width, height);
      (simMaterial.uniforms.resolution.value as THREE.Vector2).set(
        width,
        height
      );

      canvas2d.width = width;
      canvas2d.height = height;
      // Transparent background - no fill needed

      // Draw ASCII characters background that will be distorted by water effect
      const drawAsciiBackgroundOnResize = (time: number = 0) => {
        const newAsciiFontSize = Math.round(14 * window.devicePixelRatio);
        const newAsciiSpacing = Math.round(16 * window.devicePixelRatio);
        const characterSet = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^'. ";
        
        ctx.font = `${newAsciiFontSize}px Courier New`;
        
        const newCharsPerRow = Math.ceil(width / newAsciiSpacing);
        const newRows = Math.ceil(height / newAsciiSpacing);
        
        for (let row = 0; row < newRows; row++) {
          // Generate random seed for this row that changes over time
          const rowSeed = Math.floor((row * 7919 + time * 100) % 2147483647);
          let randomState = rowSeed;
          
          for (let col = 0; col < newCharsPerRow; col++) {
            // Simple PRNG for each character position - truly random per position
            randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
            const charIndex = randomState % characterSet.length;
            const char = characterSet[charIndex];
            
            // Varying opacity that changes with time and position (half transparent)
            const baseOpacity = 0.15;
            const opacityVariation = Math.sin((row * col + time * 2) * 0.1) * 0.05;
            const opacity = Math.max(0.1, Math.min(0.2, baseOpacity + opacityVariation));
            
            // Grey color instead of white
            const greyValue = 180; // Medium grey
            ctx.fillStyle = `rgba(${greyValue}, ${greyValue}, ${greyValue}, ${opacity})`;
            ctx.fillText(char, col * newAsciiSpacing, row * newAsciiSpacing + newAsciiFontSize);
          }
        }
      };
      
      drawAsciiBackgroundOnResize();

      // Hero text, logo and subtitle are now rendered separately in page.tsx
      textTexture.needsUpdate = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX * window.devicePixelRatio;
      mouse.y = (window.innerHeight - e.clientY) * window.devicePixelRatio;
    };
    const onMouseLeave = () => {
      mouse.set(0, 0);
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    let rafId = 0;
    const animate = () => {
      const currentTime = performance.now() / 1000;
      (simMaterial.uniforms.frame.value as number) = frame++;
      (simMaterial.uniforms.time.value as number) = currentTime;
      (renderMaterial.uniforms.time.value as number) = currentTime;

      // Update ASCII background every ~0.1 seconds for animated transparency
      if (currentTime - lastAsciiUpdate > 0.1 && asciiDrawFunction) {
        // Clear canvas and redraw everything
        ctx.clearRect(0, 0, width, height);
        
        // Redraw ASCII with current time
        asciiDrawFunction(currentTime);
        
        // Hero text, logo and subtitle are now rendered separately in page.tsx
        
        lastAsciiUpdate = currentTime;
      }

      (simMaterial.uniforms.textureA.value as THREE.Texture) = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, camera);

      (renderMaterial.uniforms.textureA.value as THREE.Texture) = rtB.texture;
      (renderMaterial.uniforms.textureB.value as THREE.Texture) = textTexture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      const temp = rtA;
      rtA = rtB;
      rtB = temp;

      rafId = requestAnimationFrame(animate);
    };
    animate();

    // Trigger loaded state after a short delay for smooth animation
    setTimeout(() => setIsLoaded(true), 100);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseleave", onMouseLeave);

      mountTarget.removeChild(renderer.domElement);

      plane.dispose();
      simMaterial.dispose();
      renderMaterial.dispose();
      textTexture.dispose();
      rtA.dispose();
      rtB.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out'
      }}
    />
  );
}


