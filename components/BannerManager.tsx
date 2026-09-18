
import React from 'react';
import { motion } from 'framer-motion';
import { resizeImage } from '../utils';

interface BannerManagerProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    onAddImage: (dataUri: string) => void;
    onRemoveImage: (index: number) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const BannerManager: React.FC<BannerManagerProps> = ({ isOpen, onClose, images, onAddImage, onRemoveImage }) => {
    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            const isVideo = file.type.startsWith('video/');
            const isGif = file.type === 'image/gif';

            try {
                if (isVideo || isGif) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            onAddImage(reader.result);
                        }
                    };
                    reader.readAsDataURL(file);
                } else if (file.type.startsWith('image/')) {
                    const resized = await resizeImage(file, 1920, 1080);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            onAddImage(reader.result);
                        }
                    };
                    reader.readAsDataURL(resized);
                }
            } catch (err) {
                console.error("Banner upload failed", err);
            }
        }
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose}>
            <div className="glass-card w-full max-w-2xl rounded-[2.5rem] p-10 relative animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 bg-white/[0.02] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                            Exhibition Controller
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-display italic">Gallery Orchestration</h3>
                        <p className="text-sm text-text-secondary font-light mt-1">Sculpt the visual narrative with high-res cinema captures, kinetic GIFs, and production reels.</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto suggestions-scrollbar pr-4 -mr-4">
                    {images.map((img, idx) => {
                        const isVideo = img.startsWith('data:video');
                        return (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black/40 hover:border-accent/40 hover:bg-white/[0.03] transition-all duration-500"
                            >
                                {isVideo ? (
                                    <video 
                                        src={img} 
                                        className="w-full h-full object-cover" 
                                        muted 
                                        loop 
                                        playsInline 
                                        onMouseOver={e => e.currentTarget.play()} 
                                        onMouseOut={e => e.currentTarget.pause()}
                                    />
                                ) : (
                                    <img 
                                        src={img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`} 
                                        alt={`Banner ${idx + 1}`} 
                                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center scale-110 group-hover:scale-100">
                                    <button 
                                        onClick={() => onRemoveImage(idx)}
                                        className="w-14 h-14 rounded-2xl bg-red-500 text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group/del"
                                        title="Purge Capture"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white/50 border border-white/5 tracking-widest">
                                        SLOT ◈ 0{idx + 1}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    
                    <label className="relative aspect-video rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-accent/5 hover:border-accent/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden">
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
                        <div className="relative z-10 flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-accent group-hover:text-white group-hover:border-accent group-hover:rotate-90 transition-all duration-700 shadow-xl group-hover:shadow-accent/20">
                                <PlusIcon />
                            </div>
                            <span className="text-[9px] mt-4 font-black uppercase tracking-[0.3em] text-white/10 group-hover:text-accent transition-colors">Append Vision</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*,video/*,image/gif" onChange={handleFileUpload} />
                    </label>
                </div>

                <div className="mt-10 flex justify-end gap-4 border-t border-white/5 pt-8">
                     <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] flex-grow mt-auto mb-2 opacity-40">System Architecture: High-Fidelity Asset Sync Enabled</p>
                     <button onClick={onClose} className="btn-primary py-3 px-10 rounded-full text-[10px]">Close Controller</button>
                </div>
            </div>
        </div>
    );
};

export default BannerManager;
