
import React, { useState } from 'react';
import { AdCreativeStudioProject, ImageFile } from '../types';
import { generateAdCreative, generateImage, generateAdTargetingSuggestions } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import { resizeImage } from '../utils';

const AdIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);

const AdCreativeStudio: React.FC<{
    project: AdCreativeStudioProject;
    setProject: React.Dispatch<React.SetStateAction<AdCreativeStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    if (!project) return null;

    const productImages = project.productImages || [];
    const variations = project.variations || [];
    const targetingSuggestions = project.targetingSuggestions || [];

    const onGetSuggestions = async () => {
        if (productImages.length === 0) {
            setProject(s => ({ ...s, error: 'Please upload product images first' }));
            return;
        }
        setProject(s => ({ ...s, isSuggesting: true, error: null }));
        try {
            const suggestions = await generateAdTargetingSuggestions(project.adPlatform, productImages);
            setProject(s => ({ ...s, targetingSuggestions: suggestions, isSuggesting: false }));
        } catch (err) {
            setProject(s => ({ ...s, isSuggesting: false, error: 'Failed to generate suggestions.' }));
        }
    };

    const applySuggestion = (suggestion: string) => {
        setProject(s => ({ ...s, targetAudience: suggestion }));
    };

    const handleProductFilesUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 1024, 1024);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ 
                        base64: (reader.result as string).split(',')[1], 
                        mimeType: resized.type, 
                        name: resized.name 
                    });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({ 
                ...s, 
                productImages: [...(s.productImages || []), ...uploaded],
                isUploading: false 
            }));
        } catch (err) {
            setProject(s => ({ ...s, error: 'Upload failed', isUploading: false }));
        }
    };

    const removeImage = (index: number) => {
        setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, i) => i !== index) }));
    };

    const onGenerate = async () => {
        if (!project.targetAudience) {
            setProject(s => ({ ...s, error: 'Please define your target audience' }));
            return;
        }

        setProject(s => ({ ...s, isGenerating: true, error: null, variations: [] }));
        try {
            const rawVariations = await generateAdCreative(
                productImages,
                project.adPlatform,
                project.targetAudience,
                project.competitorLinks || []
            );

            const initializedVariations = (rawVariations || []).map((v: any, i: number) => ({
                id: `var-${Date.now()}-${i}`,
                hook: v?.hook || 'Attention grabbing hook...',
                body: v?.body || 'Ad body goes here...',
                cta: v?.cta || 'Shop Now',
                visualDescription: v?.visualDescription || 'Professional product lifestyle shot',
                conversionScore: v?.conversionScore || 0,
                triggers: v?.triggers || [],
                image: null,
                isLoading: false
            }));

            setProject(s => ({ ...s, variations: initializedVariations, isGenerating: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'Failed to generate ad variations.' }));
        }
    };

    const generateVisual = async (index: number) => {
        const variation = variations[index];
        setProject(s => {
            const newVars = [...(s.variations || [])];
            if (newVars[index]) newVars[index].isLoading = true;
            return { ...s, variations: newVars };
        });

        try {
            const img = await generateImage(productImages, variation.visualDescription, null, '1:1');
            setProject(s => {
                const newVars = [...(s.variations || [])];
                if (newVars[index]) {
                    newVars[index].image = img;
                    newVars[index].isLoading = false;
                }
                return { ...s, variations: newVars };
            });
        } catch (err) {
            setProject(s => {
                const newVars = [...(s.variations || [])];
                if (newVars[index]) newVars[index].isLoading = false;
                return { ...s, variations: newVars };
            });
        }
    };

    return (
        <main className="w-full flex flex-col gap-12 pt-8 pb-24 animate-in fade-in duration-700 studio-container">
            {/* Header section */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                            High-Conversion Deployment Hub
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                           Ad Creative Studio
                        </h2>
                        <p className="text-text-secondary text-base font-light mt-3 max-w-xl">
                            Synthesize high-performance ad variations with predictive conversion scoring and automated neural production visuals.
                        </p>
                    </div>
                    <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 backdrop-blur-xl">
                        {['Facebook', 'TikTok', 'Instagram', 'Google'].map(p => (
                            <button 
                                key={p}
                                onClick={() => setProject(s => ({ ...s, adPlatform: p as any }))}
                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${project.adPlatform === p ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input Selection */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col gap-8">
                            <div className="space-y-4">
                                <h3 className="input-label !mb-0">Product DNA</h3>
                                <div className="bg-black/20 p-4 rounded-3xl border border-white/5 aspect-square max-w-[320px] mx-auto w-full">
                                    <ImageUploader 
                                        id="ad-product-images"
                                        title="Product Image"
                                        images={productImages}
                                        onFileUpload={handleProductFilesUpload} 
                                        isUploading={project.isUploading} 
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-4 px-2">
                                    {productImages.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5 bg-black/20">
                                            <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(i)} className="absolute inset-0 bg-accent/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="input-label !mb-0">Target Audience</label>
                                        <button 
                                            onClick={onGetSuggestions}
                                            disabled={project.isSuggesting}
                                            className="text-[9px] font-black text-accent uppercase tracking-widest hover:opacity-80 disabled:opacity-30 flex items-center gap-2"
                                        >
                                            {project.isSuggesting ? (
                                                <div className="w-3 h-3 border-2 border-t-transparent border-accent animate-spin rounded-full"></div>
                                            ) : '◈ Synthesize Ideas'}
                                        </button>
                                    </div>
                                    <input 
                                        value={project.targetAudience || ''}
                                        onChange={e => setProject(s => ({ ...s, targetAudience: e.target.value }))}
                                        placeholder="e.g. Coffee lovers, 25-45, eco-conscious"
                                        className="glass-input text-xs"
                                    />
                                </div>

                                {targetingSuggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                        {targetingSuggestions.map((suggestion, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => applySuggestion(suggestion)}
                                                className="px-4 py-2 bg-accent/5 border border-accent/20 rounded-xl text-[9px] font-bold text-text-secondary hover:bg-accent/10 hover:text-white transition-all text-left uppercase tracking-tight"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="input-label !mb-0 px-1">Contextual Background</label>
                                    <textarea 
                                        rows={3}
                                        value={(project.competitorLinks || []).join('\n')}
                                        onChange={e => setProject(s => ({ ...s, competitorLinks: e.target.value.split('\n') }))}
                                        placeholder="Paste competitor links or brand guidelines for deeper alignment..."
                                        className="glass-input resize-none text-xs leading-loose"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={onGenerate}
                                disabled={project.isGenerating}
                                className="btn-primary w-full py-5 rounded-2xl shadow-[0_20px_40px_rgba(var(--color-accent-rgb),0.2)] text-base mt-2"
                            >
                                {project.isGenerating ? 'ORCHESTRATING ADS...' : 'GENERATE AD MATRIX'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Results display */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 flex flex-col gap-10 min-h-[500px]">
                            {variations.length === 0 && !project.isGenerating ? (
                                <div className="flex-grow flex flex-col items-center justify-center text-center opacity-10 py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    <div className="text-7xl mb-8">◈</div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Awaiting Signal</h3>
                                    <p className="text-sm font-medium max-w-sm uppercase tracking-[0.2em]">Fill requirements to generate high-performance conversion variants</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-12">
                                     {variations.map((v, i) => (
                                         <div key={v.id} className="relative group animate-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${i * 150}ms` }}>
                                             {/* Background gradient card */}
                                             <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                                             
                                             <div className="relative glass-card bg-black/60 p-8 lg:p-12 rounded-[3rem] border border-white/5 hover:border-accent/40 shadow-2xl transition-all duration-500">
                                                 <div className="flex flex-col md:flex-row gap-12">
                                                     {/* Copy Column */}
                                                     <div className="flex-1 space-y-10">
                                                         <div className="flex justify-between items-start">
                                                             <div className="flex items-center gap-4">
                                                                 <div className="w-2 h-10 bg-accent rounded-full shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.5)]"></div>
                                                                 <div>
                                                                     <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Variation 0{i+1}</span>
                                                                     <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Copy Analysis</h4>
                                                                 </div>
                                                             </div>
                                                             <div className="flex flex-col items-end">
                                                                 <span className="text-[8px] font-black text-accent uppercase tracking-widest mb-1">Conversion Rank</span>
                                                                 <div className="flex items-center gap-3">
                                                                     <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                         <div className="h-full bg-accent animate-grow-x" style={{ width: `${v.conversionScore}%`, animationDelay: `${i * 150 + 500}ms` }}></div>
                                                                     </div>
                                                                     <span className="text-lg font-black text-white italic">{v.conversionScore}%</span>
                                                                 </div>
                                                             </div>
                                                         </div>

                                                         <div className="space-y-6">
                                                             <div className="space-y-3">
                                                                 <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] px-1">The Narrative Hook</label>
                                                                 <p className="text-2xl font-black text-white leading-tight tracking-tight italic border-l-4 border-accent/20 pl-6 py-2">
                                                                     "{v.hook}"
                                                                 </p>
                                                             </div>
                                                             
                                                             <div className="space-y-3">
                                                                 <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Ad Architecture</label>
                                                                 <div className="bg-white/5 rounded-3xl p-6 border border-white/5 leading-relaxed text-text-secondary text-sm font-medium whitespace-pre-wrap">
                                                                     {v.body}
                                                                 </div>
                                                             </div>

                                                             <div className="flex flex-wrap gap-2">
                                                                 {v.triggers?.map((trigger, tidx) => (
                                                                     <span key={tidx} className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-wider">
                                                                         #{trigger}
                                                                     </span>
                                                                 ))}
                                                                 <div className="ml-auto flex items-center gap-2">
                                                                     <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Directive:</span>
                                                                     <span className="text-[10px] font-black text-white border-b-2 border-accent uppercase tracking-widest">{v.cta}</span>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     </div>

                                                     {/* Visual Column */}
                                                     <div className="w-full md:w-[320px] shrink-0 space-y-6">
                                                         <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-1 text-center block">Neural Visual Asset</label>
                                                         {!v.image ? (
                                                             <button 
                                                                 onClick={() => generateVisual(i)}
                                                                 disabled={v.isLoading}
                                                                 className="w-full aspect-square bg-[#050505] hover:bg-accent/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all group overflow-hidden relative"
                                                             >
                                                                 {v.isLoading ? (
                                                                     <div className="flex flex-col items-center gap-4">
                                                                         <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin"></div>
                                                                         <span className="text-[9px] font-black text-accent uppercase tracking-[0.3em] animate-pulse">Rendering...</span>
                                                                     </div>
                                                                 ) : (
                                                                     <>
                                                                         <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center group-hover:border-accent/40 group-hover:scale-110 transition-all bg-white/[0.02]">
                                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/10 group-hover:text-accent group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                         </div>
                                                                         <span className="text-[9px] font-black text-text-muted uppercase tracking-widest group-hover:text-white transition-colors">Synthesize Scene</span>
                                                                     </>
                                                                 )}
                                                             </button>
                                                         ) : (
                                                             <div className="space-y-4 animate-in zoom-in-95 duration-1000">
                                                                 <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-black border border-white/10 relative gallery-img-container">
                                                                     <img src={`data:${v.image.mimeType};base64,${v.image.base64}`} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" />
                                                                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 gap-2">
                                                                         <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">Prompt Concept</span>
                                                                          <p className="text-[10px] text-white/80 font-medium leading-relaxed line-clamp-3 italic">"{v.visualDescription}"</p>
                                                                     </div>
                                                                 </div>
                                                                 <div className="grid grid-cols-2 gap-3">
                                                                     <button onClick={() => generateVisual(i)} className="btn-secondary py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                                         Regenerate
                                                                     </button>
                                                                     <a 
                                                                         href={`data:${v.image.mimeType};base64,${v.image.base64}`} 
                                                                         download={`Vora-Creative-${i+1}.png`}
                                                                         className="btn-primary py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center !shadow-none"
                                                                     >
                                                                         Export
                                                                     </a>
                                                                 </div>
                                                             </div>
                                                         )}
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>

            {project.error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-card border-red-500/30 bg-red-500/10 px-10 py-5 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-5">
                    {project.error}
                </div>
            )}
        </main>
    );
});

export default AdCreativeStudio;
