
import React, { useState, useEffect, useRef } from 'react';
import type { GenerationResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
// @ts-ignore
import html2canvas from 'html2canvas';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
  onQuoteChange: (newQuote: string) => void;
}

interface CustomizationState {
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  overlayColor: string;
  overlayOpacity: number;
}

const STORAGE_KEY = 'inspira-arte-customization';

const PRESETS = [
  { name: 'Original', color: '#000000', opacity: 0 },
  { name: 'Sombrio', color: '#000000', opacity: 0.5 },
  { name: 'Claro', color: '#ffffff', opacity: 0.2 },
  { name: 'Quente', color: '#f59e0b', opacity: 0.3 },
  { name: 'Frio', color: '#3b82f6', opacity: 0.3 },
  { name: 'Roxo', color: '#7e22ce', opacity: 0.3 },
  { name: 'Sépia', color: '#78350f', opacity: 0.4 },
];

const FONT_OPTIONS = [
    { value: 'sans-serif', label: 'Moderno (Sans)' },
    { value: 'serif', label: 'Clássico (Serif)' },
    { value: 'monospace', label: 'Tecnológico (Mono)' },
    { value: 'cursive', label: 'Manuscrito' },
    { value: 'fantasy', label: 'Decorativo' },
];

const AlignLeftIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>;
const AlignCenterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="10" x2="7" y2="10"></line><line x1="19" y1="14" x2="5" y2="14"></line><line x1="17" y1="18" x2="7" y2="18"></line></svg>;
const AlignRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>;
const DownloadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

const Placeholder: React.FC = () => (
    <div className="text-center text-gray-500 py-16 border-2 border-dashed border-gray-700 rounded-xl">
        <p>Sua arte inspiradora aparecerá aqui.</p>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, onQuoteChange }) => {
  const [customization, setCustomization] = useState<CustomizationState>(() => {
    const defaultState: CustomizationState = {
        fontFamily: 'sans-serif',
        fontSize: 28,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: true,
        overlayColor: '#000000',
        overlayOpacity: 0.3,
    };

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch (error) {
        console.warn('Erro ao carregar configurações do localStorage:', error);
        return defaultState;
    }
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
    } catch (error) {
        console.warn('Erro ao salvar configurações no localStorage:', error);
    }
  }, [customization]);

  const handleDownload = async () => {
    if (!imageContainerRef.current) return;
    setIsDownloading(true);

    try {
        // Force the font to load before capturing if possible, but basic browser rendering usually handles it.
        const canvas = await html2canvas(imageContainerRef.current, {
            useCORS: true,
            scale: 2, // Higher resolution
            backgroundColor: null, // Transparent background if needed, but we have image
            logging: false,
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `inspira-arte-${Date.now()}.png`;
        link.click();
    } catch (error) {
        console.error("Erro ao baixar a imagem:", error);
    } finally {
        setIsDownloading(false);
    }
  };

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
        {/* Image Display with Overlay */}
        <div 
            ref={imageContainerRef}
            className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700 group shadow-inner transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]"
        >
          {result.imageUrl ? (
            <>
               <img 
                 src={result.imageUrl} 
                 alt="Arte gerada" 
                 className="object-cover w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-105" 
                 crossOrigin="anonymous"
               />
               
               {/* Color Overlay */}
               <div 
                 className="absolute inset-0 pointer-events-none transition-all duration-300"
                 style={{ backgroundColor: customization.overlayColor, opacity: customization.overlayOpacity }}
               />

               {/* Text Overlay */}
               {result.quote && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12 pointer-events-none">
                      <p
                          style={{
                              fontFamily: customization.fontFamily,
                              fontSize: `${customization.fontSize}px`,
                              color: customization.color,
                              textAlign: customization.textAlign,
                              textShadow: customization.textShadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                              whiteSpace: 'pre-wrap',
                              width: '100%',
                              lineHeight: 1.4,
                              zIndex: 10,
                          }}
                          className="transition-all duration-300 break-words"
                      >
                          {result.quote}
                      </p>
                  </div>
               )}
            </>
          ) : (
            <LoadingSpinner text="Gerando a imagem... isso pode levar um momento." />
          )}
        </div>

        {/* Action Buttons: Preview Toggle & Download */}
        <div className="flex justify-end gap-3">
             <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors border ${
                    isPreviewMode 
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500 hover:bg-purple-600/30' 
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                }`}
                title={isPreviewMode ? "Voltar para edição" : "Visualizar sem controles"}
            >
                {isPreviewMode ? <EditIcon /> : <EyeIcon />}
                {isPreviewMode ? 'Editar' : 'Visualizar'}
            </button>

            <button
                onClick={handleDownload}
                disabled={isDownloading || !result.imageUrl}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isDownloading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <DownloadIcon />
                )}
                {isDownloading ? 'Baixando...' : 'Baixar Imagem'}
            </button>
        </div>

        {/* Customization Controls Area (Hidden in Preview Mode) */}
        {!isPreviewMode && (
            <div className="animate-fade-in space-y-6">
                <div className="grid lg:grid-cols-2 gap-4">
                    
                    {/* 1. Text Customization */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                            <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Texto
                            </h3>
                            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none hover:text-gray-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={customization.textShadow}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, textShadow: e.target.checked }))}
                                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                                />
                                Sombra
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {/* Font Family */}
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs text-gray-400 block mb-1">Fonte</label>
                                <select
                                    value={customization.fontFamily}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, fontFamily: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1.5 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                >
                                    {FONT_OPTIONS.map(font => (
                                        <option key={font.value} value={font.value}>{font.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Font Size */}
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs text-gray-400 block mb-1 flex justify-between">
                                <span>Tamanho</span>
                                <span>{customization.fontSize}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="14"
                                    max="64"
                                    value={customization.fontSize}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Cor</label>
                                <div className="flex gap-2 h-8">
                                    <div className="relative overflow-hidden w-10 h-full rounded border border-gray-600">
                                        <input
                                            type="color"
                                            value={customization.color}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, color: e.target.value }))}
                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <div className="flex-1 bg-gray-800 border border-gray-600 rounded flex items-center px-2 text-xs font-mono text-gray-400">
                                        {customization.color}
                                    </div>
                                </div>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Alinhamento</label>
                                <div className="flex bg-gray-800 rounded-md border border-gray-600 p-0.5 h-8">
                                    {(['left', 'center', 'right'] as const).map((align) => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => setCustomization(prev => ({ ...prev, textAlign: align }))}
                                            title={align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                                            className={`flex-1 rounded text-xs transition-colors font-medium flex items-center justify-center ${customization.textAlign === align ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
                                        >
                                            {align === 'left' ? <AlignLeftIcon /> : align === 'center' ? <AlignCenterIcon /> : <AlignRightIcon />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Filter & Atmosphere Customization */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>
                                Filtro e Atmosfera
                            </h3>
                            
                            {/* Palette Presets */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.name}
                                        onClick={() => setCustomization(prev => ({ ...prev, overlayColor: preset.color, overlayOpacity: preset.opacity }))}
                                        className="px-2 py-1 text-xs rounded border border-gray-600 hover:border-pink-400 transition-colors"
                                        style={{ 
                                            backgroundColor: preset.color === '#000000' && preset.opacity === 0 ? 'transparent' : preset.color,
                                            color: (parseInt(preset.color.replace('#', ''), 16) > 0xffffff / 2) && preset.opacity > 0.3 ? '#000' : '#fff'
                                        }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Overlay Color Input */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Cor do Filtro</label>
                                <div className="flex gap-2 h-8">
                                    <div className="relative overflow-hidden w-10 h-full rounded border border-gray-600">
                                        <input
                                            type="color"
                                            value={customization.overlayColor}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, overlayColor: e.target.value }))}
                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={customization.overlayColor}
                                        onChange={(e) => setCustomization(prev => ({...prev, overlayColor: e.target.value}))}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 text-xs font-mono text-gray-400 focus:outline-none focus:border-pink-500"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            
                            {/* Intensity Slider */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1 flex justify-between">
                                    <span>Intensidade</span>
                                    <span>{Math.round(customization.overlayOpacity * 100)}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={customization.overlayOpacity}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, overlayOpacity: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote and Prompt Editors */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quote Editor */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600 flex flex-col">
                        <label htmlFor="quote-editor" className="text-sm font-semibold text-purple-400 mb-2 block">
                        Editar Frase
                        </label>
                        {result.isLoadingQuote ? (
                            <LoadingSpinner text="Analisando a imagem para criar a frase..." />
                        ) : (
                            <textarea
                            id="quote-editor"
                            value={result.quote}
                            onChange={(e) => onQuoteChange(e.target.value)}
                            rows={3}
                            className="w-full flex-grow bg-transparent text-xl italic text-gray-200 p-1 border-0 focus:ring-2 focus:ring-purple-500 rounded-md resize-none transition-all placeholder-gray-600"
                            placeholder="Sua frase aparecerá aqui..."
                            />
                        )}
                    </div>

                    {/* Image Prompt Display */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
                        <h3 className="text-sm font-semibold text-pink-400 mb-2">Prompt de Imagem</h3>
                        <p className="text-sm text-gray-400 font-mono bg-black/30 p-3 rounded-md break-words h-full max-h-40 overflow-y-auto custom-scrollbar">
                            {result.imagePrompt}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};
