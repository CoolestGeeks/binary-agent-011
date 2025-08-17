import React, { useEffect, useRef } from 'react';

const FONT_SIZE = 10;
const CHARS = ['0', '1'];

const MatrixBackground: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref to store animation state that persists across renders
  const animationState = useRef({
    animationFrameId: 0,
    columns: 0,
    drops: [] as number[],
  }).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ResizeObserver is the modern API for tracking an element's size changes.
    // It's more efficient and reliable than window.onresize.
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      // Set the canvas physical size (accounting for high-DPI displays)
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      
      // Scale the canvas context to use CSS pixels, simplifying drawing logic
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Recalculate column count and reset drop positions on resize
      animationState.columns = Math.floor(width / FONT_SIZE);
      animationState.drops = [];
      for (let i = 0; i < animationState.columns; i++) {
        // Randomize starting y position for a more organic, less uniform look
        animationState.drops[i] = Math.floor(Math.random() * (height / FONT_SIZE));
      }
    });
    
    resizeObserver.observe(canvas);

    const draw = () => {
        if (!canvasRef.current) return;
        const { width, height } = canvasRef.current.getBoundingClientRect();

        // Draw a semi-transparent rectangle over the canvas on each frame.
        // This creates the classic "fading trail" effect for the characters.
        // The color is black to match the visualizer's background.
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#1F2937'; // Tailwind's text-gray-800
        ctx.font = `${FONT_SIZE}px monospace`;

        for (let i = 0; i < animationState.drops.length; i++) {
            const text = CHARS[Math.floor(Math.random() * CHARS.length)];
            const x = i * FONT_SIZE;
            const y = animationState.drops[i] * FONT_SIZE;
            
            ctx.fillText(text, x, y);

            // When a drop reaches the bottom, reset it to the top with a small random chance.
            // This prevents all drops from resetting at once, creating a continuous effect.
            if (y > height && Math.random() > 0.975) {
                animationState.drops[i] = 0;
            }

            animationState.drops[i]++;
        }
    };

    const loop = () => {
      if (!isPaused) {
        draw();
      }
      animationState.animationFrameId = requestAnimationFrame(loop);
    };

    // Start the animation loop
    loop();

    // Cleanup function to stop the observer and animation frame when the component unmounts
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationState.animationFrameId);
    };
  }, [isPaused, animationState]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
    />
  );
};

export default MatrixBackground;