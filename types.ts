export interface QuoteAndPrompt {
  quote: string;
  imagePrompt: string;
  author?: string;
}

export interface GenerationResult extends QuoteAndPrompt {
  imageUrl: string;
  isLoadingQuote: boolean;
  aspectRatio?: string;
  styleName?: string;
  theme?: string;
}

export interface RecentProject {
  id: string;
  createdAt: number;
  result: GenerationResult;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface VisualIdentityPayload {
  brandName: string;
  slogan: string;
  story?: string;
  colorPalette: ColorPalette;
  mascotPrompt: string;
}

export interface VisualIdentityResult extends VisualIdentityPayload {
  uploadedImageUrl: string;
  mascotImageUrl: string;
  isLoadingMascot: boolean;
}

export interface GeneratePayload {
  mode: 'theme' | 'prompt' | 'upload';
  value: string | File;
  aspectRatio?: string;
  style?: string;
  tone?: string;
}

export type LogoLayout = 'vertical' | 'horizontal' | 'badge' | 'icon-only';
export type LogoStyle = 'minimalist' | 'luxury' | 'tech' | 'organic' | 'geometric' | 'monogram';
export type BadgeShape = 'none' | 'circle' | 'square' | 'hexagon' | 'shield' | 'diamond';

export interface LogoConfig {
  brandName: string;
  slogan: string;
  industry: string;
  style: LogoStyle;
  symbolId: string;
  layout: LogoLayout;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  sloganFontFamily: string;
  fontSize: number;
  sloganSize: number;
  letterSpacing: number;
  iconSize: number;
  badgeShape: BadgeShape;
  isGradient: boolean;
  showSlogan: boolean;
  uppercase: boolean;
}

export interface LogoDesignResult {
  conceptName: string;
  designRationale: string;
  suggestedColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  symbolId: string;
  fontFamily: string;
  layout: LogoLayout;
  aiRenderUrl?: string;
}

export type ColorHarmonyType =
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'analogous-accent'
  | 'tetradic';

export interface PaletteColor {
  hex: string;
  name: string;
  role: string;
  rgb: string;
  hsl: string;
  isLight: boolean;
}

export interface GeneratedComplementaryPalette {
  title: string;
  harmonyType: ColorHarmonyType;
  source: 'image' | 'theme';
  sourceValue: string;
  description: string;
  colors: PaletteColor[];
}

export interface QuoteToneOption {
  id: string;
  name: string;
  category: string;
  iconEmoji: string;
  desc: string;
  badgeColor: string;
}

export interface FeelingTopicCategory {
  id: string;
  label: string;
  iconEmoji: string;
  associatedTone: string;
  topics: string[];
}

export interface MascotDna {
  speciesOrType: string;
  colorPalette: string[];
  distinctiveFeatures: string[];
  originalStyle: string;
  artStyle?: string;
  facialFeatures?: string;
  signatureDetails?: string;
  signatureAccessories?: string[];
  consistencyAnchorPrompt?: string;
}

export interface CharacterAppearance {
  gender: string;
  ageGroup: string;
  hair: string;
  eyes: string;
  skinOrTone: string;
  facialFeatures: string;
  signatureDetails: string;
  bodyType?: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  titleOrArchetype: string;
  bio: string;
  appearance: CharacterAppearance;
  defaultClothing: string;
  artStyle: string;
  avatarImageUrl?: string;
  isMascot?: boolean;
  importedImageUrl?: string;
  mascotDna?: MascotDna;
  createdAt: number;
}

export interface CharacterSceneConfig {
  characterId: string;
  scenario: string;
  scenarioCategory?: string;
  mood: string;
  expression: string;
  clothing: string;
  cameraAngle: string;
  timeAndAtmosphere?: string;
  aspectRatio: string;
  includeDialogue: boolean;
  customQuoteOrDialogue?: string;
  preserveExactMascotFidelity?: boolean;
}

export interface CharacterSceneResult {
  id: string;
  characterId: string;
  characterName: string;
  sceneTitle: string;
  imageUrl: string;
  prompt: string;
  dialogue?: string;
  mood: string;
  expression: string;
  clothing: string;
  scenario: string;
  aspectRatio: string;
  isMascot?: boolean;
  importedSourceImageUrl?: string;
  createdAt: number;
}

export type TextLegibilityMode = 'shadow' | 'stroke' | 'backdrop' | 'combo' | 'none';

export type ArtisticFilterId =
  | 'none'
  | 'sepia'
  | 'bw'
  | 'vintage'
  | 'cyberpunk'
  | 'cinematic'
  | 'golden_hour'
  | 'noir'
  | 'dreamy_pastel'
  | 'vaporwave';

export interface ArtisticFilterOption {
  id: ArtisticFilterId;
  label: string;
  shortLabel: string;
  category: 'Clássico' | 'Cinema & Retrô' | 'Futurista & Neon' | 'Luz & Atmosfera';
  description: string;
  previewHue: string;
  vignette?: boolean;
}

