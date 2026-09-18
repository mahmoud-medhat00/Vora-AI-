
import React, { useCallback } from 'react';
import { ImageFile, BrandingStudioProject, BrandingResultCategory, AspectRatio } from '../types';
import { resizeImage } from '../utils';
import { analyzeLogoForBranding, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import BrandingResultsGrid from './BrandingResultsGrid';
import { ASPECT_RATIOS } from '../constants';

const MOCKUP_CATEGORIES: BrandingResultCategory[] = [
    'Logo Construction Grid', 'Typography Showcase', 'Logo Color Variations', 'Monochrome Version',
    '3D Glass Logo', 'Business Card Mockup', '3D Glass App Icon', 'Creative Pen Mockup',
    'Merchandise (Tote Bag)', 'Pencil Sketch Logo', 'Notebook Mockup', 'Waving Flag Mockup'
];

const getPromptForCategory = (category: BrandingResultCategory, aspectRatio: AspectRatio): string => {
    const aspectRatioRequirement = ` The final image must have a ${aspectRatio} aspect ratio.`;
    switch (category) {
        case 'Logo Construction Grid':
            return "Create a technical brand guideline image. Display the provided logo on a light grid, showing construction lines, proportions, and a clear space margin around it." + aspectRatioRequirement;
        case 'Typography Showcase':
            return "Create a brand typography specimen sheet. Analyze the font style used in the provided logo and display full English alphabet neatly on a minimalist background." + aspectRatioRequirement;
        case 'Logo Color Variations':
            return "Create a brand guideline image showing logo color variations. Display four versions of the provided logo on different solid-colored backgrounds." + aspectRatioRequirement;
        case 'Monochrome Version':
            return 'A high-contrast, single-color (white) version of the provided logo, presented on a black background.' + aspectRatioRequirement;
        case '3D Glass Logo':
            return "Create a photorealistic 3D mockup of the provided logo rendered in glossy, translucent glass." + aspectRatioRequirement;
        case 'Business Card Mockup':
            return "A photorealistic mockup of a premium business card featuring the provided logo on marble background." + aspectRatioRequirement;
        case '3D Glass App Icon':
            return "Create a photorealistic 3D app icon from the provided logo in glossy translucent glass." + aspectRatioRequirement;
        case 'Creative Pen Mockup':
            return "A photorealistic mockup of a high-end elegant pen with the provided logo subtly engraved." + aspectRatioRequirement;
        case 'Merchandise (Tote Bag)':
            return "A photorealistic lifestyle mockup of the provided logo printed on a high-quality canvas tote bag." + aspectRatioRequirement;
        case 'Pencil Sketch Logo':
            return "Create a photorealistic artistic sketch of the provided logo as if hand-drawn with graphite pencil." + aspectRatioRequirement;
        case 'Notebook Mockup':
            return "A photorealistic mockup of a premium notebook with logo elegantly debossed on the cover." + aspectRatioRequirement;
        case 'Waving Flag Mockup':
            return "A photorealistic mockup of the provided logo on a large flag waving gently against a clear sky." + aspectRatioRequirement;
        default:
            return `A professional product shot of the provided logo.` + aspectRatioRequirement;
    }
}

const BrandingStudio: React.FC<{
  project: BrandingStudioProject;
  setProject: React.Dispatch<React.SetStateAction<BrandingStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    if (!project) return null;

    const logos = project.logos || [];
    const results = project.results || [];
    const colors = project.colors || [];

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 1024, 1024);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({
                ...s,
                logos: [...(s.logos || []), ...uploaded],
                isUploading: false,
                results: [],
                colors: [],
            }));
        } catch (err) {
            setProject(s => ({ ...s, error: 'Upload failed', isUploading: false }));
        }
    };

    const handleRemoveLogo = (idx: number) => setProject(s => ({ ...s, logos: (s.logos || []).filter((_, i) => i !== idx), results: [], colors: [], error: null }));
    const handleUpdateLogo = (idx: number, newImage: ImageFile) => setProject(s => {
        const nextLogos = [...(s.logos || [])];
        if (nextLogos[idx]) nextLogos[idx] = newImage;
        return { ...s, logos: nextLogos, results: [], colors: [] };
    });
    
    const onGenerate = useCallback(async () => {
        if (logos.length === 0) return;
        setProject(s => ({...s, isAnalyzing: true, isGenerating: true, error: null, colors: [], results: []}));
        try {
            const analysis = await analyzeLogoForBranding(logos);
            setProject(s => ({...s, colors: analysis.colors, isAnalyzing: false}));
            const initialResults = MOCKUP_CATEGORIES.map(category => ({ category, image: null, isLoading: true, error: null, editPrompt: '', isEditing: false }));
            setProject(s => ({...s, results: initialResults}));
            const promises = MOCKUP_CATEGORIES.map(category => {
                const prompt = getPromptForCategory(category, project.aspectRatio);
                return generateImage([logos[0]], prompt, null) // Primary logo as reference
                    .then(image => ({ status: 'fulfilled' as const, value: { category, image } }))
                    .catch(error => ({ status: 'rejected' as const, reason: { category, error } }));
            });
            const settledResults = await Promise.all(promises);
            settledResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    const { category, image } = result.value;
                    setProject(s => ({...s, results: s.results.map(r => r.category === category ? { ...r, image, isLoading: false } : r)}));
                } else {
                    const { category, error } = result.reason;
                    setProject(s => ({ ...s, results: s.results.map(r => r.category === category ? { ...r, error: error.message || 'Generation failed', isLoading: false } : r)}));
                }
            });
        } catch(err) {
            setProject(s => ({...s, error: 'Analysis failed', isAnalyzing: false }));
        } finally {
            setProject(s => ({...s, isGenerating: false}));
        }
    }, [project.logos, project.aspectRatio, setProject]);

  return (
    <main className="w-full flex flex-col gap-10 pt-4 md:pt-8 pb-32 animate-in fade-in duration-700 studio-container">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4 px-2 md:px-0">
          <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                  Visual Identity Matrix
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                 Branding Studio
              </h2>
              <p className="text-text-secondary text-sm md:text-base font-light mt-3 max-w-xl">
                  Synthesize comprehensive brand ecosystems through deep neural analysis of your core identity markers.
              </p>
          </div>
          <div className="flex flex-col gap-3 items-center md:items-end w-full md:w-auto">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mr-2">Core Aspect Ratio</span>
              <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                {ASPECT_RATIOS.map(ratio => (
                    <button 
                        key={ratio.value} 
                        onClick={() => setProject(s => ({ ...s, aspectRatio: ratio.value as AspectRatio }))} 
                        className={`flex-1 md:flex-none px-4 py-2 md:py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${project.aspectRatio === ratio.value ? 'bg-accent text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        {ratio.value}
                    </button>
                ))}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-black">01</div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Primary Marker</h3>
                </div>
                <div className="bg-black/20 p-2 rounded-3xl border border-white/5">
                    <ImageWorkspace
                        id="branding-logo-uploader"
                        title="Logo"
                        images={logos}
                        onImagesUpload={handleFileUpload}
                        onImageRemove={handleRemoveLogo}
                        isUploading={project.isUploading}
                        onImageUpdate={handleUpdateLogo}
                    />
                </div>
                <button 
                    onClick={onGenerate} 
                    disabled={logos.length === 0 || project.isGenerating} 
                    className="btn-primary w-full py-5 rounded-2xl mt-8 shadow-[0_20px_50px_rgba(var(--color-accent-rgb),0.3)]"
                >
                    {project.isGenerating ? 'Extrapolating Identity...' : 'Generate Brand Ecosystem'}
                </button>
            </div>

            {colors.length > 0 && (
                <div className="glass-card rounded-[2rem] p-8 border border-white/5 bg-white/[0.01] animate-in slide-in-from-bottom-4">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 opacity-40">Extracted Color Lattice</h3>
                    <div className="flex flex-wrap gap-4">
                        {colors.map((color, index) => (
                            <div key={index} className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl border border-white/5 shadow-xl" style={{backgroundColor: color}}></div>
                                <span className="text-[8px] font-black text-text-muted font-mono uppercase">{color}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="lg:col-span-8">
            <div className="glass-card rounded-[3.5rem] p-4 border border-white/5 bg-white/[0.01] min-h-[600px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                
                <div className="flex justify-between items-center p-8 relative z-10">
                   <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-black">02</div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Collateral</h3>
                   </div>
                   <div className="flex items-center gap-6 text-[9px] font-black text-text-muted uppercase tracking-widest hidden sm:flex">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Matrix Ready</span>
                   </div>
               </div>

               <div className="px-8 pb-10 relative z-10">
                    {results.length > 0 ? (
                        <BrandingResultsGrid results={results} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20 uppercase tracking-widest text-center">
                            <span className="text-4xl mb-4">◈</span>
                            <p className="text-[10px] font-black">Awaiting generation sequence</p>
                        </div>
                    )}
               </div>
            </div>
        </div>
      </div>

      {/* Status bar simulated element */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center justify-between px-6 px-safe">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Neural Link Active</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest hidden sm:inline">Identity Synthesis Matrix</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest font-mono">LATENCY: 18MS</span>
                <div className="w-px h-3 bg-white/10"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest font-mono">SECURE</span>
            </div>
      </div>
    </main>
  );
});

export default BrandingStudio;
