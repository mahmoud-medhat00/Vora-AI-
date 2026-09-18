
import React from 'react';

const VideoStudio: React.FC = React.memo(() => {
    const metaHeroImage = "https://lifehacker.com/imagery/articles/01JXN6G5PCFQQNJNM4214CCC2K/hero-image.fill.size_1248x702.v1749843503.png";
    const grokHeroImage = "https://framerusercontent.com/images/V6Wv6z9f6D5Yv7G5v5Z7v5Z7v5Z.jpg";
    const metaUrl = "https://www.meta.ai/";
    const grokUrl = "https://grok.com/imagine";

    return (
        <>
        <main className="w-full flex flex-col gap-10 pt-4 md:pt-8 pb-32 animate-in fade-in duration-700 studio-container">
            {/* Mission Control Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4 px-2 md:px-0">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                        Kinetic Engine Matrix
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                       Video & Motion Studio
                    </h2>
                    <p className="text-text-secondary text-sm md:text-base font-light mt-3 max-w-xl">
                        Unleash cinematic world-building through direct orchestration of next-generation motion synthesis models.
                    </p>
                </div>
                <div className="flex items-center gap-8 hidden lg:flex">
                     <div className="flex flex-col items-end">
                         <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Global Render Capacity</span>
                         <div className="flex gap-1">
                             {[...Array(10)].map((_, i) => (
                                 <div key={i} className={`w-1 h-3 rounded-full ${i < 8 ? 'bg-accent' : 'bg-white/10'}`}></div>
                             ))}
                         </div>
                     </div>
                     <div className="w-px h-10 bg-white/5"></div>
                     <div className="flex flex-col items-end">
                         <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Active Neural Cores</span>
                         <span className="text-xl font-black text-white font-mono">1.28 <span className="text-accent text-xs">Ph/s</span></span>
                     </div>
                </div>
            </div>

            {/* Studio Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Meta AI Studio */}
                <div className="relative group">
                    <a 
                        href={metaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block glass-card rounded-[3.5rem] overflow-hidden border border-white/5 relative bg-black/40 aspect-video shadow-[0_45px_100px_rgba(0,0,0,0.5)] transition-all hover:border-blue-500/40 hover:shadow-blue-500/10 group focus:outline-none"
                    >
                        <img 
                            src={metaHeroImage} 
                            alt="Meta AI Video Generation" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-[5s] group-hover:scale-110"
                        />

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-black/30 group-hover:bg-transparent transition-all duration-700">
                            <div className="w-24 h-24 rounded-[2rem] bg-blue-600/10 backdrop-blur-3xl border border-blue-500/20 flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-blue-500/20">
                                <svg className="h-12 w-12 text-blue-400 fill-current translate-x-1" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.4em] drop-shadow-2xl font-display italic">Meta AI Cinema</h3>
                            <p className="text-white/40 text-[10px] mt-4 font-black uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">Invoke Movie Gen Technology Matrix</p>
                        </div>

                        <div className="absolute top-10 left-10 px-6 py-2 bg-blue-600/80 backdrop-blur-xl border border-blue-400/30 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl">
                           MISSION: PRODUCTION
                        </div>
                    </a>
                </div>

                {/* Grok AI Studio */}
                <div className="relative group">
                    <a 
                        href={grokUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block glass-card rounded-[3.5rem] overflow-hidden border border-white/5 relative bg-black/40 aspect-video shadow-[0_45px_100px_rgba(0,0,0,0.5)] transition-all hover:border-accent/40 hover:shadow-accent/10 group focus:outline-none"
                    >
                        <img 
                            src={grokHeroImage} 
                            alt="Grok AI Video Generation" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-[5s] group-hover:scale-110"
                        />

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-black/30 group-hover:bg-transparent transition-all duration-700">
                            <div className="w-24 h-24 rounded-[2rem] bg-accent/10 backdrop-blur-3xl border border-accent/20 flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 shadow-2xl shadow-accent/20">
                                <svg className="h-12 w-12 text-accent fill-current translate-x-1" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.4em] drop-shadow-2xl font-display italic">Grok Imagine</h3>
                            <p className="text-white/40 text-[10px] mt-4 font-black uppercase tracking-[0.2em] group-hover:text-accent transition-colors">Interface with Grok's Visual Singularity</p>
                        </div>

                        <div className="absolute top-10 left-10 px-6 py-2 bg-accent/80 backdrop-blur-xl border border-accent/40 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl">
                            MISSION: DISCOVERY
                        </div>
                    </a>
                </div>
            </div>
            
            {/* Features Stats HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/5 mb-6 flex items-center justify-center border border-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Model Fusion Technology</h4>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">Precision-layered synthesis protocols allowing for unparalleled cinematic consistency across multi-engine workloads.</p>
                </div>
                <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 mb-6 flex items-center justify-center border border-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h4 className="text-xs font-black text-accent uppercase tracking-widest mb-3">Instant Neural Rendering</h4>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">High-bandwidth cloud orchestration enabling real-time frame synthesis and kinetic visual extrapolation.</p>
                </div>
                <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 mb-6 flex items-center justify-center border border-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    </div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">Architectural Precision</h4>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">Advanced world-state tracking ensures your prompts dictate the entire production lifecycle with surgical accuracy.</p>
                </div>
            </div>
            
            {/* Tech Floor */}
            <div className="mt-12 flex justify-center py-6 border-t border-white/5">
                 <div className="flex items-center gap-10 opacity-30">
                     <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.4em]">8K Render Pipeline</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                     <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.4em]">Tensor Flow Optimization</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                     <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.4em]">Cinematic Post-Processing</span>
                 </div>
            </div>
        </main>

        {/* Status bar simulated element */}
        <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center justify-between px-6 px-safe">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Neural Link Active</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest hidden sm:inline">Motion Synthesis Engine</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest font-mono">LATENCY: 42MS</span>
                <div className="w-px h-3 bg-white/10"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest font-mono">SECURE</span>
            </div>
        </div>
        </>
    );
});

export default VideoStudio;
