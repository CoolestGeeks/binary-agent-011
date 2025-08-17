import React, { useState } from 'react';

interface UserInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question, e.g., What is cloud computing?"
          className="w-full p-4 pr-32 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none transition-all duration-300 resize-none font-sans"
          rows={2}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="absolute top-1/2 right-3 transform -translate-y-1/2 px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md shadow-md hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
        >
          {isLoading ? 'Generating...' : 'Ask'}
        </button>
      </div>
    </form>
  );
};

export default UserInput;