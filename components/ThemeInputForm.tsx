import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Sliders,
  Check,
  X,
  FileText,
  Compass,
  Smile,
  Flame,
  Laugh,
  Target,
  Heart,
  CloudRain,
  Crown,
  BookOpen,
  Palette,
  Film,
  Camera,
} from 'lucide-react';
import type { GeneratePayload, FeelingTopicCategory, QuoteToneOption } from '../types';

interface ThemeInputFormProps {
  onGenerate: (payload: GeneratePayload) => void;
  isLoading: boolean;
}

type Mode = 'theme' | 'prompt' | 'upload';

export const FEELING_TOPIC_CATEGORIES: FeelingTopicCategory[] = [
  {
    id: 'raiva',
    label: 'Raiva & Revolta',
    iconEmoji: '⚡',
    associatedTone: 'Raiva e Revolta Canalizada',
    topics: [
      'Basta: Meu Limite Foi Atingido',
      'Fúria Que Vira Combustível',
      'Não Me Peça Calma na Tempestade',
      'Quebrando as Amarras da Hipocrisia',
      'Tolerância Zero com o Desrespeito',
      'A Chama Ardente do Inconformismo',
    ],
  },
  {
    id: 'satira',
    label: 'Sátira & Ironia',
    iconEmoji: '🎭',
    associatedTone: 'Sátira e Ironia Fina',
    topics: [
      'Boletos vs Meus Sonhos de Riqueza',
      'Reunião Que Podia Ser um E-mail',
      'Expectativa vs A Realidade Cruel',
      'Fingindo Sanidade em Meio ao Caos',
      'Paciência Vendida Separadamente',
      'Ironias e Desventuras da Vida Adulta',
    ],
  },
  {
    id: 'comico',
    label: 'Cômico & Humor',
    iconEmoji: '😂',
    associatedTone: 'Cômico e Divertido',
    topics: [
      'Procrastinando com Extrema Elegância',
      'Movido a Café, Desespero e Wi-Fi',
      'Cansaço Crônico com Muito Charme',
      'Sobrevivendo Bravamente à Segunda-Feira',
      'Rindo do Meu Próprio Desastre Diário',
      'Plena e Serena Enquanto a Casa Cai',
    ],
  },
  {
    id: 'direto',
    label: 'Direto & Sem Filtro',
    iconEmoji: '🎯',
    associatedTone: 'Direto e Sem Rodeios',
    topics: [
      'Ninguém Está Vindo Te Salvar',
      'O Tempo Não Espera Seu Medo Passar',
      'Menos Desculpas e Mais Atitude Prática',
      'Verdades Que Ninguém Tem Coragem de Dizer',
      'Foque Exclusivamente no Que Você Controla',
      'Crescer Dói, mas Ficar Parado Dói Mais',
    ],
  },
  {
    id: 'amoroso',
    label: 'Amor & Afeto',
    iconEmoji: '❤️',
    associatedTone: 'Amoroso e Apaixonado',
    topics: [
      'O Teu Abraço é Meu Porto Seguro',
      'Amor Que Transborda em Cada Detalhe',
      'Cumplicidade Silenciosa e Verdadeira',
      'Amor Próprio: Minha Primeira Casa',
      'A Doçura Inesperada dos Nossos Dias',
      'Conexão Rara de Almas Que se Reconhecem',
    ],
  },
  {
    id: 'melancolico',
    label: 'Melancolia & Saudade',
    iconEmoji: '🌊',
    associatedTone: 'Melancólico e Saudade',
    topics: [
      'A Poesia do Silêncio da Madrugada',
      'Saudade Doce do Que Já Não Volta',
      'Cicatrizes Que Contam Minha História',
      'O Fim Bonito e Necessário de um Ciclo',
      'Caminhando Sob a Chuva Meditativa',
      'O Peso Poético das Lembranças Boas',
    ],
  },
  {
    id: 'empoderado',
    label: 'Empoderado & Poder',
    iconEmoji: '👑',
    associatedTone: 'Empoderado e Conquista',
    topics: [
      'Eu Não Peço Espaço, Eu Ocupo Meu Lugar',
      'Autoestima Blindada Contra Opiniões',
      'Construindo Meu Império Passo a Passo',
      'Dona Absoluta do Meu Próprio Destino',
      'O Brilho Próprio Que Incomoda as Sombras',
      'Independência e Orgulho da Minha Jornada',
    ],
  },
  {
    id: 'filosofico',
    label: 'Estoico & Filosofia',
    iconEmoji: '🏛️',
    associatedTone: 'Filosófico e Estoico',
    topics: [
      'Ajustando as Velas Contra o Vento',
      'A Sabedoria Silenciosa do Tempo',
      'A Quietude Interior é a Maior Força',
      'Desapego do Que Foge ao Nosso Alcance',
      'Amor Fati: Amar Tudo Que Acontece',
      'A Razão Serenando as Emoções',
    ],
  },
  {
    id: 'inspirador',
    label: 'Superação & Luz',
    iconEmoji: '✨',
    associatedTone: 'Inspirador e Encorajador',
    topics: [
      'Resiliência Inabalável Diante da Dor',
      'Renascendo das Cinzas com Mais Força',
      'Amanhecer de Novas e Grandiosas Oportunidades',
      'Gratidão Profunda Pelo Caminho Percorrido',
      'Foco Absoluto na Vitória Inevitável',
      'A Força Oculta dos Novos Recomeços',
    ],
  },
];

export const QUOTE_TONES: QuoteToneOption[] = [
  {
    id: 'Raiva e Revolta Canalizada',
    name: 'Raiva / Fúria',
    category: 'raiva',
    iconEmoji: '⚡',
    desc: 'Visceral, inconformismo, basta e fogo rebelde',
    badgeColor: 'border-red-500/60 text-red-300 bg-red-950/40 hover:border-red-400',
  },
  {
    id: 'Sátira e Ironia Fina',
    name: 'Sátira / Sarcasmo',
    category: 'satira',
    iconEmoji: '🎭',
    desc: 'Humor ácido, deboche inteligente e crítica sagaz',
    badgeColor: 'border-amber-500/60 text-amber-300 bg-amber-950/40 hover:border-amber-400',
  },
  {
    id: 'Cômico e Divertido',
    name: 'Cômico / Engraçado',
    category: 'comico',
    iconEmoji: '😂',
    desc: 'Leve, divertido, rindo do caos do cotidiano',
    badgeColor: 'border-yellow-500/60 text-yellow-300 bg-yellow-950/40 hover:border-yellow-400',
  },
  {
    id: 'Direto e Sem Rodeios',
    name: 'Direto / Tapa na Cara',
    category: 'direto',
    iconEmoji: '🎯',
    desc: 'Verdade nua e crua, sem filtro e foco em ação',
    badgeColor: 'border-orange-500/60 text-orange-300 bg-orange-950/40 hover:border-orange-400',
  },
  {
    id: 'Amoroso e Apaixonado',
    name: 'Amoroso / Afeto',
    category: 'amoroso',
    iconEmoji: '❤️',
    desc: 'Ternura profunda, carinho, aconchego e romance',
    badgeColor: 'border-pink-500/60 text-pink-300 bg-pink-950/40 hover:border-pink-400',
  },
  {
    id: 'Melancólico e Saudade',
    name: 'Melancólico / Saudade',
    category: 'melancolico',
    iconEmoji: '🌊',
    desc: 'Nostalgia poética, reflexão sobre ausências e ciclos',
    badgeColor: 'border-blue-500/60 text-blue-300 bg-blue-950/40 hover:border-blue-400',
  },
  {
    id: 'Empoderado e Conquista',
    name: 'Empoderado / Poder',
    category: 'empoderado',
    iconEmoji: '👑',
    desc: 'Autoestima blindada, orgulho próprio e autonomia',
    badgeColor: 'border-purple-500/60 text-purple-300 bg-purple-950/40 hover:border-purple-400',
  },
  {
    id: 'Filosófico e Estoico',
    name: 'Estoico / Sabedoria',
    category: 'filosofico',
    iconEmoji: '🏛️',
    desc: 'Calma serena perante o caos, autodomínio e clareza',
    badgeColor: 'border-emerald-500/60 text-emerald-300 bg-emerald-950/40 hover:border-emerald-400',
  },
  {
    id: 'Inspirador e Encorajador',
    name: 'Inspirador / Luz',
    category: 'inspirador',
    iconEmoji: '✨',
    desc: 'Superação, esperança e motivação confortadora',
    badgeColor: 'border-violet-500/60 text-violet-300 bg-violet-950/40 hover:border-violet-400',
  },
];

interface AspectRatioOption {
  id: string;
  label: string;
  ratio: string;
  description: string;
  boxClass: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: '1:1',
    label: 'Quadrado (1:1)',
    ratio: '1:1',
    description: 'Instagram Feed, LinkedIn, Avatar',
    boxClass: 'w-4 h-4 rounded-sm border-2',
  },
  {
    id: '9:16',
    label: 'Vertical (9:16)',
    ratio: '9:16',
    description: 'Stories, Reels, TikTok, Shorts',
    boxClass: 'w-3 h-5 rounded-sm border-2',
  },
  {
    id: '16:9',
    label: 'Paisagem (16:9)',
    ratio: '16:9',
    description: 'Posters, YouTube, Wallpaper',
    boxClass: 'w-5 h-3 rounded-sm border-2',
  },
  {
    id: '3:4',
    label: 'Retrato (3:4)',
    ratio: '3:4',
    description: 'Feed Retrato, Pinterest, Cartão',
    boxClass: 'w-3.5 h-4.5 rounded-sm border-2',
  },
];

export interface ArtisticFilterOption {
  id: string;
  name: string;
  tag: string;
  iconEmoji: string;
  desc: string;
  promptDirective: string;
}

export const ARTISTIC_FILTERS: ArtisticFilterOption[] = [
  {
    id: 'Cinematic',
    name: 'Cinemático',
    tag: 'Cinematic',
    iconEmoji: '🎬',
    desc: 'Luz volumétrica, lente 35mm e atmosfera épica',
    promptDirective: 'Cinematic movie still, 35mm anamorphic lens, dramatic volumetric lighting, shallow depth of field, high contrast blockbuster cinematography, atmospheric haze, masterpiece',
  },
  {
    id: 'PB',
    name: 'Preto & Branco (P&B)',
    tag: 'P&B',
    iconEmoji: '🖤',
    desc: 'Monocromático dramático, alto contraste e chiaroscuro',
    promptDirective: 'Fine art black and white photography, monochrome aesthetic, striking chiaroscuro lighting, deep velvety blacks, pure luminous silvery whites, high contrast, timeless elegant mood, no color',
  },
  {
    id: 'Vintage',
    name: 'Vintage & Retrô',
    tag: 'Vintage',
    iconEmoji: '📻',
    desc: 'Cores quentes anos 70, filme analógico e granulação suave',
    promptDirective: 'Vintage 1970s analog photography, authentic Kodachrome film stock, warm golden tones, gentle film grain, nostalgic sun-bleached hues, retro aesthetics, vintage lens softness',
  },
  {
    id: 'Cyberpunk',
    name: 'Cyberpunk & Néon',
    tag: 'Cyberpunk',
    iconEmoji: '⚡',
    desc: 'Luzes ultravioleta, néon brilhante e clima futurista',
    promptDirective: 'Cyberpunk futuristic visual style, brilliant neon magenta and electric cyan illumination, rain-slicked reflective surfaces, dark synthwave noir atmosphere, high-tech glow',
  },
  {
    id: 'Fotografia 8K',
    name: 'Fotografia Realista',
    tag: 'Fotografia',
    iconEmoji: '📸',
    desc: 'Realismo hiperdetalhado, luz natural e nitidez de estúdio',
    promptDirective: 'Hyper-realistic 8k studio photography, crisp natural daylight, micro-textures, authentic depth of field, professional Hasselblad camera capture',
  },
  {
    id: 'Aquarela',
    name: 'Aquarela & Pintura',
    tag: 'Aquarela',
    iconEmoji: '🎨',
    desc: 'Pinceladas poéticas, textura de tela e arte fluida',
    promptDirective: 'Expressive watercolor and oil painting on textured canvas, fluid poetic brush strokes, delicate pigment dispersion, artisanal fine art illustration',
  },
  {
    id: 'Minimalista',
    name: 'Minimalista & Zen',
    tag: 'Minimalista',
    iconEmoji: '⚪',
    desc: 'Espaço negativo, traços essenciais e sobriedade',
    promptDirective: 'Minimalist fine art aesthetic, abundant negative space, clean geometric composition, tranquil muted neutral palette, zen architectural simplicity',
  },
  {
    id: '3D Render',
    name: 'Render 3D Octane',
    tag: '3D Render',
    iconEmoji: '💎',
    desc: 'Profundidade tridimensional, raytracing e materiais nobres',
    promptDirective: 'Hyper-detailed 3D Octane render, raytraced reflections, smooth subsurface scattering, premium glossy textures, volumetric studio illumination, modern CGI',
  },
];

export const ARTISTIC_STYLES = ARTISTIC_FILTERS;

export const ThemeInputForm: React.FC<ThemeInputFormProps> = ({ onGenerate, isLoading }) => {
  const [mode, setMode] = useState<Mode>('theme');
  const [theme, setTheme] = useState('Coragem e Superação');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [selectedFilter, setSelectedFilter] = useState<string>('Cinematic');
  const [selectedTone, setSelectedTone] = useState<string>('Inspirador e Encorajador');
  const [selectedFeelingCategory, setSelectedFeelingCategory] = useState<string>('todos');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFilterObj =
    ARTISTIC_FILTERS.find((f) => f.id === selectedFilter) || ARTISTIC_FILTERS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const fullStyleDirective = `${currentFilterObj.name} (${currentFilterObj.promptDirective})`;

    if (mode === 'theme') {
      if (!theme.trim()) return;
      onGenerate({
        mode: 'theme',
        value: theme.trim(),
        aspectRatio: selectedRatio,
        style: fullStyleDirective,
        tone: selectedTone,
      });
    } else if (mode === 'prompt') {
      if (!prompt.trim()) return;
      onGenerate({
        mode: 'prompt',
        value: prompt.trim(),
        aspectRatio: selectedRatio,
        style: fullStyleDirective,
        tone: selectedTone,
      });
    } else if (mode === 'upload') {
      if (!file) return;
      onGenerate({
        mode: 'upload',
        value: file,
        aspectRatio: selectedRatio,
        style: fullStyleDirective,
        tone: selectedTone,
      });
    }
  };

  const handleSelectTopic = (topic: string, associatedTone: string) => {
    setTheme(topic);
    setSelectedTone(associatedTone);
  };

  const handleRandomTheme = () => {
    const randomCategory = FEELING_TOPIC_CATEGORIES[Math.floor(Math.random() * FEELING_TOPIC_CATEGORIES.length)];
    const randomTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];
    setTheme(randomTopic);
    setSelectedTone(randomCategory.associatedTone);
    setSelectedFeelingCategory(randomCategory.id);
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > 8 * 1024 * 1024) {
      setFileError('O arquivo excede o limite de 8MB.');
      setFile(null);
      setFilePreview(null);
      return;
    }
    setFileError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleEnhancePrompt = async () => {
    const textToEnhance = mode === 'theme' ? theme : prompt;
    if (!textToEnhance.trim()) return;

    const fullStyleDirective = `${currentFilterObj.name} (${currentFilterObj.promptDirective})`;

    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: textToEnhance,
          style: fullStyleDirective,
          mood: selectedTone,
        }),
      });
      const data = await res.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        setMode('prompt');
      }
    } catch (err) {
      console.error('Enhance prompt error:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (mode === 'theme' && !theme.trim()) return true;
    if (mode === 'prompt' && !prompt.trim()) return true;
    if (mode === 'upload' && !file) return true;
    return false;
  };

  // Filter topics based on active category
  const displayedCategories =
    selectedFeelingCategory === 'todos'
      ? FEELING_TOPIC_CATEGORIES
      : FEELING_TOPIC_CATEGORIES.filter((c) => c.id === selectedFeelingCategory);

  // Active tone info
  const currentToneObj = QUOTE_TONES.find((t) => t.id === selectedTone) || QUOTE_TONES[QUOTE_TONES.length - 1];

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl shadow-purple-950/20">
      {/* Decorative ambient gradient corner */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-bl from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center p-1.5 bg-slate-950/80 rounded-xl border border-slate-800 mb-6 gap-1 max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setMode('theme')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === 'theme'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Tema Guiado</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('prompt')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === 'prompt'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Superprompt</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('upload')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Sua Imagem</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MODE: THEME */}
        {mode === 'theme' && (
          <div className="space-y-5">
            {/* Header with Random button */}
            <div className="flex items-center justify-between">
              <label htmlFor="theme-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-violet-400" />
                <span>Tema ou Ideia Central:</span>
              </label>
              <button
                type="button"
                onClick={handleRandomTheme}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium py-1 px-2.5 rounded-md hover:bg-violet-950/40 transition-colors"
                title="Sortear um sentimento e tema aleatório"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sortear Sentimento & Tema</span>
              </button>
            </div>

            {/* Input with active sentiment pill inside */}
            <div className="relative">
              <input
                id="theme-input"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Basta: Meu limite foi atingido, Boletos vs Sonhos, Porto seguro no seu abraço..."
                className="w-full pl-4 pr-32 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-100 placeholder-slate-500 text-sm sm:text-base shadow-inner transition-all outline-none"
                disabled={isLoading}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold">
                <span>{currentToneObj.iconEmoji}</span>
                <span className="text-slate-300 truncate max-w-[90px]">{currentToneObj.name}</span>
              </div>
            </div>

            {/* FEELING TOPIC CATEGORY SELECTOR TABS */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explorar Tópicos por Sentimento:</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Clique para carregar o tema e ajustar o tom
                </span>
              </div>

              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedFeelingCategory('todos')}
                  className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                    selectedFeelingCategory === 'todos'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>✨</span>
                  <span>Todos os Sentimentos</span>
                </button>

                {FEELING_TOPIC_CATEGORIES.map((cat) => {
                  const isSelected = selectedFeelingCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedFeelingCategory(cat.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-800 border-violet-400 text-violet-200 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{cat.iconEmoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Topics Grid for Active Category */}
              <div className="space-y-3 bg-slate-950/40 p-3 sm:p-4 rounded-xl border border-slate-800/80">
                {displayedCategories.map((cat) => (
                  <div key={cat.id} className="space-y-1.5">
                    {selectedFeelingCategory === 'todos' && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-1">
                        <span>{cat.iconEmoji}</span>
                        <span>{cat.label}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {cat.topics.map((t) => {
                        const isSelected = theme === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleSelectTopic(t, cat.associatedTone)}
                            className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all duration-150 flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-violet-600/30 border-violet-500 text-violet-200 font-semibold shadow-sm'
                                : 'bg-slate-900/70 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <span>{cat.iconEmoji}</span>
                            <span>{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE: FREE PROMPT */}
        {mode === 'prompt' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-violet-400" />
                <span>Descrição Visual Detalhada (Superprompt):</span>
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancingPrompt || !prompt.trim()}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-2.5 rounded-md hover:bg-amber-950/30 transition-colors disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEnhancingPrompt ? 'Aprimorando...' : 'Expandir com IA'}</span>
              </button>
            </div>

            <textarea
              id="prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o cenário, iluminação, cores e atmosfera que deseja criar..."
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-100 placeholder-slate-500 text-sm shadow-inner transition-all outline-none resize-y"
              disabled={isLoading}
            />
          </div>
        )}

        {/* MODE: UPLOAD */}
        {mode === 'upload' && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-violet-400" />
              <span>Sua Imagem Base (Geramos uma frase no sentimento escolhido):</span>
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-violet-500 bg-violet-950/20'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
                className="hidden"
              />

              {filePreview ? (
                <div className="relative group">
                  <img
                    src={filePreview}
                    alt="Prévia"
                    className="max-h-40 rounded-lg shadow-md border border-slate-700 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Imagem pronta: {file?.name}
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Arraste e solte sua foto aqui ou <span className="text-violet-400 underline">clique para procurar</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP até 8MB</p>
                  </div>
                </>
              )}
            </div>

            {fileError && <p className="text-xs text-rose-400 font-medium">{fileError}</p>}
          </div>
        )}

        {/* CONTROLS: Format, Style & Feelings */}
        <div className="pt-3 border-t border-slate-800/80 space-y-5">
          {/* 1. ASPECT RATIO SELECTOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Formato da Imagem:
              </label>
              <span className="text-[11px] text-slate-400">
                Proporção selecionada: {selectedRatio}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((opt) => {
                const isSelected = selectedRatio === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRatio(opt.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500/80 text-violet-200 shadow-sm ring-1 ring-violet-500/50'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div
                      className={`${opt.boxClass} flex-shrink-0 ${
                        isSelected ? 'border-violet-400 bg-violet-400/20' : 'border-slate-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{opt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ARTISTIC FILTER SELECTOR */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-violet-400" />
                <span>Filtro Artístico & Estilo Visual da Imagem:</span>
              </label>
              <span className="text-[11px] font-semibold text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-800/50">
                {currentFilterObj.iconEmoji} {currentFilterObj.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ARTISTIC_FILTERS.map((f) => {
                const isSelected = selectedFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative group flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-950/50 text-white shadow-md shadow-violet-950/40 ring-1 ring-violet-500'
                        : 'border-slate-800/90 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base">{f.iconEmoji}</span>
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      ) : (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {f.tag}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight text-slate-200">
                        {f.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {f.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visual prompt directive info badge */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2 text-slate-400">
              <Film className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-semibold text-slate-300">Diretriz no Superprompt de Imagem: </span>
                <span className="text-violet-300/90 italic font-mono text-[10px]">
                  "{currentFilterObj.promptDirective}"
                </span>
              </div>
            </div>
          </div>

          {/* 3. TONAL / FEELING SELECTOR CARDS */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-pink-400" />
                <span>Sentimento & Tom da Frase:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Defina como a mensagem deve soar
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUOTE_TONES.map((t) => {
                const isSelected = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative group flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-950/40 text-white shadow-md shadow-violet-950/30 ring-1 ring-violet-500'
                        : 'border-slate-800/90 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base">{t.iconEmoji}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{t.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitDisabled()}
            className="w-full relative group overflow-hidden rounded-xl font-bold text-white text-base sm:text-lg py-4 px-6 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:shadow-violet-600/25"
          >
            <span className="relative z-10 flex items-center justify-center gap-2.5 tracking-wide">
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>
                    Criando Obra ({currentFilterObj.name}) & Frase ({currentToneObj.name})...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>
                    Gerar Arte ({currentFilterObj.iconEmoji} {currentFilterObj.name} • {currentToneObj.iconEmoji} {currentToneObj.name})
                  </span>
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
