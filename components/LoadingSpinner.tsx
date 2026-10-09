import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  subtext?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Processando criação...',
  subtext = 'Gerando arte de alta definição e alinhando pensamentos positivos',
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute w-20 h-20 bg-gradient-to-tr from-violet-600/30 to-pink-500/30 rounded-full blur-xl animate-pulse-glow" />
        
        {/* Circular spinner */}
        <div className="relative w-16 h-16 rounded-full border-2 border-slate-800 border-t-violet-500 border-r-pink-500 animate-spin" />
        
        {/* Center Sparkle */}
        <div className="absolute">
          <Sparkles className="w-6 h-6 text-violet-400 animate-bounce" />
        </div>
      </div>

      <div className="space-y-1 max-w-md">
        <p className="text-base font-semibold text-slate-200 tracking-wide">{text}</p>
        {subtext && (
          <p className="text-xs text-slate-400 leading-relaxed">{subtext}</p>
        )}
      </div>

      {/* Pulsing dots */}
      <div className="flex items-center gap-1.5 pt-1">
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
};
