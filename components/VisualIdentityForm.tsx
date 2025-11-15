
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface VisualIdentityFormProps {
  onGenerate: (file: File, description: string) => void;
  isLoading: boolean;
}

export const VisualIdentityForm: React.FC<VisualIdentityFormProps> = ({ onGenerate, isLoading }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        setError('O arquivo é muito grande. O limite é 4MB.');
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !description.trim()) {
      setError('Por favor, envie uma imagem e preencha a descrição.');
      return;
    }
    setError(null);
    onGenerate(file, description);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
              1. Envie uma Imagem
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Pré-visualização" className="mx-auto h-24 w-auto rounded-md" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-400 justify-center">
                  <label htmlFor="image-upload-input" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-purple-500">
                    <span>Carregar um arquivo</span>
                    <input id="image-upload-input" name="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={isLoading} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP até 4MB</p>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              2. Descreva seu Projeto
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Uma cafeteria artesanal focada em produtos orgânicos e um ambiente aconchegante."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <div className="pt-2">
            <button
            type="submit"
            disabled={isLoading || !file || !description.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 text-lg"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando Identidade...
                </>
            ) : (
                <>
                <SparklesIcon className="w-5 h-5" />
                Gerar Identidade Visual
                </>
            )}
            </button>
        </div>
      </form>
    </div>
  );
};
