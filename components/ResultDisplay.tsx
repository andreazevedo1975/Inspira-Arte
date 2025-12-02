import React, { useState, useEffect, useRef } from 'react';
import type { GenerationResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { generateImageVariations } from '../services/geminiService';
// @ts-ignore
import html2canvas from 'html2canvas';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
  onQuoteChange: (newQuote: string) => void;
}

interface CustomizationState {
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  overlayColor: string;
  overlayOpacity: number;
  verticalPosition: number; // 0 to 100%
}

const STORAGE_KEY = 'inspira-arte-customization';

const PRESETS = [
  { name: 'Original', color: '#000000', opacity: 0 },
  { name: 'Sombrio', color: '#000000', opacity: 0.5 },
  { name: 'Claro', color: '#ffffff', opacity: 0.2 },
  { name: 'Quente', color: '#f59e0b', opacity: 0.3 },
  { name: 'Frio', color: '#3b82f6', opacity: 0.3 },
  { name: 'Roxo', color: '#7e22ce', opacity: 0.3 },
  { name: 'Sépia', color: '#78350f', opacity: 0.4 },
];

// Expanded Font Options with Categories
const DEFAULT_FONT_OPTIONS = [
    // Sans Serif
    { value: "'Roboto', sans-serif", label: 'Roboto (Modern)' },
    { value: "'Open Sans', sans-serif", label: 'Open Sans (Clean)' },
    { value: "'Montserrat', sans-serif", label: 'Montserrat (Geo)' },
    { value: "'Lato', sans-serif", label: 'Lato (Friendly)' },
    { value: "'Poppins', sans-serif", label: 'Poppins (Soft)' },
    { value: "'Raleway', sans-serif", label: 'Raleway (Elegant)' },
    { value: "'Nunito', sans-serif", label: 'Nunito (Rounded)' },
    { value: "'Quicksand', sans-serif", label: 'Quicksand (Round)' },
    { value: "'Ubuntu', sans-serif", label: 'Ubuntu (Tech)' },
    
    // Serif
    { value: "'Playfair Display', serif", label: 'Playfair (Classic)' },
    { value: "'Merriweather', serif", label: 'Merriweather (Book)' },
    { value: "'Lora', serif", label: 'Lora (Calligraphic)' },
    { value: "'PT Serif', serif", label: 'PT Serif (Formal)' },
    { value: "'Libre Baskerville', serif", label: 'Baskerville (Trad)' },
    { value: "'Cinzel', serif", label: 'Cinzel (Roman)' },
    { value: "'Cormorant Garamond', serif", label: 'Cormorant (Fancy)' },

    // Handwriting / Script
    { value: "'Dancing Script', cursive", label: 'Dancing Script' },
    { value: "'Pacifico', cursive", label: 'Pacifico (Fun)' },
    { value: "'Great Vibes', cursive", label: 'Great Vibes (Elegant)' },
    { value: "'Satisfy', cursive", label: 'Satisfy (Brush)' },
    { value: "'Caveat', cursive", label: 'Caveat (Natural)' },
    { value: "'Shadows Into Light', cursive", label: 'Shadows (Neat)' },
    { value: "'Indie Flower', cursive", label: 'Indie Flower (Bubbly)' },
    { value: "'Sacramento', cursive", label: 'Sacramento (Mono)' },
    
    // Display / Impact
    { value: "'Oswald', sans-serif", label: 'Oswald (Bold)' },
    { value: "'Anton', sans-serif", label: 'Anton (Tall)' },
    { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue (Caps)' },
    { value: "'Righteous', cursive", label: 'Righteous (Sci-Fi)' },
    { value: "'Abril Fatface', cursive", label: 'Abril (Heavy)' },
    { value: "'Alfa Slab One', cursive", label: 'Alfa Slab (Chunky)' },
    { value: "'Amatic SC', cursive", label: 'Amatic SC (Thin)' },
    { value: "'Permanent Marker', cursive", label: 'Marker (Bold)' },

    // Monospace
    { value: "'Roboto Mono', monospace", label: 'Roboto Mono' },
    { value: "'Inconsolata', monospace", label: 'Inconsolata' },
];

const TEXT_COLOR_PRESETS = [
    '#ffffff', // White
    '#000000', // Black
    '#FFD700', // Gold
    '#E0E0E0', // Light Gray
    '#F0F8FF', // Alice Blue
    '#FF69B4', // Hot Pink
    '#00FFFF', // Cyan
    '#FF4500', // Orange Red
];

const AlignLeftIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>;
const AlignCenterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="10" x2="7" y2="10"></line><line x1="19" y1="14" x2="5" y2="14"></line><line x1="17" y1="18" x2="7" y2="18"></line></svg>;
const AlignRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>;
const DownloadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const UploadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const VariationsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M6 12H2"/><path d="m7.8 7.8-2.9-2.9"/></svg>;

const VertTopIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><rect x="5" y="10" width="14" height="8" rx="2"></rect></svg>;
const VertMiddleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><rect x="5" y="8" width="14" height="8" rx="2" fillOpacity="0.1"></rect></svg>;
const VertBottomIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="18" x2="21" y2="18"></line><rect x="5" y="6" width="14" height="8" rx="2"></rect></svg>;
const ChevronDownIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;

const Placeholder: React.FC = () => (
    <div className="text-center text-gray-500 py-16 border-2 border-dashed border-gray-700 rounded-xl">
        <p>Sua arte inspiradora aparecerá aqui.</p>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, onQuoteChange }) => {
  const [customization, setCustomization] = useState<CustomizationState>(() => {
    const defaultState: CustomizationState = {
        fontFamily: "'Roboto', sans-serif",
        fontSize: 28,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: true,
        overlayColor: '#000000',
        overlayOpacity: 0.3,
        verticalPosition: 50,
    };

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch (error) {
        console.warn('Erro ao carregar configurações do localStorage:', error);
        return defaultState;
    }
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [customFonts, setCustomFonts] = useState<{value: string, label: string}[]>([]);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Variations State
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
            setIsFontDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state with prop changes (new generation)
  useEffect(() => {
    if (result?.imageUrl) {
        setAvailableImages([result.imageUrl]);
        setSelectedImageIndex(0);
    }
  }, [result?.imageUrl]);

  useEffect(() => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
    } catch (error) {
        console.warn('Erro ao salvar configurações no localStorage:', error);
    }
  }, [customization]);

  const handleDownload = async () => {
    if (!imageContainerRef.current) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(imageContainerRef.current, {
            useCORS: true,
            scale: 2, 
            backgroundColor: null,
            logging: false,
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `inspira-arte-${Date.now()}.png`;
        link.click();
    } catch (error) {
        console.error("Erro ao baixar a imagem:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleFontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const fontData = e.target?.result as string;
        // Clean the file name to be a safe font family name
        const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "");
        
        try {
            const fontFace = new FontFace(fontName, `url(${fontData})`);
            fontFace.load().then((loadedFace) => {
                // @ts-ignore - document.fonts is valid in modern browsers
                document.fonts.add(loadedFace);
                
                const newFontOption = { value: fontName, label: `${fontName} (Upload)` };
                setCustomFonts(prev => [...prev, newFontOption]);
                setCustomization(prev => ({ ...prev, fontFamily: fontName }));
            }).catch(err => {
                console.error("Failed to load font:", err);
                alert("Erro ao carregar a fonte. Tente outro arquivo.");
            });
        } catch (err) {
            console.error("Error creating FontFace:", err);
        }
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleGenerateVariations = async () => {
    if (!result?.imagePrompt) return;
    setIsGeneratingVariations(true);

    try {
        // Use default if no aspectRatio provided
        const aspectRatio = result.aspectRatio || '1:1';
        const newImages = await generateImageVariations(result.imagePrompt, aspectRatio);
        
        setAvailableImages(prev => [...prev, ...newImages]);
        // Switch to the first of the new images
        setSelectedImageIndex(prev => prev + 1);
    } catch (error) {
        console.error('Failed to generate variations:', error);
        alert('Falha ao gerar variações. Tente novamente.');
    } finally {
        setIsGeneratingVariations(false);
    }
  };

  const allFontOptions = [...DEFAULT_FONT_OPTIONS, ...customFonts];
  const selectedFontLabel = allFontOptions.find(f => f.value === customization.fontFamily)?.label || 'Selecione';

  if (isLoading && !result) {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <LoadingSpinner text="Iniciando o processo criativo..." />
        </div>
    );
  }

  if (!result) {
    return <Placeholder />;
  }

  // Calculate aspectRatio style
  const aspectRatioStyle = result.aspectRatio 
      ? { aspectRatio: result.aspectRatio.replace(':', '/') } 
      : { aspectRatio: '16/9' };

  // Determine current image to display
  const currentImageUrl = availableImages[selectedImageIndex] || result.imageUrl;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg animate-fade-in">
      <div className="space-y-6">
        {/* Image Display with Overlay */}
        <div className="flex justify-center w-full">
            <div 
                ref={imageContainerRef}
                className="relative w-full max-w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700 group shadow-inner transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] mx-auto"
                style={aspectRatioStyle}
            >
            {currentImageUrl ? (
                <>
                <img 
                    src={currentImageUrl} 
                    alt="Arte gerada" 
                    className="object-cover w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-105" 
                    crossOrigin="anonymous"
                />
                
                {/* Color Overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{ backgroundColor: customization.overlayColor, opacity: customization.overlayOpacity }}
                />

                {/* Text Overlay */}
                {result.quote && (
                    <div className="absolute inset-0 pointer-events-none">
                        <p
                            style={{
                                fontFamily: customization.fontFamily,
                                fontSize: `${customization.fontSize}px`,
                                color: customization.color,
                                textAlign: customization.textAlign,
                                textShadow: customization.textShadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                                whiteSpace: 'pre-wrap',
                                width: '100%',
                                padding: '0 3rem', // Add horizontal padding to prevent text touching edges
                                lineHeight: 1.4,
                                zIndex: 10,
                                position: 'absolute',
                                top: `${customization.verticalPosition}%`,
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                            className="transition-all duration-300 break-words"
                        >
                            {result.quote}
                        </p>
                    </div>
                )}
                </>
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                    <LoadingSpinner text="Gerando a imagem... isso pode levar um momento." />
                </div>
            )}
            </div>
        </div>

        {/* Variations Thumbnails */}
        {availableImages.length > 0 && !isPreviewMode && (
            <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium ml-1">Variações</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
                    {availableImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                                selectedImageIndex === idx 
                                ? 'border-purple-500 ring-2 ring-purple-500/50' 
                                : 'border-gray-700 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt={`Variação ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                    
                    {/* Placeholder for loading state in thumbnails list */}
                    {isGeneratingVariations && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-800 border-2 border-gray-700 animate-pulse flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Action Buttons: Generate Variations, Preview Toggle & Download */}
        <div className="flex flex-wrap justify-end gap-3">
             {!isPreviewMode && result.imagePrompt && (
                 <button
                    onClick={handleGenerateVariations}
                    disabled={isGeneratingVariations || isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors border bg-purple-900/30 text-purple-300 border-purple-500/50 hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Gerar 3 novas variações desta imagem"
                >
                    {isGeneratingVariations ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <VariationsIcon />
                    )}
                    {isGeneratingVariations ? 'Criando...' : 'Gerar Variações'}
                </button>
             )}

             <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors border ${
                    isPreviewMode 
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500 hover:bg-purple-600/30' 
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                }`}
                title={isPreviewMode ? "Voltar para edição" : "Visualizar sem controles"}
            >
                {isPreviewMode ? <EditIcon /> : <EyeIcon />}
                {isPreviewMode ? 'Editar' : 'Visualizar'}
            </button>

            <button
                onClick={handleDownload}
                disabled={isDownloading || !currentImageUrl}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isDownloading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <DownloadIcon />
                )}
                {isDownloading ? 'Baixando...' : 'Baixar Imagem'}
            </button>
        </div>

        {/* Customization Controls Area (Hidden in Preview Mode) */}
        {!isPreviewMode && (
            <div className="animate-fade-in space-y-6">
                <div className="grid lg:grid-cols-2 gap-4">
                    
                    {/* 1. Text Customization */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                            <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Texto
                            </h3>
                            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none hover:text-gray-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={customization.textShadow}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, textShadow: e.target.checked }))}
                                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                                />
                                Sombra
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {/* Font Family Custom Dropdown */}
                            <div className="col-span-2 sm:col-span-1 relative" ref={fontDropdownRef}>
                                <label className="text-xs text-gray-400 block mb-1">Fonte</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1.5 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none transition-colors flex justify-between items-center text-left"
                                        style={{ fontFamily: customization.fontFamily.includes('Upload') ? 'inherit' : customization.fontFamily }}
                                    >
                                        <span className="truncate mr-2">{selectedFontLabel}</span>
                                        <ChevronDownIcon />
                                    </button>

                                    <input 
                                        type="file" 
                                        accept=".ttf,.otf" 
                                        onChange={handleFontUpload}
                                        className="hidden" 
                                        ref={fileInputRef} 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 rounded-md px-2.5 py-1.5 transition-colors"
                                        title="Carregar fonte (ttf, otf)"
                                    >
                                        <UploadIcon />
                                    </button>
                                </div>

                                {/* Custom Dropdown Menu with Previews */}
                                {isFontDropdownOpen && (
                                    <div className="absolute z-50 left-0 top-full mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                        {allFontOptions.map((font) => (
                                            <button
                                                key={font.value}
                                                type="button"
                                                onClick={() => {
                                                    setCustomization(prev => ({ ...prev, fontFamily: font.value }));
                                                    setIsFontDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-900/50 transition-colors flex items-center justify-between ${customization.fontFamily === font.value ? 'bg-purple-900/30 text-purple-300' : 'text-gray-200'}`}
                                            >
                                                <span style={{ fontFamily: font.value }} className="text-base">
                                                    {font.label.split('(')[0].trim()}
                                                </span>
                                                <span className="text-[10px] text-gray-500 ml-2">
                                                    {font.label.includes('(') ? font.label.split('(')[1].replace(')', '') : 'Custom'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Font Size */}
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs text-gray-400 block mb-1 flex justify-between">
                                <span>Tamanho</span>
                                <span>{customization.fontSize}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="14"
                                    max="64"
                                    value={customization.fontSize}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Color */}
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs text-gray-400 block mb-1">Cor do Texto</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative overflow-hidden w-8 h-8 rounded-full border border-gray-600 flex-shrink-0">
                                        <input
                                            type="color"
                                            value={customization.color}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, color: e.target.value }))}
                                            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {TEXT_COLOR_PRESETS.map(presetColor => (
                                            <button
                                                key={presetColor}
                                                type="button"
                                                onClick={() => setCustomization(prev => ({ ...prev, color: presetColor }))}
                                                className="w-6 h-6 rounded-full border border-gray-600 hover:scale-110 transition-transform focus:ring-1 focus:ring-purple-500"
                                                style={{ backgroundColor: presetColor }}
                                                aria-label={`Selecionar cor ${presetColor}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Alignment (Horizontal) */}
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs text-gray-400 block mb-1">Alinhamento</label>
                                <div className="flex bg-gray-800 rounded-md border border-gray-600 p-0.5 h-8">
                                    {(['left', 'center', 'right'] as const).map((align) => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => setCustomization(prev => ({ ...prev, textAlign: align }))}
                                            title={align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                                            className={`flex-1 rounded text-xs transition-colors font-medium flex items-center justify-center ${customization.textAlign === align ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
                                        >
                                            {align === 'left' ? <AlignLeftIcon /> : align === 'center' ? <AlignCenterIcon /> : <AlignRightIcon />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vertical Position */}
                            <div className="col-span-2">
                                <label className="text-xs text-gray-400 block mb-1 flex justify-between">
                                    <span>Posição Vertical</span>
                                    <span>{Math.round(customization.verticalPosition)}%</span>
                                </label>
                                <div className="flex gap-2 items-center">
                                    {/* Quick Presets */}
                                    <div className="flex bg-gray-800 rounded-md border border-gray-600 p-0.5 h-8 shrink-0">
                                        <button 
                                            onClick={() => setCustomization(prev => ({ ...prev, verticalPosition: 15 }))} 
                                            title="Topo"
                                            className="w-8 h-full rounded text-xs transition-colors flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                        >
                                            <VertTopIcon/>
                                        </button>
                                        <button 
                                            onClick={() => setCustomization(prev => ({ ...prev, verticalPosition: 50 }))} 
                                            title="Centro"
                                            className="w-8 h-full rounded text-xs transition-colors flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                        >
                                            <VertMiddleIcon/>
                                        </button>
                                        <button 
                                            onClick={() => setCustomization(prev => ({ ...prev, verticalPosition: 85 }))} 
                                            title="Base"
                                            className="w-8 h-full rounded text-xs transition-colors flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                        >
                                            <VertBottomIcon/>
                                        </button>
                                    </div>
                                    {/* Slider */}
                                    <input
                                        type="range"
                                        min="5"
                                        max="95"
                                        value={customization.verticalPosition}
                                        onChange={(e) => setCustomization(prev => ({ ...prev, verticalPosition: Number(e.target.value) }))}
                                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 2. Filter & Atmosphere Customization */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>
                                Filtro e Atmosfera
                            </h3>
                            
                            {/* Palette Presets */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.name}
                                        onClick={() => setCustomization(prev => ({ ...prev, overlayColor: preset.color, overlayOpacity: preset.opacity }))}
                                        className="px-2 py-1 text-xs rounded border border-gray-600 hover:border-pink-400 transition-colors"
                                        style={{ 
                                            backgroundColor: preset.color === '#000000' && preset.opacity === 0 ? 'transparent' : preset.color,
                                            color: (parseInt(preset.color.replace('#', ''), 16) > 0xffffff / 2) && preset.opacity > 0.3 ? '#000' : '#fff'
                                        }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Overlay Color Input */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Cor do Filtro</label>
                                <div className="flex gap-2 h-8">
                                    <div className="relative overflow-hidden w-10 h-full rounded border border-gray-600">
                                        <input
                                            type="color"
                                            value={customization.overlayColor}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, overlayColor: e.target.value }))}
                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={customization.overlayColor}
                                        onChange={(e) => setCustomization(prev => ({...prev, overlayColor: e.target.value}))}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 text-xs font-mono text-gray-400 focus:outline-none focus:border-pink-500"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            
                            {/* Intensity Slider */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1 flex justify-between">
                                    <span>Intensidade</span>
                                    <span>{Math.round(customization.overlayOpacity * 100)}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={customization.overlayOpacity}
                                    onChange={(e) => setCustomization(prev => ({ ...prev, overlayOpacity: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote and Prompt Editors */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quote Editor */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600 flex flex-col">
                        <label htmlFor="quote-editor" className="text-sm font-semibold text-purple-400 mb-2 block">
                        Editar Frase
                        </label>
                        {result.isLoadingQuote ? (
                            <LoadingSpinner text="Analisando a imagem para criar a frase..." />
                        ) : (
                            <textarea
                            id="quote-editor"
                            value={result.quote}
                            onChange={(e) => onQuoteChange(e.target.value)}
                            rows={3}
                            className="w-full flex-grow bg-transparent text-xl italic text-gray-200 p-1 border-0 focus:ring-2 focus:ring-purple-500 rounded-md resize-none transition-all placeholder-gray-600"
                            placeholder="Sua frase aparecerá aqui..."
                            />
                        )}
                    </div>

                    {/* Image Prompt Display */}
                    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
                        <h3 className="text-sm font-semibold text-pink-400 mb-2">Prompt de Imagem</h3>
                        <p className="text-sm text-gray-400 font-mono bg-black/30 p-3 rounded-md break-words h-full max-h-40 overflow-y-auto custom-scrollbar">
                            {result.imagePrompt}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};