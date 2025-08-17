
import React from 'react';

interface PauseButtonProps {
  isPaused: boolean;
  onClick: () => void;
}

const PauseIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseButton: React.FC<PauseButtonProps> = ({ isPaused, onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 z-30 p-2 bg-black/40 text-white/70 hover:text-white hover:bg-black/60 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
    aria-label={isPaused ? 'Play' : 'Pause'}
  >
    {isPaused ? <PlayIcon /> : <PauseIcon />}
  </button>
);

export default PauseButton;
