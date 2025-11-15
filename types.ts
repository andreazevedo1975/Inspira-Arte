
export interface QuoteAndPrompt {
  quote: string;
  imagePrompt: string;
}

export interface GenerationResult extends QuoteAndPrompt {
  imageUrl: string;
  isLoadingQuote: boolean;
}

export interface VisualIdentityPayload {
  brandName: string;
  slogan: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
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
}
