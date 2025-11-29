
import React, { useState } from 'react';
import type { VisualIdentityResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface VisualIdentityResultDisplayProps {
  result: VisualIdentityResult | null;
  onIdentityChange: (field: 'brandName' | 'slogan', value: string) => void;
}

const ColorSwatch: React.FC<{ color: string; name: string }> = ({ color, name }) => (
  <div className="text-center">
    <div className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-600 transition-transform hover:scale-110 duration-200" style={{ backgroundColor: color }}></div>
    <p className="text-sm font-medium text-gray-300 capitalize">{name}</p>
    <p className="text-xs text-gray-500 font-mono">{color}</p>
  </div>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

interface MascotStyle {
    scale: number;
    rotation: number;
    isBouncing: boolean;
}

export const VisualIdentityResultDisplay: React.FC<VisualIdentityResultDisplayProps> = ({ result, onIdentityChange }) => {
  const [mascotStyle, setMascotStyle] = useState<MascotStyle>({
      scale: 1,
      rotation: 0,
      isBouncing: false,
  });

  const handleExport = () => {
    if (!result) return;

    const content = `
=========================================
IDENTIDADE VISUAL - INSPIRA ARTE
=========================================

MARCA: ${result.brandName}
SLOGAN: ${result.slogan}

-----------------------------------------
PALETA DE CORES
-----------------------------------------
Primária:   ${result.colorPalette.primary}
Secundária: ${result.colorPalette.secondary}
Destaque:   ${result.colorPalette.accent}

-----------------------------------------
PROMPT DO MASCOTE
-----------------------------------------
${result.mascotPrompt}

=========================================
Gerado por Inspira Arte
`.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `identidade-visual-${result.brandName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg animate-fade-in space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Images Column */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Uploaded Image */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Sua Imagem</h3>
            <img src={result.uploadedImageUrl} alt="Imagem enviada" className="rounded-lg object-cover w-full aspect-square border border-gray-700" />
          </div>

          {/* Generated Mascot */}
          <div className="text-center flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Mascote Gerado</h3>
            <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700 shadow-inner group">
              {result.isLoadingMascot ? (
                <LoadingSpinner text="Criando mascote..." />
              ) : (
                /* Wrapper handles the continuous loop animations (Idle or Float/Bounce) */
                <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ${mascotStyle.isBouncing ? 'animate-float' : 'animate-idle'}`}>
                   {/* Image handles the user transforms (Scale/Rotate) and entrance animation */}
                    <img 
                      src={result.mascotImageUrl} 
                      alt="Mascote gerado" 
                      style={{
                          transform: `scale(${mascotStyle.scale}) rotate(${mascotStyle.rotation}deg)`,
                      }}
                      className="object-cover w-full h-full transition-transform duration-300 ease-out animate-scale-in" 
                    />
                </div>
              )}
            </div>

            {/* Mascot Customization Controls */}
            {!result.isLoadingMascot && (
                <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-600 flex flex-col gap-2 mt-1">
                    {/* Bounce Toggle */}
                    <button
                        onClick={() => setMascotStyle(prev => ({ ...prev, isBouncing: !prev.isBouncing }))}
                        className={`text-xs font-medium py-1 px-2 rounded transition-colors flex items-center justify-center gap-1 ${mascotStyle.isBouncing ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        {mascotStyle.isBouncing ? '✨ Animado' : '⚡ Animar'}
                    </button>

                    {/* Scale Slider */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-4">Tam</span>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={mascotStyle.scale}
                            onChange={(e) => setMascotStyle(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>

                    {/* Rotation Slider */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-4">Rot</span>
                        <input
                            type="range"
                            min="-45"
                            max="45"
                            value={mascotStyle.rotation}
                            onChange={(e) => setMascotStyle(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Brand Details Column */}
        <div className="space-y-4 flex flex-col h-full">
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
          
          <div className="flex-grow"></div>
          
          <button
            onClick={handleExport}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
          >
            <FileTextIcon />
            Exportar Identidade (TXT)
          </button>
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
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        @keyframes idle {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.03); filter: brightness(1.08); } 
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-scale-in {
            animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
        .animate-idle {
            animation: idle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
