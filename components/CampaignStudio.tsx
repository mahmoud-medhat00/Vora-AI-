
import React, { useCallback, useState } from 'react';
import { CampaignStudioProject, ImageFile, BrandingResult } from '../types';
import { resizeImage } from '../utils';
import { analyzeProductForCampaign, generateImage, editImage, suggestScenarios } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import BrandingResultsGrid from './BrandingResultsGrid';

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.908-.588l3.358-7.605a1 1 0 00-.908-1.407H4.305a1 1 0 00-.908 1.407l3.358 7.605a1 1 0 00.908.588zM12 21v-1m-2.25-1h4.5M12 5V2m-6.707 5.293l1.414 1.414m12.586 0l-1.414-1.414" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
);

// Updated for 6 professional scenarios
const DEFAULT_SCENARIOS = [
    'Professional Hero Front View (Studio)', 
    'Lifestyle: A person using the product naturally (Human connection)', 
    'Aesthetic Flat Lay Shot (Environment)',
    'Creative Abstract Composition (Artistic)',
    'Dynamic Close-up Detail (Macro)',
    'Outdoor Natural Sunlight Shot (Atmosphere)'
];

const CAMPAIGN_MOODS = [
    { label: 'Original', value: '' },
    { label: 'Minimalist White', value: 'Clean, minimalist white studio aesthetic' },
    { label: 'Dark Luxury', value: 'Dramatic dark luxury with gold accents' },
    { label: 'Pastel Pop', value: 'Soft playful pastel colors' },
    { label: 'Nature Green', value: 'Organic fresh natural green aesthetic' },
    { label: 'Ocean Blue', value: 'Deep serene ocean blue tones' },
    { label: 'Warm Gold', value: 'Warm, golden hour luxury lighting' },
    { label: 'Cyberpunk Neon', value: 'Vibrant neon cyberpunk style' },
];

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

const CampaignStudio: React.FC<{
    project: CampaignStudioProject;
    setProject: React.Dispatch<React.SetStateAction<CampaignStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    const [isBrainstorming, setIsBrainstorming] = useState(false);

    const productImages = project?.productImages || [];
    const results = project?.results || [];
    const suggestedScenarios = project?.suggestedScenarios || [];
    const mode = project?.mode || 'auto';

    const handleFileUpload = useCallback(async (files: File[]) => {
        if (!files || files.length === 0 || !project) return;
        setProject(s => ({ ...s, isUploading: true, error: null }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 2048, 2048);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            const combined = [...(project?.productImages || []), ...uploaded];
            setProject(s => ({ ...s, productImages: combined, isUploading: false, isAnalyzing: true }));
            const analysis = await analyzeProductForCampaign(combined);
            setProject(s => ({ ...s, productAnalysis: analysis, isAnalyzing: false }));
        } catch (err) {
            setProject(s => ({ ...s, isUploading: false, isAnalyzing: false, error: "Upload failed" }));
        }
    }, [project, setProject]);

    const handleBrainstorm = useCallback(async () => {
        if (!project?.productAnalysis) {
            setProject(s => ({ ...s, error: 'Please upload a product first to brainstorm ideas.' }));
            return;
        }
        setIsBrainstorming(true);
        try {
            const ideas = await suggestScenarios(project.productAnalysis);
            if (ideas.length > 0) {
                setProject(s => ({ ...s, suggestedScenarios: ideas }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsBrainstorming(false);
        }
    }, [project?.productAnalysis, setProject]);

    const handleApplySuggested = useCallback(() => {
        if (!suggestedScenarios.length) return;
        setProject(s => ({
            ...s,
            customIdeas: [...suggestedScenarios],
            mode: 'custom'
        }));
    }, [suggestedScenarios, setProject]);

    const handleRemoveProduct = useCallback((idx: number) => {
        setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, i) => i !== idx) }));
    }, [setProject]);

    const handleUpdateProduct = useCallback((idx: number, newImage: ImageFile) => {
        setProject(s => {
            const nextImages = [...(s.productImages || [])];
            nextImages[idx] = newImage;
            return { ...s, productImages: nextImages };
        });
    }, [setProject]);

    const handleCustomIdeaChange = useCallback((index: number, value: string) => {
        setProject(s => {
            const nextIdeas = [...(s.customIdeas || [])];
            nextIdeas[index] = value;
            return { ...s, customIdeas: nextIdeas };
        });
    }, [setProject]);

    const onGenerate = useCallback(async () => {
        if (!productImages.length || !project) return;
        
        if (mode === 'custom' && (project.customIdeas || []).every(idea => !idea.trim())) {
            setProject(s => ({ ...s, error: 'Please write at least one idea description.' }));
            return;
        }

        setProject(s => ({ ...s, isGenerating: true, error: null, results: [] }));
        
        try {
            let analysis = project.productAnalysis || await analyzeProductForCampaign(productImages);
            
            const scenarios = mode === 'auto' 
                ? DEFAULT_SCENARIOS 
                : (project.customIdeas || []).filter(idea => idea && idea.trim().length > 0);

            const initial = scenarios.map(scenario => ({ 
                scenario, 
                image: null, 
                isLoading: true, 
                error: null, 
                editPrompt: '', 
                isEditing: false 
            }));

            setProject(s => ({ ...s, results: initial as any }));

            const promises = scenarios.map((scenario) => {
                const moodV = mode === 'auto' ? (CAMPAIGN_MOODS.find(m => m.label === project.selectedMood)?.value || '') : '';
                const backgroundInfo = project.customPrompt ? ` Style details: ${project.customPrompt}.` : '';
                
                const textConstraint = "STRICTLY PRESERVE all original text, labels, and branding on the product. DO NOT erase or modify existing writing. NO EXTRA generated text in the scene environment.";

                const prompt = mode === 'auto'
                    ? `Professional Commercial Photography: ${analysis}. Scenario: ${scenario}. Style: ${moodV}.${backgroundInfo} PHOTOREALISTIC, HIGH-RESOLUTION, CLEAN IMAGE. ${textConstraint}`
                    : `Professional Product Idea Shoot: ${analysis}. Idea: ${scenario}.${backgroundInfo} PHOTOREALISTIC, STRICT IDENTITY PRESERVATION. ${textConstraint}`;
                
                return generateImage(productImages, prompt, null)
                    .then(image => ({ scenario, image }))
                    .catch(error => ({ scenario, error: error.message }));
            });

            const completed = await Promise.all(promises);
            
            setProject(s => {
                const nextResults = [...(s.results || [])];
                completed.forEach(res => {
                    const idx = nextResults.findIndex(r => r && r.scenario === res.scenario);
                    if (idx !== -1) {
                        if ('image' in res) nextResults[idx] = { ...nextResults[idx], image: res.image, isLoading: false };
                        else nextResults[idx] = { ...nextResults[idx], error: res.error, isLoading: false };
                    }
                });
                return { ...s, results: nextResults };
            });
        } catch (err) {
            setProject(s => ({ ...s, error: 'Generation failed', isGenerating: false }));
        } finally {
            setProject(s => ({ ...s, isGenerating: false }));
        }
    }, [productImages, project, mode, setProject]);

    const handleEditResult = async (index: number, editPromptText: string) => {
        const resultToEdit = results[index];
        if (!resultToEdit || !resultToEdit.image) return;

        setProject(s => {
            const nextResults = [...(s.results || [])];
            nextResults[index] = { ...nextResults[index], isEditing: true, error: null };
            return { ...s, results: nextResults };
        });

        try {
            const updatedImage = await editImage(resultToEdit.image, editPromptText);
            setProject(s => {
                const nextResults = [...(s.results || [])];
                nextResults[index] = { ...nextResults[index], image: updatedImage, isEditing: false };
                return { ...s, results: nextResults };
            });
        } catch (err) {
            console.error("Edit failed:", err);
            setProject(s => {
                const nextResults = [...(s.results || [])];
                nextResults[index] = { ...nextResults[index], isEditing: false, error: err instanceof Error ? err.message : "Edit failed" };
                return { ...s, results: nextResults };
            });
        }
    };

    if (!project) return null;

    const safeGridResults: BrandingResult[] = results.map(r => ({
        category: r.scenario as any,
        image: r.image || null,
        isLoading: !!r.isLoading,
        isEditing: !!r.isEditing,
        error: r.error || null,
        editPrompt: r.editPrompt || ''
    }));

    return (
        <main id="campaign-studio-main" className="w-full flex flex-col gap-10 md:gap-12 pt-4 md:pt-8 pb-24 animate-in fade-in duration-700 studio-container">
            {/* Mode & Strategy Switcher */}
            <div id="campaign-mode-switcher" className="flex flex-col items-center gap-4 md:gap-6">
                <div id="hero-badge" className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                   Campaign Orchestrator v2
                </div>
                <div id="mode-switcher-container" className="bg-white/5 p-1 rounded-[1.5rem] md:p-1.5 md:rounded-[2rem] border border-white/5 flex gap-1 w-full max-w-sm sm:max-w-md">
                    <button 
                        onClick={() => setProject(s => ({ ...s, mode: 'auto' }))}
                        className={`flex-1 px-4 md:px-10 py-2.5 md:py-3 rounded-[1rem] md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${mode === 'auto' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                    >
                        Standard Feed
                    </button>
                    <button 
                        onClick={() => setProject(s => ({ ...s, mode: 'custom' }))}
                        className={`flex-1 px-4 md:px-10 py-2.5 md:py-3 rounded-[1rem] md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${mode === 'custom' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                    >
                        Custom Vision
                    </button>
                </div>
            </div>

            {/* Main Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Product & Intelligence */}
                <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                    <div id="product-selection-card" className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                        <h3 className="input-label">Product Prototype</h3>
                        <div className="bg-black/20 p-2 rounded-3xl border border-white/5">
                            <ImageWorkspace
                                id="campaign-product-uploader"
                                images={productImages}
                                onImagesUpload={handleFileUpload}
                                onImageRemove={handleRemoveProduct}
                                isUploading={project.isUploading}
                                onImageUpdate={handleUpdateProduct}
                            />
                        </div>
                    </div>

                    <div id="campaign-settings-card" className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="input-label">Visual Aesthetic DNA</label>
                            <textarea 
                                value={project.customPrompt} 
                                onChange={(e) => setProject(s => ({ ...s, customPrompt: e.target.value }))} 
                                placeholder="Describe the atmosphere (e.g., 'Mediterranean luxury with soft dawn lighting')" 
                                className="glass-input min-h-[100px] resize-none text-sm"
                            />
                        </div>

                        {mode === 'auto' && (
                            <div className="flex flex-col gap-4">
                                <label className="input-label">Atmosphere Presets</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CAMPAIGN_MOODS.map(mood => (
                                        <button 
                                            key={mood.label} 
                                            onClick={() => setProject(s => ({ ...s, selectedMood: mood.label }))} 
                                            className={`px-3 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                                project.selectedMood === mood.label 
                                                ? 'bg-accent/20 text-accent border-accent/40 shadow-lg shadow-accent/5' 
                                                : 'bg-white/[0.02] text-text-muted border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            {mood.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Idea Workspace & Generation */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div id="campaign-workspace-card" className="glass-card rounded-[2.5rem] p-6 sm:p-8 md:p-12 border border-white/5 shadow-2xl bg-white/[0.01] flex flex-col gap-10">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter font-display uppercase leading-none">
                                        {mode === 'auto' ? 'Global Campaign Studio' : 'Visionary Asset Studio'}
                                    </h2>
                                </div>
                                <p className="text-text-secondary text-sm font-light mt-1 max-w-xl">
                                    {mode === 'auto' 
                                        ? 'Engineering 6 strategic Social Media assets with distinct narrative hooks and cinematic continuity.' 
                                        : 'Define specific cinematic visions for up to 6 custom campaign placements across the digital matrix.'}
                                </p>
                            </div>
                            <button 
                                id="generate-campaign-btn"
                                onClick={onGenerate} 
                                disabled={productImages.length === 0 || project.isGenerating} 
                                className="btn-primary w-full xl:w-auto px-10 py-5 rounded-2xl shadow-[0_20px_50px_rgba(var(--color-accent-rgb),0.3)] min-w-[200px] text-sm"
                            >
                                {project.isGenerating 
                                    ? 'SYCHRONIZING ASSETS...' 
                                    : 'INITIALIZE PRODUCTION'}
                            </button>
                        </div>

                        <div className="h-px w-full bg-white/5"></div>

                        {mode === 'custom' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {[0, 1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="flex flex-col gap-3 group">
                                        <div className="flex items-center gap-3">
                                          <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-text-muted group-hover:bg-accent/20 group-hover:text-accent transition-all duration-500">{idx + 1}</span>
                                          <label className="input-label !mb-0 text-text-muted">Asset Narrative</label>
                                        </div>
                                        <textarea 
                                            value={project.customIdeas[idx]}
                                            onChange={(e) => handleCustomIdeaChange(idx, e.target.value)}
                                            placeholder={`Scenario: Product in a high-end setting...`}
                                            className="glass-input h-32 focus:border-accent/40"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-8 md:gap-10">
                            {/* Analysis intelligence */}
                            <div className={`transition-all duration-700 overflow-hidden ${project.productAnalysis || project.isAnalyzing ? 'opacity-100' : 'opacity-0 max-h-0'}`}>
                                <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">◈</div>
                                          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Market Intelligence</h4>
                                        </div>
                                        {!project.isAnalyzing && project.productAnalysis && (
                                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-500/60 uppercase">System Optimized</div>
                                        )}
                                    </div>
                                    
                                    {project.isAnalyzing ? (
                                        <div className="flex items-center gap-4 text-emerald-500/60 animate-pulse py-4">
                                            <div className="w-5 h-5 border-4 border-current border-t-transparent animate-spin rounded-full"></div>
                                            <span className="text-sm font-black uppercase tracking-widest">Decrypting Product DNA...</span>
                                        </div>
                                    ) : (
                                        <textarea 
                                            value={project.productAnalysis || ''}
                                            onChange={(e) => setProject(s => ({ ...s, productAnalysis: e.target.value }))}
                                            rows={4}
                                            className="w-full bg-transparent border-none p-0 text-sm font-medium text-emerald-500/80 leading-relaxed focus:ring-0 resize-none suggestions-scrollbar placeholder:text-emerald-500/10"
                                            placeholder="Market insights will materialize here..."
                                        />
                                    )}
                                </div>
                            </div>

                            {project.productAnalysis && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent"><LightbulbIcon /></div>
                                          <label className="input-label !mb-0">Strategic Brainstorm</label>
                                        </div>
                                        <button 
                                            onClick={handleBrainstorm}
                                            disabled={isBrainstorming}
                                            className="text-[10px] font-black text-accent hover:text-accent-light transition-all uppercase tracking-[0.2em] flex items-center gap-2"
                                        >
                                            {isBrainstorming ? <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin"></div> : <SparklesIcon />}
                                            {isBrainstorming ? 'Computing...' : 'Recalculate Scenarios'}
                                        </button>
                                    </div>
                                    
                                    {suggestedScenarios.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
                                            {suggestedScenarios.map((idea, i) => (
                                                <div key={i} className="flex flex-col gap-3 p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all cursor-default group">
                                                    <div className="flex items-center gap-3">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform"></span>
                                                      <span className="text-[10px] font-black text-text-muted uppercase">Scenario {i + 1}</span>
                                                    </div>
                                                    <span className="text-xs text-text-secondary leading-relaxed font-medium">{idea}</span>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={handleApplySuggested}
                                                className="sm:col-span-2 py-5 rounded-2xl bg-white/5 hover:bg-accent hover:text-white text-accent text-[10px] font-black uppercase tracking-widest transition-all border border-accent/20 active:scale-95"
                                            >
                                                Deploy These Narratives to Studio
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {results.length > 0 && (
                <div className="flex flex-col gap-10 mt-12 animate-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center gap-6">
                        <div className="w-3 h-12 bg-accent rounded-full"></div>
                        <h3 className="text-4xl font-black text-white tracking-tighter uppercase font-display">Campaign Vault</h3>
                        <div className="h-px flex-grow bg-white/5"></div>
                        <span className="text-xs font-black text-text-muted tracking-widest">{results.length} ASSETS GENERATED</span>
                    </div>
                    <BrandingResultsGrid 
                        results={safeGridResults}
                        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        onEditResult={handleEditResult}
                    />
                </div>
            )}
            
            {/* Status bar simulated element */}
            <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center justify-between px-6 px-safe">
                 <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                         <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Neural Link Active</span>
                     </div>
                     <div className="w-px h-3 bg-white/10"></div>
                     <span className="text-[8px] font-black text-accent uppercase tracking-widest hidden sm:inline">{mode === 'auto' ? 'Standard Synthesis Mode' : 'Custom Vision Matrix'}</span>
                 </div>
                 <div className="flex items-center gap-4">
                     <span className="text-[8px] font-black text-white/40 uppercase tracking-widest font-mono">LATENCY: 14MS</span>
                     <div className="w-px h-3 bg-white/10"></div>
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest font-mono">SECURE</span>
                 </div>
            </div>

            {project.error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-card border-red-500/20 bg-red-500/10 px-8 py-4 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-5">
                    {project.error}
                </div>
            )}
        </main>
    );
});

export default CampaignStudio;
