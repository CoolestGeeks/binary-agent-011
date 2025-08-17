
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse, Scene, VoiceHint } from '../types';
import BinaryArt from './BinaryArt';
import MatrixBackground from './MatrixBackground';
import PauseButton from './PauseButton';
import { AGENT_ART } from '../constants';

interface VisualizerProps {
  response: ApiResponse;
}

const useMousePosition = (ref: React.RefObject<HTMLElement>) => {
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      }
    };

    const handleMouseLeave = () => {
      setPosition(null);
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener('mousemove', handleMouseMove);
      currentRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('mousemove', handleMouseMove);
        currentRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [ref]);

  return position;
};

const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-md w-max max-w-[90%] z-30">
    <p className="text-center text-sm sm:text-base text-gray-200 font-sans">{text}</p>
  </div>
);

const Visualizer: React.FC<VisualizerProps> = ({ response }) => {
  const { narration_ssml, voice_hint, scenes } = response;
  
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const sceneStartTimeRef = useRef<number>(0);
  const timePausedRef = useRef<number>(0);

  const visualizerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition(visualizerRef);

  const speak = useCallback((ssml: string, hint: VoiceHint) => {
    const textToSpeak = ssml.replace(/<[^>]+>/g, '').trim();
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(hint.language)) || voices[0];
    
    if (voice) {
        utterance.voice = voice;
    }
    utterance.pitch = hint.pitch;
    utterance.rate = hint.rate;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Main animation and scene progression loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (sceneStartTimeRef.current === 0) {
        sceneStartTimeRef.current = timestamp;
      }

      if (!isPaused) {
        const currentScene = scenes[sceneIndex];
        const elapsed = timestamp - sceneStartTimeRef.current;
        
        if (currentScene && elapsed >= currentScene.duration_ms) {
          const nextIndex = sceneIndex + 1;
          if (nextIndex < scenes.length) {
            setSceneIndex(nextIndex);
            sceneStartTimeRef.current = timestamp;
          } else {
            // End of scenes, stop loop
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    // Start loop
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [sceneIndex, scenes, isPaused]);

  // Speech synthesis handling
  useEffect(() => {
    if (narration_ssml) {
        const loadVoicesAndSpeak = () => {
            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => speak(narration_ssml, voice_hint);
            } else {
                speak(narration_ssml, voice_hint);
            }
        };
        loadVoicesAndSpeak();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [narration_ssml, voice_hint, speak]);

  const handlePauseToggle = () => {
    const nowPaused = !isPaused;
    setIsPaused(nowPaused);
    if (nowPaused) {
      window.speechSynthesis.pause();
      timePausedRef.current = performance.now();
    } else {
      window.speechSynthesis.resume();
      if (sceneStartTimeRef.current > 0 && timePausedRef.current > 0) {
          const pauseDuration = performance.now() - timePausedRef.current;
          sceneStartTimeRef.current += pauseDuration;
      }
    }
  };

  const currentScene = scenes[sceneIndex] || scenes[scenes.length - 1];
  if (!currentScene) return null;

  const agentArtFrames = currentScene.agent_action ? AGENT_ART[currentScene.agent_action] : AGENT_ART.idle;

  return (
    <div className="w-full mx-auto">
      <div 
        ref={visualizerRef}
        className="relative aspect-video bg-black border-2 border-gray-700 rounded-xl shadow-2xl shadow-cyan-500/10 flex items-center justify-center overflow-hidden p-2"
      >
        <MatrixBackground isPaused={isPaused} />
        
        {/* Agent Character */}
        <div
          className="absolute z-20 transition-all duration-1000 ease-in-out"
          style={{
            left: `${currentScene.agent_position.x}%`,
            top: `${currentScene.agent_position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <BinaryArt 
            artFrames={agentArtFrames}
            isSymbol={false}
            isPaused={isPaused}
            mousePosition={mousePosition}
          />
        </div>
        
        {/* Symbol Object */}
        <div
          className="absolute z-10 transition-all duration-1000 ease-in-out"
          style={{
            left: `${currentScene.symbol_position?.x ?? 50}%`,
            top: `${currentScene.symbol_position?.y ?? 50}%`,
            transform: 'translate(-50%, -50%) scale(0.7)',
            opacity: currentScene.symbol_art ? 1 : 0,
          }}
        >
          {currentScene.symbol_art &&
            <BinaryArt 
              artFrames={[currentScene.symbol_art]}
              isSymbol={true}
              isPaused={isPaused}
              mousePosition={mousePosition}
            />
          }
        </div>
        
        <PauseButton isPaused={isPaused} onClick={handlePauseToggle} />

        {currentScene.caption && <Caption text={currentScene.caption} />}
      </div>
    </div>
  );
};

export default Visualizer;
