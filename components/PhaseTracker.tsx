
import React, { useState, useEffect } from 'react';
import { TranscriptMessage, EvaluationPhase } from '../types';

interface PhaseTrackerProps {
  transcript: TranscriptMessage[];
}

const phaseKeywords: Record<EvaluationPhase, string[]> = {
  [EvaluationPhase.Prerequisites]: ['pré-requisitos', 'instruções', 'repositório', 'subject', 'defender'],
  [EvaluationPhase.Functional]: ['funcionalidade', 'moulinette', 'binário', 'makefile', 'edge case', 'argumentos'],
  [EvaluationPhase.CodeDefense]: ['seu código', 'função', 'estrutura', 'lógica', 'otimização', 'malloc', 'leak', 'norme'],
  [EvaluationPhase.Conclusion]: ['conclusão', 'feedback', 'resultado', 'pontuação', 'pass', 'fail', 'aprovado', 'reprovado'],
};

const phasesOrder = [
    EvaluationPhase.Prerequisites,
    EvaluationPhase.Functional,
    EvaluationPhase.CodeDefense,
    EvaluationPhase.Conclusion,
];

const PhaseTracker: React.FC<PhaseTrackerProps> = ({ transcript }) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    const textCorpus = transcript
      .filter(msg => msg.sender !== 'User')
      .map(msg => msg.text.toLowerCase())
      .join(' ');
    
    let latestPhaseIndex = 0;
    phasesOrder.forEach((phase, index) => {
        const keywords = phaseKeywords[phase];
        if (keywords.some(keyword => textCorpus.includes(keyword))) {
            latestPhaseIndex = index;
        }
    });

    setCurrentPhaseIndex(latestPhaseIndex);
  }, [transcript]);

  return (
    <div className="bg-gray-800/50 p-3 border-b border-gray-700">
      <div className="flex justify-around items-center max-w-4xl mx-auto">
        {phasesOrder.map((phase, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          
          return (
            <React.Fragment key={phase}>
              <div className="flex flex-col items-center text-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive ? 'bg-cyan-500 border-cyan-300 animate-pulse' :
                      isCompleted ? 'bg-green-600 border-green-400' :
                      'bg-gray-600 border-gray-500'
                  }`}>
                      {isCompleted && <span className="text-white font-bold text-sm">✓</span>}
                  </div>
                  <p className={`mt-1 text-xs md:text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-cyan-300' :
                      isCompleted ? 'text-green-400' :
                      'text-gray-400'
                  }`}>
                      {phase.split(' ')[0]}
                  </p>
              </div>
              {index < phasesOrder.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseTracker;
