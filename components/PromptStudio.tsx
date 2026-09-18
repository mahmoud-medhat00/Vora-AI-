
import React, { useState, useCallback } from 'react';
import { PromptStudioProject, ImageFile, PromptStudioHistoryItem } from '../types';
import { analyzeImageForPrompt, generatePromptFromText } from '../services/geminiService';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

// --- ICONS ---
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
// --- END ICONS ---


const PromptStudio: React.FC<{
  project: PromptStudioProject;
  setProject: React.Dispatch<React.SetStateAction<PromptStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    if (!project) return null;

    const [copied, setCopied] = useState(false);

    const TEXT_ONLY_PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 2 7h10c0-2 2-4 2-7a7 7 0 0 0-7-7Z"></path></svg>`;
    const placeholderImageFile: ImageFile = {
        base64: btoa(TEXT_ONLY_PLACEHOLDER_SVG),
        mimeType: 'image/svg+xml',
        name: 'text-idea.svg'
    };

    const images = project.images || [];
    const history = project.history || [];

    const handleFileUpload = async (files: File[]) => {
      if (!files || files.length === 0) return;
      setProject(s => ({ ...s, isUploading: true, error: null }));
      
      try {
          const uploaded = await Promise.all(files.map(async file => {
              const resizedFile = await resizeImage(file, 1024, 1024);
              const reader = new FileReader();
              return new Promise<ImageFile>(res => {
                  reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resizedFile.type, name: resizedFile.name });
                  reader.readAsDataURL(resizedFile);
              });
          }));
          setProject(s => ({ ...s, images: [...(s.images || []), ...uploaded], isUploading: false }));
      } catch (err) {
          setProject(s => ({ ...s, error: "Upload failed", isUploading: false }));
      }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setProject(s => ({ ...s, images: (s.images || []).filter((_, i) => i !== indexToRemove) }));
    };

    const handleUpdateImage = (index: number, newImage: ImageFile) => {
        setProject(s => {
            const nextImages = [...(s.images || [])];
            if (nextImages[index]) nextImages[index] = newImage;
            return { ...s, images: nextImages };
        });
    };

    const handleGenerate = useCallback(async () => {
        if (images.length === 0 && !(project.instructions || '').trim()) {
            setProject(s => ({ ...s, error: 'Please upload an image or write an idea in the instructions.' }));
            return;
        }
        setProject(s => ({ ...s, isLoading: true, error: null, generatedPrompt: null }));
        try {
            let prompt: string;
            let historyImage: ImageFile;

            if (images.length > 0) {
                prompt = await analyzeImageForPrompt(images, project.instructions);
                historyImage = images[0];
            } else {
                prompt = await generatePromptFromText(project.instructions);
                historyImage = placeholderImageFile;
            }

            const newHistoryItem: PromptStudioHistoryItem = {
                image: historyImage,
                instructions: project.instructions,
                generatedPrompt: prompt,
            };
            setProject(s => ({
                ...s,
                isLoading: false,
                generatedPrompt: prompt,
                history: [newHistoryItem, ...(s.history || [])],
                instructions: '', 
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setProject(s => ({ ...s, isLoading: false, error: errorMessage }));
        }
    }, [images, project.instructions, setProject]);

    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="w-full flex flex-col gap-12 pt-8 pb-24 animate-in fade-in duration-700 studio-container">
            {/* Header section */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                            Prompt Engineering Core
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                           Prompt Architect
                        </h2>
                        <p className="text-text-secondary text-base font-light mt-3 max-w-xl">
                            Reverse-engineer aesthetics from reference imagery or synthesize complex creative instructions into machine-optimized prompts.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input Selection */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col gap-8 h-full">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h3 className="input-label !mb-0">Reference Vision</h3>
                                    <div className="bg-black/20 p-4 rounded-3xl border border-white/5 aspect-square max-w-[400px] mx-auto w-full">
                                        <ImageWorkspace
                                            id="prompt-studio-workspace"
                                            title="Visual Reference"
                                            images={images}
                                            onImagesUpload={handleFileUpload}
                                            onImageRemove={handleRemoveImage}
                                            isUploading={project.isUploading}
                                            onImageUpdate={handleUpdateImage}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                       <label className="input-label !mb-0">Aesthetic Logic</label>
                                       <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Optional Meta-Briefing</span>
                                    </div>
                                    <textarea 
                                        value={project.instructions || ''} 
                                        onChange={e => setProject({...project, instructions: e.target.value})} 
                                        rows={5} 
                                        className="glass-input min-h-[140px] resize-none text-xs leading-relaxed" 
                                        placeholder="Add context, specific stylistic requirements, or leave empty to reverse-engineer visual references..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={project.isLoading || project.isUploading || (images.length === 0 && !(project.instructions || '').trim())}
                                className="btn-primary w-full py-5 rounded-2xl shadow-[0_20px_40px_rgba(var(--color-accent-rgb),0.2)] text-base mt-auto"
                            >
                                {project.isLoading ? 'SYNTHESIZING...' : 'GENERATE MASTER PROMPT'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Results & Output */}
                    <div className="lg:col-span-7 flex flex-col gap-8 h-full">
                        {/* Current Result */}
                        <div className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 flex flex-col gap-8 min-h-[300px]">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-10 bg-accent rounded-full"></div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Generated Prompt</h3>
                                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em]">Machine-Optimized Variable Syntax</p>
                                    </div>
                                </div>
                                {project.generatedPrompt && (
                                    <button 
                                        onClick={() => handleCopy(project.generatedPrompt ?? '')} 
                                        className="btn-secondary px-6 py-3 rounded-xl flex items-center gap-2 group"
                                    >
                                        {copied ? <CheckIcon /> : <CopyIcon />} 
                                        <span className="text-[10px] font-black uppercase tracking-widest group-active:scale-95">{copied ? 'SECURED' : 'CLONE SYNTAX'}</span>
                                    </button>
                                )}
                            </div>

                            {project.generatedPrompt ? (
                                <div className="relative group animate-in fade-in zoom-in-95 duration-500">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative p-8 bg-black/40 rounded-[2rem] border border-white/5 text-text-secondary font-mono text-sm leading-loose whitespace-pre-wrap select-all">
                                        {project.generatedPrompt}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center opacity-10 py-12 border-2 border-dashed border-white/5 rounded-[2rem]">
                                    <div className="text-6xl mb-6">◈</div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Input Neural Bridge</p>
                                </div>
                            )}

                            {project.error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-bottom-2">
                                    {project.error}
                                </div>
                            )}
                        </div>

                        {/* History */}
                        <div className="glass-card p-8 rounded-[2.5rem] bg-[#050505] border border-white/5 flex flex-col gap-6 flex-grow">
                            <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.4em]">Chronological Synthesis</h3>
                            {history.length === 0 ? (
                                <div className="flex-grow flex flex-col items-center justify-center py-12 opacity-5 italic text-xs uppercase tracking-widest">
                                    No Prior Records
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto suggestions-scrollbar pr-4">
                                    {history.map((item, index) => (
                                        <div key={index} className="flex items-center gap-6 p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl border border-white/5 transition-all group cursor-pointer" onClick={() => setProject(s => ({ ...s, generatedPrompt: item.generatedPrompt }))}>
                                           <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10 group-hover:border-accent/40 transition-colors">
                                               <img src={`data:${item.image.mimeType};base64,${item.image.base64}`} alt="Reference" className="w-full h-full object-cover"/>
                                           </div>
                                           <div className="flex-1 overflow-hidden">
                                              <p className="text-[11px] text-text-secondary font-mono line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{item.generatedPrompt}</p>
                                              {item.instructions && (
                                                  <div className="flex items-center gap-2 mt-2">
                                                      <div className="w-1 h-1 rounded-full bg-accent"></div>
                                                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{item.instructions}</span>
                                                  </div>
                                              )}
                                           </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
});

export default PromptStudio;
