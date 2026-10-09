import React, { useState, useEffect, useRef } from 'react';
import type { GenerationResult, ArtisticFilterId } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { generateImageVariations, generateQuoteFromImage } from '../services/geminiService';
import {
  ARTISTIC_FILTERS,
  getArtisticFilterCss,
  getArtisticFilterById,
  renderFilteredImageToDataUrl,
} from '../services/filterService';
// @ts-ignore
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Eye,
  Maximize2,
  Minimize2,
  FileImage,
  Quote,
  ShieldCheck,
  Zap,
  FileText,
  Stamp,
  Shield,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Columns,
  Square,
  Compass,
  Film,
  Sun,
  RotateCcw,
} from 'lucide-react';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
  onQuoteChange: (newQuote: string) => void;
  onOpenPalette?: (imageUrl: string, theme?: string) => void;
}

export type TextPositionPreset =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'custom';

export type TextBoxWidth = 'full' | 'half' | 'compact' | 'narrow';

export type TextLegibilityMode = 'shadow' | 'stroke' | 'backdrop' | 'combo' | 'none';

export type TextStrokeWidth = 'light' | 'medium' | 'strong';

interface CustomizationState {
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  textShadowColor: string;
  hasPillBackground: boolean;
  pillColor: string;
  pillOpacity: number;
  legibilityMode: TextLegibilityMode;
  strokeColor: string;
  strokeWidth: TextStrokeWidth;
  overlayFilter: string;
  overlayOpacity: number;
  artisticFilter: ArtisticFilterId;
  artisticFilterIntensity: number; // 0 to 100%
  verticalPosition: number; // 0 to 100%
  horizontalPosition: number; // 0 to 100%
  positionPreset: TextPositionPreset;
  boxWidth: TextBoxWidth;
  authorText: string;
  showAuthor: boolean;
  letterSpacing: string;
  lineHeight: number;
  isBold: boolean;
  isItalic: boolean;
  showWatermark: boolean;
  watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
  watermarkStyle: 'badge' | 'minimal' | 'monochrome';
  watermarkOpacity: number;
}

const STORAGE_KEY = 'inspira-arte-customization-v5';

const FONT_PRESETS = [
  { group: 'Elegantes & Clássicas', fonts: [
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: "'Cinzel', serif", label: 'Cinzel Imperial' },
    { value: "'Lora', serif", label: 'Lora Literária' },
  ]},
  { group: 'Modernas & Limpas', fonts: [
    { value: "'Plus Jakarta Sans', sans-serif", label: 'Jakarta Modern' },
    { value: "'Montserrat', sans-serif", label: 'Montserrat Bold' },
    { value: "'Roboto', sans-serif", label: 'Roboto Clean' },
    { value: "'Roboto Mono', monospace", label: 'Digital Monospace' },
  ]},
  { group: 'Impacto & Display', fonts: [
    { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue (Caixa Alta)' },
    { value: "'Oswald', sans-serif", label: 'Oswald Forte' },
    { value: "'Righteous', cursive", label: 'Righteous Retro' },
    { value: "'Abril Fatface', cursive", label: 'Abril Fatface' },
  ]},
  { group: 'Caligráficas & Cursivas', fonts: [
    { value: "'Caveat', cursive", label: 'Caveat Orgânica' },
    { value: "'Dancing Script', cursive", label: 'Dancing Script' },
  ]},
];

const OVERLAY_FILTERS = [
  { id: 'none', label: 'Original', color: '#000000', defaultOpacity: 0.15 },
  { id: 'dark', label: 'Sombrio Focado', color: '#030712', defaultOpacity: 0.45 },
  { id: 'violet', label: 'Cyber Violeta', color: '#4c1d95', defaultOpacity: 0.35 },
  { id: 'amber', label: 'Dourado Quente', color: '#78350f', defaultOpacity: 0.35 },
  { id: 'ocean', label: 'Oceano Profundo', color: '#0c4a6e', defaultOpacity: 0.35 },
  { id: 'gradient', label: 'Vinheta Inferior', color: 'gradient', defaultOpacity: 0.5 },
];

const TEXT_COLORS = [
  '#ffffff',
  '#fef08a', // Yellow gold
  '#fed7aa', // Warm peach
  '#a7f3d0', // Mint
  '#bae6fd', // Sky blue
  '#fbcfe8', // Rose
  '#e2e8f0', // Silver
  '#090d16', // Dark obsidian
];

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  isLoading,
  onQuoteChange,
  onOpenPalette,
}) => {
  const [customization, setCustomization] = useState<CustomizationState>(() => {
    const defaultState: CustomizationState = {
      fontFamily: "'Playfair Display', serif",
      fontSize: 28,
      color: '#ffffff',
      textAlign: 'center',
      textShadow: true,
      textShadowColor: 'rgba(0, 0, 0, 0.85)',
      hasPillBackground: false,
      pillColor: '#000000',
      pillOpacity: 0.5,
      legibilityMode: 'shadow',
      strokeColor: '#000000',
      strokeWidth: 'medium',
      overlayFilter: 'gradient',
      overlayOpacity: 0.4,
      artisticFilter: 'none',
      artisticFilterIntensity: 100,
      verticalPosition: 50,
      horizontalPosition: 50,
      positionPreset: 'center',
      boxWidth: 'full',
      authorText: '— Inspira Arte',
      showAuthor: true,
      letterSpacing: '0.02em',
      lineHeight: 1.4,
      isBold: false,
      isItalic: false,
      showWatermark: true,
      watermarkPosition: 'bottom-right',
      watermarkStyle: 'badge',
      watermarkOpacity: 0.9,
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let restoredLegibility: TextLegibilityMode = parsed.legibilityMode;
        if (!restoredLegibility) {
          if (parsed.hasPillBackground) {
            restoredLegibility = 'backdrop';
          } else if (parsed.textShadow) {
            restoredLegibility = 'shadow';
          } else {
            restoredLegibility = 'shadow';
          }
        }

        return {
          ...defaultState,
          ...parsed,
          legibilityMode: restoredLegibility,
          strokeColor: parsed.strokeColor || '#000000',
          strokeWidth: parsed.strokeWidth || 'medium',
          hasPillBackground:
            restoredLegibility === 'backdrop' ||
            restoredLegibility === 'combo' ||
            Boolean(parsed.hasPillBackground),
          textShadow:
            restoredLegibility === 'shadow' ||
            restoredLegibility === 'combo' ||
            Boolean(parsed.textShadow),
          artisticFilter: (parsed.artisticFilter as ArtisticFilterId) || 'none',
          artisticFilterIntensity:
            parsed.artisticFilterIntensity !== undefined
              ? parsed.artisticFilterIntensity
              : 100,
          horizontalPosition: parsed.horizontalPosition !== undefined ? parsed.horizontalPosition : 50,
          positionPreset: parsed.positionPreset || 'center',
          boxWidth: parsed.boxWidth || 'full',
          showWatermark: parsed.showWatermark !== undefined ? parsed.showWatermark : true,
          watermarkPosition: parsed.watermarkPosition || 'bottom-right',
          watermarkStyle: parsed.watermarkStyle || 'badge',
          watermarkOpacity: parsed.watermarkOpacity !== undefined ? parsed.watermarkOpacity : 0.9,
        };
      }
      return defaultState;
    } catch {
      return defaultState;
    }
  });

  const [activeTab, setActiveTab] = useState<'text' | 'visual' | 'filters' | 'watermark'>('text');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingType, setDownloadingType] = useState<'png' | 'pdf' | null>(null);
  const [isRegeneratingQuote, setIsRegeneratingQuote] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const applyPositionPreset = (preset: TextPositionPreset) => {
    setCustomization((prev) => {
      switch (preset) {
        case 'top':
          return {
            ...prev,
            positionPreset: 'top',
            verticalPosition: 18,
            horizontalPosition: 50,
            boxWidth: 'full',
            textAlign: 'center',
          };
        case 'bottom':
          return {
            ...prev,
            positionPreset: 'bottom',
            verticalPosition: 82,
            horizontalPosition: 50,
            boxWidth: 'full',
            textAlign: 'center',
          };
        case 'left':
          return {
            ...prev,
            positionPreset: 'left',
            verticalPosition: 50,
            horizontalPosition: 28,
            boxWidth: 'half',
            textAlign: 'left',
          };
        case 'right':
          return {
            ...prev,
            positionPreset: 'right',
            verticalPosition: 50,
            horizontalPosition: 72,
            boxWidth: 'half',
            textAlign: 'right',
          };
        case 'center':
          return {
            ...prev,
            positionPreset: 'center',
            verticalPosition: 50,
            horizontalPosition: 50,
            boxWidth: 'full',
            textAlign: 'center',
          };
        case 'top-left':
          return {
            ...prev,
            positionPreset: 'top-left',
            verticalPosition: 20,
            horizontalPosition: 28,
            boxWidth: 'half',
            textAlign: 'left',
          };
        case 'top-right':
          return {
            ...prev,
            positionPreset: 'top-right',
            verticalPosition: 20,
            horizontalPosition: 72,
            boxWidth: 'half',
            textAlign: 'right',
          };
        case 'bottom-left':
          return {
            ...prev,
            positionPreset: 'bottom-left',
            verticalPosition: 80,
            horizontalPosition: 28,
            boxWidth: 'half',
            textAlign: 'left',
          };
        case 'bottom-right':
          return {
            ...prev,
            positionPreset: 'bottom-right',
            verticalPosition: 80,
            horizontalPosition: 72,
            boxWidth: 'half',
            textAlign: 'right',
          };
        default:
          return prev;
      }
    });
    showToast(`Posição ajustada: ${
      preset === 'top'
        ? 'Acima (Topo)'
        : preset === 'bottom'
        ? 'Abaixo (Base)'
        : preset === 'left'
        ? 'Ao Lado (Esquerda)'
        : preset === 'right'
        ? 'Ao Lado (Direita)'
        : 'Centro'
    }`);
  };

  const handleSetLegibilityMode = (mode: TextLegibilityMode) => {
    setCustomization((prev) => ({
      ...prev,
      legibilityMode: mode,
      hasPillBackground: mode === 'backdrop' || mode === 'combo',
      textShadow: mode === 'shadow' || mode === 'combo',
    }));
    const modeLabels: Record<TextLegibilityMode, string> = {
      shadow: 'Sombra profunda aplicada para contraste cinematográfico',
      stroke: 'Contorno gráfico aplicado para máxima nitidez das letras',
      backdrop: 'Fundo translúcido (Glass) aplicado para legibilidade total',
      combo: 'Modo combinado (Fundo translúcido + Sombra) ativado',
      none: 'Modo puro (sem efeito) ativado',
    };
    showToast(modeLabels[mode] || 'Legibilidade atualizada');
  };

  const isBackdropActive =
    customization.legibilityMode === 'backdrop' ||
    customization.legibilityMode === 'combo' ||
    customization.hasPillBackground;

  const getLegibilityTextStyles = (): React.CSSProperties => {
    const { legibilityMode, strokeColor, strokeWidth, textShadowColor, color } = customization;
    const strokePx = strokeWidth === 'light' ? 1.2 : strokeWidth === 'strong' ? 2.6 : 1.8;
    const effectiveStrokeColor = strokeColor || (color === '#090d16' ? '#ffffff' : '#000000');

    if (legibilityMode === 'stroke') {
      return {
        WebkitTextStroke: `${strokePx}px ${effectiveStrokeColor}`,
        paintOrder: 'stroke fill',
        textShadow: `-${strokePx}px -${strokePx}px 0 ${effectiveStrokeColor}, ${strokePx}px -${strokePx}px 0 ${effectiveStrokeColor}, -${strokePx}px ${strokePx}px 0 ${effectiveStrokeColor}, ${strokePx}px ${strokePx}px 0 ${effectiveStrokeColor}, 0 2px 10px rgba(0,0,0,0.85)`,
      };
    }

    if (legibilityMode === 'shadow') {
      return {
        WebkitTextStroke: '0px transparent',
        paintOrder: 'normal',
        textShadow: `0 2px 6px ${textShadowColor}, 0 4px 18px ${textShadowColor}, 0 0 24px rgba(0,0,0,0.9)`,
      };
    }

    if (legibilityMode === 'combo') {
      return {
        WebkitTextStroke: `${strokePx * 0.75}px ${effectiveStrokeColor}`,
        paintOrder: 'stroke fill',
        textShadow: `-${strokePx * 0.75}px -${strokePx * 0.75}px 0 ${effectiveStrokeColor}, ${strokePx * 0.75}px ${strokePx * 0.75}px 0 ${effectiveStrokeColor}, 0 3px 12px ${textShadowColor}`,
      };
    }

    if (legibilityMode === 'backdrop') {
      return {
        WebkitTextStroke: '0px transparent',
        paintOrder: 'normal',
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      };
    }

    return {
      WebkitTextStroke: '0px transparent',
      paintOrder: 'normal',
      textShadow: 'none',
    };
  };

  const getAuthorLegibilityStyles = (): React.CSSProperties => {
    const { legibilityMode, strokeColor, textShadowColor, color } = customization;
    const effectiveStrokeColor = strokeColor || (color === '#090d16' ? '#ffffff' : '#000000');

    if (legibilityMode === 'stroke') {
      return {
        WebkitTextStroke: `0.8px ${effectiveStrokeColor}`,
        paintOrder: 'stroke fill',
        textShadow: `-0.8px -0.8px 0 ${effectiveStrokeColor}, 0.8px 0.8px 0 ${effectiveStrokeColor}`,
      };
    }
    if (legibilityMode === 'shadow' || legibilityMode === 'combo') {
      return {
        textShadow: `0 1px 5px ${textShadowColor}`,
      };
    }
    return {};
  };

  const getQuoteContainerWidth = () => {
    switch (customization.boxWidth) {
      case 'half':
        return '52%';
      case 'compact':
        return '42%';
      case 'narrow':
        return '34%';
      case 'full':
      default:
        return 'calc(100% - 2.5rem)';
    }
  };

  // Sync state when new generation arrives
  useEffect(() => {
    if (result?.imageUrl) {
      setAvailableImages([result.imageUrl]);
      setSelectedImageIndex(0);
    }
  }, [result?.imageUrl]);

  // Save customization changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
    } catch {
      // Ignore quota error
    }
  }, [customization]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyQuote = async () => {
    if (!result?.quote) return;
    const textToCopy = customization.showAuthor && customization.authorText
      ? `"${result.quote}" ${customization.authorText}`
      : `"${result.quote}"`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Frase copiada para a área de transferência!');
    } catch {
      showToast('Não foi possível copiar o texto automaticamente.');
    }
  };

  const handleDownloadPNG = async () => {
    if (!imageContainerRef.current) return;
    setIsDownloading(true);
    setDownloadingType('png');
    showToast('Renderizando PNG em alta resolução com watermark Inspira Arte...');

    try {
      const canvas = await html2canvas(imageContainerRef.current, {
        useCORS: true,
        scale: 2, // High resolution crisp export (2x)
        backgroundColor: null,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `inspira-arte-${Date.now()}.png`;
      link.click();
      showToast('PNG de alta resolução baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar arte:', error);
      showToast('Houve um erro no download. Tente novamente.');
    } finally {
      setIsDownloading(false);
      setDownloadingType(null);
    }
  };

  const handleExportPDF = async () => {
    if (!imageContainerRef.current) return;
    setIsDownloading(true);
    setDownloadingType('pdf');
    showToast('Gerando PDF em alta resolução com watermark Inspira Arte...');

    try {
      const canvas = await html2canvas(imageContainerRef.current, {
        useCORS: true,
        scale: 2, // 2x crisp render
        backgroundColor: '#030712',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const width = canvas.width;
      const height = canvas.height;
      const isLandscape = width > height;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, width, height, undefined, 'FAST');

      pdf.setProperties({
        title: `Inspira Arte - ${result?.quote ? result.quote.slice(0, 30) : 'Obra'}`,
        subject: "Imagem de Alto Impacto com Frase e Marca d'água Inspira Arte",
        author: 'Inspira Arte Studio',
        creator: 'Inspira Arte Web Studio',
      });

      pdf.save(`inspira-arte-${Date.now()}.pdf`);
      showToast('PDF exportado com sucesso com watermark Inspira Arte!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showToast('Houve um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsDownloading(false);
      setDownloadingType(null);
    }
  };

  const handleDownloadComposite = handleDownloadPNG;

  const handleSetArtisticFilter = (filterId: ArtisticFilterId) => {
    setCustomization((prev) => ({
      ...prev,
      artisticFilter: filterId,
    }));
    const def = getArtisticFilterById(filterId);
    if (filterId !== 'none') {
      showToast(`Filtro "${def.shortLabel}" aplicado com acabamento profissional!`);
    } else {
      showToast('Imagem restaurada para as cores originais sem filtro.');
    }
  };

  const handleDownloadCleanImage = async (applyArtisticFilter: boolean = false) => {
    const currentImg = availableImages[selectedImageIndex] || result?.imageUrl;
    if (!currentImg) return;

    if (applyArtisticFilter && customization.artisticFilter !== 'none') {
      const def = getArtisticFilterById(customization.artisticFilter);
      try {
        setIsDownloading(true);
        showToast(`Processando acabamento "${def.shortLabel}" em alta resolução...`);
        const dataUrl = await renderFilteredImageToDataUrl(
          currentImg,
          customization.artisticFilter,
          customization.artisticFilterIntensity
        );
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `arte-filtro-${customization.artisticFilter}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Imagem limpa com acabamento "${def.shortLabel}" baixada!`);
        return;
      } catch (err) {
        console.warn('Canvas filter error, fallback to raw download', err);
      } finally {
        setIsDownloading(false);
      }
    }

    try {
      let downloadUrl = currentImg;
      if (currentImg.startsWith('http')) {
        const resp = await fetch(currentImg);
        const blob = await resp.blob();
        downloadUrl = URL.createObjectURL(blob);
      }
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `arte-limpa-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (downloadUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 8000);
      }
      showToast('Imagem limpa original baixada com sucesso!');
    } catch {
      const link = document.createElement('a');
      link.href = currentImg;
      link.download = `arte-limpa-${Date.now()}.png`;
      link.click();
      showToast('Imagem limpa baixada!');
    }
  };

  const handleRegenerateQuote = async (toneOverride?: string) => {
    if (!result) return;
    setIsRegeneratingQuote(true);
    const chosenTone =
      typeof toneOverride === 'string' && toneOverride.trim()
        ? toneOverride
        : 'Inspirador e Encorajador';
    try {
      const currentImg = availableImages[selectedImageIndex] || result?.imageUrl;
      const newQuote = await generateQuoteFromImage(
        currentImg,
        'image/png',
        result.theme || 'vida e existência',
        chosenTone
      );
      onQuoteChange(newQuote);
      showToast('Novo aforismo positivo gerado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao regerar frase.');
    } finally {
      setIsRegeneratingQuote(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!result?.imagePrompt) return;
    setIsGeneratingVariations(true);
    showToast('Criando variações visuais com a IA...');

    try {
      const ratio = result.aspectRatio || '1:1';
      const newImages = await generateImageVariations(result.imagePrompt, ratio);
      if (newImages.length > 0) {
        setAvailableImages((prev) => [...prev, ...newImages]);
        setSelectedImageIndex(availableImages.length);
        showToast(`${newImages.length} novas variações geradas!`);
      } else {
        showToast('Nenhuma variação adicional encontrada.');
      }
    } catch (error) {
      console.error('Erro ao gerar variações:', error);
      showToast('Falha ao gerar variações.');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  if (isLoading && !result) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <LoadingSpinner
          text="Gerando Imagem & Criando Frase Inspiradora..."
          subtext="Nosso motor criativo está sintetizando estética visual e sabedoria em alta fidelidade."
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="relative border-2 border-dashed border-slate-800/80 rounded-2xl p-12 text-center bg-slate-950/40">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
          <Sparkles className="w-8 h-8 text-violet-500/60" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300">Estúdio de Criação Vazio</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Escolha um tema ou envie sua imagem no painel acima para dar vida a uma arte inspiradora.
        </p>
      </div>
    );
  }

  const currentImageUrl = availableImages[selectedImageIndex] || result.imageUrl;

  const activeFilterObj = getArtisticFilterById(customization.artisticFilter);
  const calculatedFilterCss = getArtisticFilterCss(
    customization.artisticFilter,
    customization.artisticFilterIntensity
  );

  // Aspect ratio styling
  const aspectRatioStyle = result.aspectRatio
    ? { aspectRatio: result.aspectRatio.replace(':', '/') }
    : { aspectRatio: '1/1' };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-violet-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-violet-400 flex items-center gap-2.5 animate-fade-in text-sm font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Display Card */}
      <div id="studio-result-display" className="bg-slate-900/90 backdrop-blur-xl p-5 sm:p-7 rounded-2xl border border-slate-800 shadow-2xl space-y-6 scroll-mt-24">
        {/* Top Header bar with status and quick action icons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              Arte & Frase Pronta
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/50 font-mono">
              {result.aspectRatio || '1:1'}
            </span>
          </div>

          {/* Quick Bar actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyQuote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Copiar Frase"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copiar Frase</span>
            </button>

            <button
              type="button"
              onClick={() => handleRegenerateQuote('Inspirador e Encorajador')}
              disabled={isRegeneratingQuote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-300 bg-violet-950/60 hover:bg-violet-900/60 rounded-lg transition-colors border border-violet-800/70 disabled:opacity-50"
              title="Regerar apenas o aforismo mantendo a mesma imagem visual"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingQuote ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRegeneratingQuote ? 'Regerando...' : 'Novo Aforismo'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors border border-slate-700"
              title={isFullscreen ? 'Sair do Modo Expandido' : 'Modo Expandido'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Position Bar: Acima, Ao Lado, Abaixo */}
        <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-violet-400" />
              <span>Local da Frase:</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (posicione para não esconder partes importantes da imagem)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPositionPreset('top')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.positionPreset === 'top'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Posicionar acima (topo da imagem, liberando o centro e a base)"
            >
              <ArrowUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Acima</span>
            </button>

            <button
              type="button"
              onClick={() => applyPositionPreset('left')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.positionPreset === 'left'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Posicionar ao lado esquerdo (em coluna, liberando o centro e a direita da imagem)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-300" />
              <span>Ao Lado (Esq)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPositionPreset('center')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.positionPreset === 'center'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Posicionar no centro clássico"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-violet-300 inline-block" />
              <span>Centro</span>
            </button>

            <button
              type="button"
              onClick={() => applyPositionPreset('right')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.positionPreset === 'right'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Posicionar ao lado direito (em coluna, liberando o centro e a esquerda da imagem)"
            >
              <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
              <span>Ao Lado (Dir)</span>
            </button>

            <button
              type="button"
              onClick={() => applyPositionPreset('bottom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.positionPreset === 'bottom'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Posicionar abaixo (base da imagem, liberando o topo e o centro)"
            >
              <ArrowDown className="w-3.5 h-3.5 text-pink-300" />
              <span>Abaixo</span>
            </button>
          </div>
        </div>

        {/* Quick Legibility Selector Bar: Sombra, Contorno, Fundo Translúcido */}
        <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Legibilidade da Frase:</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (garanta leitura nítida sobre qualquer imagem)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSetLegibilityMode('shadow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.legibilityMode === 'shadow'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Sombra profunda: camadas de sombra escura que destacam o texto sem cobrir a imagem"
            >
              <Layers className="w-3.5 h-3.5 text-violet-300" />
              <span>Sombra</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLegibilityMode('stroke')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.legibilityMode === 'stroke'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Contorno gráfico (Stroke): traço nítido ao redor das letras, perfeito para fundos com detalhes claros e escuros"
            >
              <Type className="w-3.5 h-3.5 text-cyan-300" />
              <span>Contorno</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLegibilityMode('backdrop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                customization.legibilityMode === 'backdrop'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
              title="Fundo translúcido: cartão com efeito vidro fosco (glassmorphism) que destaca a frase com elegância"
            >
              <Square className="w-3.5 h-3.5 text-pink-300" />
              <span>Fundo Translúcido</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLegibilityMode('combo')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                customization.legibilityMode === 'combo'
                  ? 'bg-violet-700 text-white ring-1 ring-violet-400 shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
              title="Combinado: fundo translúcido suave + contorno e sombra"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Combinado</span>
            </button>
          </div>
        </div>

        {/* Quick Post-Generation Artistic Filter Selector Bar: Sépia, Black & White, Vintage Film, Cyberpunk */}
        <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-2.5 rounded-xl flex flex-col gap-2.5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Filtro Artístico (Pós-Geração):</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                (acabamento fotográfico e cinematográfico final para a imagem)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {customization.artisticFilter !== 'none' && (
                <button
                  type="button"
                  onClick={() => handleSetArtisticFilter('none')}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 transition-colors"
                  title="Restaurar cores originais"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Original</span>
                </button>
              )}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/50">
                {activeFilterObj.shortLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetArtisticFilter('none')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customization.artisticFilter === 'none'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                }`}
                title="Cores originais puras da geração de IA"
              >
                <span>Original</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetArtisticFilter('sepia')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customization.artisticFilter === 'sepia'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                }`}
                title="Sépia: calor clássico vintage e tons âmbar nostálgicos"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>Sépia</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetArtisticFilter('bw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customization.artisticFilter === 'bw'
                    ? 'bg-gradient-to-r from-slate-600 to-zinc-700 text-white shadow-md shadow-slate-600/30 ring-1 ring-slate-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                }`}
                title="Black & White: monocromático de alto contraste e textura definida"
              >
                <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                <span>Black & White</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetArtisticFilter('vintage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customization.artisticFilter === 'vintage'
                    ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-md shadow-amber-700/30 ring-1 ring-amber-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                }`}
                title="Vintage Film: filme analógico 35mm com saturação balanceada e vinheta"
              >
                <Film className="w-3.5 h-3.5 text-amber-300" />
                <span>Vintage Film</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetArtisticFilter('cyberpunk')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customization.artisticFilter === 'cyberpunk'
                    ? 'bg-gradient-to-r from-pink-600 to-cyan-600 text-white shadow-md shadow-pink-600/30 ring-1 ring-pink-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                }`}
                title="Cyberpunk: estética futurista neon de alto contraste (magenta & ciano)"
              >
                <Zap className="w-3.5 h-3.5 text-pink-300" />
                <span>Cyberpunk</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetArtisticFilter('cinematic')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hidden md:flex ${
                  customization.artisticFilter === 'cinematic'
                    ? 'bg-sky-600 text-white ring-1 ring-sky-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title="Cinema Teal & Orange: gradação cinematográfica de Hollywood"
              >
                <Film className="w-3 h-3 text-sky-400" />
                <span>Cinema</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetArtisticFilter('golden_hour')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hidden md:flex ${
                  customization.artisticFilter === 'golden_hour'
                    ? 'bg-amber-600 text-white ring-1 ring-amber-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title="Golden Hour: luz solar dourada do entardecer"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Golden Hour</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'filters'
                    ? 'bg-fuchsia-700 text-white ring-1 ring-fuchsia-400'
                    : 'bg-slate-900/90 text-fuchsia-300 hover:bg-slate-800 border border-fuchsia-900/60'
                }`}
                title="Abrir painel completo de filtros artísticos e intensidade"
              >
                <Sparkles className="w-3 h-3 text-fuchsia-300" />
                <span>+ Mais Filtros</span>
              </button>
            </div>

            {/* Intensity slider if filter is active */}
            {customization.artisticFilter !== 'none' && (
              <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  Intensidade: <strong className="text-fuchsia-300">{customization.artisticFilterIntensity}%</strong>
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={customization.artisticFilterIntensity}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      artisticFilterIntensity: Number(e.target.value),
                    })
                  }
                  className="w-20 accent-fuchsia-500 h-1 bg-slate-800 rounded cursor-pointer"
                  title="Ajustar intensidade do filtro"
                />
              </div>
            )}
          </div>
        </div>

        {/* IMAGE STAGE */}
        <div className="flex justify-center w-full">
          <div
            ref={imageContainerRef}
            className={`relative w-full overflow-hidden rounded-xl border border-slate-700/80 shadow-2xl bg-slate-950 group transition-all duration-300 ${
              isFullscreen ? 'max-w-4xl' : 'max-w-2xl'
            }`}
            style={aspectRatioStyle}
          >
            {/* Quick Floating Quote Regenerate Button */}
            <div className="absolute top-3 left-3 z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegenerateQuote('Inspirador e Encorajador');
                }}
                disabled={isRegeneratingQuote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-violet-200 hover:text-white border border-violet-500/50 backdrop-blur-md shadow-lg text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Regerar apenas a frase positiva baseada nesta imagem"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingQuote ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingQuote ? 'Criando aforismo...' : 'Novo Aforismo'}</span>
              </button>
            </div>

            {/* Background Image with Applied Post-Generation Artistic Filter */}
            <img
              src={currentImageUrl}
              alt="Obra de arte inspiradora"
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover select-none transition-all duration-300"
              style={{
                filter: calculatedFilterCss,
              }}
            />

            {/* Artistic Filter Vignette Effect Layer */}
            {activeFilterObj?.vignette && customization.artisticFilter !== 'none' && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.45) 100%)',
                  opacity: customization.artisticFilterIntensity / 100,
                }}
              />
            )}

            {/* Artistic Filter Atmospheric Gradient Overlay Layer */}
            {activeFilterObj?.overlayGradient && customization.artisticFilter !== 'none' && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: activeFilterObj.overlayGradient,
                  opacity: customization.artisticFilterIntensity / 100,
                }}
              />
            )}

            {/* Atmosphere / Gradient Overlay */}
            {customization.overlayFilter === 'gradient' ? (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, rgba(3, 7, 18, ${customization.overlayOpacity + 0.3}) 0%, rgba(3, 7, 18, ${
                    customization.overlayOpacity
                  }) 40%, rgba(0, 0, 0, 0.05) 100%)`,
                }}
              />
            ) : customization.overlayFilter !== 'none' ? (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor:
                    OVERLAY_FILTERS.find((f) => f.id === customization.overlayFilter)?.color || '#000000',
                  opacity: customization.overlayOpacity,
                }}
              />
            ) : null}

            {/* QUOTE & AUTHOR CONTAINER */}
            <div
              className="absolute transition-all duration-200 pointer-events-auto"
              style={{
                top: `${customization.verticalPosition}%`,
                left: `${customization.horizontalPosition}%`,
                transform: 'translate(-50%, -50%)',
                width: getQuoteContainerWidth(),
                maxWidth: getQuoteContainerWidth(),
                boxSizing: 'border-box',
              }}
            >
              <div
                className={`transition-all duration-200 rounded-2xl mx-auto w-full ${
                  isBackdropActive
                    ? 'px-6 py-4 sm:px-7 sm:py-5 backdrop-blur-md border border-white/15 shadow-2xl ring-1 ring-black/20'
                    : 'px-2 py-1'
                }`}
                style={{
                  backgroundColor: isBackdropActive
                    ? `rgba(${customization.pillColor === '#ffffff' ? '255, 255, 255' : '0, 0, 0'}, ${customization.pillOpacity})`
                    : 'transparent',
                  textAlign: customization.textAlign,
                }}
              >
                {/* Quote Text */}
                <p
                  className="transition-all tracking-wide select-text"
                  style={{
                    fontFamily: customization.fontFamily,
                    fontSize: `${customization.fontSize}px`,
                    color: customization.color,
                    lineHeight: customization.lineHeight,
                    letterSpacing: customization.letterSpacing,
                    fontWeight: customization.isBold ? 700 : 500,
                    fontStyle: customization.isItalic ? 'italic' : 'normal',
                    ...getLegibilityTextStyles(),
                  }}
                >
                  "{result.quote}"
                </p>

                {/* Author attribution */}
                {customization.showAuthor && customization.authorText && (
                  <p
                    className="mt-3 text-xs sm:text-sm font-semibold opacity-90 transition-all select-text"
                    style={{
                      fontFamily: customization.fontFamily,
                      color: customization.color,
                      ...getAuthorLegibilityStyles(),
                    }}
                  >
                    {customization.authorText}
                  </p>
                )}
              </div>
            </div>

            {/* Inspira Arte Official Watermark */}
            {customization.showWatermark && (
              <div
                className={`absolute z-20 pointer-events-none select-none transition-all ${
                  customization.watermarkPosition === 'bottom-left'
                    ? 'bottom-3 sm:bottom-4 left-3 sm:left-4'
                    : customization.watermarkPosition === 'top-right'
                    ? 'top-3 sm:top-4 right-3 sm:right-4'
                    : customization.watermarkPosition === 'top-left'
                    ? 'top-3 sm:top-4 left-3 sm:left-4'
                    : customization.watermarkPosition === 'bottom-center'
                    ? 'bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2'
                    : 'bottom-3 sm:bottom-4 right-3 sm:right-4'
                }`}
                style={{ opacity: customization.watermarkOpacity }}
              >
                {customization.watermarkStyle === 'minimal' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 backdrop-blur-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] border border-white/10">
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase font-sans">
                      Inspira Arte
                    </span>
                  </div>
                ) : customization.watermarkStyle === 'monochrome' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase font-sans">
                      Inspira Arte
                    </span>
                  </div>
                ) : (
                  /* 'badge' style - modern branded pill with gradient emblem */
                  <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-xl">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400 flex items-center justify-center p-0.5 shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase font-sans text-slate-100">
                      Inspira Arte
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Variations Strip */}
        {availableImages.length > 1 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Variações Disponíveis ({availableImages.length}):
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {availableImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-violet-500 ring-2 ring-violet-500/40 scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Variação ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* REGENERATE POSITIVE QUOTE BANNER (KEEP ART, NEW APHORISM) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-slate-900 border border-violet-700/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-violet-600/25 border border-violet-500/40 flex items-center justify-center text-violet-300 flex-shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-violet-300 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-100">
                  Regenerar Apenas a Frase Positiva
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-violet-900/80 text-violet-300 border border-violet-700/60 rounded-full font-mono">
                  Mesma Imagem
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gere um novo aforismo positivo de alto impacto mantendo a mesma obra visual intacta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleRegenerateQuote('Inspirador e Encorajador')}
            disabled={isRegeneratingQuote}
            className="w-full md:w-auto flex items-center justify-center gap-2.5 px-5 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex-shrink-0"
            title="Gera uma nova frase positiva mantendo a imagem atual intacta"
          >
            <RefreshCw className={`w-4 h-4 ${isRegeneratingQuote ? 'animate-spin' : ''}`} />
            <span>{isRegeneratingQuote ? 'Criando Novo Aforismo...' : 'Novo Aforismo com Esta Imagem'}</span>
          </button>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* PNG High-Res with Watermark */}
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-center"
          >
            <div className="flex items-center gap-2">
              <Download className={`w-4 h-4 ${downloadingType === 'png' ? 'animate-bounce' : ''}`} />
              <span className="text-sm font-bold">
                {downloadingType === 'png' ? 'Renderizando PNG...' : 'Baixar PNG (Alta Res.)'}
              </span>
            </div>
            <span className="text-[10px] text-violet-200/80 font-normal mt-0.5">
              Escala 2x • com Watermark Inspira Arte
            </span>
          </button>

          {/* PDF Export with Watermark */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isDownloading}
            className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-r from-rose-700 via-pink-700 to-purple-800 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-700/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-center"
          >
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${downloadingType === 'pdf' ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-bold">
                {downloadingType === 'pdf' ? 'Gerando PDF...' : 'Exportar como PDF'}
              </span>
            </div>
            <span className="text-[10px] text-rose-200/80 font-normal mt-0.5">
              PDF Vetorial • com Watermark Inspira Arte
            </span>
          </button>

          {/* Clean Image Download */}
          {customization.artisticFilter !== 'none' ? (
            <div className="flex flex-col justify-between p-2.5 bg-gradient-to-r from-fuchsia-950/70 via-purple-950/70 to-slate-900 rounded-xl border border-fuchsia-700/60 shadow-lg gap-2 text-center">
              <button
                type="button"
                onClick={() => handleDownloadCleanImage(true)}
                disabled={isDownloading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg transition-all text-xs shadow-md disabled:opacity-50"
                title={`Baixar arte pura com acabamento ${activeFilterObj.shortLabel}`}
              >
                <Palette className="w-3.5 h-3.5 text-fuchsia-200" />
                <span>Baixar Limpa c/ Filtro</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadCleanImage(false)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline transition-colors"
                title="Baixar arte original crua sem filtros"
              >
                ou Baixar Original sem Filtro
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleDownloadCleanImage(false)}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all hover:scale-[1.01] active:scale-[0.99] text-center"
            >
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Baixar Imagem Limpa</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                Arte original sem texto
              </span>
            </button>
          )}

          {/* Variations */}
          <button
            type="button"
            onClick={handleGenerateVariations}
            disabled={isGeneratingVariations}
            className="flex flex-col items-center justify-center p-3.5 bg-slate-850 hover:bg-slate-800 text-fuchsia-300 font-semibold rounded-xl border border-fuchsia-900/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-center"
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${isGeneratingVariations ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isGeneratingVariations ? 'Criando...' : 'Gerar Variações'}
              </span>
            </div>
            <span className="text-[10px] text-fuchsia-400/80 font-normal mt-0.5">
              Novas opções visuais com IA
            </span>
          </button>
        </div>

        {onOpenPalette && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onOpenPalette(currentImageUrl, result.theme)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/60 transition-all hover:scale-[1.005] active:scale-[0.995]"
              title="Gerar paleta de cores complementar baseada nesta imagem"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extrair Paleta de Cores Complementar Desta Imagem</span>
            </button>
          </div>
        )}

        {/* STUDIO CUSTOMIZATION DRAWER / TABS */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Estúdio de Customização de Tipografia & Filtros</span>
            </h3>

            {/* Customization Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'text' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Texto & Tipografia
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'visual' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3 h-3 text-cyan-300" />
                <span>Posição & Layout</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'filters' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3 h-3 text-fuchsia-300" />
                <span>Filtros Artísticos</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('watermark')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'watermark' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Stamp className="w-3 h-3 text-amber-300" />
                <span>Marca d'água & Exportação</span>
              </button>
            </div>
          </div>

          {/* TAB 1: TEXT & TYPOGRAPHY */}
          {activeTab === 'text' && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {/* Direct Quote Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Editar Texto da Frase:
                  </label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleRegenerateQuote('Inspirador e Encorajador')}
                      disabled={isRegeneratingQuote}
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Gera uma nova frase positiva para esta mesma imagem"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRegeneratingQuote ? 'animate-spin' : ''}`} />
                      <span>{isRegeneratingQuote ? 'Gerando...' : 'Regenerar Frase Positiva'}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">{result.quote.length} caracteres</span>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={result.quote}
                  onChange={(e) => onQuoteChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                />

                {/* Instant Feeling Transformer */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span>Transformar Sentimento com IA:</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Gera nova frase no tom</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Raiva & Basta', icon: '⚡', tone: 'Raiva e Revolta Canalizada', color: 'hover:border-red-500 hover:text-red-300' },
                      { label: 'Sátira & Ironia', icon: '🎭', tone: 'Sátira e Ironia Fina', color: 'hover:border-amber-500 hover:text-amber-300' },
                      { label: 'Cômico & Humor', icon: '😂', tone: 'Cômico e Divertido', color: 'hover:border-yellow-500 hover:text-yellow-300' },
                      { label: 'Direto & Cru', icon: '🎯', tone: 'Direto e Sem Rodeios', color: 'hover:border-orange-500 hover:text-orange-300' },
                      { label: 'Amoroso & Afeto', icon: '❤️', tone: 'Amoroso e Apaixonado', color: 'hover:border-pink-500 hover:text-pink-300' },
                      { label: 'Melancólico', icon: '🌊', tone: 'Melancólico e Saudade', color: 'hover:border-blue-500 hover:text-blue-300' },
                      { label: 'Empoderado', icon: '👑', tone: 'Empoderado e Conquista', color: 'hover:border-purple-500 hover:text-purple-300' },
                      { label: 'Estoico', icon: '🏛️', tone: 'Filosófico e Estoico', color: 'hover:border-emerald-500 hover:text-emerald-300' },
                      { label: 'Inspirador', icon: '✨', tone: 'Inspirador e Encorajador', color: 'hover:border-violet-500 hover:text-violet-300' },
                    ].map((btn) => (
                      <button
                        key={btn.tone}
                        type="button"
                        onClick={() => handleRegenerateQuote(btn.tone)}
                        disabled={isRegeneratingQuote}
                        className={`text-[11px] px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/90 text-slate-300 transition-colors flex items-center gap-1.5 ${btn.color} disabled:opacity-50`}
                        title={`Gerar frase com sentimento de ${btn.label}`}
                      >
                        <span>{btn.icon}</span>
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Família Tipográfica:</label>
                  <select
                    value={customization.fontFamily}
                    onChange={(e) => setCustomization({ ...customization, fontFamily: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    {FONT_PRESETS.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.fonts.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Font Size & Alignment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                    <span>Tamanho: {customization.fontSize}px</span>
                    <span>Alinhamento:</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={16}
                      max={48}
                      value={customization.fontSize}
                      onChange={(e) =>
                        setCustomization({ ...customization, fontSize: Number(e.target.value) })
                      }
                      className="flex-1 accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setCustomization({ ...customization, textAlign: 'left' })}
                        className={`p-1.5 ${
                          customization.textAlign === 'left' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomization({ ...customization, textAlign: 'center' })}
                        className={`p-1.5 ${
                          customization.textAlign === 'center' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomization({ ...customization, textAlign: 'right' })}
                        className={`p-1.5 ${
                          customization.textAlign === 'right' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color & Styles Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Text Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Cor do Texto:</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCustomization({ ...customization, color: c })}
                          className={`w-6 h-6 rounded-full border transition-all ${
                            customization.color === c ? 'scale-125 border-violet-400 ring-2 ring-violet-500/50' : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={customization.color}
                      onChange={(e) => setCustomization({ ...customization, color: e.target.value })}
                      className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                    />
                  </div>
                </div>

                {/* Author / Signature */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customization.showAuthor}
                        onChange={(e) => setCustomization({ ...customization, showAuthor: e.target.checked })}
                        className="rounded accent-violet-500"
                      />
                      <span>Assinatura / Autor</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={customization.authorText}
                    onChange={(e) => setCustomization({ ...customization, authorText: e.target.value })}
                    disabled={!customization.showAuthor}
                    placeholder="Ex: — Inspira Arte"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Quick Legibility Selector in Tab 1 */}
              <div className="pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Legibilidade da Frase sobre a Imagem:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('visual')}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Opções visuais avançadas →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetLegibilityMode('shadow')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                      customization.legibilityMode === 'shadow'
                        ? 'bg-violet-600 border-violet-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-violet-300" />
                    <span>Sombra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetLegibilityMode('stroke')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                      customization.legibilityMode === 'stroke'
                        ? 'bg-violet-600 border-violet-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Contorno</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetLegibilityMode('backdrop')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                      customization.legibilityMode === 'backdrop'
                        ? 'bg-violet-600 border-violet-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5 text-pink-300" />
                    <span>Fundo Translúcido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetLegibilityMode('combo')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1 ${
                      customization.legibilityMode === 'combo'
                        ? 'bg-violet-600 border-violet-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Combinado</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILTERS & POSITION */}
          {activeTab === 'visual' && (
            <div className="space-y-5 bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800">
              {/* PRIMARY LOCATION SELECTOR (Acima, Ao Lado, Abaixo) */}
              <div className="space-y-3 pb-4 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Move className="w-4 h-4 text-violet-400" />
                    <span>Local da Frase sobre a Imagem:</span>
                  </label>
                  <span className="text-[11px] text-violet-300 font-medium">
                    Evita esconder partes importantes (rostos, paisagens, ponto focal)
                  </span>
                </div>

                {/* 5 Main Preset Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPositionPreset('top')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      customization.positionPreset === 'top'
                        ? 'border-violet-500 bg-violet-950/50 text-white ring-2 ring-violet-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold">Acima (Topo)</span>
                    <span className="text-[10px] text-slate-400">Libera centro e base</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPositionPreset('left')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      customization.positionPreset === 'left'
                        ? 'border-violet-500 bg-violet-950/50 text-white ring-2 ring-violet-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs font-bold">Ao Lado (Esq)</span>
                    <span className="text-[10px] text-slate-400">Libera lado direito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPositionPreset('center')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      customization.positionPreset === 'center'
                        ? 'border-violet-500 bg-violet-950/50 text-white ring-2 ring-violet-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-violet-400/80 flex items-center justify-center text-[10px] text-slate-950 font-bold">●</span>
                    <span className="text-xs font-bold">Centro</span>
                    <span className="text-[10px] text-slate-400">Foco centralizado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPositionPreset('right')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      customization.positionPreset === 'right'
                        ? 'border-violet-500 bg-violet-950/50 text-white ring-2 ring-violet-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs font-bold">Ao Lado (Dir)</span>
                    <span className="text-[10px] text-slate-400">Libera lado esquerdo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPositionPreset('bottom')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 col-span-2 sm:col-span-1 ${
                      customization.positionPreset === 'bottom'
                        ? 'border-violet-500 bg-violet-950/50 text-white ring-2 ring-violet-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <ArrowDown className="w-4 h-4 text-pink-300" />
                    <span className="text-xs font-bold">Abaixo (Base)</span>
                    <span className="text-[10px] text-slate-400">Libera topo e centro</span>
                  </button>
                </div>

                {/* 3x3 Quadrant Mini-Map Grid */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <span>Mapa Visual 3x3 de Quadrantes (clique para fixar no quadrante exato):</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-w-sm mx-auto bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    {[
                      { id: 'top-left' as TextPositionPreset, label: '↖ Topo Esq' },
                      { id: 'top' as TextPositionPreset, label: '⬆ Topo Centro' },
                      { id: 'top-right' as TextPositionPreset, label: '↗ Topo Dir' },
                      { id: 'left' as TextPositionPreset, label: '⬅ Meio Esq' },
                      { id: 'center' as TextPositionPreset, label: '⏺ Centro' },
                      { id: 'right' as TextPositionPreset, label: '➡ Meio Dir' },
                      { id: 'bottom-left' as TextPositionPreset, label: '↙ Base Esq' },
                      { id: 'bottom' as TextPositionPreset, label: '⬇ Base Centro' },
                      { id: 'bottom-right' as TextPositionPreset, label: '↘ Base Dir' },
                    ].map((quad) => (
                      <button
                        key={quad.id}
                        type="button"
                        onClick={() => applyPositionPreset(quad.id)}
                        className={`py-2 px-1 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                          customization.positionPreset === quad.id
                            ? 'bg-violet-600 border-violet-400 text-white shadow-md'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {quad.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOX WIDTH & ALIGNMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                {/* Box Width */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Largura da Caixa da Frase:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, boxWidth: 'full' })}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        customization.boxWidth === 'full'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Faixa Larga (100%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, boxWidth: 'half' })}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        customization.boxWidth === 'half'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                      title="Ideal para frases ao lado esquerdo ou direito"
                    >
                      <span>Coluna Lateral (52%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, boxWidth: 'compact' })}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        customization.boxWidth === 'compact'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Cartão Compacto (42%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, boxWidth: 'narrow' })}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        customization.boxWidth === 'narrow'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Coluna Estreita (34%)</span>
                    </button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Alinhamento do Texto na Caixa:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, textAlign: 'left' })}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        customization.textAlign === 'left'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>Esquerda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, textAlign: 'center' })}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        customization.textAlign === 'center'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      <span>Centro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, textAlign: 'right' })}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        customization.textAlign === 'right'
                          ? 'border-violet-500 bg-violet-950/50 text-violet-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                      <span>Direita</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FINE-TUNING SLIDERS (X e Y) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                {/* Vertical Position (Y) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Ajuste Vertical (Y): {customization.verticalPosition}%</span>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, verticalPosition: 50, positionPreset: 'custom' })}
                      className="text-[10px] text-slate-400 hover:text-violet-300 underline"
                    >
                      Redefinir Centro (50%)
                    </button>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={88}
                    value={customization.verticalPosition}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        verticalPosition: Number(e.target.value),
                        positionPreset: 'custom',
                      })
                    }
                    className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>12% (Topo)</span>
                    <span>50% (Meio)</span>
                    <span>88% (Base)</span>
                  </div>
                </div>

                {/* Horizontal Position (X) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Ajuste Horizontal (X): {customization.horizontalPosition}%</span>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, horizontalPosition: 50, positionPreset: 'custom' })}
                      className="text-[10px] text-slate-400 hover:text-violet-300 underline"
                    >
                      Redefinir Centro (50%)
                    </button>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={82}
                    value={customization.horizontalPosition}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        horizontalPosition: Number(e.target.value),
                        positionPreset: 'custom',
                      })
                    }
                    className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>18% (Esquerda)</span>
                    <span>50% (Centro)</span>
                    <span>82% (Direita)</span>
                  </div>
                </div>
              </div>

              {/* Atmosphere Overlay Filters */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Filtro Atmosférico da Imagem:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {OVERLAY_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setCustomization({
                          ...customization,
                          overlayFilter: f.id,
                          overlayOpacity: f.defaultOpacity,
                        })
                      }
                      className={`p-2 rounded-lg border text-center transition-all ${
                        customization.overlayFilter === f.id
                          ? 'border-violet-500 bg-violet-950/40 text-violet-200 font-semibold shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs block truncate">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overlay Opacity & Pill Box Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Intensidade do Filtro: {Math.round(customization.overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.05}
                    value={customization.overlayOpacity}
                    onChange={(e) =>
                      setCustomization({ ...customization, overlayOpacity: Number(e.target.value) })
                    }
                    className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Legibility Mode indicator & selector */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Modo de Legibilidade da Frase:</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Garante leitura nítida sobre fundos claros, escuros ou texturizados
                    </span>
                  </div>

                  {/* 4 Cards Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Sombra */}
                    <button
                      type="button"
                      onClick={() => handleSetLegibilityMode('shadow')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        customization.legibilityMode === 'shadow'
                          ? 'border-violet-500 bg-violet-950/60 ring-2 ring-violet-500/40 shadow-lg text-white'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-xs font-bold">Sombra</span>
                        </div>
                        {customization.legibilityMode === 'shadow' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Camadas profundas sem cobrir a imagem
                      </p>
                    </button>

                    {/* Contorno */}
                    <button
                      type="button"
                      onClick={() => handleSetLegibilityMode('stroke')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        customization.legibilityMode === 'stroke'
                          ? 'border-violet-500 bg-violet-950/60 ring-2 ring-violet-500/40 shadow-lg text-white'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-bold">Contorno</span>
                        </div>
                        {customization.legibilityMode === 'stroke' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Borda gráfica (stroke) ao redor das letras
                      </p>
                    </button>

                    {/* Fundo Translúcido */}
                    <button
                      type="button"
                      onClick={() => handleSetLegibilityMode('backdrop')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        customization.legibilityMode === 'backdrop'
                          ? 'border-violet-500 bg-violet-950/60 ring-2 ring-violet-500/40 shadow-lg text-white'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Square className="w-3.5 h-3.5 text-pink-400" />
                          <span className="text-xs font-bold">Fundo Translúcido</span>
                        </div>
                        {customization.legibilityMode === 'backdrop' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Vidro fosco (glassmorphism) elegante
                      </p>
                    </button>

                    {/* Combinado */}
                    <button
                      type="button"
                      onClick={() => handleSetLegibilityMode('combo')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        customization.legibilityMode === 'combo'
                          ? 'border-violet-500 bg-violet-950/60 ring-2 ring-violet-500/40 shadow-lg text-white'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold">Combinado</span>
                        </div>
                        {customization.legibilityMode === 'combo' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Fundo translúcido + contorno/sombra
                      </p>
                    </button>
                  </div>

                  {/* Contextual Fine-Tuning depending on active mode */}
                  {customization.legibilityMode === 'stroke' && (
                    <div className="mt-2.5 bg-slate-900/90 p-3 rounded-xl border border-cyan-800/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-300 block">
                          Espessura do Contorno:
                        </span>
                        <div className="flex gap-1.5">
                          {(['light', 'medium', 'strong'] as TextStrokeWidth[]).map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setCustomization({ ...customization, strokeWidth: w })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                customization.strokeWidth === w
                                  ? 'bg-cyan-600 border-cyan-400 text-white'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {w === 'light' ? 'Fino (1.2px)' : w === 'medium' ? 'Médio (1.8px)' : 'Forte (2.6px)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-300 block">
                          Cor do Contorno:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {[
                            { color: '#000000', label: 'Preto (Máximo Contraste)' },
                            { color: '#1e293b', label: 'Grafite' },
                            { color: '#ffffff', label: 'Branco' },
                            { color: '#78350f', label: 'Âmbar Escuro' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setCustomization({ ...customization, strokeColor: c.color })}
                              className={`w-6 h-6 rounded-full border transition-all ${
                                customization.strokeColor === c.color
                                  ? 'scale-125 border-cyan-400 ring-2 ring-cyan-500/50'
                                  : 'border-slate-700'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                          <input
                            type="color"
                            value={customization.strokeColor}
                            onChange={(e) => setCustomization({ ...customization, strokeColor: e.target.value })}
                            className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                            title="Cor personalizada"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(customization.legibilityMode === 'backdrop' || customization.legibilityMode === 'combo') && (
                    <div className="mt-2.5 bg-slate-900/90 p-3 rounded-xl border border-pink-800/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-300">
                            <span>Opacidade do Vidro: {Math.round(customization.pillOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.15}
                            max={0.9}
                            step={0.05}
                            value={customization.pillOpacity}
                            onChange={(e) =>
                              setCustomization({ ...customization, pillOpacity: Number(e.target.value) })
                            }
                            className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-300 block">Tom do Fundo:</span>
                          <div className="flex gap-2">
                            {[
                              { color: '#000000', label: 'Preto Noturno' },
                              { color: '#0f172a', label: 'Azul Ardósia' },
                              { color: '#ffffff', label: 'Branco Nevoeiro' },
                            ].map((pill) => (
                              <button
                                key={pill.color}
                                type="button"
                                onClick={() => setCustomization({ ...customization, pillColor: pill.color })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                  customization.pillColor === pill.color
                                    ? 'bg-pink-950/60 border-pink-400 text-white'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-600 inline-block"
                                  style={{ backgroundColor: pill.color }}
                                />
                                <span>{pill.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {customization.legibilityMode === 'shadow' && (
                    <div className="mt-2.5 bg-slate-900/90 p-3 rounded-xl border border-violet-800/40 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-300">Tom da Sombra Projetada:</span>
                      <div className="flex gap-1.5">
                        {[
                          { value: 'rgba(0, 0, 0, 0.95)', label: 'Preto Intenso' },
                          { value: 'rgba(0, 0, 0, 0.75)', label: 'Suave' },
                          { value: 'rgba(15, 23, 42, 0.9)', label: 'Ardósia' },
                          { value: 'rgba(67, 20, 7, 0.9)', label: 'Âmbar' },
                        ].map((sh) => (
                          <button
                            key={sh.value}
                            type="button"
                            onClick={() => setCustomization({ ...customization, textShadowColor: sh.value })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              customization.textShadowColor === sh.value
                                ? 'bg-violet-600 border-violet-400 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {sh.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARTISTIC FILTERS GALLERY & TUNING */}
          {activeTab === 'filters' && (
            <div className="space-y-5 bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 animate-fade-in">
              {/* Header & Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-800/60 text-fuchsia-300">
                    <Palette className="w-4 h-4 text-fuchsia-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Camada de Filtros Artísticos Pós-Geração</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-700/50">
                        10 Estilos
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Aplique acabamento de color grading analógico, cinema ou neon diretamente sobre a imagem gerada.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {customization.artisticFilter !== 'none' ? (
                    <button
                      type="button"
                      onClick={() => handleSetArtisticFilter('none')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-850 border border-slate-700 transition-colors"
                      title="Remover filtro e voltar à imagem pura"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Voltar ao Original</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">Original Ativo</span>
                  )}
                </div>
              </div>

              {/* Global Filter Intensity Slider */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Intensidade do Acabamento Artístico:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-fuchsia-300 text-sm">
                      {customization.artisticFilterIntensity}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomization({ ...customization, artisticFilterIntensity: 100 })}
                      className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Redefinir 100%
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={customization.artisticFilterIntensity}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      artisticFilterIntensity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Sem efeito)</span>
                  <span>50% (Sutil & Equilibrado)</span>
                  <span>100% (Impacto Total)</span>
                </div>
              </div>

              {/* Filter Cards Grid */}
              <div className="space-y-4">
                {/* 1. Destaques (Sépia, Black & White, Vintage Film, Cyberpunk) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Filtros em Destaque:</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Pós-processamento de alto impacto</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {ARTISTIC_FILTERS.filter((f) =>
                      ['sepia', 'bw', 'vintage', 'cyberpunk'].includes(f.id)
                    ).map((f) => {
                      const isSelected = customization.artisticFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSetArtisticFilter(f.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative group overflow-hidden ${
                            isSelected
                              ? 'border-fuchsia-500 bg-fuchsia-950/60 ring-2 ring-fuchsia-500/50 shadow-lg text-white'
                              : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: f.previewHue }}
                              />
                              <span className="text-xs font-bold">{f.label}</span>
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {f.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                            <span className="text-slate-500 font-mono">{f.category}</span>
                            <span className={`font-semibold ${isSelected ? 'text-fuchsia-300' : 'text-slate-400'}`}>
                              {isSelected ? '✓ Aplicado' : 'Clique para aplicar'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Todos os Filtros & Cinema */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cinema, Retrô & Luz Atmosférica:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {ARTISTIC_FILTERS.filter(
                      (f) => !['sepia', 'bw', 'vintage', 'cyberpunk'].includes(f.id)
                    ).map((f) => {
                      const isSelected = customization.artisticFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSetArtisticFilter(f.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative ${
                            isSelected
                              ? 'border-fuchsia-500 bg-fuchsia-950/60 ring-2 ring-fuchsia-500/50 shadow-lg text-white'
                              : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: f.previewHue }}
                              />
                              <span className="text-xs font-bold">{f.label}</span>
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {f.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                            <span className="text-slate-500 font-mono">{f.category}</span>
                            <span className={`font-semibold ${isSelected ? 'text-fuchsia-300' : 'text-slate-400'}`}>
                              {isSelected ? '✓ Aplicado' : 'Selecionar'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* High-Res Filtered Export Banner inside Tab */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/30 to-slate-900 border border-fuchsia-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 block flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Filtro renderizado em tempo real na tela e gravado na exportação</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    O acabamento escolhido é embutido na exportação em alta resolução PNG e PDF.
                  </span>
                </div>

                {customization.artisticFilter !== 'none' && (
                  <button
                    type="button"
                    onClick={() => handleDownloadCleanImage(true)}
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg shadow-md transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Limpa com Este Filtro</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WATERMARK & EXPORT */}
          {activeTab === 'watermark' && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/60 text-violet-300">
                    <Stamp className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Marca d'água "Inspira Arte"</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-900/50 text-violet-300 border border-violet-700/50">
                        PNG & PDF
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Assina sua imagem com a marca oficial na exportação de alta resolução para PNG e PDF.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-slate-900 hover:bg-slate-850 border border-slate-700/80 px-3 py-1.5 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={customization.showWatermark}
                    onChange={(e) =>
                      setCustomization({ ...customization, showWatermark: e.target.checked })
                    }
                    className="rounded accent-violet-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-200">Ativar Marca d'água</span>
                </label>
              </div>

              {customization.showWatermark ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Position */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">Posicionamento:</label>
                      <select
                        value={customization.watermarkPosition}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            watermarkPosition: e.target.value as any,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                      >
                        <option value="bottom-right">Canto Inferior Direito (Padrão)</option>
                        <option value="bottom-left">Canto Inferior Esquerdo</option>
                        <option value="bottom-center">Centro Inferior</option>
                        <option value="top-right">Canto Superior Direito</option>
                        <option value="top-left">Canto Superior Esquerdo</option>
                      </select>
                    </div>

                    {/* Watermark Style */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">Estilo da Marca:</label>
                      <select
                        value={customization.watermarkStyle}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            watermarkStyle: e.target.value as any,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                      >
                        <option value="badge">Badge Translúcido com Gradiente</option>
                        <option value="minimal">Minimalista Dourado com Sombra</option>
                        <option value="monochrome">Monocromático Discreto</option>
                      </select>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>Opacidade: {Math.round(customization.watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={1.0}
                        step={0.05}
                        value={customization.watermarkOpacity}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            watermarkOpacity: Number(e.target.value),
                          })
                        }
                        className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-2"
                      />
                    </div>
                  </div>

                  {/* Watermark preview note */}
                  <div className="p-3 bg-violet-950/30 border border-violet-800/40 rounded-lg flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-violet-400" />
                      <span>A marca d'água é renderizada em tempo real sobre a prévia e incluída na exportação.</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">
                  Marca d'água desativada. As exportações em PNG e PDF serão geradas sem a insígnia da marca.
                </div>
              )}

              {/* Direct Export Buttons inside Tab */}
              <div className="pt-2 border-t border-slate-850 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingType === 'png' ? 'Renderizando PNG...' : 'Exportar PNG em Alta Resolução'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{downloadingType === 'pdf' ? 'Gerando PDF...' : 'Exportar PDF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
