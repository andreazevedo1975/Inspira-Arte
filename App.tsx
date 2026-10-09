import React, { useState, useCallback, useEffect } from 'react';
import { ThemeInputForm } from './components/ThemeInputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { RecentProjectsGallery } from './components/RecentProjectsGallery';
import { VisualIdentityForm } from './components/VisualIdentityForm';
import { VisualIdentityResultDisplay } from './components/VisualIdentityResultDisplay';
import { LogoStudio } from './components/LogoStudio';
import { ComplementaryPaletteSelector } from './components/ComplementaryPaletteSelector';
import { CharacterStudio } from './components/CharacterStudio';
import {
  generateImagePromptFromTheme,
  generateImage,
  generateQuoteFromImage,
  generateVisualIdentity,
} from './services/geminiService';
import {
  loadRecentProjects,
  saveRecentProject,
  deleteRecentProject,
  clearAllRecentProjects,
} from './services/projectStorage';
import type { GenerationResult, VisualIdentityResult, GeneratePayload, RecentProject } from './types';
import {
  Sparkles,
  Palette,
  Shapes,
  AlertCircle,
  Cpu,
  Pipette,
  User,
} from 'lucide-react';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'character' | 'logo' | 'identity' | 'palette'>('quotes');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Palette selected context
  const [selectedPaletteImage, setSelectedPaletteImage] = useState<string>('');
  const [selectedPaletteTheme, setSelectedPaletteTheme] = useState<string>('');

  // Visual identity states
  const [visualIdentityResult, setVisualIdentityResult] = useState<VisualIdentityResult | null>(null);
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState<boolean>(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Recent projects gallery state (persisted in localStorage)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(() => loadRecentProjects());

  // Server health indicator
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  const handleGenerate = useCallback(async (payload: GeneratePayload) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const selectedAspectRatio = payload.aspectRatio || '1:1';

    try {
      let promptText = '';
      let imageBase64 = '';
      let mimeType = 'image/png';
      let imageUrl = '';

      if (payload.mode === 'upload') {
        setLoadingStep('Lendo imagem enviada...');
        const file = payload.value as File;
        promptText = `Imagem original enviada: ${file.name}`;
        mimeType = file.type || 'image/png';
        imageBase64 = await fileToBase64(file);
        imageUrl = `data:${mimeType};base64,${imageBase64}`;
      } else {
        const userInput = payload.value as string;

        if (payload.mode === 'theme') {
          setLoadingStep('Criando Superprompt com filtro artístico e estética visual...');
          promptText = await generateImagePromptFromTheme(
            userInput,
            payload.style || 'Cinemático',
            payload.tone || 'Inspirador'
          );
        } else {
          promptText = payload.style
            ? `${userInput}. Visual style and aesthetic filter: ${payload.style}`
            : userInput;
        }

        setLoadingStep('Sintetizando obra de arte em alta fidelidade...');
        imageBase64 = await generateImage(
          promptText,
          selectedAspectRatio,
          payload.mode === 'theme' ? (payload.value as string) : ''
        );
        imageUrl = `data:${mimeType};base64,${imageBase64}`;
      }

      setLoadingStep('Compondo aforismo e frase de alto impacto...');
      setResult({
        quote: 'Sintonizando palavras de poder e sabedoria...',
        imagePrompt: promptText,
        imageUrl,
        isLoadingQuote: true,
        aspectRatio: selectedAspectRatio,
        styleName: payload.style,
        theme: payload.mode === 'theme' ? (payload.value as string) : undefined,
      });

      const finalQuote = await generateQuoteFromImage(
        imageBase64,
        mimeType,
        payload.mode === 'theme' ? (payload.value as string) : undefined,
        payload.tone
      );

      const finalResult: GenerationResult = {
        quote: finalQuote,
        imagePrompt: promptText,
        imageUrl,
        isLoadingQuote: false,
        aspectRatio: selectedAspectRatio,
        styleName: payload.style,
        theme: payload.mode === 'theme' ? (payload.value as string) : undefined,
      };

      setResult(finalResult);

      // Automatically persist in localStorage recent projects gallery (max 5)
      saveRecentProject(finalResult).then((updated) => {
        setRecentProjects(updated);
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          'Ocorreu uma instabilidade na geração de conteúdo. Por favor, tente novamente com outro tema.'
      );
      setResult(null);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, []);

  const handleGenerateIdentity = useCallback(async (file: File, description: string) => {
    setIsGeneratingIdentity(true);
    setIdentityError(null);
    setVisualIdentityResult(null);

    try {
      const base64Image = await fileToBase64(file);
      const payload = await generateVisualIdentity(base64Image, file.type, description);

      setVisualIdentityResult({
        ...payload,
        uploadedImageUrl: URL.createObjectURL(file),
        mascotImageUrl: payload.mascotImageUrl || '',
        isLoadingMascot: false,
      });
    } catch (err: any) {
      console.error(err);
      setIdentityError(
        err?.message || 'Ocorreu um erro ao gerar a identidade visual. Tente novamente.'
      );
      setVisualIdentityResult(null);
    } finally {
      setIsGeneratingIdentity(false);
    }
  }, []);

  const handleQuoteChange = (newQuote: string) => {
    setResult((prev) => {
      if (!prev) return null;
      const updated: GenerationResult = { ...prev, quote: newQuote };
      // Keep recent projects in sync with edited quote
      saveRecentProject(updated).then((projects) => {
        setRecentProjects(projects);
      });
      return updated;
    });
  };

  const handleResumeProject = (project: RecentProject) => {
    setResult(project.result);
    setActiveTab('quotes');
  };

  const handleDeleteProject = (id: string) => {
    const updated = deleteRecentProject(id);
    setRecentProjects(updated);
  };

  const handleClearAllProjects = () => {
    clearAllRecentProjects();
    setRecentProjects([]);
  };

  const handleIdentityChange = (field: 'brandName' | 'slogan', value: string) => {
    setVisualIdentityResult((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleOpenPaletteFromImage = (imgUrl: string, theme?: string) => {
    setSelectedPaletteImage(imgUrl);
    if (theme) setSelectedPaletteTheme(theme);
    setActiveTab('palette');
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col items-center selection:bg-violet-600 selection:text-white relative overflow-x-hidden">
      {/* Background Ambience & Cyber Grid Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/15 via-pink-600/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-gradient-to-tl from-indigo-600/10 via-amber-500/5 to-transparent blur-[100px]" />
      </div>

      {/* Top App Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[1.5px] shadow-lg shadow-violet-600/25">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="header-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 14 C56 32 78 40 78 54 C78 70 64 78 50 86 C36 78 22 70 22 54 C22 40 44 32 50 14 Z"
                  stroke="url(#header-logo-grad)"
                  strokeWidth="3.5"
                  fill="#8B5CF6"
                  fillOpacity="0.2"
                />
                <polygon points="50,42 54,50 62,50 56,55 58,63 50,58 42,63 44,55 38,50 46,50" fill="#F59E0B" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-violet-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                Inspira Arte
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-700/60 text-violet-300 font-mono tracking-wider uppercase">
                Design Studio
              </span>
            </div>
          </div>
        </div>

        {/* View switcher tabs in navbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'quotes'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Arte & Frases</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('character')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'character'
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-pink-300" />
            <span>Personagens & Mascotes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'logo'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shapes className="w-3.5 h-3.5 text-pink-300" />
            <span>Logotipo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'identity'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Identidade & Mascote</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('palette')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'palette'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pipette className="w-3.5 h-3.5 text-emerald-300" />
            <span>Paleta Complementar</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-200 px-5 py-3.5 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline font-medium"
            >
              Fechar
            </button>
          </div>
        )}

        {/* TAB 0: PERSONAGEM & CENAS (Consistency Director Studio) */}
        {activeTab === 'character' && <CharacterStudio />}

        {/* TAB 1: LOGOTIPO PERSONALIZADA (Webdesigner Senior Studio) */}
        {activeTab === 'logo' && <LogoStudio />}

        {/* TAB 2: QUOTES & ART GENERATOR */}
        {activeTab === 'quotes' && (
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
                Imagens de Alto Impacto com{' '}
                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                  Frases
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Transforme qualquer tema em uma imagem inspiradora com tipografia ajustável e download 2x PNG.
              </p>
            </div>

            <ThemeInputForm onGenerate={handleGenerate} isLoading={isLoading} />

            {isLoading && loadingStep && (
              <div className="text-center py-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/60 border border-violet-800/60 text-xs font-semibold text-violet-300 animate-pulse">
                  <Cpu className="w-3.5 h-3.5" />
                  {loadingStep}
                </span>
              </div>
            )}

            <ResultDisplay
              result={result}
              isLoading={isLoading}
              onQuoteChange={handleQuoteChange}
              onOpenPalette={handleOpenPaletteFromImage}
            />

            {/* Galeria de Projetos Recentes (Salvos no Navegador - 5 mais recentes) */}
            <RecentProjectsGallery
              projects={recentProjects}
              currentResult={result}
              onResumeProject={handleResumeProject}
              onDeleteProject={handleDeleteProject}
              onClearAll={handleClearAllProjects}
            />
          </div>
        )}

        {/* TAB 3: BRAND IDENTITY & MASCOT */}
        {activeTab === 'identity' && (
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
                Identidade Visual &{' '}
                <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
                  Mascote Criativo
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Envie uma foto de referência para criar nome de marca, slogan, cores harmonizadas e mascote.
              </p>
            </div>

            {identityError && (
              <div className="bg-rose-950/50 border border-rose-800 text-rose-200 px-5 py-3.5 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div className="flex-1">{identityError}</div>
              </div>
            )}

            <VisualIdentityForm
              onGenerate={handleGenerateIdentity}
              isLoading={isGeneratingIdentity}
            />

            <VisualIdentityResultDisplay
              result={visualIdentityResult}
              onIdentityChange={handleIdentityChange}
              onNavigateToCharacterStudio={() => setActiveTab('character')}
            />
          </div>
        )}

        {/* TAB 4: COMPLEMENTARY COLOR PALETTE STUDIO */}
        {activeTab === 'palette' && (
          <ComplementaryPaletteSelector
            initialImageUrl={selectedPaletteImage || result?.imageUrl}
            initialTheme={selectedPaletteTheme || result?.theme || 'Pôr do Sol Dourado'}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/80 mt-auto py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Inspira Arte — Design Gráfico de Alto Impacto, Logotipos & Identidade Visual</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Vetor SVG Nítido</span>
            <span>•</span>
            <span>Exportação PNG 2000px</span>
            <span>•</span>
            <span>IA Gemini 3 Series</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
