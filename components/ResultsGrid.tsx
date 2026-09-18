
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PhotoshootResult, ShotType } from '../types';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-accent animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-2 border-accent/10"></div>
            <div className="absolute inset-4 rounded-full border-2 border-b-accent animate-spin-slow"></div>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Synthesizing</span>
            <span className="text-[8px] font-medium text-text-muted uppercase tracking-widest mt-1 animate-pulse">Capturing Production Shot</span>
        </div>
    </div>
);

const ImageResult: React.FC<{ 
    result: PhotoshootResult;
    onEdit?: (prompt: string) => void;
}> = ({ result, onEdit }) => {
    const [isFullViewOpen, setIsFullViewOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [localPrompt, setLocalPrompt] = useState('');

    if (!result) return null;
    const shotType = result.shotType;

    const handleDownload = (resolution: '2k' | '4k') => {
        if (!result.image) return;
        setIsDownloading(true);
        const img = new Image();
        img.src = `data:${result.image.mimeType};base64,${result.image.base64}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { setIsDownloading(false); return; }
            const targetWidth = resolution === '4k' ? 4096 : 2048;
            canvas.width = targetWidth;
            canvas.height = targetWidth / (img.width / img.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const link = document.createElement('a');
            link.download = `Jenta-${shotType.replace(/\s+/g, '-')}-${resolution}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsDownloading(false);
        };
        img.onerror = () => setIsDownloading(false);
    };

    const handleApplyEdit = () => {
        if (localPrompt.trim() && onEdit) {
            onEdit(localPrompt);
            setLocalPrompt('');
        }
    };

    return (
        <div className="flex flex-col gap-4 group/card animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="relative w-full aspect-square bg-[#050505] rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 shadow-2xl group-hover/card:shadow-accent/10 group-hover/card:border-accent/30 box-content">
                {result.isLoading || result.isEditing ? (
                    <div className="flex flex-col items-center justify-center h-full bg-black/40 backdrop-blur-xl">
                        <LoadingSpinner />
                    </div>
                ) : result.image ? (
                    <>
                        <img 
                            src={`data:${result.image.mimeType};base64,${result.image.base64}`} 
                            alt={shotType} 
                            className="object-cover w-full h-full cursor-zoom-in transition-transform duration-1000 group-hover/card:scale-110"
                            onClick={() => setIsFullViewOpen(true)}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black text-accent uppercase tracking-widest">{shotType}</span>
                              <span className="text-[8px] text-white/50 font-medium uppercase truncate">8K Production Render • Cinematic Lighting</span>
                           </div>
                        </div>
                    </>
                ) : result.error ? (
                    <div className="p-8 text-center h-full flex flex-col items-center justify-center gap-4 bg-red-500/5">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xl">!</div>
                        <p className="text-xs text-red-400 font-medium leading-relaxed">{result.error}</p>
                    </div>
                ) : null}
            </div>

            {result.image && !result.isLoading && !result.isEditing && (
                <div className="flex flex-col gap-4 px-2">
                    <div className="relative group/edit">
                        <input 
                            type="text"
                            value={localPrompt}
                            onChange={(e) => setLocalPrompt(e.target.value)}
                            placeholder="Refine shot details..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all placeholder:text-text-muted font-medium"
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyEdit()}
                        />
                        <button 
                            onClick={handleApplyEdit}
                            disabled={!localPrompt.trim()}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-accent hover:bg-accent-dark text-white text-[9px] font-black rounded-xl transition-all disabled:opacity-0 disabled:scale-90 shadow-xl shadow-accent/20"
                        >
                            EVOLVE
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => handleDownload('2k')} disabled={isDownloading} className="btn-secondary flex-1 py-4 rounded-xl border-white/5 text-[9px] font-black tracking-widest uppercase">2K Master</button>
                        <button onClick={() => handleDownload('4k')} disabled={isDownloading} className="btn-primary flex-1 py-4 rounded-xl shadow-none text-[9px] font-black tracking-widest uppercase">4K Cinematic</button>
                    </div>
                </div>
            )}

            {isFullViewOpen && result.image && createPortal(
                <div className="fixed inset-0 bg-black backdrop-blur-3xl flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-500 cursor-zoom-out" onClick={() => setIsFullViewOpen(false)}>
                    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12 lg:p-24">
                        <img 
                            src={`data:${result.image.mimeType};base64,${result.image.base64}`} 
                            className="max-w-full max-h-full object-contain shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-3xl ring-1 ring-white/10 animate-in zoom-in-95 duration-700" 
                        />
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 px-6 py-3 rounded-full border border-white/10 backdrop-blur-xl">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{shotType}</span>
                            <div className="w-1 h-3 bg-accent rounded-full"></div>
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Master View</span>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const ResultsGrid: React.FC<{
  results: PhotoshootResult[];
  onEditResult?: (index: number, prompt: string) => void;
}> = ({ results, onEditResult }) => {
  const safeResults = Array.isArray(results) ? results.filter(r => !!r) : [];
  if (safeResults.length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeResults.map((result, idx) => (
        <ImageResult 
            key={`${result.shotType}-${idx}`} 
            result={result} 
            onEdit={(p) => onEditResult?.(idx, p)}
        />
      ))}
    </div>
  );
};

export default ResultsGrid;
