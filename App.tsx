
import React, { useState } from 'react';
import UserInput from './components/UserInput';
import Visualizer from './components/Visualizer';
import Loader from './components/Loader';
import { fetchExplanation } from './services/geminiService';
import type { ApiResponse } from './types';

const initialApiResponse: ApiResponse = {
  narration_ssml: '',
  voice_hint: { language: 'en', style: 'friendly', rate: 1, pitch: 0 },
  scenes: [{
    duration_ms: 9999999,
    agent_action: 'idle',
    agent_position: { x: 50, y: 50 },
  }]
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    window.speechSynthesis.cancel();

    try {
      const response = await fetchExplanation(question);
      setApiResponse(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Binary Art <span className="text-cyan-400 text-glow">Explainer</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Ask any question. Get an AI-powered voice and visual explanation.
        </p>
      </div>

      <UserInput onSubmit={handleSubmit} isLoading={isLoading} />

      <div className="w-full max-w-5xl mt-6">
        {isLoading && <Loader />}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
        {!isLoading && !error && (
           <Visualizer response={apiResponse || initialApiResponse} />
        )}
      </div>
        <footer className="text-center text-gray-600 mt-12 text-sm">
            <p>Powered by Google Gemini. UI by a world-class React engineer.</p>
        </footer>
    </div>
  );
};

export default App;
