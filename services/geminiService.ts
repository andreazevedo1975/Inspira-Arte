import type { VisualIdentityPayload } from '../types';

export const generateImagePromptFromTheme = async (
  theme: string,
  style?: string,
  mood?: string
): Promise<string> => {
  try {
    const res = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, style, mood }),
    });

    if (!res.ok) {
      throw new Error(`Falha ao gerar prompt: ${res.statusText}`);
    }

    const data = await res.json();
    return data.prompt || `Masterpiece representing ${theme}, ${style || 'cinematic'}, volumetric lighting, 8k`;
  } catch (error) {
    console.error('generateImagePromptFromTheme error:', error);
    return `Artistic visual representing ${theme}, beautiful illumination, inspirational atmosphere, high resolution`;
  }
};

export const generateQuoteFromImage = async (
  base64Image?: string,
  mimeType?: string,
  theme?: string,
  tone?: string
): Promise<string> => {
  try {
    let resolvedImage = base64Image;

    // Convert blob: url to base64 if needed
    if (resolvedImage && resolvedImage.startsWith('blob:')) {
      try {
        const resp = await fetch(resolvedImage);
        const blob = await resp.blob();
        resolvedImage = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (convErr) {
        console.warn('Could not convert blob URL to base64:', convErr);
      }
    }

    const res = await fetch('/api/generate-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Image: resolvedImage,
        mimeType: mimeType || 'image/png',
        theme,
        tone: tone || 'Inspirador e Encorajador',
      }),
    });

    if (!res.ok) {
      throw new Error(`Falha ao gerar frase: ${res.statusText}`);
    }

    const data = await res.json();
    return data.quote || 'Acredite no potencial infinito dos seus sonhos e transforme cada obstáculo em degrau.';
  } catch (error) {
    console.error('generateQuoteFromImage error:', error);
    return 'Acredite no potencial infinito dos seus sonhos e transforme cada obstáculo em degrau.';
  }
};

export const generateImage = async (
  prompt: string,
  aspectRatio: string = '1:1',
  themeHint: string = ''
): Promise<string> => {
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, themeHint }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.imageBase64) {
        return data.imageBase64;
      }
      if (data.imageUrl && data.imageUrl.startsWith('data:')) {
        return data.imageUrl.replace(/^data:[^;]+;base64,/, '');
      }
      if (data.imageUrl && data.imageUrl.startsWith('http')) {
        try {
          const imgResp = await fetch(data.imageUrl);
          const blob = await imgResp.blob();
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const b64 = ((reader.result as string) || '').replace(/^data:[^;]+;base64,/, '');
              resolve(b64);
            };
            reader.readAsDataURL(blob);
          });
        } catch {
          // ignore
        }
      }
    }
  } catch (error) {
    console.warn('generateImage fetch notice:', error);
  }

  // Zero-failure procedural SVG base64
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <radialGradient id="g" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stop-color="#8B5CF6"/>
        <stop offset="50%" stop-color="#EC4899"/>
        <stop offset="100%" stop-color="#080B11"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="512" cy="380" r="140" fill="#F59E0B" opacity="0.8"/>
    <circle cx="512" cy="380" r="80" fill="#FFFFFF" opacity="0.95"/>
    <path d="M0 700 L280 540 L512 660 L760 500 L1024 660 L1024 1024 L0 1024 Z" fill="#080B11" opacity="0.95"/>
  </svg>`;
  return btoa(unescape(encodeURIComponent(fallbackSvg)));
};

export const generateImageVariations = async (
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<string[]> => {
  try {
    const res = await fetch('/api/generate-variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    if (!res.ok) {
      throw new Error(`Erro de variações: ${res.statusText}`);
    }

    const data = await res.json();
    return data.variations || [];
  } catch (error) {
    console.error('generateImageVariations error:', error);
    return [];
  }
};

export const generateVisualIdentity = async (
  base64Image: string,
  mimeType: string,
  description: string
): Promise<VisualIdentityPayload & { mascotImageUrl: string }> => {
  try {
    const res = await fetch('/api/generate-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, mimeType, description }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.warn('generateVisualIdentity network notice:', error);
  }

  // Graceful fallback brand kit
  return {
    brandName: 'Aura Criativa',
    slogan: 'Inovação que inspira e transforma.',
    story: 'Uma marca contemporânea criada para conectar propósitos e despertar o melhor potencial de sua comunidade.',
    colorPalette: {
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#F59E0B',
      background: '#0F172A',
    },
    mascotPrompt: 'A friendly charming mascot, vibrant 3D character',
    mascotImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  };
};

export const generateLogoStrategy = async (
  brandName: string,
  slogan: string,
  industry: string,
  style: string
): Promise<any> => {
  try {
    const res = await fetch('/api/generate-logo-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName, slogan, industry, style }),
    });

    if (!res.ok) {
      throw new Error(`Erro ao gerar estratégia de logotipo: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('generateLogoStrategy error:', error);
    return {
      conceptName: `Marca ${brandName}`,
      designRationale: 'Conceito visual estruturado com geometria de alta pregnância e contraste marcante para garantir legibilidade e memorabilidade imediata.',
      suggestedColors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        accent: '#F59E0B',
        background: '#080B11',
      },
      symbolId: 'lotus-star',
      fontFamily: "'Playfair Display', serif",
      layout: 'vertical',
    };
  }
};

export const generateComplementaryPalette = async (
  mode: 'theme' | 'image',
  value: string,
  base64Image?: string,
  mimeType?: string,
  harmonyType: string = 'complementary'
): Promise<any> => {
  try {
    const res = await fetch('/api/generate-complementary-palette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, value, base64Image, mimeType, harmonyType }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('generateComplementaryPalette network notice:', error);
  }

  // Guaranteed fallback palette
  return {
    title: `Paleta Complementar - ${value || 'Harmonia'}`,
    harmonyType,
    source: mode,
    sourceValue: value || 'Design Inspirador',
    description: 'Paleta cromática desenvolvida através dos princípios da roda de cores e contraste perceptual.',
    colors: [
      { hex: '#8B5CF6', name: 'Violeta Cósmico', role: 'Dominante / Base', rgb: 'rgb(139, 92, 246)', hsl: 'hsl(258, 90%, 66%)', isLight: false },
      { hex: '#10B981', name: 'Esmeralda Vibrante', role: 'Complementar Direta', rgb: 'rgb(16, 185, 129)', hsl: 'hsl(161, 84%, 39%)', isLight: false },
      { hex: '#F59E0B', name: 'Âmbar Dourado', role: 'Acento Dinâmico', rgb: 'rgb(245, 158, 11)', hsl: 'hsl(38, 92%, 50%)', isLight: true },
      { hex: '#EDE9FE', name: 'Luz de Lavanda', role: 'Superfície / Destaque', rgb: 'rgb(237, 233, 254)', hsl: 'hsl(250, 78%, 96%)', isLight: true },
      { hex: '#090D16', name: 'Obsidiana Noturna', role: 'Profundidade / Fundo', rgb: 'rgb(9, 13, 22)', hsl: 'hsl(222, 42%, 6%)', isLight: false },
    ],
  };
};

