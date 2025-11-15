import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { GeneratePayload } from '../types';

interface ThemeInputFormProps {
  onGenerate: (payload: GeneratePayload) => void;
  isLoading: boolean;
}

type Mode = 'theme' | 'prompt' | 'upload';

const inspirationalThemes = [
  'Esperança', 'Gratidão', 'Resiliência', 'Coragem', 'Amizade', 'Sonhos',
  'Felicidade', 'Paz', 'Superação', 'Amor', 'Liberdade', 'Inspiração'
];

export const ThemeInputForm: React.FC<ThemeInputFormProps> = ({ onGenerate, isLoading }) => {
  const [mode, setMode] = useState<Mode>('theme');
  const [theme, setTheme] = useState('');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    switch (mode) {
      case 'theme':
        if (theme.trim()) onGenerate({ mode, value: theme });
        break;
      case 'prompt':
        if (prompt.trim()) onGenerate({ mode, value: prompt });
        break;
      case 'upload':
        if (file) onGenerate({ mode, value: file });
        break;
    }
  };

  const handleRandomTheme = () => {
    const randomTheme = inspirationalThemes[Math.floor(Math.random() * inspirationalThemes.length)];
    setTheme(randomTheme);
    setMode('theme');
    onGenerate({ mode: 'theme', value: randomTheme });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
            setFileError('Arquivo muito grande. O limite é 4MB.');
            setFile(null);
            return;
        }
        setFileError(null);
        setFile(selectedFile);
    }
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (mode === 'theme' && !theme.trim()) return true;
    if (mode === 'prompt' && !prompt.trim()) return true;
    if (mode === 'upload' && !file) return true;
    return false;
  }

  const TabButton: React.FC<{ currentMode: Mode; targetMode: Mode; children: React.ReactNode; }> = ({ currentMode, targetMode, children }) => (
    <button
        type="button"
        onClick={() => setMode(targetMode)}
        disabled={isLoading}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 ${
            currentMode === targetMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex justify-center mb-4 space-x-2">
        <TabButton currentMode={mode} targetMode="theme">Tema</TabButton>
        <TabButton currentMode={mode} targetMode="prompt">Prompt</TabButton>
        <TabButton currentMode={mode} targetMode="upload">Imagem</TabButton>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'theme' && (
           <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Digite um tema (ex: Fé, Alegria, Superação)"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 text-lg"
            disabled={isLoading}
          />
        )}
        {mode === 'prompt' && (
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva a imagem que você quer criar... (em inglês para melhores resultados)"
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 text-base"
                disabled={isLoading}
            />
        )}
        {mode === 'upload' && (
             <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="image-upload-input-main" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 4MB)</p>
                    </div>
                    {/* Fix: Corrected typo in function name from handleFilechange to handleFileChange */}
                    <input id="image-upload-input-main" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={isLoading} />
                </label>
                {file && <p className="text-sm text-gray-300 mt-2">Arquivo selecionado: <span className="font-medium">{file.name}</span></p>}
                {fileError && <p className="text-sm text-red-400 mt-2">{fileError}</p>}
            </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
            type="submit"
            disabled={isSubmitDisabled()}
            className="w-full flex-grow flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 text-lg"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Gerando...
                </>
            ) : (
                <>
                <SparklesIcon className="w-5 h-5" />
                Gerar Arte
                </>
            )}
            </button>
            <button
                type="button"
                onClick={handleRandomTheme}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-lg"
                aria-label="Gerar tema aleatório"
            >
                🎲 Tema Aleatório
            </button>
        </div>
      </form>
    </div>
  );
};