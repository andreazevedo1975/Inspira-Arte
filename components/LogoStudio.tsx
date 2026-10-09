import React, { useState, useRef } from 'react';
import type { LogoConfig, LogoLayout, LogoStyle, BadgeShape } from '../types';
import { generateLogoStrategy } from '../services/geminiService';
// @ts-ignore
import html2canvas from 'html2canvas';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Palette,
  Type,
  Layout,
  Shapes,
  Sliders,
  Eye,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Compass,
  FileCode,
  Layers,
} from 'lucide-react';

const SYMBOL_PRESETS = [
  { id: 'lotus-star', name: 'Lótus & Estrela', category: 'Criatividade & Inspiração' },
  { id: 'crown-spark', name: 'Coroa Imperial', category: 'Luxo & Realeza' },
  { id: 'geometric-shield', name: 'Escudo Cyber', category: 'Tecnologia & Segurança' },
  { id: 'infinite-loop', name: 'Loop Infinito', category: 'Inovação & IA' },
  { id: 'hex-crystal', name: 'Cristal Isométrico', category: 'Moderno & Web3' },
  { id: 'zen-circle', name: 'Círculo Ensō', category: 'Zen & Orgânico' },
  { id: 'phoenix-flame', name: 'Fênix Alada', category: 'Força & Transformação' },
  { id: 'diamond-luxury', name: 'Diamante Facetado', category: 'Alta Joalheria & Estilo' },
  { id: 'spiral-galaxy', name: 'Espiral Áurea', category: 'Ciência & Visão' },
  { id: 'leaf-eco', name: 'Folha Botânica', category: 'Sustentabilidade' },
  { id: 'circuit-mind', name: 'Sinapse Neural', category: 'Inteligência Artificial' },
  { id: 'monogram', name: 'Monograma Letras', category: 'Tipografia Pura' },
];

const COLOR_PALETTES = [
  {
    name: 'Inspira Violeta & Rosa',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#F59E0B',
    bg: '#080B11',
  },
  {
    name: 'Ouro Nobre & Obsidiana',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FEF3C7',
    bg: '#0B0F19',
  },
  {
    name: 'Cobalto Cyber & Safira',
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#93C5FD',
    bg: '#050B14',
  },
  {
    name: 'Esmeralda & Menta Orgânica',
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#A7F3D0',
    bg: '#04130C',
  },
  {
    name: 'Rubi Carmim & Fogo',
    primary: '#EF4444',
    secondary: '#F43F5E',
    accent: '#FECDD3',
    bg: '#140608',
  },
  {
    name: 'Monocromático Minimalista',
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    accent: '#E2E8F0',
    bg: '#000000',
  },
];

const FONT_OPTIONS = [
  { value: "'Playfair Display', serif", label: 'Playfair Display (Serifada Luxo)' },
  { value: "'Cinzel', serif", label: 'Cinzel Imperial (Clássica Romana)' },
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Jakarta Sans (Ultra Moderna)' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat (Geométrica Limpa)' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue (Display Caixa Alta)' },
  { value: "'Righteous', cursive", label: 'Righteous (Retro Futurista)' },
  { value: "'Oswald', sans-serif", label: 'Oswald (Corporativa de Impacto)' },
  { value: "'Roboto Mono', monospace", label: 'Roboto Mono (Digital Tech)' },
];

export const LogoStudio: React.FC = () => {
  const [config, setConfig] = useState<LogoConfig>({
    brandName: 'Inspira Arte',
    slogan: 'Criatividade & Sabedoria',
    industry: 'Design & Tecnologia',
    style: 'luxury',
    symbolId: 'lotus-star',
    layout: 'vertical',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    accentColor: '#F8FAFC',
    backgroundColor: '#080B11',
    fontFamily: "'Playfair Display', serif",
    sloganFontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 34,
    sloganSize: 13,
    letterSpacing: 2,
    iconSize: 72,
    badgeShape: 'none',
    isGradient: true,
    showSlogan: true,
    uppercase: true,
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'mockups'>('editor');
  const [mockupView, setMockupView] = useState<'dark' | 'light' | 'card' | 'app'>('dark');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(
    'Design construído sob os princípios de proporção áurea e equilíbrio assimétrico, combinando a nobreza da geometria com tipografia de alta legibilidade.'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const logoPreviewRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAiStrategy = async () => {
    setIsGeneratingStrategy(true);
    showToast('Consultando IA de Direção de Arte...');
    try {
      const strategy = await generateLogoStrategy(
        config.brandName,
        config.slogan,
        config.industry,
        config.style
      );

      setConfig((prev) => ({
        ...prev,
        primaryColor: strategy.suggestedColors.primary || prev.primaryColor,
        secondaryColor: strategy.suggestedColors.secondary || prev.secondaryColor,
        accentColor: strategy.suggestedColors.accent || prev.accentColor,
        backgroundColor: strategy.suggestedColors.background || prev.backgroundColor,
        symbolId: strategy.symbolId || prev.symbolId,
        fontFamily: strategy.fontFamily || prev.fontFamily,
        layout: (strategy.layout as LogoLayout) || prev.layout,
      }));

      setAiRationale(strategy.designRationale || null);
      showToast('Estratégia e estilo aplicados com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao consultar IA.');
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  // Helper to render the geometric vector symbol
  const renderSymbol = (size = config.iconSize) => {
    const gradId = `logo-grad-${config.symbolId}`;
    const strokeWidth = 2.5;

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.primaryColor} />
            <stop offset="100%" stopColor={config.secondaryColor} />
          </linearGradient>
          <filter id="glow-symbol" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Badge Shape (if enabled) */}
        {config.badgeShape === 'circle' && (
          <circle cx="50" cy="50" r="46" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
        )}
        {config.badgeShape === 'square' && (
          <rect x="6" y="6" width="88" height="88" rx="14" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.4" />
        )}
        {config.badgeShape === 'hexagon' && (
          <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.4" />
        )}
        {config.badgeShape === 'shield' && (
          <path d="M50 8 L85 22 V50 C85 72 50 92 50 92 C50 92 15 72 15 50 V22 Z" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.4" />
        )}

        {/* SYMBOL DESIGNS */}
        {config.symbolId === 'lotus-star' && (
          <g filter="url(#glow-symbol)">
            {/* Sacred geometric lotus petals */}
            <path
              d="M50 14 C56 32 78 40 78 54 C78 70 64 78 50 86 C36 78 22 70 22 54 C22 40 44 32 50 14 Z"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeWidth}
              fill={config.primaryColor}
              fillOpacity="0.15"
            />
            <path
              d="M50 32 C54 44 68 50 68 60 C68 70 58 74 50 80 C42 74 32 70 32 60 C32 50 46 44 50 32 Z"
              stroke={`url(#${gradId})`}
              strokeWidth="2"
              fill={config.secondaryColor}
              fillOpacity="0.25"
            />
            {/* Center radiant diamond star */}
            <polygon points="50,42 54,50 62,50 56,55 58,63 50,58 42,63 44,55 38,50 46,50" fill={config.accentColor} />
          </g>
        )}

        {config.symbolId === 'crown-spark' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M20 72 L26 36 L40 50 L50 24 L60 50 L74 36 L80 72 Z"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeWidth}
              fill={config.primaryColor}
              fillOpacity="0.15"
              strokeLinejoin="round"
            />
            <line x1="20" y1="78" x2="80" y2="78" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="20" r="3.5" fill={config.accentColor} />
            <circle cx="26" cy="32" r="3" fill={config.secondaryColor} />
            <circle cx="74" cy="32" r="3" fill={config.secondaryColor} />
          </g>
        )}

        {config.symbolId === 'geometric-shield' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M50 12 L82 26 V48 C82 68 50 88 50 88 C50 88 18 68 18 48 V26 Z"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeWidth}
              fill={config.primaryColor}
              fillOpacity="0.12"
            />
            <path
              d="M50 24 L72 34 V48 C72 62 50 76 50 76 C50 76 28 62 28 48 V34 Z"
              stroke={config.secondaryColor}
              strokeWidth="2"
            />
            <circle cx="50" cy="50" r="7" fill={config.accentColor} />
          </g>
        )}

        {config.symbolId === 'infinite-loop' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M32 50 C20 38 20 62 32 50 C44 38 56 62 68 50 C80 38 80 62 68 50 C56 38 44 62 32 50 Z"
              stroke={`url(#${gradId})`}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="50" cy="50" r="4" fill={config.accentColor} />
          </g>
        )}

        {config.symbolId === 'hex-crystal' && (
          <g filter="url(#glow-symbol)">
            <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" stroke={`url(#${gradId})`} strokeWidth={strokeWidth} fill={config.primaryColor} fillOpacity="0.1" />
            <line x1="50" y1="14" x2="50" y2="86" stroke={`url(#${gradId})`} strokeWidth="1.5" />
            <line x1="16" y1="32" x2="84" y2="68" stroke={`url(#${gradId})`} strokeWidth="1.5" />
            <line x1="16" y1="68" x2="84" y2="32" stroke={`url(#${gradId})`} strokeWidth="1.5" />
          </g>
        )}

        {config.symbolId === 'zen-circle' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M50 16 A34 34 0 1 1 20 68"
              stroke={`url(#${gradId})`}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="50" cy="50" r="9" fill={config.accentColor} />
          </g>
        )}

        {config.symbolId === 'phoenix-flame' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M50 14 C56 30 72 38 84 38 C74 54 62 60 50 86 C38 60 26 54 16 38 C28 38 44 30 50 14 Z"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeWidth}
              fill={config.primaryColor}
              fillOpacity="0.2"
            />
            <path d="M50 36 C54 48 64 54 50 72 C36 54 46 48 50 36 Z" fill={config.secondaryColor} />
          </g>
        )}

        {config.symbolId === 'diamond-luxury' && (
          <g filter="url(#glow-symbol)">
            <polygon points="30,22 70,22 88,44 50,84 12,44" stroke={`url(#${gradId})`} strokeWidth={strokeWidth} fill={config.primaryColor} fillOpacity="0.15" />
            <line x1="12" y1="44" x2="88" y2="44" stroke={`url(#${gradId})`} strokeWidth="1.5" />
            <line x1="30" y1="22" x2="50" y2="84" stroke={`url(#${gradId})`} strokeWidth="1.5" />
            <line x1="70" y1="22" x2="50" y2="84" stroke={`url(#${gradId})`} strokeWidth="1.5" />
          </g>
        )}

        {config.symbolId === 'spiral-galaxy' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M50 50 C50 42 58 42 58 50 C58 60 44 60 44 50 C44 34 66 34 66 50 C66 70 36 70 36 50 C36 26 74 26 74 50 C74 80 28 80 28 50"
              stroke={`url(#${gradId})`}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="50" cy="50" r="3" fill={config.accentColor} />
          </g>
        )}

        {config.symbolId === 'leaf-eco' && (
          <g filter="url(#glow-symbol)">
            <path
              d="M20 80 C20 30 50 16 80 16 C80 66 50 80 20 80 Z"
              stroke={`url(#${gradId})`}
              strokeWidth={strokeWidth}
              fill={config.primaryColor}
              fillOpacity="0.2"
            />
            <path d="M20 80 Q 48 52 80 16" stroke={config.secondaryColor} strokeWidth="2.5" />
          </g>
        )}

        {config.symbolId === 'circuit-mind' && (
          <g filter="url(#glow-symbol)">
            <circle cx="50" cy="50" r="14" stroke={`url(#${gradId})`} strokeWidth={strokeWidth} />
            <circle cx="50" cy="50" r="6" fill={config.accentColor} />
            <line x1="50" y1="12" x2="50" y2="36" stroke={`url(#${gradId})`} strokeWidth="2.5" />
            <circle cx="50" cy="12" r="3.5" fill={config.secondaryColor} />
            <line x1="50" y1="64" x2="50" y2="88" stroke={`url(#${gradId})`} strokeWidth="2.5" />
            <circle cx="50" cy="88" r="3.5" fill={config.secondaryColor} />
            <line x1="16" y1="50" x2="36" y2="50" stroke={`url(#${gradId})`} strokeWidth="2.5" />
            <circle cx="16" cy="50" r="3.5" fill={config.secondaryColor} />
            <line x1="64" y1="50" x2="84" y2="50" stroke={`url(#${gradId})`} strokeWidth="2.5" />
            <circle cx="84" cy="50" r="3.5" fill={config.secondaryColor} />
          </g>
        )}

        {config.symbolId === 'monogram' && (
          <g filter="url(#glow-symbol)">
            <circle cx="50" cy="50" r="42" stroke={`url(#${gradId})`} strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            <text
              x="50"
              y="62"
              textAnchor="middle"
              fill={`url(#${gradId})`}
              fontFamily={config.fontFamily}
              fontSize="38"
              fontWeight="bold"
            >
              {config.brandName ? config.brandName.slice(0, 2).toUpperCase() : 'IA'}
            </text>
          </g>
        )}
      </svg>
    );
  };

  const handleDownloadPNG = async (transparent = false) => {
    if (!logoPreviewRef.current) return;
    showToast('Exportando PNG em 2000x2000px...');
    try {
      const canvas = await html2canvas(logoPreviewRef.current, {
        useCORS: true,
        scale: 4, // High resolution crisp raster
        backgroundColor: transparent ? null : config.backgroundColor,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `logo-${config.brandName.toLowerCase().replace(/\s+/g, '-')}-${transparent ? 'transparente' : 'completo'}.png`;
      a.click();
      showToast('PNG de alta definição baixado!');
    } catch {
      showToast('Erro ao exportar PNG.');
    }
  };

  const generateSymbolSvgString = (gradId: string) => {
    let badgeMarkup = '';
    if (config.badgeShape === 'circle') {
      badgeMarkup = `<circle cx="50" cy="50" r="46" stroke="url(#${gradId})" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.4" fill="none" />`;
    } else if (config.badgeShape === 'square') {
      badgeMarkup = `<rect x="6" y="6" width="88" height="88" rx="14" stroke="url(#${gradId})" stroke-width="1.5" opacity="0.4" fill="none" />`;
    } else if (config.badgeShape === 'hexagon') {
      badgeMarkup = `<polygon points="50,6 88,28 88,72 50,94 12,72 12,28" stroke="url(#${gradId})" stroke-width="1.5" opacity="0.4" fill="none" />`;
    } else if (config.badgeShape === 'shield') {
      badgeMarkup = `<path d="M50 8 L85 22 V50 C85 72 50 92 50 92 C50 92 15 72 15 50 V22 Z" stroke="url(#${gradId})" stroke-width="1.5" opacity="0.4" fill="none" />`;
    }

    let symbolMarkup = '';
    const strokeWidth = 3;
    if (config.symbolId === 'lotus-star') {
      symbolMarkup = `
        <path d="M50 14 C56 32 78 40 78 54 C78 70 64 78 50 86 C36 78 22 70 22 54 C22 40 44 32 50 14 Z" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.15" />
        <path d="M50 32 C54 44 68 50 68 60 C68 70 58 74 50 80 C42 74 32 70 32 60 C32 50 46 44 50 32 Z" stroke="url(#${gradId})" stroke-width="2" fill="${config.secondaryColor}" fill-opacity="0.25" />
        <polygon points="50,42 54,50 62,50 56,55 58,63 50,58 42,63 44,55 38,50 46,50" fill="${config.accentColor}" />
      `;
    } else if (config.symbolId === 'crown-spark') {
      symbolMarkup = `
        <path d="M20 72 L26 36 L40 50 L50 24 L60 50 L74 36 L80 72 Z" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.15" stroke-linejoin="round" />
        <line x1="20" y1="78" x2="80" y2="78" stroke="url(#${gradId})" stroke-width="3" stroke-linecap="round" />
        <circle cx="50" cy="20" r="3.5" fill="${config.accentColor}" />
        <circle cx="26" cy="32" r="3" fill="${config.secondaryColor}" />
        <circle cx="74" cy="32" r="3" fill="${config.secondaryColor}" />
      `;
    } else if (config.symbolId === 'geometric-shield') {
      symbolMarkup = `
        <path d="M50 12 L82 26 V48 C82 68 50 88 50 88 C50 88 18 68 18 48 V26 Z" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.12" />
        <path d="M50 24 L72 34 V48 C72 62 50 76 50 76 C50 76 28 62 28 48 V34 Z" stroke="${config.secondaryColor}" stroke-width="2" fill="none" />
        <circle cx="50" cy="50" r="7" fill="${config.accentColor}" />
      `;
    } else if (config.symbolId === 'infinite-loop') {
      symbolMarkup = `
        <path d="M32 50 C20 38 20 62 32 50 C44 38 56 62 68 50 C80 38 80 62 68 50 C56 38 44 62 32 50 Z" stroke="url(#${gradId})" stroke-width="5" stroke-linecap="round" fill="none" />
        <circle cx="50" cy="50" r="4" fill="${config.accentColor}" />
      `;
    } else if (config.symbolId === 'hex-crystal') {
      symbolMarkup = `
        <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.1" />
        <line x1="50" y1="14" x2="50" y2="86" stroke="url(#${gradId})" stroke-width="1.5" />
        <line x1="16" y1="32" x2="84" y2="68" stroke="url(#${gradId})" stroke-width="1.5" />
        <line x1="16" y1="68" x2="84" y2="32" stroke="url(#${gradId})" stroke-width="1.5" />
      `;
    } else if (config.symbolId === 'zen-circle') {
      symbolMarkup = `
        <path d="M50 16 A34 34 0 1 1 20 68" stroke="url(#${gradId})" stroke-width="7" stroke-linecap="round" fill="none" />
        <circle cx="50" cy="50" r="9" fill="${config.accentColor}" />
      `;
    } else if (config.symbolId === 'phoenix-flame') {
      symbolMarkup = `
        <path d="M50 14 C56 30 72 38 84 38 C74 54 62 60 50 86 C38 60 26 54 16 38 C28 38 44 30 50 14 Z" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.2" />
        <path d="M50 36 C54 48 64 54 50 72 C36 54 46 48 50 36 Z" fill="${config.secondaryColor}" />
      `;
    } else if (config.symbolId === 'diamond-luxury') {
      symbolMarkup = `
        <polygon points="30,22 70,22 88,44 50,84 12,44" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.15" />
        <line x1="12" y1="44" x2="88" y2="44" stroke="url(#${gradId})" stroke-width="1.5" />
        <line x1="30" y1="22" x2="50" y2="84" stroke="url(#${gradId})" stroke-width="1.5" />
        <line x1="70" y1="22" x2="50" y2="84" stroke="url(#${gradId})" stroke-width="1.5" />
      `;
    } else if (config.symbolId === 'spiral-galaxy') {
      symbolMarkup = `
        <path d="M50 50 C50 42 58 42 58 50 C58 60 44 60 44 50 C44 34 66 34 66 50 C66 70 36 70 36 50 C36 26 74 26 74 50 C74 80 28 80 28 50" stroke="url(#${gradId})" stroke-width="3.5" stroke-linecap="round" fill="none" />
        <circle cx="50" cy="50" r="3" fill="${config.accentColor}" />
      `;
    } else if (config.symbolId === 'leaf-eco') {
      symbolMarkup = `
        <path d="M20 80 C20 30 50 16 80 16 C80 66 50 80 20 80 Z" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="${config.primaryColor}" fill-opacity="0.2" />
        <path d="M20 80 Q 48 52 80 16" stroke="${config.secondaryColor}" stroke-width="2.5" fill="none" />
      `;
    } else if (config.symbolId === 'circuit-mind') {
      symbolMarkup = `
        <circle cx="50" cy="50" r="14" stroke="url(#${gradId})" stroke-width="${strokeWidth}" fill="none" />
        <circle cx="50" cy="50" r="6" fill="${config.accentColor}" />
        <line x1="50" y1="12" x2="50" y2="36" stroke="url(#${gradId})" stroke-width="2.5" />
        <circle cx="50" cy="12" r="3.5" fill="${config.secondaryColor}" />
        <line x1="50" y1="64" x2="50" y2="88" stroke="url(#${gradId})" stroke-width="2.5" />
        <circle cx="50" cy="88" r="3.5" fill="${config.secondaryColor}" />
        <line x1="16" y1="50" x2="36" y2="50" stroke="url(#${gradId})" stroke-width="2.5" />
        <circle cx="16" cy="50" r="3.5" fill="${config.secondaryColor}" />
        <line x1="64" y1="50" x2="84" y2="50" stroke="url(#${gradId})" stroke-width="2.5" />
        <circle cx="84" cy="50" r="3.5" fill="${config.secondaryColor}" />
      `;
    } else {
      // Monogram or fallback
      const initials = config.brandName ? config.brandName.slice(0, 2).toUpperCase() : 'IA';
      symbolMarkup = `
        <circle cx="50" cy="50" r="42" stroke="url(#${gradId})" stroke-width="2" stroke-dasharray="3 3" opacity="0.6" fill="none" />
        <text x="50" y="62" text-anchor="middle" fill="url(#${gradId})" font-family="${config.fontFamily.replace(/'/g, '')}" font-size="38" font-weight="bold">${initials}</text>
      `;
    }

    return `${badgeMarkup}\n${symbolMarkup}`;
  };

  const handleDownloadSVG = () => {
    const brand = config.uppercase ? config.brandName.toUpperCase() : config.brandName;
    const slogan = config.slogan;
    const gradId = 'svg-export-grad';
    const innerSymbol = generateSymbolSvgString(gradId);

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="1200" height="800">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${config.primaryColor}" />
      <stop offset="100%" stop-color="${config.secondaryColor}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${config.backgroundColor}" />
  <g transform="translate(300, 160)">
    <!-- Symbol -->
    <g transform="translate(-50, -50)">
      ${innerSymbol}
    </g>
  </g>
  <!-- Typography -->
  <text x="300" y="270" text-anchor="middle" font-family="${config.fontFamily.replace(/'/g, '')}" font-size="${config.fontSize}" font-weight="700" fill="${config.accentColor}" letter-spacing="${config.letterSpacing}px">
    ${brand}
  </text>
  ${
    config.showSlogan && slogan
      ? `<text x="300" y="305" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="${config.sloganSize}" font-weight="500" fill="${config.secondaryColor}" letter-spacing="1.5px">
    ${slogan}
  </text>`
      : ''
  }
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-${config.brandName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Vetor SVG nítido baixado!');
  };

  const formattedBrandName = config.uppercase ? config.brandName.toUpperCase() : config.brandName;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-violet-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-violet-400 flex items-center gap-2.5 text-sm font-semibold animate-fade-in">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Container */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                Estúdio de Design de Logotipo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Criador de Logotipo Personalizada
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Direção de arte vetorial, geometria sagrada e exportação profissional SVG + PNG.
            </p>
          </div>

          {/* AI Strategy Button */}
          <button
            type="button"
            onClick={handleAiStrategy}
            disabled={isGeneratingStrategy || !config.brandName}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:shadow-lg hover:shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingStrategy ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isGeneratingStrategy ? 'Consultando IA...' : 'Harmonizar com IA'}</span>
          </button>
        </div>

        {/* AI RATIONALE CARD */}
        {aiRationale && (
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-xl border border-violet-900/40 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-violet-950 border border-violet-800/80 flex items-center justify-center text-violet-400 flex-shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider block">
                Parecer de Webdesigner Sênior & Psicologia Visual
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{aiRationale}</p>
            </div>
          </div>
        )}

        {/* WORKSPACE GRID: Controls vs Live Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: CONTROLS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* BRAND DETAILS INPUTS */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Type className="w-4 h-4 text-violet-400" />
                <span>Identidade e Tipografia</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Nome da Marca:</label>
                  <input
                    type="text"
                    value={config.brandName}
                    onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="Ex: Inspira Arte"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Slogan / Tagline:</label>
                  <input
                    type="text"
                    value={config.slogan}
                    onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="Ex: Criatividade & Sabedoria"
                  />
                </div>
              </div>

              {/* Font Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Tipografia Principal:</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Espaçamento (Kerning): {config.letterSpacing}px</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.uppercase}
                        onChange={(e) => setConfig({ ...config, uppercase: e.target.checked })}
                        className="rounded accent-violet-500"
                      />
                      <span>CAIXA ALTA</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={config.letterSpacing}
                    onChange={(e) => setConfig({ ...config, letterSpacing: Number(e.target.value) })}
                    className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SYMBOL SELECTION */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Shapes className="w-4 h-4 text-violet-400" />
                  <span>Símbolo & Geometria Sagrada</span>
                </h3>
                <span className="text-[11px] text-slate-500">{SYMBOL_PRESETS.length} modelos vetoriais</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {SYMBOL_PRESETS.map((sym) => {
                  const isSelected = config.symbolId === sym.id;
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => setConfig({ ...config, symbolId: sym.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-violet-500 bg-violet-950/40 text-violet-200 ring-2 ring-violet-500/20 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold block truncate">{sym.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{sym.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Emblema / Moldura shape */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300 block mb-2">Moldura / Emblema Externo:</label>
                <div className="flex flex-wrap gap-2">
                  {(['none', 'circle', 'square', 'hexagon', 'shield'] as BadgeShape[]).map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setConfig({ ...config, badgeShape: shape })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                        config.badgeShape === shape
                          ? 'border-violet-500 bg-violet-950/60 text-violet-200'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {shape === 'none' ? 'Sem Moldura' : shape}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLOR PALETTE PRESETS */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-400" />
                <span>Paletas Cromáticas de Alto Impacto</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        primaryColor: pal.primary,
                        secondaryColor: pal.secondary,
                        accentColor: pal.accent,
                        backgroundColor: pal.bg,
                      })
                    }
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.secondary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.accent }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 block truncate group-hover:text-white">
                      {pal.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Fine Color Pickers */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800/80 items-center">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Primária:</span>
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Secundária:</span>
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Texto:</span>
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Fundo:</span>
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* LAYOUT CONTROLS */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layout className="w-4 h-4 text-violet-400" />
                <span>Disposição Espacial (Layout)</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, layout: 'vertical' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    config.layout === 'vertical'
                      ? 'border-violet-500 bg-violet-950/50 text-violet-200 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-4 h-4 mx-auto mb-1 rounded bg-violet-400/40" />
                  <div className="w-8 h-1.5 mx-auto rounded bg-slate-500" />
                  <span className="text-xs block mt-2">Vertical</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, layout: 'horizontal' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    config.layout === 'horizontal'
                      ? 'border-violet-500 bg-violet-950/50 text-violet-200 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-4 h-4 rounded bg-violet-400/40" />
                    <div className="w-6 h-1.5 rounded bg-slate-500" />
                  </div>
                  <span className="text-xs block mt-2">Horizontal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, layout: 'icon-only' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    config.layout === 'icon-only'
                      ? 'border-violet-500 bg-violet-950/50 text-violet-200 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-violet-400/40" />
                  <span className="text-xs block mt-2">Apenas Ícone</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE STAGE & MOCKUPS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setMockupView('dark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mockupView === 'dark' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Noturno</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMockupView('light')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mockupView === 'light' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Papel Claro</span>
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setMockupView('card')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    mockupView === 'card' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mockup Cartão de Visitas"
                >
                  <CreditCard className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setMockupView('app')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    mockupView === 'app' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mockup App Icon"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW CANVAS */}
            <div className="w-full flex justify-center">
              {mockupView === 'dark' && (
                <div
                  ref={logoPreviewRef}
                  className="w-full aspect-square rounded-2xl flex items-center justify-center p-8 transition-all duration-300 shadow-2xl relative overflow-hidden border border-slate-800"
                  style={{ backgroundColor: config.backgroundColor }}
                >
                  {/* Subtle background mesh glow */}
                  <div
                    className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: config.primaryColor }}
                  />

                  {/* Logo Composite */}
                  <div
                    className={`relative z-10 flex items-center justify-center transition-all ${
                      config.layout === 'vertical'
                        ? 'flex-col text-center gap-4'
                        : config.layout === 'horizontal'
                        ? 'flex-row text-left gap-5'
                        : 'flex-col text-center'
                    }`}
                  >
                    {renderSymbol()}

                    {config.layout !== 'icon-only' && (
                      <div className="space-y-1">
                        <h1
                          className="font-bold tracking-wider leading-none select-none transition-all"
                          style={{
                            fontFamily: config.fontFamily,
                            fontSize: `${config.fontSize}px`,
                            color: config.accentColor,
                            letterSpacing: `${config.letterSpacing}px`,
                          }}
                        >
                          {formattedBrandName}
                        </h1>

                        {config.showSlogan && config.slogan && (
                          <p
                            className="font-medium opacity-85 select-none transition-all"
                            style={{
                              fontFamily: config.sloganFontFamily,
                              fontSize: `${config.sloganSize}px`,
                              color: config.secondaryColor,
                              letterSpacing: '1px',
                            }}
                          >
                            {config.slogan}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mockupView === 'light' && (
                <div
                  className="w-full aspect-square rounded-2xl bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-8 transition-all shadow-2xl relative overflow-hidden border border-slate-300"
                >
                  <div
                    className={`relative z-10 flex items-center justify-center transition-all ${
                      config.layout === 'vertical'
                        ? 'flex-col text-center gap-4'
                        : config.layout === 'horizontal'
                        ? 'flex-row text-left gap-5'
                        : 'flex-col text-center'
                    }`}
                  >
                    {renderSymbol()}

                    {config.layout !== 'icon-only' && (
                      <div className="space-y-1">
                        <h1
                          className="font-bold tracking-wider leading-none select-none transition-all"
                          style={{
                            fontFamily: config.fontFamily,
                            fontSize: `${config.fontSize}px`,
                            color: '#0F172A',
                            letterSpacing: `${config.letterSpacing}px`,
                          }}
                        >
                          {formattedBrandName}
                        </h1>

                        {config.showSlogan && config.slogan && (
                          <p
                            className="font-medium opacity-85 select-none transition-all"
                            style={{
                              fontFamily: config.sloganFontFamily,
                              fontSize: `${config.sloganSize}px`,
                              color: '#64748B',
                              letterSpacing: '1px',
                            }}
                          >
                            {config.slogan}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mockupView === 'card' && (
                <div className="w-full aspect-square rounded-2xl bg-slate-950 p-6 flex items-center justify-center border border-slate-800">
                  {/* Business Card Simulation */}
                  <div className="w-full max-w-sm aspect-[1.75/1] rounded-xl bg-gradient-to-br from-slate-900 to-[#0A0E17] border border-slate-700 p-6 flex flex-col justify-between shadow-2xl shadow-black relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-3">
                      {renderSymbol(36)}
                      <div>
                        <span
                          className="text-sm font-bold text-slate-100 block leading-tight"
                          style={{ fontFamily: config.fontFamily }}
                        >
                          {formattedBrandName}
                        </span>
                        <span className="text-[9px] text-violet-400 font-medium">
                          {config.slogan}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-2 flex justify-between items-end">
                      <div>
                        <p className="font-semibold text-slate-200">Diretoria Executiva</p>
                        <p className="text-slate-500">contato@inspiraarte.com</p>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">PRO CARD</span>
                    </div>
                  </div>
                </div>
              )}

              {mockupView === 'app' && (
                <div className="w-full aspect-square rounded-2xl bg-slate-950 p-8 flex flex-col items-center justify-center gap-3 border border-slate-800">
                  {/* Mobile App Icon */}
                  <div
                    className="w-24 h-24 rounded-[22px] flex items-center justify-center shadow-2xl border border-white/20 transition-transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
                    }}
                  >
                    <div className="scale-75">{renderSymbol(64)}</div>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    {formattedBrandName.slice(0, 12)}
                  </span>
                  <span className="text-[10px] text-slate-500">Ícone iOS / Android</span>
                </div>
              )}
            </div>

            {/* EXPORT ACTION BUTTONS */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Baixar SVG Vetorial Nítido (.svg)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPNG(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-violet-400" />
                  <span>PNG Fundo Transparente</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPNG(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>PNG Alta Definição</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
