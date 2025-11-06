
import React, { useState } from 'react';
import EvaluationView from './components/EvaluationView';

const ProjectSetup: React.FC<{ onStart: (projectName: string) => void }> = ({ onStart }) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onStart(projectName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400">Cadete Avaliador</h1>
          <p className="mt-2 text-gray-400">Simulador de Avaliação da 42 Network</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-300">
              Nome do Projeto
            </label>
            <div className="mt-1">
              <input
                id="project-name"
                name="project-name"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-gray-700 text-white"
                placeholder="ex: ft_printf"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors duration-200"
            >
              Iniciar Avaliação
            </button>
          </div>
        </form>
         <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Esta é uma simulação. O objetivo é preparar você para uma avaliação real, testando seu conhecimento e defesa do código.</p>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [projectName, setProjectName] = useState<string | null>(null);

  const handleStartEvaluation = (name: string) => {
    setProjectName(name);
  };

  return (
    <>
      {projectName ? (
        <EvaluationView projectName={projectName} />
      ) : (
        <ProjectSetup onStart={handleStartEvaluation} />
      )}
    </>
  );
}
