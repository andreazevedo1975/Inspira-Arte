import type { ArtisticFilterId, ArtisticFilterOption } from '../types';

export interface ArtisticFilterDefinition extends ArtisticFilterOption {
  filterCssTemplate: (ratio: number) => string;
  overlayGradient?: string;
  vignette?: boolean;
}

export const ARTISTIC_FILTERS: ArtisticFilterDefinition[] = [
  {
    id: 'none',
    label: 'Original (Sem Filtro)',
    shortLabel: 'Original',
    category: 'Clássico',
    description: 'Cores e iluminação puras e naturais da geração de IA sem pós-processamento.',
    previewHue: '#64748b',
    filterCssTemplate: () => 'none',
  },
  {
    id: 'sepia',
    label: 'Sépia Vintage',
    shortLabel: 'Sépia',
    category: 'Clássico',
    description: 'Tons acolhedores de sépia e âmbar nostálgico, evocando fotografias históricas e retratos de época.',
    previewHue: '#b45309',
    overlayGradient: 'rgba(180, 120, 50, 0.08)',
    filterCssTemplate: (ratio) => {
      const s = (0.85 * ratio).toFixed(2);
      const c = (1 + 0.1 * ratio).toFixed(2);
      const b = (1 - 0.04 * ratio).toFixed(2);
      const sat = (1 + 0.18 * ratio).toFixed(2);
      return `sepia(${s}) contrast(${c}) brightness(${b}) saturate(${sat})`;
    },
  },
  {
    id: 'bw',
    label: 'Black & White (P&B Clássico)',
    shortLabel: 'Black & White',
    category: 'Clássico',
    description: 'Monocromático atemporal com alto contraste e gradiente tonal rico, realçando texturas e formas.',
    previewHue: '#334155',
    filterCssTemplate: (ratio) => {
      const g = (1 * ratio).toFixed(2);
      const c = (1 + 0.3 * ratio).toFixed(2);
      const b = (1 + 0.02 * ratio).toFixed(2);
      return `grayscale(${g}) contrast(${c}) brightness(${b})`;
    },
  },
  {
    id: 'vintage',
    label: 'Vintage Film (35mm Analógico)',
    shortLabel: 'Vintage Film',
    category: 'Cinema & Retrô',
    description: 'Estética de filme analógico 35mm com saturação controlada, realces suaves e vinheta sutil.',
    previewHue: '#d97706',
    vignette: true,
    overlayGradient: 'radial-gradient(circle at center, transparent 40%, rgba(30, 20, 10, 0.35) 100%)',
    filterCssTemplate: (ratio) => {
      const s = (0.35 * ratio).toFixed(2);
      const c = (1 + 0.16 * ratio).toFixed(2);
      const b = (1 - 0.04 * ratio).toFixed(2);
      const sat = (1 - 0.2 * ratio).toFixed(2);
      const h = (-8 * ratio).toFixed(1);
      return `sepia(${s}) contrast(${c}) brightness(${b}) saturate(${sat}) hue-rotate(${h}deg)`;
    },
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Neon',
    shortLabel: 'Cyberpunk',
    category: 'Futurista & Neon',
    description: 'Visual futurista neon com alto contraste, sombras ciano profundo e realces magenta luminosos.',
    previewHue: '#ec4899',
    overlayGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
    filterCssTemplate: (ratio) => {
      const c = (1 + 0.36 * ratio).toFixed(2);
      const sat = (1 + 0.7 * ratio).toFixed(2);
      const h = (185 * ratio).toFixed(1);
      const b = (1 + 0.04 * ratio).toFixed(2);
      return `contrast(${c}) saturate(${sat}) hue-rotate(${h}deg) brightness(${b})`;
    },
  },
  {
    id: 'cinematic',
    label: 'Cinema Teal & Orange',
    shortLabel: 'Cinema',
    category: 'Cinema & Retrô',
    description: 'Color grading de cinema hollywoodiano: harmonia clássica entre tons ciano e âmbar quente.',
    previewHue: '#0284c7',
    filterCssTemplate: (ratio) => {
      const c = (1 + 0.24 * ratio).toFixed(2);
      const sat = (1 + 0.34 * ratio).toFixed(2);
      const h = (-15 * ratio).toFixed(1);
      const b = (1 - 0.02 * ratio).toFixed(2);
      return `contrast(${c}) saturate(${sat}) hue-rotate(${h}deg) brightness(${b})`;
    },
  },
  {
    id: 'golden_hour',
    label: 'Golden Hour (Luz Dourada)',
    shortLabel: 'Golden Hour',
    category: 'Luz & Atmosfera',
    description: 'Luz dourada do pôr do sol, conferindo calor, aconchego e atmosfera serena à cena.',
    previewHue: '#f59e0b',
    overlayGradient: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.04) 100%)',
    filterCssTemplate: (ratio) => {
      const s = (0.26 * ratio).toFixed(2);
      const sat = (1 + 0.44 * ratio).toFixed(2);
      const b = (1 + 0.06 * ratio).toFixed(2);
      const c = (1 + 0.08 * ratio).toFixed(2);
      const h = (-6 * ratio).toFixed(1);
      return `sepia(${s}) saturate(${sat}) brightness(${b}) contrast(${c}) hue-rotate(${h}deg)`;
    },
  },
  {
    id: 'noir',
    label: 'Noir Dramático',
    shortLabel: 'Noir Dramático',
    category: 'Cinema & Retrô',
    description: 'Preto e branco misterioso com sombras profundas cortantes e alto impacto emocional.',
    previewHue: '#0f172a',
    vignette: true,
    overlayGradient: 'radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.5) 100%)',
    filterCssTemplate: (ratio) => {
      const g = (1 * ratio).toFixed(2);
      const c = (1 + 0.65 * ratio).toFixed(2);
      const b = (1 - 0.12 * ratio).toFixed(2);
      return `grayscale(${g}) contrast(${c}) brightness(${b})`;
    },
  },
  {
    id: 'dreamy_pastel',
    label: 'Pastel dos Sonhos (Soft Bloom)',
    shortLabel: 'Pastel',
    category: 'Luz & Atmosfera',
    description: 'Brilho suave difuso com contraste atenuado e tonalidade aveludada etérea.',
    previewHue: '#f472b6',
    overlayGradient: 'rgba(244, 114, 182, 0.06)',
    filterCssTemplate: (ratio) => {
      const b = (1 + 0.08 * ratio).toFixed(2);
      const c = (1 - 0.08 * ratio).toFixed(2);
      const sat = (1 - 0.12 * ratio).toFixed(2);
      const s = (0.12 * ratio).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${sat}) sepia(${s})`;
    },
  },
  {
    id: 'vaporwave',
    label: 'Vaporwave 80s (Synthwave)',
    shortLabel: 'Vaporwave',
    category: 'Futurista & Neon',
    description: 'Explosão de cores retrô com toques de magenta, lilás elétrico e estética anos 80.',
    previewHue: '#8b5cf6',
    overlayGradient: 'linear-gradient(45deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
    filterCssTemplate: (ratio) => {
      const c = (1 + 0.26 * ratio).toFixed(2);
      const sat = (1 + 0.62 * ratio).toFixed(2);
      const h = (295 * ratio).toFixed(1);
      const b = (1 + 0.04 * ratio).toFixed(2);
      return `contrast(${c}) saturate(${sat}) hue-rotate(${h}deg) brightness(${b})`;
    },
  },
];

export function getArtisticFilterCss(
  filterId: ArtisticFilterId | string,
  intensityPercent: number = 100
): string {
  if (filterId === 'none' || intensityPercent <= 0) return 'none';
  const def = ARTISTIC_FILTERS.find((f) => f.id === filterId);
  if (!def) return 'none';
  const ratio = Math.max(0, Math.min(100, intensityPercent)) / 100;
  return def.filterCssTemplate(ratio);
}

export function getArtisticFilterById(filterId: ArtisticFilterId | string): ArtisticFilterDefinition {
  return ARTISTIC_FILTERS.find((f) => f.id === filterId) || ARTISTIC_FILTERS[0];
}

/**
 * High-resolution canvas renderer that burns the artistic filter directly into image pixels
 * for pristine offline download without any CSS dependencies.
 */
export async function renderFilteredImageToDataUrl(
  imageUrl: string,
  filterId: ArtisticFilterId | string,
  intensityPercent: number = 100
): Promise<string> {
  const def = getArtisticFilterById(filterId);

  // If no filter, return original
  if (def.id === 'none' || intensityPercent <= 0) {
    return imageUrl;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Falha ao carregar imagem para aplicar filtro'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 1024;
  canvas.height = img.naturalHeight || 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter contexto 2D do Canvas');

  const filterCss = getArtisticFilterCss(def.id, intensityPercent);
  ctx.filter = filterCss;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // If vignette is part of filter
  if (def.vignette) {
    const ratio = intensityPercent / 100;
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.72;
    const minRadius = Math.min(canvas.width, canvas.height) * 0.35;
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      minRadius,
      canvas.width / 2,
      canvas.height / 2,
      maxRadius
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${0.45 * ratio})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // If color gradient overlay is present
  if (def.overlayGradient && def.id === 'sepia') {
    ctx.fillStyle = `rgba(180, 120, 50, ${0.08 * (intensityPercent / 100)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/png');
}
