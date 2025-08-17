
import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/50 rounded-lg">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="mt-4 text-lg font-mono text-cyan-300 tracking-wider">
        Generating explanation{dots}
      </p>
      <p className="mt-2 text-sm text-gray-400">The agent is thinking...</p>
    </div>
  );
};

export default Loader;