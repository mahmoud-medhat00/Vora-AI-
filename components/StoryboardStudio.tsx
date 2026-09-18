
import React, { useCallback, useState } from 'react';
import { StoryboardStudioProject, ImageFile, StoryboardScene } from '../types';
import { resizeImage } from '../utils';
import { generateStoryboardPlan, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';

const DirectorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const StoryboardStudio: React.FC<{
    project: StoryboardStudioProject;
    setProject: React.Dispatch<React.SetStateAction<StoryboardStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    if (!project) return null;

    const subjectImages = project.subjectImages || [];
    const scenes = project.scenes || [];

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
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
            setProject(s => ({
                ...s,
                subjectImages: [...(s.subjectImages || []), ...uploaded],
                isUploading: false,
                gridImage: null,
                scenes: []
            }));
        } catch (err) {
            setProject(s => ({ ...s, isUploading: false, error: "Upload failed" }));
        }
    };

    const handleRemoveSubject = (idx: number) => {
        setProject(s => ({ ...s, subjectImages: (s.subjectImages || []).filter((_, i) => i !== idx), scenes: [], gridImage: null }));
    };

    const onCreatePlan = async () => {
        setProject(s => ({ ...s, isGeneratingPlan: true, error: null, scenes: [], gridImage: null }));
        try {
            const plan = await generateStoryboardPlan(subjectImages, project.customInstructions);
            const storyboardScenes: StoryboardScene[] = plan.map(p => ({
                ...p,
                id: Math.random().toString(36).substr(2, 9),
                image: null,
                isLoading: false,
                error: null
            }));
            setProject(s => ({ ...s, scenes: storyboardScenes, isGeneratingPlan: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGeneratingPlan: false, error: "Failed to generate storyboard plan" }));
        }
    };

    const onGenerateGrid = async () => {
        if (scenes.length === 0) return;
        setProject(s => ({ ...s, isGeneratingGrid: true, error: null }));
        try {
            const prompt = `A professional storyboard grid layout containing 9 numbered panels. Each panel showing a unique scene of the story: ${project.customInstructions}. High contrast, cinematic lighting, sketching style mixed with digital art. Maintain identity from subject image. Aspect Ratio: ${project.aspectRatio}. 8k resolution.`;
            const image = await generateImage(subjectImages, prompt, null, project.aspectRatio);
            setProject(s => ({ ...s, gridImage: image, isGeneratingGrid: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGeneratingGrid: false, error: "Grid generation failed" }));
        }
    };

    const onGenerateSceneImage = async (sceneId: string) => {
        const sceneIdx = scenes.findIndex(s => s.id === sceneId);
        if (sceneIdx === -1) return;

        setProject(s => {
            const next = [...(s.scenes || [])];
            if (next[sceneIdx]) next[sceneIdx] = { ...next[sceneIdx], isLoading: true, error: null };
            return { ...s, scenes: next };
        });

        try {
            const scene = scenes[sceneIdx];
            const textConstraint = "STRICTLY PRESERVE all original branding/features from provided subject images. NO EXTRA text.";
            const finalPrompt = `Professional Cinema Shot. ${scene.cameraAngle}. ${scene.visualPrompt}. HIGH-END COMMERCIAL QUALITY. 8k, Photorealistic. ${textConstraint}`;
            
            const image = await generateImage(subjectImages, finalPrompt, null, project.aspectRatio);
            
            setProject(s => {
                const next = [...(s.scenes || [])];
                if (next[sceneIdx]) next[sceneIdx] = { ...next[sceneIdx], image, isLoading: false };
                return { ...s, scenes: next };
            });
        } catch (err) {
            setProject(s => {
                const next = [...(s.scenes || [])];
                if (next[sceneIdx]) next[sceneIdx] = { ...next[sceneIdx], isLoading: false, error: "Failed to generate HQ image" };
                return { ...s, scenes: next };
            });
        }
    };

    const handleDownload = (image: ImageFile, label: string) => {
        const link = document.createElement('a');
        link.href = `data:${image.mimeType};base64,${image.base64}`;
        link.download = `Jenta-Storyboard-${label.replace(/\s+/g, '-')}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="w-full flex flex-col gap-12 pt-8 pb-24 animate-in fade-in duration-700 studio-container">
            {/* Header Section */}
            <div className="flex flex-col gap-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                            Cinematic Intelligence Engine
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                           Storyboard Director
                        </h2>
                        <p className="text-text-secondary text-base font-light mt-3 max-w-xl">
                            Architect visual narratives with pixel-perfect scene orchestration, camera strategy mapping, and high-fidelity production renders.
                        </p>
                    </div>
                    <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 backdrop-blur-xl">
                        <button 
                            onClick={() => setProject(s => ({ ...s, aspectRatio: '16:9' }))}
                            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${project.aspectRatio === '16:9' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                        >
                            16:9 Cinema
                        </button>
                        <button 
                            onClick={() => setProject(s => ({ ...s, aspectRatio: '9:16' }))}
                            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${project.aspectRatio === '9:16' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:text-white'}`}
                        >
                            9:16 Vision
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                            <label className="input-label !mb-4 px-1 text-center block">Reference Subject</label>
                            <div className="bg-black/20 p-2 rounded-3xl border border-white/5">
                                <ImageWorkspace
                                    id="storyboard-subject-uploader"
                                    images={subjectImages}
                                    onImagesUpload={handleFileUpload}
                                    onImageRemove={handleRemoveSubject}
                                    isUploading={project.isUploading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-9 flex flex-col gap-6">
                        <div className="glass-card p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
                            {/* Decorative background pulse */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-colors duration-1000"></div>
                            
                            <div className="space-y-3 relative z-10">
                                <label className="text-xs font-black text-accent uppercase tracking-[0.4em] px-1 flex items-center gap-3">
                                    <div className="w-4 h-[1px] bg-accent"></div> Story Vision & Cinematic Narrative
                                </label>
                                <textarea
                                    value={project.customInstructions || ''}
                                    onChange={(e) => setProject(s => ({ ...s, customInstructions: e.target.value }))}
                                    placeholder="e.g. A futuristic protagonist discovering an ancient artifact in a bioluminescent cavern. High-contrast chiaroscuro lighting, anamorphic lens flares."
                                    className="w-full bg-transparent border border-white/5 bg-white/[0.01] rounded-3xl p-8 text-xl font-medium focus:ring-1 focus:ring-accent/30 focus:border-accent/30 outline-none suggestions-scrollbar min-h-[160px] text-white leading-relaxed tracking-tight"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <button
                                    onClick={onCreatePlan}
                                    disabled={project.isGeneratingPlan || !(project.customInstructions || '').trim()}
                                    className="btn-primary flex-1 py-5 rounded-2xl text-base"
                                >
                                    {project.isGeneratingPlan ? 'ENGINEERING SCRIPT...' : 'INITIALIZE 9-SCENE MATRIX'}
                                </button>
                                {scenes.length > 0 && (
                                    <button
                                        onClick={onGenerateGrid}
                                        disabled={project.isGeneratingGrid}
                                        className="btn-secondary flex-1 py-5 rounded-2xl flex items-center justify-center gap-3 text-base"
                                    >
                                        <GridIcon />
                                        {project.isGeneratingGrid ? 'CONSTRUCTING GRID...' : 'GENERATE MASTER GRID'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Image Preview */}
            {project.gridImage && (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex justify-between items-end mb-8 gap-4 px-2">
                        <div>
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Integrated Layout</span>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Storyboard Grid</h3>
                        </div>
                        <button 
                            onClick={() => handleDownload(project.gridImage!, 'Preview-Grid')} 
                            className="btn-primary px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                        >
                            <DownloadIcon />
                            Synchronize & Export
                        </button>
                    </div>
                    <div className={`glass-card rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_45px_100px_rgba(0,0,0,0.5)] bg-black/40 relative group ${project.aspectRatio === '9:16' ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video'}`}>
                        <img src={`data:${project.gridImage.mimeType};base64,${project.gridImage.base64}`} alt="Storyboard Grid" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[5s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-12">
                             <div className="flex items-center gap-6">
                                 <div className="px-6 py-2 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Neural Preview Matrix</div>
                                 <div className="h-px flex-grow bg-white/20"></div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Scenes List */}
            {scenes.length > 0 && (
                <div className="flex flex-col gap-10">
                    <div className="flex items-center gap-6 px-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Scene Decomposition</h3>
                        <div className="h-px flex-grow bg-white/5"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {scenes.map((scene, idx) => (
                            <div key={scene.id} className="group relative animate-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="glass-card rounded-[3rem] overflow-hidden border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-500 hover:border-accent/30 shadow-2xl h-full flex flex-col">
                                    <div className={`relative bg-black flex items-center justify-center overflow-hidden neural-visualizer ${project.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                                        {scene.isLoading ? (
                                            <div className="flex flex-col items-center gap-4 py-20">
                                                <div className="w-12 h-12 rounded-full border-2 border-t-accent border-white/5 animate-spin"></div>
                                                <span className="text-[9px] font-black text-accent tracking-[0.4em] uppercase animate-pulse">Neural Synthesis...</span>
                                            </div>
                                        ) : scene.image ? (
                                            <div className="w-full h-full relative group/img gallery-img-container">
                                                <img src={`data:${scene.image.mimeType};base64,${scene.image.base64}`} alt={`Scene ${idx+1}`} className="w-full h-full object-cover transition-transform duration-[3s] group-hover/img:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <button 
                                                        onClick={() => handleDownload(scene.image!, `Scene-${idx+1}`)} 
                                                        className="w-14 h-14 bg-accent text-white rounded-full hover:scale-110 transition-transform shadow-2xl flex items-center justify-center"
                                                        title="Export Asset"
                                                    >
                                                        <DownloadIcon />
                                                    </button>
                                                    <button 
                                                        onClick={() => onGenerateSceneImage(scene.id)} 
                                                        className="w-14 h-14 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl flex items-center justify-center"
                                                        title="Re-render Shot"
                                                    >
                                                        <DirectorIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-6 py-20 px-10 text-center">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-white/20 group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/30 transition-all duration-500">
                                                    <MagicIcon />
                                                </div>
                                                <button 
                                                    onClick={() => onGenerateSceneImage(scene.id)}
                                                    className="btn-accent px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    Finalize Render
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black text-white/80 border border-white/10 tracking-widest ring-1 ring-white/5 shadow-2xl">
                                            SCN ◈ 0{scene.sequence}
                                        </div>
                                    </div>

                                    <div className="p-8 lg:p-10 flex flex-col gap-8 flex-grow">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-accent/5 border border-accent/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.5)]"></div>
                                                <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">{scene.cameraAngle}</span>
                                            </div>
                                            <p className="text-base text-text-secondary leading-relaxed font-light line-clamp-4 italic">
                                                "{scene.description}"
                                            </p>
                                        </div>
                                        
                                        <div className="mt-auto h-px bg-white/5 w-full"></div>
                                        <div className="flex justify-between items-center text-[8px] font-black text-text-muted uppercase tracking-[0.3em] font-mono">
                                            <span>Resolution: 8K Unfiltered</span>
                                            <span>Seed: Adaptive Neural</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {project.error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-card border-red-500/30 bg-red-500/10 px-10 py-5 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-5 z-50">
                    {project.error}
                </div>
            )}
        </main>
    );
});

export default StoryboardStudio;
