
import React from 'react';
import type { VisualIdentityResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface VisualIdentityResultDisplayProps {
  result: VisualIdentityResult | null;
  onIdentityChange: (field: 'brandName' | 'slogan', value: string) => void;
}

const ColorSwatch: React.FC<{ color: string; name: string }> = ({ color, name }) => (
  <div className="text-center">
    <div className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-600" style={{ backgroundColor: color }}></div>
    <p className="text-sm font-medium text-gray-300 capitalize">{name}</p>
    <p className="text-xs text-gray-500 font-mono">{color}</p>
  </div>
);


export const VisualIdentityResultDisplay: React.FC<VisualIdentityResultDisplayProps> = ({ result, onIdentityChange }) => {
  if (!result) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg animate-fade-in space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Images */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Sua Imagem</h3>
            <img src={result.uploadedImageUrl} alt="Imagem enviada" className="rounded-lg object-cover w-full aspect-square border border-gray-700" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Mascote Gerado</h3>
            <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
              {result.isLoadingMascot ? (
                <LoadingSpinner text="Criando mascote..." />
              ) : (
                <img src={result.mascotImageUrl} alt="Mascote gerado" className="object-cover w-full h-full" />
              )}
            </div>
          </div>
        </div>
        {/* Brand Details */}
        <div className="space-y-4">
          <div>
            <label htmlFor="brandName-editor" className="text-sm font-semibold text-gray-400 mb-1 block">Nome da Marca (editável)</label>
            <input
                id="brandName-editor"
                type="text"
                value={result.brandName}
                onChange={(e) => onIdentityChange('brandName', e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-purple-400 p-1 border-0 focus:ring-2 focus:ring-purple-500 rounded-md transition-all"
                aria-label="Nome da marca editável"
            />
            <label htmlFor="slogan-editor" className="text-sm font-semibold text-gray-400 mb-1 mt-2 block">Slogan (editável)</label>
             <textarea
                id="slogan-editor"
                value={result.slogan}
                onChange={(e) => onIdentityChange('slogan', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-md italic text-gray-300 p-1 border-0 focus:ring-2 focus:ring-purple-500 rounded-md resize-none transition-all"
                aria-label="Slogan editável"
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Paleta de Cores</h4>
            <div className="flex justify-around items-center bg-gray-900/70 p-4 rounded-lg">
              <ColorSwatch color={result.colorPalette.primary} name="Primária" />
              <ColorSwatch color={result.colorPalette.secondary} name="Secundária" />
              <ColorSwatch color={result.colorPalette.accent} name="Destaque" />
            </div>
          </div>
        </div>
      </div>
      {/* Mascot Prompt */}
      <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
          <h3 className="text-sm font-semibold text-pink-400 mb-2">Prompt do Mascote</h3>
          <p className="text-sm text-gray-400 font-mono bg-black/30 p-3 rounded-md break-words">
              {result.mascotPrompt}
          </p>
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
