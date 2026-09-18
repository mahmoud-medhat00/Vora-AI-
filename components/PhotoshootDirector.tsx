
import React, { useCallback } from 'react';
import { ImageFile, ShotType, PhotoshootDirectorProject } from '../types';
import { resizeImage } from '../utils';
import { generateImage, editImage, suggestShotTypes } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import ShotTypeSelector from './ShotTypeSelector';
import ResultsGrid from './ResultsGrid';

interface PhotoshootDirectorProps {
  project: PhotoshootDirectorProject;
  setProject: React.Dispatch<React.SetStateAction<PhotoshootDirectorProject>>;
}

const PhotoshootDirector: React.FC<PhotoshootDirectorProps> = React.memo(({ project, setProject }) => {

    if (!project) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const [isSuggesting, setIsSuggesting] = React.useState(false);

    const productImages = project.productImages || [];
    const selectedShotTypes = project.selectedShotTypes || [];
    const results = project.results || [];

    const handleSuggestShots = async () => {
        if (productImages.length === 0) return;
        setIsSuggesting(true);
        try {
            const suggestions = await suggestShotTypes(productImages);
            setProject(s => ({ ...s, selectedShotTypes: suggestions }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const onGenerate = useCallback(async () => {
    if (!project || productImages.length === 0 || selectedShotTypes.length === 0) {
      setProject(s => ({ ...s, error: 'Please upload a product image and select at least one shot type.' }));
      return;
    }

    setProject(s => ({
      ...s,
      isGenerating: true,
      error: null,
      results: selectedShotTypes.map(shotType => ({
        shotType,
        image: null,
        isLoading: true,
        error: null,
        editPrompt: '',
        isEditing: false,
      })),
    }));

    const generationPromises = selectedShotTypes.map(shotType => {
      const textProtection = "STRICTLY PRESERVE all original text, labels, and branding on the product. DO NOT erase original writing. NO EXTRA generated text in the scene.";
      let prompt = `A high-resolution, professional photograph of the subject from the provided image. The desired shot is: '${shotType}'. The background should be clean, non-distracting, and complementary to the subject. ${textProtection}`;
      if (project.customStylePrompt) {
        prompt += ` Additional style requirements: ${project.customStylePrompt}`;
      }
      return generateImage(productImages, prompt, null)
        .then(image => ({ status: 'fulfilled' as const, value: { shotType, image } }))
        .catch(error => ({ status: 'rejected' as const, reason: { shotType, error } }));
    });

    const settledResults = await Promise.all(generationPromises);

    settledResults.forEach(result => {
      if (result.status === 'fulfilled') {
        const { shotType, image } = result.value;
        setProject(s => ({
          ...s,
          results: s.results.map(r => r.shotType === shotType ? { ...r, image, isLoading: false } : r),
        }));
      } else {
        const { shotType, error } = result.reason;
        console.error(`Failed to generate image for ${shotType}:`, error);
        setProject(s => ({
          ...s,
          results: s.results.map(r => r.shotType === shotType ? { ...r, error: error.message || 'Generation failed', isLoading: false } : r),
        }));
      }
    });
    
    setProject(s => ({ ...s, isGenerating: false }));
  }, [project, setProject]);

  const handleEditResult = async (index: number, prompt: string) => {
      const result = results[index];
      if (!result || !result.image) return;

      setProject(s => {
          const newResults = [...(s.results || [])];
          if (newResults[index]) newResults[index] = { ...newResults[index], isEditing: true, error: null };
          return { ...s, results: newResults };
      });

      try {
          const updated = await editImage(result.image, prompt);
          setProject(s => {
              const newResults = [...(s.results || [])];
              if (newResults[index]) newResults[index] = { ...newResults[index], image: updated, isEditing: false };
              return { ...s, results: newResults };
          });
      } catch (err) {
          setProject(s => {
              const newResults = [...(s.results || [])];
              if (newResults[index]) newResults[index] = { ...newResults[index], isEditing: false, error: err instanceof Error ? err.message : 'Edit failed' };
              return { ...s, results: newResults };
          });
      }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setProject(s => ({ ...s, isUploading: true, error: null }));
    let currentError: string | null = null;
    
    const filePromises = files.map(file => {
      return new Promise<ImageFile | null>(async (resolve) => {
        if (!file.type.startsWith('image/')) {
          if (!currentError) currentError = `File '${file.name}' is not a supported image type.`;
          resolve(null);
          return;
        }
        try {
          const resizedFile = await resizeImage(file, 2048, 2048);
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve({
              base64: base64String.split(',')[1],
              mimeType: resizedFile.type,
              name: resizedFile.name
            });
          };
          reader.onerror = () => {
            if (!currentError) currentError = `Error reading file '${resizedFile.name}'.`;
            resolve(null);
          };
          reader.readAsDataURL(resizedFile);
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
          if (!currentError) currentError = `Could not process file '${file.name}'.`;
          resolve(null);
        }
      });
    });

    const resultsArr = await Promise.all(filePromises);
    const validImages = resultsArr.filter((img): img is ImageFile => img !== null);

    setProject(s => ({
      ...s,
      productImages: [...(s.productImages || []), ...validImages],
      error: currentError,
      isUploading: false,
    }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProject(s => ({
      ...s,
      productImages: (s.productImages || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleImageUpdate = (index: number, newImage: ImageFile) => {
      setProject(s => {
          const newImages = [...(s.productImages || [])];
          if (index >= 0 && index < newImages.length) {
              newImages[index] = newImage;
          }
          return { ...s, productImages: newImages };
      });
  };

  return (
    <main className="w-full flex flex-col gap-10 pt-4 md:pt-8 pb-32 animate-in fade-in duration-700 studio-container">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4 px-2 md:px-0">
          <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                  Neural Product Labs
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                 Photoshoot Director
              </h2>
              <p className="text-text-secondary text-sm md:text-base font-light mt-3 max-w-xl">
                  Automate high-fidelity product photography with AI-driven shot planning, cinematic lighting, and precision environmental synthesis.
              </p>
          </div>
          <button 
              onClick={handleSuggestShots}
              disabled={isSuggesting || productImages.length === 0}
              className="w-full md:w-auto px-8 py-4 md:py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/30 text-[10px] font-black uppercase tracking-widest text-accent transition-all active:scale-95 shadow-xl backdrop-blur-xl"
          >
              {isSuggesting ? 'Analyzing DNA...' : 'Smart Scene Suggestions'}
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 mb-6">
                 <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-black">01</div>
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Source Material</h3>
            </div>
            <div className="bg-black/20 p-2 rounded-3xl border border-white/5">
                <ImageWorkspace
                  id="photoshoot-product-uploader"
                  images={productImages}
                  onImagesUpload={handleFileUpload}
                  onImageRemove={handleRemoveImage}
                  isUploading={project.isUploading}
                  onImageUpdate={handleImageUpdate}
                />
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.02]">
             <div className="flex items-center gap-4 mb-8">
                 <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-black">02</div>
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Shot Strategy</h3>
            </div>

             <ShotTypeSelector
                selected={selectedShotTypes}
                onChange={(selected) => setProject(s => ({ ...s, selectedShotTypes: selected }))}
                customStylePrompt={project.customStylePrompt}
                onCustomStylePromptChange={(prompt) => setProject(s => ({...s, customStylePrompt: prompt }))}
              />
              
              <div className="mt-10">
                <button
                    onClick={onGenerate}
                    disabled={project.isGenerating || project.isUploading || productImages.length === 0 || selectedShotTypes.length === 0}
                    className="btn-primary w-full py-5 rounded-2xl text-base shadow-[0_20px_50px_rgba(var(--color-accent-rgb),0.3)]"
                >
                    {project.isGenerating ? 'Synthesizing Production...' : `Initialize Creative Loop`}
                </button>
                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] text-center mt-6 opacity-40">Preserving Original Branding & Identity Matrix</p>
              </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="flex flex-col glass-card rounded-[3.5rem] p-4 lg:p-4 border border-white/5 bg-white/[0.01] min-h-[600px] relative overflow-hidden">
               {/* Grid texture background */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
               
               <div className="flex justify-between items-center p-8 lg:p-10 relative z-10">
                   <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-black">03</div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Production Renders</h3>
                   </div>
                   <div className="flex items-center gap-6 text-[9px] font-black text-text-muted uppercase tracking-widest hidden sm:flex">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Online</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Neural Core Active</span>
                   </div>
               </div>

               <div className="px-8 pb-8 relative z-10">
                    {project.error && (
                        <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest animate-in slide-in-from-top-4" role="alert">
                            {project.error}
                        </div>
                    )}
                    <ResultsGrid 
                        results={results} 
                        onEditResult={handleEditResult}
                    />
               </div>
               
               {/* Placeholder state when no results */}
               {results.length === 0 && !project.isGenerating && (
                    <div className="flex-grow flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center mb-10 group hover:border-accent/40 transition-colors duration-700">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/5 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-700">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                 </svg>
                             </div>
                        </div>
                        <h4 className="text-xl font-black text-white/20 uppercase tracking-tighter italic">Cinema Ready</h4>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mt-3">Await generation to see cinematic captures</p>
                    </div>
               )}
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
                <span className="text-[8px] font-black text-accent uppercase tracking-widest hidden sm:inline">Product Synthesis Engine</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest font-mono">LATENCY: 22MS</span>
                <div className="w-px h-3 bg-white/10"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest font-mono">SECURE</span>
            </div>
      </div>
    </main>
  );
});

export default PhotoshootDirector;
