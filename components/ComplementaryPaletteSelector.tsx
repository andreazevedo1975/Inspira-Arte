import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedComplementaryPalette, PaletteColor, ColorHarmonyType } from '../types';
import { generateComplementaryPalette } from '../services/geminiService';
// @ts-ignore
import html2canvas from 'html2canvas';
import {
  Palette,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Type,
  FileText,
  FileCode,
  FileSpreadsheet,
  Layers,
  Sliders,
  Eye,
  ShieldCheck,
  Pipette,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface ComplementaryPaletteSelectorProps {
  initialTheme?: string;
  initialImageUrl?: string;
}

// Curated themes for instant 1-click inspiration
const CURATED_THEMES = [
  { name: 'Pôr do Sol Dourado', desc: 'Laranja Solar & Cobalto Profundo' },
  { name: 'Cyberpunk Neon', desc: 'Magenta Elétrico & Verde Ácido' },
  { name: 'Floresta Mística', desc: 'Esmeralda Profunda & Orquídea Real' },
  { name: 'Oceano Profundo & Coral', desc: 'Azul Abissal & Coral Radiante' },
  { name: 'Café Vintage & Baunilha', desc: 'Mogno Queimado & Ouro Imperial' },
  { name: 'Aurora Boreal Cósmica', desc: 'Turquesa Ártico & Violeta Nebular' },
  { name: 'Minimalismo Nórdico', desc: 'Carvão Fosco & Terracota Suave' },
];

const HARMONY_TYPES: { id: ColorHarmonyType; label: string; desc: string; degrees: string }[] = [
  {
    id: 'complementary',
    label: 'Complementar Direta',
    desc: 'Opostos em 180° na roda de cores. Máxima vibração e pregnância visual.',
    degrees: '180°',
  },
  {
    id: 'split-complementary',
    label: 'Complementar Dividida',
    desc: 'Tons vizinhos ao complemento direto (150° e 210°). Contraste balanceado.',
    degrees: '150° / 210°',
  },
  {
    id: 'triadic',
    label: 'Tríade Harmônica',
    desc: 'Três polos equidistantes em 120°. Riqueza cromática estável e alegre.',
    degrees: '120° / 240°',
  },
  {
    id: 'analogous-accent',
    label: 'Análoga + Acento',
    desc: 'Cores análogas de transição suave combinadas a um ponto focal complementar.',
    degrees: '30° + 180°',
  },
  {
    id: 'tetradic',
    label: 'Tetrádica (Dupla)',
    desc: 'Dois pares complementares. Ampla versatilidade e sofisticação.',
    degrees: '90° / 180°',
  },
];

// Helper: HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Helper: HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper: RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Client-side fallback color math generator
function calculateMathematicalPalette(
  baseHex: string,
  harmonyType: ColorHarmonyType,
  title: string,
  sourceType: 'image' | 'theme'
): GeneratedComplementaryPalette {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  let compH = (h + 180) % 360;
  let accentH = (h + 60) % 360;
  let lightH = h;
  let darkH = compH;

  let roleComp = 'Complementar Direta';

  if (harmonyType === 'split-complementary') {
    compH = (h + 150) % 360;
    accentH = (h + 210) % 360;
    roleComp = 'Complementar Dividida A';
  } else if (harmonyType === 'triadic') {
    compH = (h + 120) % 360;
    accentH = (h + 240) % 360;
    roleComp = 'Tríade Harmônica A';
  } else if (harmonyType === 'analogous-accent') {
    compH = (h + 30) % 360;
    accentH = (h + 180) % 360;
    roleComp = 'Análoga Suave';
  } else if (harmonyType === 'tetradic') {
    compH = (h + 90) % 360;
    accentH = (h + 180) % 360;
    roleComp = 'Dupla Complementar A';
  }

  const hex1 = baseHex;
  const hex2 = hslToHex(compH, Math.min(100, Math.max(50, s)), Math.min(65, Math.max(35, l)));
  const hex3 = hslToHex(accentH, 95, 52);
  const hex4 = hslToHex(lightH, Math.max(20, s * 0.4), 94);
  const hex5 = hslToHex(darkH, Math.max(30, s * 0.5), 10);

  const colors: PaletteColor[] = [
    {
      hex: hex1,
      name: 'Cor Dominante Base',
      role: 'Dominante / Identidade',
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      isLight: l > 60,
    },
    {
      hex: hex2,
      name: 'Harmonia Complementar',
      role: roleComp,
      rgb: `rgb(${hexToRgb(hex2).r}, ${hexToRgb(hex2).g}, ${hexToRgb(hex2).b})`,
      hsl: `hsl(${compH}, ${s}%, ${l}%)`,
      isLight: false,
    },
    {
      hex: hex3,
      name: 'Acento de Alto Contraste',
      role: 'Acento Vibrante (CTA)',
      rgb: `rgb(${hexToRgb(hex3).r}, ${hexToRgb(hex3).g}, ${hexToRgb(hex3).b})`,
      hsl: `hsl(${accentH}, 95%, 52%)`,
      isLight: true,
    },
    {
      hex: hex4,
      name: 'Superfície de Luz',
      role: 'Luz / Fundo Claro',
      rgb: `rgb(${hexToRgb(hex4).r}, ${hexToRgb(hex4).g}, ${hexToRgb(hex4).b})`,
      hsl: `hsl(${lightH}, ${Math.round(s * 0.4)}%, 94%)`,
      isLight: true,
    },
    {
      hex: hex5,
      name: 'Profundidade Noturna',
      role: 'Fundo Escuro / Texto',
      rgb: `rgb(${hexToRgb(hex5).r}, ${hexToRgb(hex5).g}, ${hexToRgb(hex5).b})`,
      hsl: `hsl(${darkH}, ${Math.round(s * 0.5)}%, 10%)`,
      isLight: false,
    },
  ];

  return {
    title: `Paleta ${harmonyType} - ${title}`,
    harmonyType,
    source: sourceType,
    sourceValue: title,
    description: `Paleta equilibrada com base na roda cromática. A cor dominante (${hex1}) interage harmoniosamente com seu polo complementar (${hex2}) e acento vibrante (${hex3}).`,
    colors,
  };
}

export const ComplementaryPaletteSelector: React.FC<ComplementaryPaletteSelectorProps> = ({
  initialTheme = 'Pôr do Sol Dourado',
  initialImageUrl,
}) => {
  const [sourceMode, setSourceMode] = useState<'theme' | 'image'>(
    initialImageUrl ? 'image' : 'theme'
  );
  const [themeInput, setThemeInput] = useState<string>(initialTheme || 'Pôr do Sol Dourado');
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [harmonyType, setHarmonyType] = useState<ColorHarmonyType>('complementary');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // The generated palette state
  const [palette, setPalette] = useState<GeneratedComplementaryPalette>(() => {
    return calculateMathematicalPalette(
      '#8B5CF6',
      'complementary',
      'Harmonia Violeta & Esmeralda',
      'theme'
    );
  });

  const paletteCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync initial props if they change
  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
      setSourceMode('image');
      if (initialTheme) setThemeInput(initialTheme);
      // Auto generate palette from incoming image
      extractDominantColorFromImage(initialImageUrl).then((hex) => {
        const mathPalette = calculateMathematicalPalette(
          hex,
          harmonyType,
          initialTheme || 'Imagem da Obra',
          'image'
        );
        setPalette(mathPalette);
        showToast('Paleta extraída da obra com sucesso!');
      });
    } else if (initialTheme) {
      setThemeInput(initialTheme);
    }
  }, [initialImageUrl, initialTheme]);

  // Extract dominant color from image using canvas
  const extractDominantColorFromImage = (imgSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imgSrc;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 60;
          canvas.height = 60;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve('#8B5CF6');

          ctx.drawImage(img, 0, 0, 60, 60);
          const imageData = ctx.getImageData(0, 0, 60, 60).data;

          let rTotal = 0;
          let gTotal = 0;
          let bTotal = 0;
          let count = 0;

          // Sample pixels skipping very dark or blown-out white
          for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const brightness = (r + g + b) / 3;

            if (brightness > 25 && brightness < 240) {
              rTotal += r;
              gTotal += g;
              bTotal += b;
              count++;
            }
          }

          if (count === 0) return resolve('#8B5CF6');

          const avgR = Math.round(rTotal / count);
          const avgG = Math.round(gTotal / count);
          const avgB = Math.round(bTotal / count);

          const hex = `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`.toUpperCase();
          resolve(hex);
        } catch {
          resolve('#8B5CF6');
        }
      };
      img.onerror = () => resolve('#8B5CF6');
    });
  };

  // Main generation handler
  const handleGeneratePalette = async (overrideHarmony?: ColorHarmonyType) => {
    const selectedHarmony = overrideHarmony || harmonyType;
    setIsGenerating(true);
    showToast('Calculando relações cromáticas e harmonia...');

    try {
      let base64Data: string | undefined = undefined;
      let mime = 'image/png';
      let extractedHex = '#8B5CF6';

      if (sourceMode === 'image' && imageUrl) {
        if (imageUrl.startsWith('data:')) {
          const parts = imageUrl.split(',');
          base64Data = parts[1];
          const match = parts[0].match(/:(.*?);/);
          if (match) mime = match[1];
        }
        extractedHex = await extractDominantColorFromImage(imageUrl);
      } else {
        // Map common theme strings to good base tones
        const lower = themeInput.toLowerCase();
        if (lower.includes('sol') || lower.includes('ouro') || lower.includes('amarelo')) {
          extractedHex = '#F59E0B';
        } else if (lower.includes('oceano') || lower.includes('azul') || lower.includes('mar')) {
          extractedHex = '#0284C7';
        } else if (lower.includes('floresta') || lower.includes('verde') || lower.includes('natureza')) {
          extractedHex = '#059669';
        } else if (lower.includes('cyber') || lower.includes('neon') || lower.includes('rosa')) {
          extractedHex = '#EC4899';
        } else if (lower.includes('fogo') || lower.includes('rubi') || lower.includes('vermelho')) {
          extractedHex = '#DC2626';
        }
      }

      // Try AI-powered endpoint first
      try {
        const aiResponse = await generateComplementaryPalette(
          sourceMode,
          sourceMode === 'image' ? 'Imagem Criativa' : themeInput,
          base64Data,
          mime,
          selectedHarmony
        );

        if (aiResponse && aiResponse.colors && aiResponse.colors.length >= 4) {
          setPalette(aiResponse);
          showToast('Paleta gerada com sucesso via Teoria das Cores!');
          setIsGenerating(false);
          return;
        }
      } catch (aiErr) {
        console.warn('AI palette error, falling back to chromatic calculations:', aiErr);
      }

      // Immediate high-precision chromatic math fallback
      const calculated = calculateMathematicalPalette(
        extractedHex,
        selectedHarmony,
        sourceMode === 'image' ? 'Imagem Selecionada' : themeInput,
        sourceMode
      );
      setPalette(calculated);
      showToast('Paleta gerada com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao sintetizar paleta.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySingleHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Código ${hex} copiado para a área de transferência!`);
    setTimeout(() => setCopiedHex(null), 2500);
  };

  const handleCopyAllHex = () => {
    const allHex = palette.colors.map((c) => c.hex).join(', ');
    navigator.clipboard.writeText(allHex);
    showToast('Todos os 5 códigos HEX foram copiados!');
  };

  // Download options
  const handleDownloadTxt = () => {
    const textContent = `=========================================
INSPIRA ARTE - PALETA DE CORES COMPLEMENTAR
=========================================
Título: ${palette.title}
Tipo de Harmonia: ${palette.harmonyType}
Origem: ${palette.source === 'image' ? 'Imagem' : 'Tema'} (${palette.sourceValue})
Data: ${new Date().toLocaleDateString('pt-BR')}

Descrição do Conceito:
${palette.description}

-----------------------------------------
CÓDIGOS HEX & ESPECIFICAÇÕES TÉCNICAS:
-----------------------------------------
${palette.colors
  .map(
    (c, i) =>
      `${i + 1}. ${c.role.toUpperCase()}
   Nome: ${c.name}
   HEX:  ${c.hex}
   RGB:  ${c.rgb}
   HSL:  ${c.hsl}
`
  )
  .join('\n')}
-----------------------------------------
Exportado pelo Estúdio Inspira Arte.
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paleta-${palette.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo .txt baixado com sucesso!');
  };

  const handleDownloadCss = () => {
    const slug = palette.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cssContent = `/* =========================================
   INSPIRA ARTE: VARIÁVEIS CSS DE DESIGN SYSTEM
   Paleta: ${palette.title}
   Harmonia: ${palette.harmonyType}
   ========================================= */

:root {
  /* Design Tokens - HEX */
  --palette-primary: ${palette.colors[0]?.hex || '#8B5CF6'};
  --palette-complementary: ${palette.colors[1]?.hex || '#10B981'};
  --palette-accent: ${palette.colors[2]?.hex || '#F59E0B'};
  --palette-surface: ${palette.colors[3]?.hex || '#F8FAFC'};
  --palette-background: ${palette.colors[4]?.hex || '#090D16'};

  /* Design Tokens - RGB */
  --palette-primary-rgb: ${palette.colors[0]?.rgb || 'rgb(139, 92, 246)'};
  --palette-complementary-rgb: ${palette.colors[1]?.rgb || 'rgb(16, 185, 129)'};
  --palette-accent-rgb: ${palette.colors[2]?.rgb || 'rgb(245, 158, 11)'};

  /* Metadados */
  --palette-name: "${slug}";
}
`;

    const blob = new Blob([cssContent], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paleta-${slug}.css`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Variáveis .css exportadas!');
  };

  const handleDownloadJson = () => {
    const jsonContent = JSON.stringify(palette, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paleta-${palette.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tokens .json baixados!');
  };

  const handleDownloadPng = async () => {
    if (!paletteCardRef.current) return;
    showToast('Exportando cartela gráfica em alta resolução...');
    try {
      const canvas = await html2canvas(paletteCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#090D16',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `cartela-cores-${palette.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      a.click();
      showToast('Imagem PNG da cartela baixada!');
    } catch {
      showToast('Erro ao exportar PNG da cartela.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
        setSourceMode('image');
        showToast('Nova imagem carregada para extração!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-violet-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-violet-400 flex items-center gap-2.5 text-sm font-semibold animate-fade-in">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Gerador de Harmonia Cromática
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Paleta de Cores Complementar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Extraia contrastes dinâmicos da imagem gerada ou sintetize paletas a partir de temas com exportação HEX, CSS, JSON e PNG.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleGeneratePalette()}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'text-amber-200'}`} />
            <span>{isGenerating ? 'Sintetizando...' : 'Gerar Paleta'}</span>
          </button>
        </div>

        {/* CONTROLS SECTION: Source Selector + Harmonies */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: SOURCE SELECTION (Image vs Theme) */}
          <div className="lg:col-span-6 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Pipette className="w-4 h-4 text-emerald-400" />
                <span>1. Origem da Análise</span>
              </span>

              {/* Source Mode Switcher */}
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSourceMode('theme')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                    sourceMode === 'theme'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Por Tema</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('image')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                    sourceMode === 'image'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Por Imagem</span>
                </button>
              </div>
            </div>

            {/* If Theme Mode Selected */}
            {sourceMode === 'theme' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Tema ou Emoção Desejada:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={themeInput}
                      onChange={(e) => setThemeInput(e.target.value)}
                      placeholder="Ex: Pôr do Sol Dourado, Cyberpunk Neón, Café Vintage..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Quick Theme Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Sugestões Rápidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CURATED_THEMES.map((th) => (
                      <button
                        key={th.name}
                        type="button"
                        onClick={() => {
                          setThemeInput(th.name);
                          // Auto trigger with that theme
                          setTimeout(() => handleGeneratePalette(), 50);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                          themeInput === th.name
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {th.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If Image Mode Selected */}
            {sourceMode === 'image' && (
              <div className="space-y-3 pt-1">
                {imageUrl ? (
                  <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <img
                      src={imageUrl}
                      alt="Referência para paleta"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate">
                        Imagem Ativa no Estúdio
                      </span>
                      <p className="text-[11px] text-slate-400 truncate">
                        O algoritmo extrairá as frequências cromáticas dominantes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
                    >
                      Trocar
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 p-6 rounded-xl text-center cursor-pointer bg-slate-900/40 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-300 block">
                      Selecione ou Arraste uma Imagem
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Gere uma arte na aba "Arte & Frases" ou envie qualquer foto
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* RIGHT: HARMONY TYPE SELECTOR */}
          <div className="lg:col-span-6 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. Tipo de Harmonia na Roda de Cores</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HARMONY_TYPES.map((type) => {
                const isSelected = harmonyType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setHarmonyType(type.id);
                      handleGeneratePalette(type.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold block">{type.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {type.degrees}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PALETTE VISUAL DISPLAY CARD (Exportable via html2canvas) */}
        <div
          ref={paletteCardRef}
          className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Decorative light wash behind card */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: palette.colors[0]?.hex || '#8B5CF6' }}
          />

          {/* Palette Info Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase">
                  {palette.harmonyType}
                </span>
                <span className="text-xs text-slate-500">
                  {palette.source === 'image' ? 'Extraído de Imagem' : `Tema: "${palette.sourceValue}"`}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-100">{palette.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
                {palette.description}
              </p>
            </div>

            {/* Single click copy all */}
            <button
              type="button"
              onClick={handleCopyAllHex}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiar Todos os HEX</span>
            </button>
          </div>

          {/* 5 COLOR SWATCH TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
            {palette.colors.map((color, index) => {
              const isCopied = copiedHex === color.hex;
              return (
                <div
                  key={`${color.hex}-${index}`}
                  className="group bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-600 transition-all p-3 space-y-3 flex flex-col justify-between shadow-lg"
                >
                  {/* Swatch Sample Box */}
                  <div
                    onClick={() => handleCopySingleHex(color.hex)}
                    className="w-full aspect-square rounded-lg shadow-inner cursor-pointer relative overflow-hidden transition-transform group-hover:scale-[1.02] flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: color.hex }}
                    title="Clique para copiar este código HEX"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs w-full h-full flex flex-col items-center justify-center text-white gap-1">
                      {isCopied ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                      <span className="text-[10px] font-bold font-mono">
                        {isCopied ? 'COPIADO!' : 'COPIAR HEX'}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {color.role}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-100 block truncate" title={color.name}>
                      {color.name}
                    </span>

                    {/* HEX CODE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleCopySingleHex(color.hex)}
                      className="w-full mt-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition-colors group/btn"
                    >
                      <span className="font-mono font-bold text-xs text-emerald-300">
                        {color.hex}
                      </span>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-slate-300" />
                      )}
                    </button>

                    {/* Secondary Specs */}
                    <div className="pt-1.5 text-[9px] font-mono text-slate-500 space-y-0.5">
                      <p className="truncate">{color.rgb}</p>
                      <p className="truncate">{color.hsl}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* REAL WORLD UI SIMULATOR (How these colors work together) */}
          <div className="pt-4 border-t border-slate-800 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulação Prática no Design (Como essas cores interagem)</span>
            </span>

            <div
              className="p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                backgroundColor: palette.colors[4]?.hex || '#090D16',
                borderColor: palette.colors[0]?.hex || '#8B5CF6',
              }}
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block"
                  style={{
                    backgroundColor: palette.colors[2]?.hex || '#F59E0B',
                    color: '#000000',
                  }}
                >
                  Destaque Visual
                </span>
                <h4
                  className="text-lg font-black tracking-tight"
                  style={{ color: palette.colors[3]?.hex || '#FFFFFF' }}
                >
                  {palette.title}
                </h4>
                <p
                  className="text-xs opacity-80 max-w-md"
                  style={{ color: palette.colors[3]?.hex || '#CBD5E1' }}
                >
                  Harmonia perceptual perfeita entre a cor dominante, o acento e a base de alto contraste.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-transform active:scale-95"
                  style={{
                    backgroundColor: palette.colors[0]?.hex || '#8B5CF6',
                    color: '#FFFFFF',
                  }}
                >
                  Ação Principal
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg font-bold text-xs border transition-colors"
                  style={{
                    borderColor: palette.colors[1]?.hex || '#10B981',
                    color: palette.colors[1]?.hex || '#10B981',
                    backgroundColor: 'transparent',
                  }}
                >
                  Complementar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EXPORT & DOWNLOAD TOOLBAR */}
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Opções de Download dos Códigos HEX e Design Tokens</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Exporte em múltiplos formatos para Figma, VS Code, Tailwind ou Illustrator.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Baixar lista formatada com códigos HEX e RGB"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Baixar .TXT</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCss}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Baixar variáveis CSS (:root { --palette... })"
            >
              <FileCode className="w-3.5 h-3.5 text-violet-400" />
              <span>Variáveis .CSS</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Baixar estrutura JSON de tokens"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Tokens .JSON</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              title="Baixar imagem PNG de alta resolução da cartela"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cartela .PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
