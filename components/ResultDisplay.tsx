
import React from 'react';
import type { GenerationResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
  onQuoteChange: (newQuote: string) => void;
}

const Placeholder: React.FC = () => (
    <div className="text-center text-gray-500 py-16 border-2 border-dashed border-gray-700 rounded-xl">
        <p>Sua arte inspiradora aparecerá aqui.</p>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, onQuoteChange }) => {
  if (isLoading && !result) {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <LoadingSpinner text="Iniciando o processo criativo..." />
        </div>
    );
  }

  if (!result) {
    return <Placeholder />;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg animate-fade-in">
      <div className="space-y-6">
        {/* Image Display */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
          {result.imageUrl ? (
             <img src={result.imageUrl} alt="Arte gerada" className="object-cover w-full h-full" />
          ) : (
            <LoadingSpinner text="Gerando a imagem... isso pode levar um momento." />
          )}
        </div>

        {/* Quote and Prompt */}
        <div className="grid md:grid-cols-2 gap-6">
            {/* Quote */}
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600 flex flex-col">
                <label htmlFor="quote-editor" className="text-sm font-semibold text-purple-400 mb-2 block">
                  Frase Gerada (editável)
                </label>
                {result.isLoadingQuote ? (
                    <LoadingSpinner text="Analisando a imagem para criar a frase..." />
                ) : (
                    <textarea
                    id="quote-editor"
                    value={result.quote}
                    onChange={(e) => onQuoteChange(e.target.value)}
                    rows={3}
                    className="w-full flex-grow bg-transparent text-xl italic text-gray-200 p-1 border-0 focus:ring-2 focus:ring-purple-500 rounded-md resize-none transition-all"
                    aria-label="Frase gerada editável"
                    />
                )}
            </div>

            {/* Image Prompt */}
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
                <h3 className="text-sm font-semibold text-pink-400 mb-2">Prompt de Imagem</h3>
                <p className="text-sm text-gray-400 font-mono bg-black/30 p-3 rounded-md break-words h-full">
                    {result.imagePrompt}
                </p>
            </div>
        </div>
      </div>
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
