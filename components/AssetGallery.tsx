
import React from 'react';
import { ImageFile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Trash2, LayoutGrid, List } from 'lucide-react';

interface AssetGalleryProps {
    assets: { id: string; type: string; image: ImageFile; createdAt: Date }[];
    onDelete: (id: string) => void;
}

const AssetGallery: React.FC<AssetGalleryProps> = ({ assets, onDelete }) => {
    const [view, setView] = React.useState<'grid' | 'list'>('grid');

    const downloadImage = (base64: string, name: string) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = `${name || 'generation'}.png`;
        link.click();
    };

    return (
        <div className="flex flex-col gap-10 p-8 studio-container max-w-7xl mx-auto w-full min-h-[600px]">
            {/* Gallery Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                        Secure Generation Repository
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase font-display leading-none">The Asset Vault</h2>
                    <p className="text-text-secondary text-base font-light mt-3 max-w-xl">
                        A persistent high-fidelity archive of all synthesized production assets, optimized for high-res deployment.
                    </p>
                </div>
                <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 backdrop-blur-xl">
                    <button 
                        onClick={() => setView('grid')}
                        className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        onClick={() => setView('list')}
                        className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {assets.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01] py-32 group hover:bg-white/[0.02] transition-colors duration-1000">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:border-accent/40 transition-all duration-700">
                        <Share2 size={32} className="text-white/10 group-hover:text-accent group-hover:animate-pulse transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-white/20 uppercase tracking-tighter">Vault is Empty</h3>
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mt-2">Initialize generations to populate your archive</p>
                </div>
            ) : (
                <div className={view === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" 
                    : "flex flex-col gap-4"
                }>
                    <AnimatePresence mode="popLayout">
                        {assets.map((asset, idx) => (
                            <motion.div 
                                key={asset.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.6, delay: idx * 0.05 }}
                                className={`group relative overflow-hidden transition-all duration-500 ${
                                    view === 'grid' 
                                    ? 'glass-card rounded-[2.5rem] aspect-square flex flex-col border border-white/5 bg-white/[0.01] hover:border-accent/30 hover:bg-white/[0.03]' 
                                    : 'glass-card rounded-3xl p-6 flex items-center gap-8 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                                }`}
                            >
                                <div className={view === 'grid' ? "w-full h-full relative p-3" : "w-24 h-24 shrink-0 relative"}>
                                     <img 
                                        src={`data:${asset.image.mimeType};base64,${asset.image.base64}`} 
                                        className="w-full h-full object-cover rounded-[1.8rem] gallery-img transition-transform duration-[3s] group-hover:scale-110"
                                        alt={asset.type}
                                    />
                                </div>
                                
                                {view === 'list' && (
                                    <div className="flex-grow">
                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-accent/5 border border-accent/10 mb-2">
                                            <span className="text-[8px] font-black text-accent uppercase tracking-widest">{asset.type}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Asset ID: {asset.id.slice(0, 8)}</h4>
                                        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">Captured: {asset.createdAt.toLocaleDateString()} at {asset.createdAt.toLocaleTimeString()}</p>
                                    </div>
                                )}

                                {view === 'grid' && (
                                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10 pointer-events-none">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-accent uppercase tracking-widest mb-1 shadow-black/40 text-shadow-sm">Generation Type</span>
                                            <span className="text-sm font-black text-white italic uppercase shadow-black/40 text-shadow-sm">{asset.type}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex gap-3 pointer-events-auto ${view === 'grid' 
                                    ? "absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center scale-110 group-hover:scale-100" 
                                    : "shrink-0"
                                }`}>
                                    <button 
                                        onClick={() => downloadImage(asset.image.base64, asset.type)}
                                        className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-accent/20 group/btn overflow-hidden"
                                        title="Export Asset"
                                    >
                                        <Download size={22} className="group-hover/btn:translate-y-px transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(asset.id)}
                                        className="w-14 h-14 bg-white/5 border border-white/5 hover:bg-red-500 hover:text-white text-white/40 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-xl group/del"
                                        title="Purge from Vault"
                                    >
                                        <Trash2 size={22} className="group-hover/del:animate-bounce" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AssetGallery;
