import React, { useState, useEffect, useRef } from 'react';
import type { CharacterProfile, CharacterSceneConfig, CharacterSceneResult, TextLegibilityMode, ArtisticFilterId } from '../types';
import {
  loadSavedCharacters,
  saveCharacter,
  deleteCharacter,
  loadCharacterScenes,
  saveCharacterScene,
  deleteCharacterScene,
  createCharacterScene,
  SCENARIO_PRESETS,
  MOOD_PRESETS,
  EXPRESSION_PRESETS,
  CLOTHING_PRESETS,
  CAMERA_PRESETS,
} from '../services/characterService';
import { getArtisticFilterCss, getArtisticFilterById } from '../services/filterService';
import { CharacterCreatorModal } from './CharacterCreatorModal';
import { LoadingSpinner } from './LoadingSpinner';
// @ts-ignore
import html2canvas from 'html2canvas';
import {
  User,
  Users,
  Sparkles,
  Clapperboard,
  Film,
  Plus,
  Trash2,
  Edit3,
  Download,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Type,
  Square,
  Eye,
  ArrowRight,
  Move,
  Camera,
  Shirt,
  Smile,
  Maximize2,
  Minimize2,
  Quote,
  Compass,
  AlertCircle,
  Share2,
  Bot,
  Columns,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

export const CharacterStudio: React.FC = () => {
  const [characters, setCharacters] = useState<CharacterProfile[]>(() => loadSavedCharacters());
  const [activeCharacterId, setActiveCharacterId] = useState<string>(() => {
    const list = loadSavedCharacters();
    return list[0]?.id || '';
  });

  // Navigation within Character Studio
  const [studioTab, setStudioTab] = useState<'director' | 'roster' | 'storyboard'>('director');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfile | null>(null);
  const [modalDefaultMode, setModalDefaultMode] = useState<'character' | 'mascot'>('character');

  // Mascot comparison and roster filtering
  const [showCompareReference, setShowCompareReference] = useState<boolean>(false);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'characters' | 'mascots'>('all');

  // Scene Configuration States
  const [scenario, setScenario] = useState<string>(SCENARIO_PRESETS[0].items[0].label);
  const [customScenario, setCustomScenario] = useState<string>('');
  const [mood, setMood] = useState<string>(MOOD_PRESETS[0].label);
  const [expression, setExpression] = useState<string>(EXPRESSION_PRESETS[0].label);
  const [clothing, setClothing] = useState<string>(CLOTHING_PRESETS[0].label);
  const [customClothing, setCustomClothing] = useState<string>('');
  const [cameraAngle, setCameraAngle] = useState<string>(CAMERA_PRESETS[0].label);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [includeDialogue, setIncludeDialogue] = useState<boolean>(true);
  const [customDialogue, setCustomDialogue] = useState<string>('');

  // Generation status
  const [isGeneratingScene, setIsGeneratingScene] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [currentSceneResult, setCurrentSceneResult] = useState<CharacterSceneResult | null>(null);
  const [allScenes, setAllScenes] = useState<CharacterSceneResult[]>(() => loadCharacterScenes());

  // Scene Legibility selector for dialogue overlay (Sombra, Contorno, Fundo Translúcido)
  const [legibilityMode, setLegibilityMode] = useState<TextLegibilityMode>('shadow');
  const [sceneFilter, setSceneFilter] = useState<ArtisticFilterId>('none');
  const [sceneFilterIntensity, setSceneFilterIntensity] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dialogueVerticalPos, setDialogueVerticalPos] = useState<number>(82); // 82% bottom default

  const sceneContainerRef = useRef<HTMLDivElement>(null);

  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || characters[0];

  useEffect(() => {
    setAllScenes(loadCharacterScenes());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveCharacter = (char: CharacterProfile) => {
    const updated = saveCharacter(char);
    setCharacters(updated);
    setActiveCharacterId(char.id);
    showToast(`Personagem "${char.name}" salvo com sucesso!`);
  };

  const handleDeleteCharacter = (id: string, name: string) => {
    if (characters.length <= 1) {
      showToast('Mantenha ao menos um personagem na sua galeria.');
      return;
    }
    const updated = deleteCharacter(id);
    setCharacters(updated);
    if (activeCharacterId === id) {
      setActiveCharacterId(updated[0]?.id || '');
    }
    showToast(`Personagem "${name}" removido.`);
  };

  const handleGenerateScene = async () => {
    if (!activeCharacter) return;
    setIsGeneratingScene(true);
    setGenerationStep('Preparando âncora de consistência visual do personagem...');

    const resolvedScenario = customScenario.trim() || scenario;
    const resolvedClothing = customClothing.trim() || clothing;

    const config: CharacterSceneConfig = {
      characterId: activeCharacter.id,
      scenario: resolvedScenario,
      mood,
      expression,
      clothing: resolvedClothing,
      cameraAngle,
      aspectRatio,
      includeDialogue,
      customQuoteOrDialogue: customDialogue.trim() || undefined,
    };

    try {
      setGenerationStep(`Renderizando ${activeCharacter.name} no cenário "${resolvedScenario.slice(0, 30)}..."`);
      const result = await createCharacterScene(activeCharacter, config);
      setCurrentSceneResult(result);
      setAllScenes(loadCharacterScenes());
      showToast(`Cena de ${activeCharacter.name} sintetizada com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao gerar cena:', err);
      showToast('Falha na geração da cena. Tente novamente com outro cenário.');
    } finally {
      setIsGeneratingScene(false);
      setGenerationStep('');
    }
  };

  const handleQuickMoodChange = async (newMood: string, newExpression: string) => {
    setMood(newMood);
    setExpression(newExpression);
    showToast(`Humor alterado para: ${newMood}`);
  };

  const handleDownloadScenePNG = async () => {
    if (!sceneContainerRef.current) return;
    showToast('Exportando cena em alta resolução 2x...');
    try {
      const canvas = await html2canvas(sceneContainerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${activeCharacter?.name || 'personagem'}-${Date.now()}.png`;
      link.click();
      showToast('Download concluído com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao realizar download.');
    }
  };

  // Helper for dialogue legibility styles
  const getDialogueStyles = (): React.CSSProperties => {
    if (legibilityMode === 'stroke') {
      return {
        WebkitTextStroke: '1.8px #000000',
        paintOrder: 'stroke fill',
        textShadow: '-1.8px -1.8px 0 #000, 1.8px -1.8px 0 #000, -1.8px 1.8px 0 #000, 1.8px 1.8px 0 #000, 0 2px 8px rgba(0,0,0,0.85)',
      };
    }
    if (legibilityMode === 'shadow') {
      return {
        textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 4px 18px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.95)',
      };
    }
    if (legibilityMode === 'combo') {
      return {
        WebkitTextStroke: '1.2px #000000',
        paintOrder: 'stroke fill',
        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, 0 3px 12px rgba(0,0,0,0.8)',
      };
    }
    if (legibilityMode === 'backdrop') {
      return {
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      };
    }
    return { textShadow: 'none' };
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-violet-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-violet-400 flex items-center gap-2.5 animate-fade-in text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Title & Character Roster Bar */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/70 border border-violet-700/60 text-xs font-semibold text-violet-300 mb-1">
          <Clapperboard className="w-3.5 h-3.5 text-pink-400" />
          <span>Direção Criativa & Consistência Visual de Personagens</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Estúdio de{' '}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            Personagem & Cenas
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Crie personagens com traços faciais fixos e use o mesmo personagem em múltiplos cenários, sentimentos, feições e vestimentas.
        </p>
      </div>

      {/* Active Character Spotlight & Studio Tab Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        {/* Top Active Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          {/* Active Character Quick Card */}
          {activeCharacter ? (
            <div className="flex items-center gap-3.5">
              <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 bg-slate-950 shadow-lg flex-shrink-0 ${
                activeCharacter.isMascot ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-violet-500'
              }`}>
                {activeCharacter.avatarImageUrl ? (
                  <img
                    src={activeCharacter.avatarImageUrl}
                    alt={activeCharacter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${
                    activeCharacter.isMascot ? 'bg-amber-950/60 text-amber-300' : 'bg-violet-950/60 text-violet-300'
                  }`}>
                    {activeCharacter.name.charAt(0)}
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  activeCharacter.isMascot ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
              </div>

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">
                    {activeCharacter.name}
                  </h3>
                  {activeCharacter.isMascot ? (
                    <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>Mascote Importado (Fidelidade 100%)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-violet-950/80 text-violet-300 border border-violet-800/60 rounded-full">
                      {activeCharacter.artStyle}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {activeCharacter.titleOrArchetype} • {activeCharacter.appearance.gender}
                </p>
                {activeCharacter.isMascot && activeCharacter.mascotDna?.colorPalette && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="text-[10px] text-slate-500">Cores da Imagem:</span>
                    {activeCharacter.mascotDna.colorPalette.slice(0, 3).map((col, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-amber-200">
                        {col}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhum personagem selecionado.</p>
          )}

          {/* Quick Actions & Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStudioTab('director')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studioTab === 'director'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Diretor de Cenas</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioTab('roster')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studioTab === 'roster'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Galeria ({characters.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioTab('storyboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studioTab === 'storyboard'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Storyboard ({allScenes.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCharacter(null);
                setModalDefaultMode('mascot');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/25 transition-all"
              title="Importe a imagem de um mascote para usá-lo com feições, sentimentos e cenários diversos"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Importar Mascote</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingCharacter(null);
                setModalDefaultMode('character');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              <span>Novo Personagem</span>
            </button>
          </div>
        </div>

        {/* Character switcher pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0">
            Alternar Ativo:
          </span>
          {characters.map((c) => {
            const isSelected = activeCharacterId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCharacterId(c.id)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all flex-shrink-0 ${
                  isSelected
                    ? c.isMascot
                      ? 'border-amber-400 bg-amber-950/60 text-amber-200 ring-1 ring-amber-400/50 shadow-sm'
                      : 'border-violet-500 bg-violet-950/60 text-white ring-1 ring-violet-500/40 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full overflow-hidden flex-shrink-0 ${c.isMascot ? 'ring-1 ring-amber-400' : 'bg-slate-800'}`}>
                  {c.avatarImageUrl ? (
                    <img src={c.avatarImageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-center block leading-4">{c.name[0]}</span>
                  )}
                </div>
                <span className="font-bold">{c.name}</span>
                {c.isMascot && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
                    Mascote
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DIRETOR DE CENAS (O MESMO PERSONAGEM EM DIVERSOS MUNDOS E HUMORES) */}
      {studioTab === 'director' && activeCharacter && (
        <div className="space-y-6">
          {/* Main Controls Deck */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-5 sm:p-7 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-violet-400" />
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Direção de Cena para "{activeCharacter.name}"
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                A âncora facial e traços do personagem permanecem fixos; escolha o cenário, o humor e a roupa.
              </span>
            </div>

            {/* Step 1: Cenário & Ambiente */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Escolha o Cenário / Ambiente (Onde ele está)</span>
                </label>
                <span className="text-[11px] text-slate-500">Mundo, local ou atmosfera</span>
              </div>

              {/* Categorias de Cenários */}
              <div className="space-y-3">
                {SCENARIO_PRESETS.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <span>{cat.icon}</span>
                      <span>{cat.category}:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setScenario(item.label);
                            setCustomScenario('');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            scenario === item.label && !customScenario
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-sm'
                              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Scenario Input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={customScenario}
                  onChange={(e) => setCustomScenario(e.target.value)}
                  placeholder="Ou digite qualquer cenário personalizado (Ex: No topo de uma pirâmide maia sob chuva cósmica)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Step 2: Sentimentos, Humores & Emoções */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Sentimento & Humor do Personagem (O que ele sente)</span>
                </label>
                <span className="text-[11px] text-slate-500">O personagem obedecerá emocionalmente</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {MOOD_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.label)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                      mood === m.label
                        ? 'border-amber-400 bg-amber-950/40 text-white ring-1 ring-amber-400/50 shadow-md'
                        : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{m.icon}</span>
                      <span className="text-xs font-bold leading-tight">{m.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Feição Facial Específica */}
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span>3. Feição Facial & Expressão Exata</span>
                </label>
                <span className="text-[11px] text-slate-500">Comando direto para os olhos e boca</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {EXPRESSION_PRESETS.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setExpression(exp.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      expression === exp.label
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-400 text-white shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Vestimentas & Roupas */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-indigo-400" />
                  <span>4. Vestimenta & Traje na Cena</span>
                </label>
                <span className="text-[11px] text-slate-500">Alterne o que ele está vestindo neste momento</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CLOTHING_PRESETS.map((cloth) => (
                  <button
                    key={cloth.id}
                    type="button"
                    onClick={() => {
                      setClothing(cloth.label);
                      setCustomClothing('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      clothing === cloth.label && !customClothing
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {cloth.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={customClothing}
                onChange={(e) => setCustomClothing(e.target.value)}
                placeholder="Ou digite outra vestimenta personalizada (Ex: Manto élfico esfarrapado com capa de veludo)..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Step 5: Enquadramento, Proporção & Diálogo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              {/* Enquadramento & Proporção */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Ângulo & Proporção da Tela</span>
                </label>

                <div className="grid grid-cols-2 gap-1.5">
                  {CAMERA_PRESETS.map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => setCameraAngle(cam.label)}
                      className={`p-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                        cameraAngle === cam.label
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400">Formato:</span>
                  {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                        aspectRatio === ratio
                          ? 'bg-violet-600 border-violet-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fala / Pensamento do Personagem */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-pink-400" />
                    <span>Fala / Pensamento do Personagem</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDialogue}
                      onChange={(e) => setIncludeDialogue(e.target.checked)}
                      className="rounded accent-violet-500"
                    />
                    <span>Ativar Fala</span>
                  </label>
                </div>

                {includeDialogue ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customDialogue}
                      onChange={(e) => setCustomDialogue(e.target.value)}
                      placeholder="Deixe em branco para IA gerar a fala no tom do sentimento..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-400">
                      A fala será sintonizada automaticamente com o humor "{mood}" e o cenário.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">
                    Cena cinematográfica limpa sem legenda sobreposta.
                  </p>
                )}
              </div>
            </div>

            {/* ACTION GENERATE BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateScene}
                disabled={isGeneratingScene}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>
                  {isGeneratingScene
                    ? 'Diretor em Ação: Sintetizando Cena...'
                    : `Gerar Cena: ${activeCharacter.name} em ${mood}`}
                </span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isGeneratingScene && (
            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-800 shadow-2xl">
              <LoadingSpinner
                text={`Sintetizando ${activeCharacter.name} no cenário...`}
                subtext={generationStep || 'Aplicando âncora visual e feições ao motor gerador.'}
              />
            </div>
          )}

          {/* GENERATED SCENE RESULT DISPLAY */}
          {currentSceneResult && (
            <div className="bg-slate-900/90 backdrop-blur-xl p-5 sm:p-7 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">
                    Cena Pronta: {currentSceneResult.characterName}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/70 text-violet-300 border border-violet-800/50 font-semibold">
                    {currentSceneResult.mood}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(activeCharacter.isMascot || currentSceneResult.importedSourceImageUrl) && (
                    <button
                      type="button"
                      onClick={() => setShowCompareReference(!showCompareReference)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        showCompareReference
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25'
                          : 'bg-slate-800 text-amber-300 hover:text-white border-slate-700'
                      }`}
                      title="Comparar a imagem original importada lado a lado com a nova cena gerada"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>{showCompareReference ? 'Ocultar Comparativo' : 'Comparar com Imagem Original'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadScenePNG}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Cena 2x PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors border border-slate-700"
                    title={isFullscreen ? 'Reduzir' : 'Modo Expandido'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison: Original Reference Mascot vs Newly Synthesized Scene */}
              {showCompareReference && (currentSceneResult.importedSourceImageUrl || activeCharacter.importedImageUrl) && (
                <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border-2 border-amber-500/50 shadow-2xl space-y-3 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Columns className="w-4 h-4 text-amber-400" />
                      <span>Comparativo Visual: Mascote Original Importado vs. Nova Emoção / Cenário</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Fidelidade Visual 100% Preservada</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original Reference */}
                    <div className="space-y-1.5 text-center">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold px-1">
                        <span className="text-amber-400 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>1. Imagem Original Importada (Âncora):</span>
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">Referência</span>
                      </div>
                      <div className="aspect-square max-h-72 rounded-xl overflow-hidden border-2 border-amber-500/60 bg-black shadow-lg mx-auto relative group">
                        <img
                          src={currentSceneResult.importedSourceImageUrl || activeCharacter.importedImageUrl}
                          alt="Imagem Original Importada de Referência"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 backdrop-blur-xs text-[10px] font-bold text-amber-300 border border-amber-400/40">
                          Original de Referência
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Cores, espécie e traços anatômicos fixados pelo DNA visual.
                      </p>
                    </div>

                    {/* Right: Generated Scene */}
                    <div className="space-y-1.5 text-center">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold px-1">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>2. Mesmo Mascote com Nova Emoção & Cenário:</span>
                        </span>
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">{currentSceneResult.mood}</span>
                      </div>
                      <div className="aspect-square max-h-72 rounded-xl overflow-hidden border-2 border-emerald-500/60 bg-black shadow-lg mx-auto relative group">
                        <img
                          src={currentSceneResult.imageUrl}
                          alt={currentSceneResult.sceneTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-950/85 backdrop-blur-xs text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                          {currentSceneResult.mood}
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-300 font-medium">
                        Cenário: {currentSceneResult.scenario.slice(0, 36)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legibility Selector Bar (Sombra, Contorno, Fundo Translúcido) */}
              {currentSceneResult.dialogue && (
                <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Legibilidade da Fala do Personagem:</span>
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      (garante leitura nítida sobre qualquer detalhe da cena)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLegibilityMode('shadow')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        legibilityMode === 'shadow'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md ring-1 ring-violet-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-violet-300" />
                      <span>Sombra</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLegibilityMode('stroke')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        legibilityMode === 'stroke'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md ring-1 ring-violet-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Contorno</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLegibilityMode('backdrop')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        legibilityMode === 'backdrop'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md ring-1 ring-violet-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                      }`}
                    >
                      <Square className="w-3.5 h-3.5 text-pink-300" />
                      <span>Fundo Translúcido</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLegibilityMode('combo')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        legibilityMode === 'combo'
                          ? 'bg-violet-700 text-white ring-1 ring-violet-400'
                          : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Combinado</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Artistic Filters Bar for Scene */}
              <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Filtro Artístico da Cena:</span>
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    (acabamento cinematográfico final)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'none' as ArtisticFilterId, label: 'Original' },
                    { id: 'sepia' as ArtisticFilterId, label: 'Sépia', color: 'bg-amber-400' },
                    { id: 'bw' as ArtisticFilterId, label: 'Black & White', color: 'bg-slate-200' },
                    { id: 'vintage' as ArtisticFilterId, label: 'Vintage Film', color: 'bg-amber-600' },
                    { id: 'cyberpunk' as ArtisticFilterId, label: 'Cyberpunk', color: 'bg-pink-500' },
                    { id: 'cinematic' as ArtisticFilterId, label: 'Cinema', color: 'bg-sky-400' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSceneFilter(f.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        sceneFilter === f.id
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md ring-1 ring-violet-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                      }`}
                    >
                      {f.color && <span className={`w-2 h-2 rounded-full ${f.color}`} />}
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IMAGE STAGE */}
              <div className="flex justify-center w-full">
                <div
                  ref={sceneContainerRef}
                  className={`relative w-full overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-950 transition-all duration-300 ${
                    isFullscreen ? 'max-w-4xl' : 'max-w-2xl'
                  }`}
                  style={{
                    aspectRatio: currentSceneResult.aspectRatio
                      ? currentSceneResult.aspectRatio.replace(':', '/')
                      : '1/1',
                  }}
                >
                  <img
                    src={currentSceneResult.imageUrl}
                    alt={currentSceneResult.sceneTitle}
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-cover select-none transition-all duration-300"
                    style={{
                      filter: getArtisticFilterCss(sceneFilter, sceneFilterIntensity),
                    }}
                  />

                  {/* Scene Vignette if applicable */}
                  {getArtisticFilterById(sceneFilter).vignette && sceneFilter !== 'none' && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.45) 100%)',
                        opacity: sceneFilterIntensity / 100,
                      }}
                    />
                  )}

                  {/* Scene Atmosphere Gradient if applicable */}
                  {getArtisticFilterById(sceneFilter).overlayGradient && sceneFilter !== 'none' && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        background: getArtisticFilterById(sceneFilter).overlayGradient,
                        opacity: sceneFilterIntensity / 100,
                      }}
                    />
                  )}

                  {/* Character Name Badge */}
                  <div className="absolute top-3 left-3 z-20 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-lg text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />
                      <span>{currentSceneResult.characterName}</span>
                    </div>
                  </div>

                  {/* Character In-Scene Dialogue Overlay */}
                  {currentSceneResult.dialogue && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-[90%] max-w-xl transition-all duration-200 pointer-events-auto"
                      style={{
                        top: `${dialogueVerticalPos}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`transition-all rounded-2xl mx-auto w-full text-center ${
                          legibilityMode === 'backdrop' || legibilityMode === 'combo'
                            ? 'px-5 py-3.5 backdrop-blur-md bg-black/55 border border-white/15 shadow-2xl'
                            : 'px-2 py-1'
                        }`}
                      >
                        <p
                          className="text-base sm:text-lg font-semibold text-white tracking-wide select-text leading-snug"
                          style={getDialogueStyles()}
                        >
                          "{currentSceneResult.dialogue}"
                        </p>
                        <p
                          className="mt-1.5 text-[11px] font-bold text-violet-300 tracking-wider uppercase select-text"
                          style={{
                            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                          }}
                        >
                          — {currentSceneResult.characterName} em {currentSceneResult.mood}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Official Inspira Arte Watermark */}
                  <div className="absolute bottom-3 right-3 z-20 pointer-events-none select-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-xl">
                      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400 flex items-center justify-center p-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase font-sans text-slate-100">
                        Inspira Arte Studio
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Mood Shifter (Same Scene, Different Emotions) */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Transição Instantânea de Emoção no Mesmo Cenário:</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Mude o sentimento com 1 clique</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MOOD_PRESETS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        handleQuickMoodChange(m.label, EXPRESSION_PRESETS.find((e) => e.id === m.id)?.label || EXPRESSION_PRESETS[0].label);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                        mood === m.label
                          ? 'bg-amber-600 border-amber-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEUS PERSONAGENS (ROSTER / BIBLIOTECA) */}
      {studioTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">Galeria de Personagens & Mascotes</h3>
              <p className="text-xs text-slate-400">
                Personagens e mascotes salvos com âncoras de traços e estilo visual definidos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCharacter(null);
                  setModalDefaultMode('mascot');
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Importar Mascote a partir de Imagem</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCharacter(null);
                  setModalDefaultMode('character');
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Personagem</span>
              </button>
            </div>
          </div>

          {/* Roster Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRosterFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rosterFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({characters.length})
            </button>
            <button
              type="button"
              onClick={() => setRosterFilter('characters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rosterFilter === 'characters'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Personagens Narrativos ({characters.filter((c) => !c.isMascot).length})
            </button>
            <button
              type="button"
              onClick={() => setRosterFilter('mascots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rosterFilter === 'mascots'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              Mascotes da Marca ({characters.filter((c) => c.isMascot).length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {characters
              .filter((char) => {
                if (rosterFilter === 'mascots') return char.isMascot;
                if (rosterFilter === 'characters') return !char.isMascot;
                return true;
              })
              .map((char) => {
              const charScenesCount = allScenes.filter((s) => s.characterId === char.id).length;
              const isActive = activeCharacterId === char.id;

              return (
                <div
                  key={char.id}
                  className={`bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? char.isMascot
                        ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-950/40'
                        : 'border-violet-500 ring-2 ring-violet-500/40 shadow-xl shadow-violet-950/40'
                      : char.isMascot
                      ? 'border-amber-500/40 hover:border-amber-500/70'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header with Avatar & Details */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 bg-slate-950 flex-shrink-0 shadow-md ${
                        char.isMascot ? 'border-amber-400' : 'border-slate-700'
                      }`}>
                        {char.avatarImageUrl ? (
                          <img src={char.avatarImageUrl} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-bold text-xl ${
                            char.isMascot ? 'bg-amber-950/70 text-amber-300' : 'bg-violet-950/70 text-violet-300'
                          }`}>
                            {char.name[0]}
                          </div>
                        )}
                        {isActive && (
                          <span className={`absolute top-1 right-1 w-3 h-3 rounded-full border border-slate-950 ${
                            char.isMascot ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-base font-bold text-slate-100 truncate">{char.name}</h4>
                          {char.isMascot && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                              Mascote
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-violet-300 font-medium truncate">{char.titleOrArchetype}</p>
                        <span className="inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          {char.artStyle}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{char.bio}</p>

                    {/* Characteristic traits */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-1.5 text-[11px]">
                      {char.isMascot ? (
                        <>
                          <div className="text-slate-300">
                            <span className="text-amber-400 font-semibold">Espécie / Forma: </span>
                            {char.appearance.gender}
                          </div>
                          <div className="text-slate-300 truncate">
                            <span className="text-amber-400 font-semibold">Cores: </span>
                            {char.mascotDna?.colorPalette?.join(', ') || char.appearance.hair}
                          </div>
                          <div className="text-slate-300 truncate">
                            <span className="text-amber-400 font-semibold">Detalhes: </span>
                            {char.appearance.signatureDetails}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-300">
                            <span className="text-slate-500 font-semibold">Cabelo: </span>
                            {char.appearance.hair}
                          </div>
                          <div className="text-slate-300">
                            <span className="text-slate-500 font-semibold">Olhos: </span>
                            {char.appearance.eyes}
                          </div>
                          <div className="text-slate-300 truncate">
                            <span className="text-slate-500 font-semibold">Detalhe: </span>
                            {char.appearance.signatureDetails}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      {charScenesCount} {charScenesCount === 1 ? 'cena gerada' : 'cenas geradas'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCharacter(char);
                          setModalDefaultMode(char.isMascot ? 'mascot' : 'character');
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                        title={char.isMascot ? 'Editar Mascote' : 'Editar Personagem'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {characters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCharacter(char.id, char.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveCharacterId(char.id);
                          setStudioTab('director');
                          showToast(`"${char.name}" ativado no Diretor de Cenas!`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isActive
                            ? char.isMascot
                              ? 'bg-amber-500 text-slate-950 font-extrabold'
                              : 'bg-violet-600 text-white'
                            : char.isMascot
                            ? 'bg-amber-950/60 text-amber-300 hover:bg-amber-600 hover:text-slate-950 border border-amber-600/40'
                            : 'bg-slate-800 text-slate-300 hover:bg-violet-700 hover:text-white'
                        }`}
                      >
                        <span>{isActive ? 'Ativo' : 'Dirigir'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STORYBOARD & DIÁRIO DE CENAS */}
      {studioTab === 'storyboard' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Storyboard & Linha do Tempo ({allScenes.length} cenas)
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe a evolução do mesmo personagem em múltiplos mundos, feições e roupas.
              </p>
            </div>

            {allScenes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja limpar todo o histórico de cenas do Storyboard?')) {
                    localStorage.removeItem('inspira-arte-character-scenes-v1');
                    setAllScenes([]);
                    showToast('Histórico de cenas limpo.');
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Limpar Cenas
              </button>
            )}
          </div>

          {allScenes.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-950/40">
              <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-300">Nenhuma cena no Storyboard ainda</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Abra a aba "Diretor de Cenas", escolha um cenário e humor para gerar a primeira cena do seu personagem!
              </p>
              <button
                type="button"
                onClick={() => setStudioTab('director')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold"
              >
                Ir para o Diretor de Cenas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg group hover:border-violet-600/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Scene Image Preview */}
                    <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                      <img
                        src={scene.imageUrl}
                        alt={scene.sceneTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                          {scene.characterName}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-violet-950/90 backdrop-blur-md text-[10px] font-bold text-violet-300 border border-violet-700/50">
                          {scene.mood}
                        </span>
                      </div>

                      {/* Dialogue Snippet if available */}
                      {scene.dialogue && (
                        <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-medium leading-tight text-center border border-white/10">
                          "{scene.dialogue}"
                        </div>
                      )}
                    </div>

                    {/* Scene Details */}
                    <div className="p-4 space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{scene.sceneTitle}</h4>
                      <p className="text-[11px] text-slate-400">
                        <span className="text-slate-500 font-semibold">Feição: </span>
                        {scene.expression}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        <span className="text-slate-500 font-semibold">Roupa: </span>
                        {scene.clothing}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(scene.createdAt).toLocaleDateString('pt-BR')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = scene.imageUrl;
                          link.download = `${scene.characterName}-${scene.mood}.png`;
                          link.click();
                          showToast('Download da cena iniciado!');
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                        title="Baixar Imagem"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteCharacterScene(scene.id);
                          setAllScenes(loadCharacterScenes());
                          showToast('Cena removida do Storyboard.');
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800 rounded-lg transition-colors"
                        title="Excluir Cena"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Character Creator Modal */}
      <CharacterCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCharacter}
        initialCharacter={editingCharacter}
        defaultMode={modalDefaultMode}
      />
    </div>
  );
};
