
import React, { useState, useEffect, useMemo, useRef } from 'react';

interface BinaryArtProps {
  artFrames: string[];
  isSymbol: boolean;
  isPaused: boolean;
  mousePosition: { x: number; y: number } | null;
}

const INTERACTION_RADIUS = 80;
const MAX_DISPLACEMENT = 6;

const BinaryArt: React.FC<BinaryArtProps> = ({ artFrames, isSymbol, isPaused, mousePosition }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const artRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setFrameIndex(0); // Reset animation on new art
    if (artFrames.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setFrameIndex(prev => (prev + 1) % artFrames.length);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [artFrames, isPaused]);

  const currentArt = useMemo(() => artFrames[frameIndex] || '', [artFrames, frameIndex]);
  
  const scaledArt = useMemo(() => {
    const artToScale = currentArt || '';
    if (isSymbol && artToScale) {
      const scale = 8; // Scale symbols to be larger
      const lines = artToScale.trim().split('\n');
      const newLines = [];
      for (const line of lines) {
        const expandedLine = line.split('').map(char => char.repeat(scale)).join('');
        for (let i = 0; i < scale; i++) {
          newLines.push(expandedLine);
        }
      }
      return newLines.join('\n');
    }
    return artToScale;
  }, [currentArt, isSymbol]);

  const artLines = useMemo(() => scaledArt.split('\n'), [scaledArt]);

  const charDimensions = useMemo(() => {
    if (artRef.current) {
      const span = document.createElement('span');
      span.style.font = window.getComputedStyle(artRef.current).font;
      span.style.visibility = 'hidden';
      span.textContent = '0';
      document.body.appendChild(span);
      const { width, height } = span.getBoundingClientRect();
      document.body.removeChild(span);
      return { width: width || 5, height: height || 5 };
    }
    return { width: 5, height: 5 };
  }, [artRef.current]);


  if (!artFrames || artFrames.length === 0) return null;

  return (
    <pre
      ref={artRef}
      className="font-mono text-[0.2rem] sm:text-[0.25rem] md:text-[0.32rem] lg:text-[0.4rem] xl:text-[0.5rem] leading-tight text-center text-white select-none whitespace-pre"
    >
      {artLines.map((line, i) => (
        <span key={i} className="block">
          {line.split('').map((char, j) => {
            let style: React.CSSProperties = { transition: 'transform 0.2s ease-out, color 0.2s ease-out, text-shadow 0.2s ease-out' };
            let className = char === '0' ? 'text-gray-700' : 'text-white text-glow';

            if (mousePosition && artRef.current) {
               // Get the position of the art container relative to the viewport
              const artRect = artRef.current.getBoundingClientRect();
              
              // Calculate char position relative to the viewport
              const charScreenX = artRect.left + (j * charDimensions.width) + (charDimensions.width / 2);
              const charScreenY = artRect.top + (i * charDimensions.height) + (charDimensions.height / 2);

              // Calculate mouse position relative to the viewport (assuming visualizer is the reference)
              // This is an approximation; mousePosition is relative to the parent visualizer.
              // For a perfect effect we'd need the visualizer's rect too, but this works well.
              const dx = charScreenX - (mousePosition.x + artRect.left);
              const dy = charScreenY - (mousePosition.y + artRect.top);
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < INTERACTION_RADIUS) {
                const falloff = 1 - (distance / INTERACTION_RADIUS);
                
                const displacement = Math.pow(falloff, 1.5) * MAX_DISPLACEMENT;
                const angle = Math.atan2(dy, dx);
                
                const translateX = Math.cos(angle) * displacement;
                const translateY = Math.sin(angle) * displacement;

                style.transform = `translate(${translateX}px, ${translateY}px)`;
                
                if (char === '0') {
                    const brightness = Math.floor(128 + 100 * falloff);
                    style.color = `rgb(${brightness}, ${brightness}, ${brightness})`;
                } else {
                    const glowSize = 2 + 10 * falloff;
                    style.textShadow = `0 0 2px #fff, 0 0 ${glowSize}px #06b6d4, 0 0 ${glowSize * 2}px #06b6d4`;
                }
              }
            }
            
            return (
              <span key={j} className={className} style={style}>
                {char === ' ' ? ' ' : char}
              </span>
            );
          })}
        </span>
      ))}
    </pre>
  );
};

export default BinaryArt;
