import React, { useState, useRef } from 'react';
import type { CharacterProfile, CharacterAppearance, MascotDna } from '../types';
import { ART_STYLES, generateCharacterAvatar, analyzeMascotImage } from '../services/characterService';
import {
  User,
  Sparkles,
  X,
  Check,
  RefreshCw,
  Camera,
  Smile,
  Wand2,
  Upload,
  Image as ImageIcon,
  Bot,
  Layers,
  Palette,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: CharacterProfile) => void;
  initialCharacter?: CharacterProfile | null;
  defaultMode?: 'character' | 'mascot';
}

const TEMPLATE_PRESETS = [
  {
    name: 'Lyra Solaria',
    archetype: 'Feiticeira Astral & Guardiã Solar',
    gender: 'Feminino',
    ageGroup: 'Jovem (22 anos)',
    hair: 'Cabelos loiro-dourados longos ondulados com mechas incandescentes',
    eyes: 'Olhos âmbar brilhantes como o sol',
    skin: 'Pele bronzeada com micropigmentação estelar',
    face: 'Expressão altiva, queixo firme e olhar acolhedor',
    details: 'Tiara fina de ouro solar e manto translúcido com runas de luz',
    clothing: 'Manto de seda dourada sobre corpete de couro flexível e braceletes gravados',
    style: 'Cinemático 3D (8K)',
  },
  {
    name: 'Darius Thorne',
    archetype: 'Comandante Tático & Guerreiro Cyberpunk',
    gender: 'Masculino',
    ageGroup: 'Adulto (34 anos)',
    hair: 'Cabelos pretos raspados nas laterais com topo curto militar',
    eyes: 'Olhos cinza-aço frios e calculistas',
    skin: 'Pele clara com marcas de queimadura cibernética no pescoço',
    face: 'Maxilar quadrado marcado, cicatriz vertical na sobrancelha esquerda',
    details: 'Braço biônico de titânio fosco com juntas luminosas em laranja',
    clothing: 'Colete tático balístico com correias de combate sobre camisa militar preta',
    style: 'Cyberpunk Neon Realism',
  },
  {
    name: 'Nico Silva',
    archetype: 'Explorador Urbano & Ilustrador Criativo',
    gender: 'Masculino',
    ageGroup: 'Jovem (20 anos)',
    hair: 'Cabelos castanho-escuros encaracolados volumosos',
    eyes: 'Olhos castanhos vivos e curiosos',
    skin: 'Pele morena com sardas sutis no rosto',
    face: 'Sorriso largo espontâneo e covinhas nas bochechas',
    details: 'Óculos redondos de aro fino dourado e fone de ouvido no pescoço',
    clothing: 'Moletom oversized lilás com jaqueta jeans desgastada e mochila de lona',
    style: 'Animação 3D Estilizada',
  },
  {
    name: 'Kira Vex',
    archetype: 'Androide Sintética & Espiã de Dados',
    gender: 'Feminino / Sintética',
    ageGroup: 'Atemporal (Aparência 25 anos)',
    hair: 'Cabelos lisos azul-ciano neon cortados em chanel assimétrico',
    eyes: 'Olhos biônicos violeta com anéis concêntricos digitais',
    skin: 'Pele porcelana com linhas sutis de circuitos bioluminescentes',
    face: 'Feições perfeitamente simétricas com aura misteriosa e serena',
    details: 'Gargantilha de fibra óptica que pulsa dados em ciano',
    clothing: 'Macacão colante de nanofibra preta reflexiva com detalhes holográficos',
    style: 'Anime & Manga Premium',
  },
];

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCharacter,
  defaultMode = 'character',
}) => {
  const [modalMode, setModalMode] = useState<'character' | 'mascot'>(() => {
    if (initialCharacter?.isMascot) return 'mascot';
    return defaultMode;
  });

  // Mascot-specific states
  const [mascotImage, setMascotImage] = useState<string>(initialCharacter?.importedImageUrl || initialCharacter?.avatarImageUrl || '');
  const [mascotMimeType, setMascotMimeType] = useState<string>('image/png');
  const [isAnalyzingMascot, setIsAnalyzingMascot] = useState<boolean>(false);
  const [mascotDna, setMascotDna] = useState<MascotDna | null>(initialCharacter?.mascotDna || null);
  const [mascotSpecies, setMascotSpecies] = useState<string>(initialCharacter?.mascotDna?.speciesOrType || 'Raposa estilizada 3D');
  const [mascotColorPalette, setMascotColorPalette] = useState<string[]>(initialCharacter?.mascotDna?.colorPalette || ['#FF7A00 Laranja', '#FFFFFF Branco', '#06B6D4 Ciano']);
  const [mascotAnchorPrompt, setMascotAnchorPrompt] = useState<string>(initialCharacter?.mascotDna?.consistencyAnchorPrompt || '');

  // Common Character / Mascot fields
  const [name, setName] = useState(initialCharacter?.name || '');
  const [titleOrArchetype, setTitleOrArchetype] = useState(initialCharacter?.titleOrArchetype || '');
  const [bio, setBio] = useState(initialCharacter?.bio || '');
  const [gender, setGender] = useState(initialCharacter?.appearance?.gender || 'Feminino');
  const [ageGroup, setAgeGroup] = useState(initialCharacter?.appearance?.ageGroup || 'Jovem Adulto (24 anos)');
  const [hair, setHair] = useState(initialCharacter?.appearance?.hair || 'Cabelos castanhos médios ondulados');
  const [eyes, setEyes] = useState(initialCharacter?.appearance?.eyes || 'Olhos castanhos penetrantes');
  const [skinOrTone, setSkinOrTone] = useState(initialCharacter?.appearance?.skinOrTone || 'Pele clara natural');
  const [facialFeatures, setFacialFeatures] = useState(
    initialCharacter?.appearance?.facialFeatures || 'Mandíbula bem delineada e expressão marcante'
  );
  const [signatureDetails, setSignatureDetails] = useState(
    initialCharacter?.appearance?.signatureDetails || 'Pequena cicatriz sutil ou detalhe característico'
  );
  const [defaultClothing, setDefaultClothing] = useState(
    initialCharacter?.defaultClothing || 'Jaqueta moderna de couro e calça escura'
  );
  const [artStyle, setArtStyle] = useState(initialCharacter?.artStyle || 'Animação 3D Estilizada');
  const [avatarUrl, setAvatarUrl] = useState(initialCharacter?.avatarImageUrl || '');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: (typeof TEMPLATE_PRESETS)[0]) => {
    setName(tpl.name);
    setTitleOrArchetype(tpl.archetype);
    setGender(tpl.gender);
    setAgeGroup(tpl.ageGroup);
    setHair(tpl.hair);
    setEyes(tpl.eyes);
    setSkinOrTone(tpl.skin);
    setFacialFeatures(tpl.face);
    setSignatureDetails(tpl.details);
    setDefaultClothing(tpl.clothing);
    setArtStyle(tpl.style);
    setBio(`Personagem ${tpl.archetype}, dotado de personalidade única e determinação.`);
  };

  const handleImageFileChange = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setMascotImage(dataUrl);
      setAvatarUrl(dataUrl);
      setMascotMimeType(file.type || 'image/png');

      // Trigger automatic deep Mascot DNA analysis
      setIsAnalyzingMascot(true);
      try {
        const result = await analyzeMascotImage(dataUrl, file.type, name || file.name.replace(/\.[^/.]+$/, ''));
        if (result.success && result.dna) {
          const dna = result.dna;
          setMascotDna(dna);
          if (dna.name && !name.trim()) setName(dna.name);
          if (dna.speciesOrType) setMascotSpecies(dna.speciesOrType);
          if (dna.archetype && !titleOrArchetype.trim()) setTitleOrArchetype(dna.archetype);
          if (dna.artStyle) setArtStyle(dna.artStyle);
          if (dna.colorPalette && dna.colorPalette.length > 0) setMascotColorPalette(dna.colorPalette);
          if (dna.facialFeatures) setFacialFeatures(dna.facialFeatures);
          if (dna.signatureDetails) setSignatureDetails(dna.signatureDetails);
          if (dna.defaultClothing) setDefaultClothing(dna.defaultClothing);
          if (dna.consistencyAnchorPrompt) setMascotAnchorPrompt(dna.consistencyAnchorPrompt);
          if (dna.suggestedBio && !bio.trim()) setBio(dna.suggestedBio);
        }
      } catch (err) {
        console.warn('Falha na análise automática de imagem:', err);
      } finally {
        setIsAnalyzingMascot(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = async () => {
    if (!name.trim()) {
      setAvatarError('Digite o nome do personagem antes de gerar o avatar.');
      return;
    }
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    try {
      const tempProfile: CharacterProfile = {
        id: initialCharacter?.id || 'temp',
        name,
        titleOrArchetype: titleOrArchetype || 'Aventureiro',
        bio,
        appearance: {
          gender,
          ageGroup,
          hair,
          eyes,
          skinOrTone,
          facialFeatures,
          signatureDetails,
        },
        defaultClothing,
        artStyle,
        createdAt: Date.now(),
      };
      const url = await generateCharacterAvatar(tempProfile);
      setAvatarUrl(url);
    } catch (err: any) {
      console.error(err);
      setAvatarError('Não foi possível sintetizar o avatar no momento. Tente novamente.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isMascot = modalMode === 'mascot';

    const appearance: CharacterAppearance = {
      gender: isMascot ? (mascotSpecies || 'Mascote Carismático') : gender,
      ageGroup: isMascot ? 'Mascote Oficial' : ageGroup,
      hair: isMascot ? (mascotColorPalette.join(', ') || 'Pelos/Cores do Mascote') : hair,
      eyes: isMascot ? 'Olhos expressivos e vivos da imagem de referência' : eyes,
      skinOrTone: isMascot ? 'Textura e tonalidade idênticas à imagem importada' : skinOrTone,
      facialFeatures: facialFeatures.trim() || 'Expressão simpática e feições originais',
      signatureDetails: signatureDetails.trim() || 'Silhueta e detalhes inconfundíveis da imagem importada',
    };

    const finalMascotDna: MascotDna | undefined = isMascot
      ? {
          speciesOrType: mascotSpecies || 'Mascote Carismático',
          colorPalette: mascotColorPalette,
          distinctiveFeatures: [signatureDetails, facialFeatures],
          originalStyle: artStyle,
          consistencyAnchorPrompt:
            mascotAnchorPrompt ||
            `Official charismatic mascot '${name.trim()}', exact same species and anatomy as imported reference image, distinct recognizable facial features, identical color palette (${mascotColorPalette.join(', ')}), masterpiece quality`,
        }
      : undefined;

    const profile: CharacterProfile = {
      id: initialCharacter?.id || `${isMascot ? 'mascot' : 'char'}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      titleOrArchetype: titleOrArchetype.trim() || (isMascot ? 'Mascote Oficial da Marca' : 'Protagonista Heroico'),
      bio: bio.trim() || (isMascot ? `Mascote criado a partir da imagem importada de referência.` : `Personagem criado no estúdio Inspira Arte.`),
      appearance,
      defaultClothing: defaultClothing.trim() || (isMascot ? 'Aparência original do mascote' : 'Vestimenta casual estilizada'),
      artStyle,
      avatarImageUrl: mascotImage || avatarUrl || undefined,
      isMascot,
      importedImageUrl: isMascot ? (mascotImage || undefined) : undefined,
      mascotDna: finalMascotDna,
      createdAt: initialCharacter?.createdAt || Date.now(),
    };

    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              modalMode === 'mascot'
                ? 'bg-amber-600/25 border-amber-500/40 text-amber-300'
                : 'bg-violet-600/25 border-violet-500/40 text-violet-300'
            }`}>
              {modalMode === 'mascot' ? <Bot className="w-5 h-5 text-amber-400" /> : <User className="w-5 h-5 text-violet-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {initialCharacter
                  ? (initialCharacter.isMascot ? 'Editar Mascote Importado' : 'Editar Personagem')
                  : (modalMode === 'mascot' ? 'Importar Mascote a partir de Imagem' : 'Criar Novo Personagem')}
              </h3>
              <p className="text-xs text-slate-400">
                {modalMode === 'mascot'
                  ? 'Fidelidade visual 100%: use a imagem do mascote para gerar emoções, humores e cenários diversos.'
                  : 'Defina traços, arquétipo e consistência para cenas em qualquer mundo ou sentimento.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Personagem Narrativo vs Mascote Importado) */}
        <div className="px-6 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalMode('character')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modalMode === 'character'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personagem Narrativo / Humano</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('mascot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modalMode === 'mascot'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/25'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mascote a partir de Imagem (Fidelidade 100%)</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* ======================================================== */}
          {/* MASCOT IMPORT MODE */}
          {/* ======================================================== */}
          {modalMode === 'mascot' && (
            <div className="space-y-5">
              {/* Upload Card */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Upload da Imagem Original do Mascote (Âncora de Referência)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG ou WebP</span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    mascotImage
                      ? 'border-amber-500/50 bg-amber-950/15 hover:bg-amber-950/25'
                      : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileChange(file);
                    }}
                  />

                  {mascotImage ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-950 flex-shrink-0">
                        <img src={mascotImage} alt="Mascote Original" className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-amber-300">
                          Original
                        </div>
                      </div>

                      <div className="text-left space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                            Imagem de Mascote Carregada
                          </span>
                          {isAnalyzingMascot && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-400 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Analisando DNA visual...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">
                          O motor de consistência guardará cada detalhe da sua imagem para reproduzir o mascote exatamente igual em todas as emoções e cenários.
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
                        >
                          Trocar imagem do mascote
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          Clique ou arraste a imagem do seu mascote aqui
                        </p>
                        <p className="text-[11px] text-slate-400">
                          O sistema extrai cores, espécie, traços e prepara a âncora de consistência visual 100%.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Nome do Mascote *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sparky, Pip, Fred, Robo-Buddy"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Espécie / Forma do Mascote</label>
                  <input
                    type="text"
                    value={mascotSpecies}
                    onChange={(e) => setMascotSpecies(e.target.value)}
                    placeholder="Ex: Raposa estilizada, Robô ciano, Coruja mágica"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Papel / Arquétipo da Marca</label>
                  <input
                    type="text"
                    value={titleOrArchetype}
                    onChange={(e) => setTitleOrArchetype(e.target.value)}
                    placeholder="Ex: Mascote Oficial de Inovação & Alegria"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Estilo Artístico</label>
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {ART_STYLES.map((st) => (
                      <option key={st.id} value={st.label}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visual DNA Badges */}
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>DNA Visual Extraído da Imagem Importada:</span>
                  </span>
                  {mascotColorPalette.length > 0 && (
                    <span className="text-[10px] text-amber-300 font-semibold">Cores Identificadas</span>
                  )}
                </div>

                {/* Color Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {mascotColorPalette.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      {col}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Feições do Rosto & Olhos</label>
                    <input
                      type="text"
                      value={facialFeatures}
                      onChange={(e) => setFacialFeatures(e.target.value)}
                      placeholder="Olhos grandes expressivos, sorriso amigável..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">Acessórios / Marcas Permanentes</label>
                    <input
                      type="text"
                      value={signatureDetails}
                      onChange={(e) => setSignatureDetails(e.target.value)}
                      placeholder="Ex: Óculos redondos verdes, gravata borboleta..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Âncora de Fidelidade (Prompt em Inglês para IA):
                  </label>
                  <textarea
                    rows={2}
                    value={mascotAnchorPrompt}
                    onChange={(e) => setMascotAnchorPrompt(e.target.value)}
                    placeholder="Instruções em inglês que cravam a identidade do mascote em cada cena gerada..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 focus:ring-1 focus:ring-amber-500 outline-none resize-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* HUMANOID CHARACTER MODE */}
          {/* ======================================================== */}
          {modalMode === 'character' && (
            <div className="space-y-6">
              {/* Quick Inspiring Template Buttons */}
              <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Preencher com Modelo Pronto de Inspiração (Opcional):</span>
                  </span>
                  <span className="text-[10px] text-slate-500">1 clique preenche tudo</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TEMPLATE_PRESETS.map((tpl) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-violet-950/60 border border-slate-800 hover:border-violet-600/50 rounded-lg text-left transition-all text-xs"
                    >
                      <span className="font-bold text-slate-200 block truncate">{tpl.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{tpl.archetype}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 1: Basic Identity */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  <span>1. Identidade & Conceito do Personagem</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Nome do Personagem *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Aria Thorne, Kaelen, Lucas"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Arquétipo / Título / Papel</label>
                    <input
                      type="text"
                      value={titleOrArchetype}
                      onChange={(e) => setTitleOrArchetype(e.target.value)}
                      placeholder="Ex: Feiticeira Arcana, Detetive Cibernético, Samurai"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Gênero / Identidade</label>
                    <input
                      type="text"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      placeholder="Feminino, Masculino, Andrógino, etc."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Faixa Etária / Idade</label>
                    <input
                      type="text"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      placeholder="Jovem (24 anos), Adulto, Ancestral..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Estilo Artístico Base</label>
                    <select
                      value={artStyle}
                      onChange={(e) => setArtStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    >
                      {ART_STYLES.map((st) => (
                        <option key={st.id} value={st.label}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Pequena Biografia / Motivação</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Uma breve história do personagem ou de suas motivações..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Physical & Facial Traits */}
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Traços Físicos & Feições Reconhecíveis (Âncora de Consistência)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Cabelos (Cor, corte, estilo)</label>
                    <input
                      type="text"
                      value={hair}
                      onChange={(e) => setHair(e.target.value)}
                      placeholder="Ex: Platinados longos com tranças, Preto curto militar"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Olhos (Cor, brilho, formato)</label>
                    <input
                      type="text"
                      value={eyes}
                      onChange={(e) => setEyes(e.target.value)}
                      placeholder="Ex: Violeta profundos luminosos, Castanhos amendoados"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Tom de Pele / Textura</label>
                    <input
                      type="text"
                      value={skinOrTone}
                      onChange={(e) => setSkinOrTone(e.target.value)}
                      placeholder="Ex: Clara com reflexos estelares, Morena beijada pelo sol"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Feições do Rosto & Estrutura</label>
                    <input
                      type="text"
                      value={facialFeatures}
                      onChange={(e) => setFacialFeatures(e.target.value)}
                      placeholder="Ex: Mandíbula esculpida, maçãs do rosto altas, olhar firme"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Detalhes Marcantes / Assinatura Visual</label>
                    <input
                      type="text"
                      value={signatureDetails}
                      onChange={(e) => setSignatureDetails(e.target.value)}
                      placeholder="Ex: Marca rúnica na têmpora, óculos redondos, cicatriz sutil"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Vestimenta Padrão Principal</label>
                    <input
                      type="text"
                      value={defaultClothing}
                      onChange={(e) => setDefaultClothing(e.target.value)}
                      placeholder="Ex: Manto estrelado de veludo, sobretudo de couro preto"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Avatar Preview & AI Synthesis */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  <span>3. Retrato do Avatar (Foto de Referência)</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-violet-500/50 bg-slate-900 flex-shrink-0 shadow-lg">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                        <User className="w-8 h-8 text-slate-600 mb-1" />
                        <span className="text-[10px]">Sem avatar</span>
                      </div>
                    )}
                    {isGeneratingAvatar && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={handleGenerateAvatar}
                        disabled={isGeneratingAvatar || !name.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-violet-600/30"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGeneratingAvatar ? 'Sintetizando...' : 'Gerar Avatar com IA'}</span>
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Gere um retrato oficial inicial com base nos traços preenchidos ou salve sem foto.
                    </p>
                    {avatarError && <p className="text-xs text-rose-400 font-medium">{avatarError}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-lg ${
                modalMode === 'mascot'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-amber-500/30 hover:brightness-110'
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{modalMode === 'mascot' ? 'Salvar Mascote Importado' : 'Salvar Personagem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
