import type { CharacterProfile, CharacterSceneConfig, CharacterSceneResult, MascotDna } from '../types';
import { generateImage } from './geminiService';

const CHARACTERS_STORAGE_KEY = 'inspira-arte-characters-v1';
const SCENES_STORAGE_KEY = 'inspira-arte-character-scenes-v1';

export const ART_STYLES = [
  { id: 'cinematic', label: 'Cinemático 3D (8K)', promptTerm: 'cinematic 8k, photorealistic octane render, dramatic volumetric lighting, highly detailed masterpiece' },
  { id: 'anime', label: 'Anime & Manga Premium', promptTerm: 'high-end anime key visual, Makoto Shinkai aesthetic, clean lines, vibrant expressive colors, detailed art' },
  { id: 'digital_painting', label: 'Pintura Fantasia Épica', promptTerm: 'epic digital oil painting, Artstation trend, rich brush strokes, Greg Rutkowski fantasy art style' },
  { id: 'pixar_3d', label: 'Animação 3D Estilizada', promptTerm: 'Pixar Disney stylized 3D character render, soft studio illumination, expressive proportions, friendly charm' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon Realism', promptTerm: 'cyberpunk sci-fi aesthetics, neon glow reflections, rain wet reflections, Blade Runner atmospheric lighting' },
  { id: 'comic', label: 'Quadrinhos & Comic Book', promptTerm: 'modern graphic novel comic book style, bold ink dynamic lines, cinematic color grading, punchy contrast' },
];

export const SCENARIO_PRESETS = [
  {
    category: 'Mascote & Marca no Dia a Dia',
    icon: '🎯',
    items: [
      { id: 'office_desk', label: 'Escritório Moderno & Home Office', prompt: 'a vibrant modern startup office desk with a laptop, sticky notes, potted plant, and warm ambient sunlight' },
      { id: 'stage_spotlight', label: 'Palco de Evento com Holofotes', prompt: 'a dazzling illuminated keynote stage with bright colorful stage spotlights, cheering audience silhouettes, and celebratory confetti' },
      { id: 'candy_kitchen', label: 'Cozinha Gourmet de Confeitaria', prompt: 'a charming pastel kitchen bakery with colorful pastries, mixing bowls, flour dusting in warm cozy light' },
      { id: 'gamer_setup', label: 'Quarto Gamer com Luzes RGB', prompt: 'a high-end gaming room setup with multiple monitors, purple and teal neon LED strip illumination, and headphones' },
      { id: 'amusement_park', label: 'Parque de Diversões Iluminado', prompt: 'a festive magical amusement park at dusk with an illuminated ferris wheel, carnival lights, and cotton candy colors' },
    ],
  },
  {
    category: 'Metrópoles & Tecnologia',
    icon: '🏙️',
    items: [
      { id: 'cyber_rain', label: 'Metrópole Neon sob Chuva', prompt: 'a sprawling futuristic cyberpunk metropolis at night with glowing neon billboards and wet rain reflections on asphalt' },
      { id: 'cozy_cafe', label: 'Cafeteria Aconchegante em Paris', prompt: 'a warm sunlit vintage Parisian coffee shop with wooden tables, steaming mugs, and books by large glass windows' },
      { id: 'penthouse_night', label: 'Cobertura de Vidro com Vista Noturna', prompt: 'a luxurious modern glass penthouse terrace overlooking a sparkling city skyline at midnight' },
      { id: 'ai_lab', label: 'Laboratório Quântico de Hologramas', prompt: 'a high-tech clean white scientific laboratory with glowing floating blue holographic displays and sleek servers' },
      { id: 'subway_station', label: 'Estação de Metrô Synthwave', prompt: 'a moody retro-futuristic underground subway platform bathed in magenta and cyan neon tube lights' },
    ],
  },
  {
    category: 'Natureza & Aventura',
    icon: '🌲',
    items: [
      { id: 'mystic_forest', label: 'Floresta Encantada com Vaga-lumes', prompt: 'an ancient mystical bioluminescent forest with glowing green fireflies, mossy giant roots, and golden sun rays' },
      { id: 'snowy_peak', label: 'Pico Nevado sob Tempestade', prompt: 'a breathtaking frozen mountain peak in a blustery snow storm with jagged icy cliffs and dramatic mist' },
      { id: 'sunset_beach', label: 'Praia Tropical ao Pôr do Sol', prompt: 'a tranquil tropical ocean shore at golden sunset with gentle turquoise waves, pink sky, and swaying palm silhouettes' },
      { id: 'aurora_desert', label: 'Deserto sob Aurora Boreal', prompt: 'vast rolling golden sand dunes beneath a spectacular emerald and violet northern lights aurora night sky' },
      { id: 'crystal_cave', label: 'Caverna de Cristais Luminosos', prompt: 'a subterranean cavern illuminated by giant glowing amethyst and quartz crystal pillars reflecting in still water' },
    ],
  },
  {
    category: 'Fantasia Épica & Mística',
    icon: '🏰',
    items: [
      { id: 'throne_room', label: 'Salão do Trono Imperial', prompt: 'a grand Gothic imperial throne room with towering stained glass windows casting crimson and gold light on marble floors' },
      { id: 'arcane_library', label: 'Biblioteca Arcana com Livros Flutuantes', prompt: 'a magical multi-story circular wizard library with floating illuminated spellbooks and spiral wooden staircases' },
      { id: 'sky_ruins', label: 'Ruínas Flutuantes no Céu', prompt: 'ancient stone temple ruins floating high among fluffy white clouds with waterfalls cascading into the open air' },
      { id: 'volcano_bridge', label: 'Ponte de Pedra sobre Lava Vulcânica', prompt: 'a perilous ancient dark basalt bridge spanning across a bubbling glowing red volcanic chasm' },
      { id: 'sacred_temple', label: 'Templo Subaquático Sagrado', prompt: 'a majestic submerged sunlit sunken temple with coral formations, schools of iridescent fish, and water caustics' },
    ],
  },
  {
    category: 'Ficção Científica & Espaço',
    icon: '🚀',
    items: [
      { id: 'starship_bridge', label: 'Ponte de Comando de Nave Estelar', prompt: 'the high-tech panoramic bridge of a deep space starship looking out through viewports at distant colorful nebulae' },
      { id: 'alien_twin_moons', label: 'Planeta Alienígena com Duas Luas', prompt: 'an exotic alien world with purple flora, strange bioluminescent plants, and two massive twin moons in the night sky' },
      { id: 'orbital_station', label: 'Estação Espacial com Vista da Terra', prompt: 'an observation cupola inside an orbital space station with the blue curved horizon of planet Earth glowing in the window' },
      { id: 'mars_outpost', label: 'Base de Colonização em Marte', prompt: 'a dusty red Martian outpost with geodesic glass domes, solar arrays, and rusty red canyon mountains' },
    ],
  },
];

export const MOOD_PRESETS = [
  { id: 'alegria', label: 'Alegria Radiante & Triunfo', icon: '✨', color: 'from-amber-500 to-yellow-500', promptTerm: 'radiant pure joy, triumphant radiant smile, warm hopeful glow, celebratory optimism' },
  { id: 'furia', label: 'Fúria Cômica & Revolta', icon: '⚡', color: 'from-red-600 to-rose-700', promptTerm: 'fierce comic anger, fiery funny determination, clenched energetic tension, dramatic flair' },
  { id: 'tristeza', label: 'Tristeza & Melancolia Reflexiva', icon: '🌧️', color: 'from-blue-600 to-indigo-700', promptTerm: 'deep melancholic sorrow, emotional reflective gaze, adorable tear glistening, poetic heartbreak' },
  { id: 'determinacao', label: 'Determinação Heroica & Foco', icon: '🛡️', color: 'from-purple-600 to-indigo-600', promptTerm: 'unshakable heroic resolve, focused resolute eyes, fearless courageous posture, steadfast will' },
  { id: 'sarcasmo', label: 'Travesso & Piscadela Cúmplice', icon: '🎭', color: 'from-orange-500 to-amber-600', promptTerm: 'playful mischievous wink, charming witty half-smirk, witty arrogance, sharp playful gaze' },
  { id: 'serenidade', label: 'Paz & Serenidade Zen', icon: '🍃', color: 'from-emerald-600 to-teal-600', promptTerm: 'deep serene peace, inner tranquility, calm breathing, enlightened harmonious presence' },
  { id: 'tensao', label: 'Susto & Tensão Surpreendente', icon: '👁️', color: 'from-slate-700 to-zinc-900', promptTerm: 'funny shocked surprise, wide round alert eyes, tense heightened comic awareness, dramatic thrill' },
  { id: 'romance', label: 'Amor & Olhinhos de Coração', icon: '❤️', color: 'from-pink-600 to-rose-600', promptTerm: 'tender loving adorable gaze, hearts fluttering, sweet affectionate warmth, blushing fondness' },
  { id: 'curiosidade', label: 'Curiosidade & Espanto', icon: '🌌', color: 'from-cyan-600 to-blue-600', promptTerm: 'wonderstruck childlike awe, eyes wide with discovery, head tilted in curiosity, fascinated gaze' },
];

export const EXPRESSION_PRESETS = [
  { id: 'triunfante', label: 'Sorriso aberto e triunfante', promptTerm: 'wide confident triumphant smile, bright radiant expression' },
  { id: 'winking', label: 'Piscadela divertida e cúmplice', promptTerm: 'playful friendly wink, joyful eye crinkle, charming charismatic smile' },
  { id: 'crying_cute', label: 'Triste com olhinhos marejados (fofo)', promptTerm: 'big shiny watery puppy eyes, slightly downturned mouth, adorable sorrowful pout' },
  { id: 'surprised_gasp', label: 'Surpreso com olhos esbugalhados', promptTerm: 'wide shocked round eyes, open mouth in surprise, hilarious dramatic awe' },
  { id: 'feroz', label: 'Olhar feroz e desafiador', promptTerm: 'fierce intense challenging glare, knitted brows, hardened jaw' },
  { id: 'pensativo', label: 'Olhar compenetrado e pensativo', promptTerm: 'deeply thoughtful contemplative expression, looking slightly off-camera' },
  { id: 'heroic_fist', label: 'Confiante com determinação heroica', promptTerm: 'proud confident puffed-up chest, determined sparkling eyes, brave winning smile' },
  { id: 'sleepy_yawn', label: 'Sonolento e bocejando com preguiça', promptTerm: 'sleepy half-closed droopy eyes, cute wide yawn, relaxed comfy vibe' },
  { id: 'gargalhada', label: 'Gargalhada espontânea e viva', promptTerm: 'burst of hearty spontaneous laughter, crinkled smiling eyes' },
  { id: 'sereno', label: 'Expressão suave e serena', promptTerm: 'gentle serene face, calm relaxed eyelids, quiet graceful dignity' },
];

export const CLOTHING_PRESETS = [
  { id: 'default', label: 'Vestimenta Padrão / Original', promptTerm: 'signature character outfit as described' },
  { id: 'astronaut', label: 'Traje Espacial de Astronauta', promptTerm: 'cute tailored astronaut space suit with clear bubble glass helmet and mission patch' },
  { id: 'chef', label: 'Chef de Cozinha com Chapéu Toque', promptTerm: 'adorable white chef uniform with tall pleated toque hat and red neckerchief' },
  { id: 'vacation', label: 'Roupas de Férias de Verão & Óculos de Sol', promptTerm: 'colorful Hawaiian summer vacation floral shirt and stylish retro sunglasses' },
  { id: 'detective', label: 'Detetive Investigador com Chapéu Fedora', promptTerm: 'classic vintage trench coat, brown fedora hat, and brass magnifying glass' },
  { id: 'battle_armor', label: 'Armadura de Combate com Marcas de Batalha', promptTerm: 'heavy tactical battle armor with scratched metal plates, combat straps, and worn battle scuffs' },
  { id: 'tuxedo', label: 'Smoking Elegante com Gravata Borboleta', promptTerm: 'dapper tailored miniature black tuxedo suit with crisp white collar and red bow tie' },
  { id: 'streetwear', label: 'Streetwear Moderno & Jaqueta Confortável', promptTerm: 'stylish urban streetwear hoodie under a worn leather jacket with cargo pants and sneakers' },
  { id: 'mage_robes', label: 'Manto Arcano com Runas Luminosas', promptTerm: 'flowing mystical sorcerer robes with glowing golden runic embroidery along the hem and collar' },
  { id: 'tactical_specops', label: 'Traje Tático de Operações Especiais', promptTerm: 'sleek matte-black stealth tactical operative suit with utility harness and reinforced padding' },
];

export const CAMERA_PRESETS = [
  { id: 'portrait', label: 'Primeiro Plano (Retrato / Rosto)', promptTerm: 'close-up portrait focusing on facial features, expressive eyes, and emotional depth' },
  { id: 'medium', label: 'Plano Médio (Cintura para Cima)', promptTerm: 'medium shot from waist up, showing both facial expression and dynamic clothing posture' },
  { id: 'full', label: 'Plano Aberto (Corpo Inteiro no Cenário)', promptTerm: 'full body wide cinematic shot capturing the character interacting within the epic environment' },
  { id: 'action', label: 'Ângulo Dramático de Ação Dinâmica', promptTerm: 'low-angle dramatic dynamic perspective with motion blur hints and heroic framing' },
];

// Pre-seeded starter characters for immediate testing
export const DEFAULT_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char-aria',
    name: 'Aria Thorne',
    titleOrArchetype: 'Feiticeira das Estrelas & Guardiã Arcana',
    bio: 'Uma maga cósmica que canaliza constelações. Apesar de jovem, carrega a sabedoria de milênios e um coração leal.',
    appearance: {
      gender: 'Feminino',
      ageGroup: 'Jovem Adulta (24 anos)',
      hair: 'Cabelos platinados longos com tranças laterais e brilho sutil de poeira estelar',
      eyes: 'Olhos violeta profundos luminosos',
      skinOrTone: 'Pele clara com reflexos suaves azul-celeste',
      facialFeatures: 'Rosto oval elegante, maçãs do rosto esculpidas, lábios bem definidos',
      signatureDetails: 'Pequena marca rúnica lunar prateada brilhando na têmpora direita',
      bodyType: 'Esguia e altiva',
    },
    defaultClothing: 'Manto azul-marinho translúcido com broches de constelações em prata e espartilho de veludo',
    artStyle: 'Cinemático 3D (8K)',
    avatarImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'char-kaelen',
    name: 'Kaelen Vance',
    titleOrArchetype: 'Detetive Cibernético & Renegado Synth',
    bio: 'Ex-investigador da divisão de crimes quânticos de Neo-Metrópole, perspicaz, sarcástico e implacável contra injustiças.',
    appearance: {
      gender: 'Masculino',
      ageGroup: 'Adulto (32 anos)',
      hair: 'Cabelos pretos ondulados e desgrenhados com corte fade moderno',
      eyes: 'Olho esquerdo castanho natural e olho direito cibernético brilhando em ciano neon',
      skinOrTone: 'Pele morena clara com cicatriz sutil na bochecha',
      facialFeatures: 'Mandíbula quadrada pronunciada, barba rala por fazer, olhar penetrante e cínico',
      signatureDetails: 'Implante neural discreto na nuca que pulsa luz azulada fria',
      bodyType: 'Atlético e esguio',
    },
    defaultClothing: 'Sobretudo longo preto de couro sintético com gola alta e luvas táticas reforçadas',
    artStyle: 'Cyberpunk Neon Realism',
    avatarImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=85',
    createdAt: Date.now() - 3600000 * 18,
  },
  {
    id: 'char-maya',
    name: 'Maya Silveira',
    titleOrArchetype: 'Exploradora Solar & Arqueóloga de Ruínas',
    bio: 'Aventureira destemida que viaja pelos cantos mais selvagens do mundo em busca de artefatos perdidos e segredos ancestrais.',
    appearance: {
      gender: 'Feminino',
      ageGroup: 'Jovem Adulta (26 anos)',
      hair: 'Cabelos castanhos volumosos com cachos soltos presos em rabo de cavalo prático',
      eyes: 'Olhos castanho-dourados expressivos e calorosos',
      skinOrTone: 'Pele morena beijada pelo sol com sardas no nariz',
      facialFeatures: 'Sorriso carismático contagiante, nariz arrebitado e olhar inquisitivo',
      signatureDetails: 'Bandana vermelha desgastada amarrada no pulso esquerdo e colar com bússola de latão',
      bodyType: 'Atlética e ágil',
    },
    defaultClothing: 'Jaqueta utilitária cáqui sobre regata verde-oliva, calça cargo reforçada e botas de trilha',
    artStyle: 'Animação 3D Estilizada',
    avatarImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'char-sparky-mascote',
    name: 'Sparky & Cyber-Fox',
    titleOrArchetype: 'Mascote Oficial de Tecnologia & Criatividade',
    bio: 'Raposa antropomórfica carismática com jaleco tech e óculos de lentes holográficas. Embaixador oficial de criatividade e inovação, pronto para viver qualquer emoção ou aventura.',
    isMascot: true,
    appearance: {
      gender: 'Mascote Criatura (Raposa Antropomórfica)',
      ageGroup: 'Mascote Carismático e Expressivo',
      hair: 'Pelagem laranja vibrante com peito branco macio e orelhas pontiagudas expressivas',
      eyes: 'Olhos grandes amendoados ciano neon expressivos e amigáveis',
      skinOrTone: 'Pelos aveludados com gradiente sutil dourado',
      facialFeatures: 'Focinho arrebitado simpático, sorriso caloroso contagiante e bochechas cheias',
      signatureDetails: 'Óculos holográficos redondos com armação verde e cauda felpuda com ponta branca',
      bodyType: 'Estilizado 3D ágil e simpático',
    },
    defaultClothing: 'Colete esportivo azul com detalhes em prata e gravata borboleta vermelha',
    artStyle: 'Animação 3D Estilizada',
    avatarImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=85',
    importedImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=85',
    mascotDna: {
      speciesOrType: 'Raposa estilizada antropomórfica',
      colorPalette: ['#FF7A00 Laranja Vibrante', '#FFFFFF Branco Puro', '#06B6D4 Ciano Neon', '#EF4444 Vermelho'],
      distinctiveFeatures: ['Óculos holográficos verdes', 'Cauda felpuda com ponta branca', 'Olhos ciano brilhantes'],
      originalStyle: 'Animação 3D Estilizada (estilo Pixar)',
      signatureAccessories: ['Óculos redondos', 'Gravata borboleta'],
      consistencyAnchorPrompt: 'A charismatic friendly 3D Pixar-style stylized fox mascot, bright orange fur, cream white chest and snout, luminous cyan eyes, round green holographic goggles, big fluffy tail with white tip',
    },
    createdAt: Date.now() - 3600000 * 6,
  },
];

// Load characters from localStorage with seed fallback
export function loadSavedCharacters(): CharacterProfile[] {
  try {
    const raw = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar personagens:', err);
  }
  // Save seed default characters
  try {
    localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(DEFAULT_CHARACTERS));
  } catch {}
  return DEFAULT_CHARACTERS;
}

export function saveCharacter(character: CharacterProfile): CharacterProfile[] {
  const current = loadSavedCharacters();
  const index = current.findIndex((c) => c.id === character.id);
  let updated: CharacterProfile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = character;
  } else {
    updated = [character, ...current];
  }
  try {
    localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar personagem:', err);
  }
  return updated;
}

export function deleteCharacter(id: string): CharacterProfile[] {
  const current = loadSavedCharacters();
  const updated = current.filter((c) => c.id !== id);
  try {
    localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao remover personagem:', err);
  }
  return updated;
}

// Load character scenes (Storyboard)
export function loadCharacterScenes(characterId?: string): CharacterSceneResult[] {
  try {
    const raw = localStorage.getItem(SCENES_STORAGE_KEY);
    if (raw) {
      const parsed: CharacterSceneResult[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (characterId) {
          return parsed.filter((s) => s.characterId === characterId);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar cenas do personagem:', err);
  }
  return [];
}

export function saveCharacterScene(scene: CharacterSceneResult): CharacterSceneResult[] {
  const current = loadCharacterScenes();
  const updated = [scene, ...current.filter((s) => s.id !== scene.id)];
  try {
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch (err) {
    console.warn('Erro ao salvar cena:', err);
  }
  return updated;
}

export function deleteCharacterScene(sceneId: string): CharacterSceneResult[] {
  const current = loadCharacterScenes();
  const updated = current.filter((s) => s.id !== sceneId);
  try {
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao remover cena:', err);
  }
  return updated;
}

// Master prompt builder ensuring character or imported mascot visual anchor + obedience to scene and emotions
export function buildCharacterConsistencyPrompt(
  character: CharacterProfile,
  scene: CharacterSceneConfig
): string {
  const styleObj = ART_STYLES.find((s) => s.id === character.artStyle || s.label === character.artStyle);
  const styleKeywords = styleObj?.promptTerm || 'cinematic masterpiece, 8k, atmospheric illumination, highly detailed';

  // SCENARIO 1: Imported Mascot Fidelity Engine (Exatamente igual à imagem importada)
  if (character.isMascot || character.mascotDna) {
    const dna = character.mascotDna;
    const mascotIdentity = dna?.consistencyAnchorPrompt
      ? `${dna.consistencyAnchorPrompt}. Character mascot '${character.name}', a ${dna.speciesOrType || character.appearance.gender}. Palette tones: ${dna.colorPalette?.join(', ') || character.appearance.skinOrTone}. Iconic face: ${character.appearance.facialFeatures}, permanent signature markings: ${character.appearance.signatureDetails}`
      : `Iconic character mascot '${character.name}', a ${character.appearance.gender} (${character.titleOrArchetype}). Exact recognizable features: ${character.appearance.facialFeatures}, markings: ${character.appearance.signatureDetails}, body/fur: ${character.appearance.hair}, ${character.appearance.skinOrTone}`;

    const clothingDetail = scene.clothing || character.defaultClothing;
    const moodDetail = scene.mood;
    const expressionDetail = scene.expression;
    const settingDetail = scene.scenario;
    const cameraDetail = scene.cameraAngle || 'medium shot portrait';
    const lightingAtmosphere = scene.timeAndAtmosphere || 'dramatic volumetric cinematic lighting';

    return `${styleKeywords}. ${cameraDetail} of the EXACT SAME MASCOT: ${mascotIdentity}. Vividly experiencing emotion: ${moodDetail}, with clear visible emotional facial expression: ${expressionDetail}. Wearing: ${clothingDetail}. Location and environment: ${settingDetail}, illuminated by ${lightingAtmosphere}. Strict character design consistency, identical species and colors to reference image, masterpiece quality, expressive storytelling`;
  }

  // SCENARIO 2: Humanoid / Story Character Anchor
  const charIdentity = `Character '${character.name}', a ${character.appearance.gender} (${character.appearance.ageGroup}) ${character.titleOrArchetype}. Visual appearance: ${character.appearance.hair}, ${character.appearance.eyes}, ${character.appearance.skinOrTone}, ${character.appearance.facialFeatures}, ${character.appearance.signatureDetails}`;

  const clothingDetail = scene.clothing || character.defaultClothing;
  const moodDetail = scene.mood;
  const expressionDetail = scene.expression;
  const settingDetail = scene.scenario;
  const cameraDetail = scene.cameraAngle || 'medium shot portrait';
  const lightingAtmosphere = scene.timeAndAtmosphere || 'dramatic volumetric light';

  return `${styleKeywords}. ${cameraDetail} of ${charIdentity}. Wearing: ${clothingDetail}. Facial expression: ${expressionDetail}, vividly displaying ${moodDetail}. Environment and background: ${settingDetail}, with ${lightingAtmosphere}. Coherent facial anatomy, recognizable same character features across shots, rich cinematic storytelling, ultra-crisp focus`;
}

// Deep Vision-Powered Mascot DNA Analyzer
export async function analyzeMascotImage(
  base64Image: string,
  mimeType: string = 'image/png',
  mascotName?: string,
  notes?: string
): Promise<{
  success: boolean;
  dna: MascotDna & {
    name?: string;
    archetype?: string;
    defaultClothing?: string;
    suggestedBio?: string;
  };
}> {
  try {
    const res = await fetch('/api/analyze-mascot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, mimeType, mascotName, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.dna) return data;
    }
  } catch (err) {
    console.warn('Erro ao chamar /api/analyze-mascot:', err);
  }
  return {
    success: true,
    dna: {
      name: mascotName || 'Mascote Guardião',
      speciesOrType: 'Mascote carismático estilizado',
      archetype: 'Embaixador da Marca',
      artStyle: 'Animação 3D Estilizada',
      originalStyle: 'Animação 3D Estilizada',
      colorPalette: ['#7C3AED Roxo Vibrante', '#38BDF8 Ciano Iluminado', '#FFFFFF Branco Puro'],
      distinctiveFeatures: ['Silhueta icônica e cores da imagem original importada'],
      facialFeatures: 'Olhos expressivos e grandes, feições arredondadas e amigáveis',
      signatureDetails: 'Silhueta icônica e cores da imagem original importada',
      defaultClothing: 'Aparência original de referência',
      consistencyAnchorPrompt: 'A charismatic 3D stylized character mascot identical to reference, friendly eyes, exact same colors and features',
      suggestedBio: 'Mascote criado a partir da imagem importada de referência.',
    },
  };
}

// Generate an initial character avatar portrait
export async function generateCharacterAvatar(character: CharacterProfile): Promise<string> {
  const styleObj = ART_STYLES.find((s) => s.id === character.artStyle || s.label === character.artStyle);
  const styleKeywords = styleObj?.promptTerm || 'cinematic 8k portrait, studio lighting';

  const avatarPrompt = `${styleKeywords}, iconic close-up portrait of ${character.name}, a ${character.appearance.gender} ${character.titleOrArchetype}. Features: ${character.appearance.hair}, ${character.appearance.eyes}, ${character.appearance.skinOrTone}, ${character.appearance.facialFeatures}, ${character.appearance.signatureDetails}. Wearing ${character.defaultClothing}. Centered framing, neutral confident expression, majestic lighting, high detail, masterpiece portrait`;

  return await generateImage(avatarPrompt, '1:1', character.name);
}

// Generate in-character dialogue
export async function generateInCharacterDialogue(
  character: CharacterProfile,
  scene: CharacterSceneConfig
): Promise<string> {
  try {
    const res = await fetch('/api/generate-character-dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterName: character.name,
        archetype: character.titleOrArchetype,
        mood: scene.mood,
        expression: scene.expression,
        scenario: scene.scenario,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.dialogue) return data.dialogue;
    }
  } catch (err) {
    console.warn('Erro ao gerar fala do personagem:', err);
  }
  return `Minha trajetória é guiada por quem eu sou, mesmo diante da tempestade.`;
}

// Generate complete character scene
export async function createCharacterScene(
  character: CharacterProfile,
  sceneConfig: CharacterSceneConfig
): Promise<CharacterSceneResult> {
  const prompt = buildCharacterConsistencyPrompt(character, sceneConfig);
  const imageUrl = await generateImage(prompt, sceneConfig.aspectRatio || '1:1', character.name);

  let dialogue: string | undefined = undefined;
  if (sceneConfig.includeDialogue) {
    if (sceneConfig.customQuoteOrDialogue?.trim()) {
      dialogue = sceneConfig.customQuoteOrDialogue.trim();
    } else {
      dialogue = await generateInCharacterDialogue(character, sceneConfig);
    }
  }

  const result: CharacterSceneResult = {
    id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    characterId: character.id,
    characterName: character.name,
    sceneTitle: `${character.name} em ${sceneConfig.scenario.slice(0, 32)} (${sceneConfig.mood})`,
    imageUrl,
    prompt,
    dialogue,
    mood: sceneConfig.mood,
    expression: sceneConfig.expression,
    clothing: sceneConfig.clothing,
    scenario: sceneConfig.scenario,
    aspectRatio: sceneConfig.aspectRatio,
    isMascot: Boolean(character.isMascot),
    importedSourceImageUrl: character.importedImageUrl || character.avatarImageUrl,
    createdAt: Date.now(),
  };

  saveCharacterScene(result);
  return result;
}
