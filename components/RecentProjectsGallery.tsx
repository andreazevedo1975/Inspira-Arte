import React, { useState } from 'react';
import type { RecentProject, GenerationResult } from '../types';
import { formatProjectDate } from '../services/projectStorage';
import {
  History,
  Trash2,
  Edit3,
  Sparkles,
  ArrowUpRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RecentProjectsGalleryProps {
  projects: RecentProject[];
  currentResult: GenerationResult | null;
  onResumeProject: (project: RecentProject) => void;
  onDeleteProject: (id: string) => void;
  onClearAll: () => void;
}

export const RecentProjectsGallery: React.FC<RecentProjectsGalleryProps> = ({
  projects,
  currentResult,
  onResumeProject,
  onDeleteProject,
  onClearAll,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResume = (project: RecentProject) => {
    onResumeProject(project);
    triggerToast('Projeto carregado no estúdio de edição!');

    // Smooth scroll up to the editor / result display
    const studioEl = document.getElementById('studio-result-display');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({
        top: 260,
        behavior: 'smooth',
      });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteProject(id);
    triggerToast('Projeto removido do histórico.');
  };

  const handleClearConfirmed = () => {
    onClearAll();
    setShowClearConfirm(false);
    triggerToast('Histórico de projetos limpo com sucesso.');
  };

  return (
    <section className="relative z-10 w-full pt-6 border-t border-slate-800/80 space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 flex-shrink-0">
            <History className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Galeria de Projetos Recentes
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60 font-semibold">
                {projects.length}/5 salvos
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Suas últimas 5 criações salvas automaticamente no navegador para retomar a edição quando desejar.
            </p>
          </div>
        </div>

        {/* Clear projects action */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 p-1 rounded-xl animate-fade-in">
                <span className="text-xs text-rose-300 px-2 font-medium">Limpar tudo?</span>
                <button
                  type="button"
                  onClick={handleClearConfirmed}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 bg-slate-800/80 hover:bg-rose-950/40 rounded-xl transition-colors border border-slate-700 hover:border-rose-900/60"
                title="Limpar todos os projetos recentes do navegador"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Histórico</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid of recent projects */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {projects.map((project, index) => {
            const isCurrentlyActive =
              currentResult?.imageUrl &&
              (currentResult.imageUrl === project.result.imageUrl ||
                (currentResult.imagePrompt &&
                  currentResult.imagePrompt === project.result.imagePrompt));

            const ratio = project.result.aspectRatio || '1:1';

            return (
              <div
                key={project.id || index}
                onClick={() => handleResume(project)}
                className={`group relative flex flex-col justify-between bg-slate-900/90 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                  isCurrentlyActive
                    ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-violet-900/30'
                    : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Visual Thumbnail Stage */}
                <div className="relative w-full aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={project.result.imageUrl}
                    alt={project.result.theme || 'Projeto Recente'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-violet-300 border border-violet-500/30 backdrop-blur-md">
                      {ratio}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, project.id)}
                      className="pointer-events-auto p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110"
                      title="Excluir este projeto do histórico"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Active Indicator Badge */}
                  {isCurrentlyActive && (
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-lg backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Em Edição
                      </span>
                    </div>
                  )}

                  {/* Date Tag */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-slate-300 pointer-events-none">
                    <span className="flex items-center gap-1 opacity-90">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatProjectDate(project.createdAt)}
                    </span>
                    {project.result.theme && (
                      <span className="max-w-[90px] truncate text-[9px] bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60">
                        {project.result.theme}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content & Quote Snippet */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-200 line-clamp-2 italic leading-snug font-serif">
                      "{project.result.quote}"
                    </p>
                  </div>

                  {/* Resume Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResume(project);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      isCurrentlyActive
                        ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/25 group-hover:scale-[1.02]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isCurrentlyActive ? 'Editando Agora' : 'Retomar Edição'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border-2 border-dashed border-slate-800/80 rounded-2xl p-8 text-center bg-slate-950/30 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800 shadow-inner">
            <Sparkles className="w-6 h-6 text-violet-500/60" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-200">
              Nenhum projeto recente salvo ainda
            </h4>
            <p className="text-xs text-slate-400">
              Crie uma arte inspiradora no painel acima. Suas últimas 5 gerações aparecerão aqui automaticamente para você retomar a edição, trocar fontes, filtros ou exportar em alta resolução.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
