import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Check, X, Building2, Lightbulb } from 'lucide-react';

interface VisualIdentityFormProps {
  onGenerate: (file: File, description: string) => void;
  isLoading: boolean;
}

const SAMPLE_PROJECTS = [
  'Cafeteria artesanal focada em sustentabilidade e café especial de pequenos produtores.',
  'Estúdio de bem-estar, yoga e meditação com atmosfera minimalista e serena.',
  'Startup de tecnologia e inteligência artificial para criadores de conteúdo.',
  'Marca de moda consciente com tecidos orgânicos e estética urbana contemporânea.',
];

export const VisualIdentityForm: React.FC<VisualIdentityFormProps> = ({ onGenerate, isLoading }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.size > 8 * 1024 * 1024) {
      setError('O arquivo é muito grande. O limite máximo é 8MB.');
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !description.trim()) {
      setError('Por favor, envie uma imagem de referência e preencha a descrição do projeto.');
      return;
    }
    setError(null);
    onGenerate(file, description.trim());
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* STEP 1: IMAGE UPLOAD */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500 text-violet-300 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Imagem de Referência ou Inspiração Visual:</span>
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
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] ${
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
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
                className="hidden"
                disabled={isLoading}
              />

              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Prévia de Referência"
                    className="max-h-36 rounded-lg shadow-md border border-slate-700 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {file?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-violet-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Clique ou arraste uma imagem aqui
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG ou WEBP até 8MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: PROJECT DESCRIPTION */}
          <div className="space-y-2">
            <label htmlFor="project-desc" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500 text-violet-300 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Descreva seu Projeto / Negócio:</span>
            </label>

            <textarea
              id="project-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Uma cafeteria artesanal focada em sustentabilidade e aconchego..."
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-100 placeholder-slate-500 text-sm shadow-inner transition-all outline-none resize-none"
              disabled={isLoading}
            />

            {/* Quick Inspiration Chips */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" /> Exemplos rápidos para testar:
              </span>
              <div className="flex flex-wrap gap-1">
                {SAMPLE_PROJECTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescription(sample)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors truncate max-w-xs text-left"
                  >
                    {sample.slice(0, 45)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !file || !description.trim()}
            className="w-full relative group overflow-hidden rounded-xl font-bold text-white text-base py-4 px-6 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:shadow-violet-600/25"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Construindo Identidade Visual & Mascote...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Gerar Identidade Visual Completa com Mascote</span>
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
