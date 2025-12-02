
import React, { useState, useCallback } from 'react';
import { ThemeInputForm } from './components/ThemeInputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { generateImagePromptFromTheme, generateImage, generateQuoteFromImage, generateVisualIdentity } from './services/geminiService';
import type { GenerationResult, VisualIdentityResult, GeneratePayload } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { VisualIdentityForm } from './components/VisualIdentityForm';
import { VisualIdentityResultDisplay } from './components/VisualIdentityResultDisplay';

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};


const App: React.FC = () => {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New state for visual identity
  const [visualIdentityResult, setVisualIdentityResult] = useState<VisualIdentityResult | null>(null);
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState<boolean>(false);
  const [identityError, setIdentityError] = useState<string | null>(null);


 const handleGenerate = useCallback(async (payload: GeneratePayload) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const selectedAspectRatio = payload.aspectRatio || '1:1';

    try {
        let promptText = '';
        let imageBase64 = '';
        let mimeType = 'image/jpeg';
        let imageUrl = '';

        // Steps 1 & 2: Get the image data (either by generating or uploading)
        if (payload.mode === 'upload') {
            const file = payload.value as File;
            promptText = 'Imagem enviada pelo usuário.';
            mimeType = file.type;
            // Get base64 and object URL concurrently
            [imageBase64, imageUrl] = await Promise.all([
                fileToBase64(file),
                Promise.resolve(URL.createObjectURL(file))
            ]);
        } else { // 'theme' or 'prompt'
            const userInput = payload.value as string;
            
            if (payload.mode === 'theme') {
                promptText = await generateImagePromptFromTheme(userInput);
            } else { // 'prompt'
                promptText = userInput;
            }
            
            // Show prompt while image generates
            setResult({ quote: '', imagePrompt: promptText, imageUrl: '', isLoadingQuote: true, aspectRatio: selectedAspectRatio });

            imageBase64 = await generateImage(promptText, selectedAspectRatio);
            imageUrl = `data:${mimeType};base64,${imageBase64}`;
        }

        // Show image and indicate quote is loading
        setResult({
            quote: '',
            imagePrompt: promptText,
            imageUrl: imageUrl,
            isLoadingQuote: true,
            aspectRatio: selectedAspectRatio,
        });

        // Step 3: Generate quote from the image
        const finalQuote = await generateQuoteFromImage(imageBase64, mimeType);

        // Final update with the quote
        setResult(prev => prev ? { ...prev, quote: finalQuote, isLoadingQuote: false } : null);

    } catch (err) {
        console.error(err);
        setError('Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.');
        setResult(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // New handler for visual identity
  const handleGenerateIdentity = useCallback(async (file: File, description: string) => {
    setIsGeneratingIdentity(true);
    setIdentityError(null);
    setVisualIdentityResult(null);

    try {
      const base64Image = await fileToBase64(file);
      
      const payload = await generateVisualIdentity(base64Image, file.type, description);

      setVisualIdentityResult({
        ...payload,
        uploadedImageUrl: URL.createObjectURL(file),
        mascotImageUrl: '',
        isLoadingMascot: true,
      });

      const mascotImageUrl = await generateImage(payload.mascotPrompt, '1:1'); // Mascots default to 1:1

      setVisualIdentityResult(prev => {
        if (!prev) return null;
        return { ...prev, mascotImageUrl: `data:image/jpeg;base64,${mascotImageUrl}`, isLoadingMascot: false };
      });

    } catch (err) {
      console.error(err);
      setIdentityError('Ocorreu um erro ao gerar a identidade visual. Tente novamente.');
      setVisualIdentityResult(null);
    } finally {
      setIsGeneratingIdentity(false);
    }
  }, []);

  const handleQuoteChange = (newQuote: string) => {
    setResult(prevResult => {
      if (!prevResult) return null;
      return { ...prevResult, quote: newQuote };
    });
  };
  
  const handleIdentityChange = (field: 'brandName' | 'slogan', value: string) => {
      setVisualIdentityResult(prevResult => {
          if (!prevResult) return null;
          return { ...prevResult, [field]: value };
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3">
            <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Inspira Arte
            </h1>
          </div>
          <p className="mt-3 text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Crie arte inspiradora a partir de um tema, um prompt, ou sua própria imagem.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <ThemeInputForm onGenerate={handleGenerate} isLoading={isLoading} />
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <p>{error}</p>
            </div>
          )}

          <ResultDisplay result={result} isLoading={isLoading} onQuoteChange={handleQuoteChange} />

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-900 px-2 text-gray-500">
                <SparklesIcon className="w-5 h-5" />
              </span>
            </div>
          </div>
          
          {/* Part 2: Visual Identity Generator */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-200">
              Crie uma Identidade Visual
            </h2>
            <p className="mt-2 text-base text-gray-400 max-w-2xl mx-auto">
              Envie uma imagem, descreva seu projeto e crie uma identidade de marca com mascote.
            </p>
          </div>

          <VisualIdentityForm onGenerate={handleGenerateIdentity} isLoading={isGeneratingIdentity} />
          {identityError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <p>{identityError}</p>
            </div>
          )}
          <VisualIdentityResultDisplay result={visualIdentityResult} onIdentityChange={handleIdentityChange} />

        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Criado com React, Tailwind CSS e Gemini API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
