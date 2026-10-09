import React, { useState } from 'react';
import type { VisualIdentityResult, CharacterProfile } from '../types';
import { saveCharacter } from '../services/characterService';
import { LoadingSpinner } from './LoadingSpinner';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Palette,
  FileText,
  Layers,
  RotateCw,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';

interface VisualIdentityResultDisplayProps {
  result: VisualIdentityResult | null;
  onIdentityChange: (field: 'brandName' | 'slogan', value: string) => void;
  onNavigateToCharacterStudio?: () => void;
}

interface MascotStyle {
  scale: number;
  rotation: number;
  isBouncing: boolean;
  isFloating: boolean;
}

export const VisualIdentityResultDisplay: React.FC<VisualIdentityResultDisplayProps> = ({
  result,
  onIdentityChange,
  onNavigateToCharacterStudio,
}) => {
  const [mascotStyle, setMascotStyle] = useState<MascotStyle>({
    scale: 1,
    rotation: 0,
    isBouncing: false,
    isFloating: true,
  });

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      showToast(`Código ${hex} copiado!`);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch {
      showToast('Falha ao copiar.');
    }
  };

  const resetMascotStyle = () => {
    setMascotStyle({ scale: 1, rotation: 0, isBouncing: false, isFloating: true });
  };

  const handleExportText = () => {
    if (!result) return;

    const content = `=========================================
KIT DE IDENTIDADE VISUAL - INSPIRA ARTE
=========================================

NOME DA MARCA: ${result.brandName}
SLOGAN: ${result.slogan}

${result.story ? `MANIFESTO / CONCEITO:\n${result.story}\n` : ''}
-----------------------------------------
PALETA CROMÁTICA
-----------------------------------------
Cor Primária:   ${result.colorPalette.primary}
Cor Secundária: ${result.colorPalette.secondary}
Cor de Destaque: ${result.colorPalette.accent}
${result.colorPalette.background ? `Cor de Fundo:  ${result.colorPalette.background}` : ''}

-----------------------------------------
PROMPT DO MASCOTE (IA)
-----------------------------------------
${result.mascotPrompt}

=========================================
Gerado com IA de Alta Fidelidade no Inspira Arte
Data: ${new Date().toLocaleDateString('pt-BR')}
=========================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brand-kit-${result.brandName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Brand Kit exportado em arquivo texto!');
  };

  const handleDownloadMascot = async () => {
    if (!result?.mascotImageUrl) return;
    try {
      let downloadUrl = result.mascotImageUrl;
      if (result.mascotImageUrl.startsWith('http')) {
        const resp = await fetch(result.mascotImageUrl);
        const blob = await resp.blob();
        downloadUrl = URL.createObjectURL(blob);
      }
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mascote-${result.brandName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (downloadUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 8000);
      }
      showToast('Mascote baixado com sucesso!');
    } catch {
      const link = document.createElement('a');
      link.href = result.mascotImageUrl;
      link.download = `mascote-${result.brandName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      showToast('Mascote baixado!');
    }
  };

  if (!result) return null;

  const colorItems = [
    { name: 'Primária', hex: result.colorPalette.primary },
    { name: 'Secundária', hex: result.colorPalette.secondary },
    { name: 'Destaque', hex: result.colorPalette.accent },
    ...(result.colorPalette.background
      ? [{ name: 'Fundo', hex: result.colorPalette.background }]
      : []),
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8 animate-fade-in">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Brand Identity Header & Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pb-6 border-b border-slate-800">
        <div className="space-y-3">
          <div>
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block mb-1">
              Nome da Marca Gerada
            </span>
            <input
              type="text"
              value={result.brandName}
              onChange={(e) => onIdentityChange('brandName', e.target.value)}
              className="text-2xl sm:text-3xl font-extrabold bg-transparent text-slate-100 border-b border-slate-700 focus:border-violet-500 focus:outline-none w-full tracking-tight"
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Slogan / Tagline
            </span>
            <input
              type="text"
              value={result.slogan}
              onChange={(e) => onIdentityChange('slogan', e.target.value)}
              className="text-base sm:text-lg font-medium text-pink-300/90 bg-transparent border-b border-slate-800 focus:border-pink-500 focus:outline-none w-full italic"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5 justify-start md:justify-end">
          <button
            type="button"
            onClick={handleExportText}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-violet-400" />
            <span>Exportar Brand Kit (.TXT)</span>
          </button>

          {result.mascotImageUrl && (
            <>
              <button
                type="button"
                onClick={() => {
                  const newMascot: CharacterProfile = {
                    id: `mascot-${Date.now()}`,
                    name: `Mascote ${result.brandName}`,
                    titleOrArchetype: `Mascote Oficial de ${result.brandName}`,
                    bio: result.story || `Mascote oficial criado para a marca ${result.brandName}.`,
                    appearance: {
                      gender: 'Mascote Criatura da Marca',
                      ageGroup: 'Carismático e Expressivo',
                      hair: `Paleta ${result.colorPalette.primary} e ${result.colorPalette.secondary}`,
                      eyes: 'Olhos expressivos e vivos',
                      skinOrTone: 'Estilo da imagem gerada',
                      facialFeatures: 'Expressão simpática e amigável',
                      signatureDetails: `Paleta de cores ${result.colorPalette.primary}, ${result.colorPalette.secondary}, ${result.colorPalette.accent}`,
                    },
                    defaultClothing: 'Aparência original do mascote',
                    artStyle: 'Animação 3D Estilizada',
                    avatarImageUrl: result.mascotImageUrl,
                    importedImageUrl: result.mascotImageUrl,
                    isMascot: true,
                    mascotDna: {
                      speciesOrType: 'Mascote Criativo da Marca',
                      colorPalette: [result.colorPalette.primary, result.colorPalette.secondary, result.colorPalette.accent],
                      distinctiveFeatures: [result.mascotPrompt],
                      originalStyle: 'Animação 3D Estilizada',
                      consistencyAnchorPrompt: `${result.mascotPrompt}. Exact same brand mascot for ${result.brandName}, high fidelity, consistent design`,
                    },
                    createdAt: Date.now(),
                  };
                  saveCharacter(newMascot);
                  showToast(`"${newMascot.name}" enviado para o Estúdio de Personagens & Cenas!`);
                  if (onNavigateToCharacterStudio) {
                    onNavigateToCharacterStudio();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg transition-all"
                title="Use este mascote para gerar novas emoções, humores e cenários diversos mantendo sua aparência exata"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Usar Mascote no Estúdio de Cenas & Emoções</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMascot}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Mascote</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Brand Story Manifesto (if provided) */}
      {result.story && (
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Conceito & Manifesto da Marca
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">{result.story}</p>
        </div>
      )}

      {/* Visual Showcase: Reference vs Generated Mascot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Images comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Sua Referência
            </span>
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <img
                src={result.uploadedImageUrl}
                alt="Referência Original"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Mascote Criado
            </span>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-violet-900/60 bg-slate-950 shadow-inner flex items-center justify-center group">
              {result.isLoadingMascot ? (
                <LoadingSpinner text="Criando Mascote..." />
              ) : result.mascotImageUrl ? (
                <div
                  className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
                    mascotStyle.isBouncing ? 'animate-bounce' : mascotStyle.isFloating ? 'animate-float-slow' : ''
                  }`}
                >
                  <img
                    src={result.mascotImageUrl}
                    alt="Mascote Gerado"
                    style={{
                      transform: `scale(${mascotStyle.scale}) rotate(${mascotStyle.rotation}deg)`,
                    }}
                    className="w-full h-full object-cover transition-transform duration-200"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-500">Mascote não disponível</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Color Palette & Mascot Controls */}
        <div className="space-y-6">
          {/* COLOR PALETTE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Palette className="w-4 h-4 text-violet-400" />
              <span>Paleta Cromática Extraída & Harmonizada</span>
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {colorItems.map((c) => (
                <div
                  key={c.name}
                  onClick={() => copyToClipboard(c.hex)}
                  className="group relative cursor-pointer p-3 bg-slate-950/70 hover:bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-center"
                  title="Clique para copiar código HEX"
                >
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 border border-white/20 shadow-md group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="text-xs font-semibold text-slate-200">{c.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 group-hover:text-violet-300 transition-colors">
                    {c.hex}
                  </p>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MASCOT INTERACTIVE CONTROLS */}
          {!result.isLoadingMascot && result.mascotImageUrl && (
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ajustes Interativos do Mascote
                </span>
                <button
                  type="button"
                  onClick={resetMascotStyle}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Resetar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Scale */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Escala:</span>
                    <span>{Math.round(mascotStyle.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.7}
                    max={1.4}
                    step={0.05}
                    value={mascotStyle.scale}
                    onChange={(e) =>
                      setMascotStyle({ ...mascotStyle, scale: Number(e.target.value) })
                    }
                    className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Rotação:</span>
                    <span>{mascotStyle.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={mascotStyle.rotation}
                    onChange={(e) =>
                      setMascotStyle({ ...mascotStyle, rotation: Number(e.target.value) })
                    }
                    className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Animation toggles */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setMascotStyle({
                      ...mascotStyle,
                      isFloating: !mascotStyle.isFloating,
                      isBouncing: false,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    mascotStyle.isFloating
                      ? 'bg-violet-950/60 border-violet-500 text-violet-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flutuação Suave
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMascotStyle({
                      ...mascotStyle,
                      isBouncing: !mascotStyle.isBouncing,
                      isFloating: false,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    mascotStyle.isBouncing
                      ? 'bg-pink-950/60 border-pink-500 text-pink-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pulo Alegre
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
