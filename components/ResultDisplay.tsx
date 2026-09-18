
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageFile } from '../types';

interface ResultDisplayProps {
  imageFile: ImageFile | null;
  isLoading: boolean;
  onEdit?: (prompt: string) => void;
  isEditing?: boolean;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin"></div>
            <div className="absolute inset-6 rounded-full border-4 border-accent/10"></div>
            <div className="absolute inset-6 rounded-full border-4 border-b-accent animate-spin-slow"></div>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-accent uppercase tracking-[0.4em]">Rendering Masterpiece</span>
            <span className="text-[9px] font-medium text-text-muted uppercase tracking-widest mt-2 opacity-50">Calibrating Visual Fidelity</span>
        </div>
    </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = React.memo(({ 
    imageFile, 
    isLoading,
    onEdit,
    isEditing
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFullViewOpen, setIsFullViewOpen] = useState(false);
    const [localPrompt, setLocalPrompt] = useState('');
    const [showHeatMap, setShowHeatMap] = useState(false);
    const [showMobileMockup, setShowMobileMockup] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsFullViewOpen(false);
        };
        if (isFullViewOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isFullViewOpen]);

    const handleDownload = (resolution: '2k' | '4k') => {
        if (!imageFile) return;
        setIsDownloading(true);
        const img = new Image();
        img.src = `data:${imageFile.mimeType};base64,${imageFile.base64}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { setIsDownloading(false); return; }
            const targetWidth = resolution === '4k' ? 4096 : 2048;
            canvas.width = targetWidth;
            canvas.height = targetWidth / (img.width / img.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const link = document.createElement('a');
            link.download = `Jenta-Creative-${resolution}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsDownloading(false);
        }
        img.onerror = () => setIsDownloading(false);
    };

    const handleApplyEdit = () => {
        if (localPrompt.trim() && onEdit) {
            onEdit(localPrompt);
            setLocalPrompt('');
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="relative w-full aspect-square bg-[#050505] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center group">
                {(isLoading || isEditing) && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl animate-in fade-in duration-500">
                        <LoadingSpinner />
                    </div>
                )}
                
                {!isLoading && !isEditing && !imageFile && (
                    <div className="flex flex-col items-center gap-6 opacity-10 p-12">
                        <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                            <span className="text-6xl font-thin tracking-tighter">◈</span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-center">Architecting Visual Logic</span>
                    </div>
                )}
                
                {!isLoading && !isEditing && imageFile && (
                     <div className="w-full h-full relative cursor-zoom-in group/image overflow-hidden flex items-center justify-center">
                        <img 
                            src={`data:${imageFile.mimeType};base64,${imageFile.base64}`} 
                            alt="Master Output" 
                            className={`transition-all duration-[2s] ${showMobileMockup ? 'h-[85%] aspect-[9/19.5] rounded-[2.5rem] object-cover ring-[12px] ring-black/80 ring-offset-4 ring-offset-white/5 shadow-2xl' : 'object-cover w-full h-full group-hover:scale-110'}`}
                            onClick={() => setIsFullViewOpen(true)}
                        />
                        {showMobileMockup && (
                            <div className="absolute inset-x-0 bottom-[8%] flex justify-center pointer-events-none">
                                <div className="w-24 h-1 bg-white/20 rounded-full animate-pulse"></div>
                            </div>
                        )}
                        {showHeatMap && (
                            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-80 animate-in fade-in duration-700">
                                <div className="w-full h-full relative">
                                     <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-red-500 blur-[60px] rounded-full animate-pulse"></div>
                                     <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500 blur-[80px] rounded-full animate-pulse delay-500"></div>
                                     <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-orange-500 blur-[50px] rounded-full animate-pulse delay-700"></div>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-10 pointer-events-none">
                            <div className="flex flex-col gap-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Master File No. 001</span>
                                <span className="text-[14px] text-white font-black uppercase tracking-tighter">Final Production Asset</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {imageFile && !isLoading && !isEditing && (
                <div className="animate-in slide-in-from-bottom-6 fade-in duration-700 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${showHeatMap ? 'bg-accent shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.5)] scale-125' : 'bg-white/20 scale-100'}`}></div>
                             <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{showHeatMap ? 'Live Eye-Tracking Simulation' : 'Attention Logic Layer'}</span>
                        </div>
                        <button 
                            onClick={() => setShowHeatMap(!showHeatMap)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${showHeatMap ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}
                        >
                            {showHeatMap ? 'Disable Simulation' : 'Attention Matrix'}
                        </button>
                        <button 
                            onClick={() => setShowMobileMockup(!showMobileMockup)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${showMobileMockup ? 'bg-accent border-accent text-white shadow-lg' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}
                        >
                            {showMobileMockup ? 'Full View' : 'Mobile Preview'}
                        </button>
                    </div>

                    <div className="relative group/edit">
                        <input 
                            type="text"
                            value={localPrompt}
                            onChange={(e) => setLocalPrompt(e.target.value)}
                            placeholder="Describe cinematic modifications..."
                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all placeholder:text-text-muted font-medium"
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyEdit()}
                        />
                        <button 
                            onClick={handleApplyEdit}
                            disabled={!localPrompt.trim()}
                            className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-accent hover:bg-accent-dark text-white text-[10px] font-black rounded-xl transition-all disabled:opacity-0 shadow-2xl shadow-accent/20"
                        >
                            EVOLVE CREATIVE
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleDownload('2k')} disabled={isDownloading} className="btn-secondary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 border-white/10 group">
                            <DownloadIcon />
                            <span className="text-[10px] font-black tracking-widest group-hover:translate-x-1 transition-transform">2K PRODUCTION</span>
                        </button>
                        <button onClick={() => handleDownload('4k')} disabled={isDownloading} className="btn-primary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 group">
                            <DownloadIcon />
                            <span className="text-[10px] font-black tracking-widest group-hover:translate-x-1 transition-transform">4K MASTER CINEMATIC</span>
                        </button>
                    </div>
                </div>
            )}

            {isFullViewOpen && imageFile && createPortal(
                <div className="fixed inset-0 bg-black backdrop-blur-3xl flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-500 cursor-zoom-out" onClick={() => setIsFullViewOpen(false)}>
                    <div className="relative w-full h-full flex items-center justify-center p-6 md:p-12 lg:p-24">
                        <img src={`data:${imageFile.mimeType};base64,${imageFile.base64}`} className="max-w-full max-h-full object-contain shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-3xl" />
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 px-8 py-4 rounded-full border border-white/10 backdrop-blur-3xl">
                            <span className="text-[12px] font-black text-white uppercase tracking-[0.5em]">Master View</span>
                            <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">3840 × 3840 UNCOMPRESSED</span>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});

export default ResultDisplay;
