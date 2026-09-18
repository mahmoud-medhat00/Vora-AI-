
import React, { useState } from 'react';
import { MarketingStudioProject, ImageFile } from '../types';
import { generateMarketingAnalysis, generateSocialDrafts } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import { resizeImage } from '../utils';

const MarketingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

// Constant defined to fix reference error in the watermark image
const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const MarketingStudio: React.FC<{
    project: MarketingStudioProject;
    setProject: React.Dispatch<React.SetStateAction<MarketingStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    if (!project) return null;

    const [copied, setCopied] = useState(false);
    const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);

    const onGenerate = async () => {
        if (project.brandType === 'new' && (!project.brandName || !project.specialty)) {
            setProject(s => ({ ...s, error: 'Please enter brand name and specialty' }));
            return;
        }
        if (project.brandType === 'existing' && !project.websiteLink) {
            setProject(s => ({ ...s, error: 'Please enter a website link' }));
            return;
        }

        setProject(s => ({ ...s, isGenerating: true, error: null, result: null }));
        try {
            const data = project.brandType === 'new' 
                ? { type: project.brandType, name: project.brandName, specialty: project.specialty, brief: project.brief }
                : { type: project.brandType, link: project.websiteLink };
            
            const strategy = await generateMarketingAnalysis(data as any, project.language);
            setProject(s => ({ ...s, result: strategy, isGenerating: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'Strategy generation failed. Please try again.' }));
        }
    };

    const handleGenerateSocialDrafts = async () => {
        setIsGeneratingDrafts(true);
        try {
            const data = project.brandType === 'new' 
                ? { name: project.brandName, specialty: project.specialty, brief: project.brief }
                : { website: project.websiteLink };
            
            const drafts = await generateSocialDrafts(data, project.brandImages || [], project.language);
            setProject(s => ({ ...s, socialDrafts: drafts }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeneratingDrafts(false);
        }
    };

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isGenerating: true }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 2048, 2048);
                return new Promise<ImageFile>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({ ...s, brandImages: [...(s.brandImages || []), ...uploaded], isGenerating: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'Upload failed' }));
        }
    };

    const handleCopy = () => {
        if (!project.result) return;
        navigator.clipboard.writeText(project.result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'txt' | 'md' | 'pdf') => {
        if (!project.result) return;
        
        if (format === 'pdf') {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            printWindow.document.write(`
                <html>
                <head>
                    <title>Jenta Marketing Report - ${project.brandName || 'Analysis'}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Tajawal', sans-serif; direction: ${project.language === 'ar' ? 'rtl' : 'ltr'}; padding: 40px; line-height: 1.6; }
                        h1, h2, h3 { color: #ff0000; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        p { font-size: 14px; color: #333; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="margin: 0;">AI Marketing Strategy Report</h1>
                        <p>Generated by Jenta Design Tool PRO</p>
                    </div>
                    <div style="white-space: pre-wrap;">${project.result}</div>
                    <div class="footer">Confidential Report &copy; ${new Date().getFullYear()} Jenta AI Studio</div>
                    <script>window.onload = () => { window.print(); }</script>
                </body>
                </html>
            `);
            printWindow.document.close();
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([project.result], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Jenta-Marketing-Strategy.${format}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <main className="w-full flex flex-col gap-12 pt-8 pb-24 animate-in fade-in duration-700 studio-container">
            {/* Control Center */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                            Strategic IQ Engine
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                           Brand Intelligence
                        </h2>
                        <p className="text-text-secondary text-base font-light mt-3 max-w-xl">
                            Architect full-scale market positioning, competitive benchmarking, and go-to-market strategies using advanced AI modeling.
                        </p>
                    </div>
                    
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                        <button 
                            onClick={() => setProject(s => ({ ...s, language: 'ar' }))}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.language === 'ar' ? 'bg-accent text-white shadow-xl' : 'text-text-muted hover:text-white'}`}
                        >
                            Arabic
                        </button>
                        <button 
                            onClick={() => setProject(s => ({ ...s, language: 'en' }))}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.language === 'en' ? 'bg-accent text-white shadow-xl' : 'text-text-muted hover:text-white'}`}
                        >
                            English
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input Selection */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-6">
                            <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/5">
                                <button 
                                    onClick={() => setProject(s => ({ ...s, brandType: 'new' }))}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.brandType === 'new' ? 'bg-white/10 text-white shadow-inner' : 'text-text-muted hover:text-white'}`}
                                >
                                    Concepting
                                </button>
                                <button 
                                    onClick={() => setProject(s => ({ ...s, brandType: 'existing' }))}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.brandType === 'existing' ? 'bg-white/10 text-white shadow-inner' : 'text-text-muted hover:text-white'}`}
                                >
                                    Optimizing
                                </button>
                            </div>

                            {project.brandType === 'new' ? (
                                <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                                    <div className="space-y-2">
                                        <label className="input-label !mb-0 text-text-muted">Brand Identity</label>
                                        <input 
                                            value={project.brandName}
                                            onChange={e => setProject(s => ({ ...s, brandName: e.target.value }))}
                                            placeholder="e.g. 'Neo-Tech Solutions'"
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="input-label !mb-0 text-text-muted">Industry Vertical</label>
                                        <input 
                                            value={project.specialty}
                                            onChange={e => setProject(s => ({ ...s, specialty: e.target.value }))}
                                            placeholder="e.g. 'Sustainable Architecture'"
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="input-label !mb-0 text-text-muted">Mission Discovery</label>
                                        <textarea 
                                            value={project.brief}
                                            onChange={e => setProject(s => ({ ...s, brief: e.target.value }))}
                                            rows={4}
                                            placeholder="What problem does this brand solve? Who is the ideal customer?"
                                            className="glass-input min-h-[120px] resize-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                                    <div className="space-y-2">
                                        <label className="input-label !mb-0 text-text-muted">E-Commerce / Portfolio URL</label>
                                        <input 
                                            value={project.websiteLink}
                                            onChange={e => setProject(s => ({ ...s, websiteLink: e.target.value }))}
                                            placeholder="https://brand-vault.com"
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6">
                                        <p className="text-xs text-accent/80 font-medium leading-relaxed italic">
                                            ◈ System will perform a real-time crawl of the provided URL to extract market positioning and competitive vectors.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={onGenerate}
                                disabled={project.isGenerating}
                                className="btn-primary w-full py-5 rounded-2xl shadow-[0_20px_40px_rgba(var(--color-accent-rgb),0.2)] text-base"
                            >
                                {project.isGenerating ? 'PROCESSING IQ...' : 'SYNTHESIZE STRATEGY'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Visual DNA & Coverage */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="glass-card p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 h-full flex flex-col gap-8">
                            <div className="space-y-4">
                                <h3 className="input-label !mb-0">Visual Asset DNA</h3>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <ImageWorkspace 
                                        id="marketing-brand-images"
                                        images={project.brandImages || []}
                                        onImagesUpload={handleFileUpload}
                                        onImageRemove={(idx) => setProject(s => ({ ...s, brandImages: (s.brandImages || []).filter((_, i) => i !== idx) }))}
                                        isUploading={project.isGenerating && !project.result}
                                        title="Branded References"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 flex-grow">
                                <h4 className="input-label !mb-0">Intelligence Modules:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { t: 'Multi-Persona Mapping', d: 'Target demographic behavioral patterns' },
                                        { t: 'Competitive Vectoring', d: 'Competitor gap analysis & benchmarks' },
                                        { t: 'GTM Execution Plan', d: '3-stage market entry roadmap' },
                                        { t: 'Psychological Pricing', d: 'Value-based revenue optimization' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-1.5 group hover:border-accent/30 transition-all cursor-default">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight">{item.t}</span>
                                            </div>
                                            <span className="text-[10px] text-text-muted font-medium">{item.d}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Social Media Lab */}
            <div className="glass-card rounded-[3rem] p-10 border border-white/5 bg-gradient-to-br from-accent/5 to-purple-500/5 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase font-display">Viral Creative Lab</h3>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mt-1">Generate strategic multi-platform narrative drafts</p>
                        </div>
                        <button 
                            onClick={handleGenerateSocialDrafts}
                            disabled={isGeneratingDrafts || (project.brandType === 'new' && !project.brandName)}
                            className="px-10 py-5 bg-white/5 hover:bg-accent text-white border border-white/10 hover:border-accent rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-30 shadow-xl"
                        >
                            {isGeneratingDrafts ? 'CRAFTING NARRATIVES...' : 'LAUNCH SOCIAL LAB'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(project.socialDrafts || []).length > 0 ? (
                            (project.socialDrafts || []).map((draft, i) => (
                                <div key={i} className="glass-card p-8 rounded-[2rem] border border-white/5 bg-black/40 flex flex-col gap-6 animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{draft?.platform}</span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${draft?.content || ''}\n\n${(draft?.hashtags || []).join(' ')}`);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-accent/20 rounded-xl transition-all text-text-muted hover:text-accent"
                                        >
                                            <CopyIcon />
                                        </button>
                                    </div>
                                    <p className={`text-xs font-medium text-white/70 leading-relaxed whitespace-pre-wrap flex-grow ${project.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ direction: project.language === 'ar' ? 'rtl' : 'ltr' }}>
                                        {draft?.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(draft?.hashtags || []).map((tag, j) => (
                                            <span key={j} className="text-[8px] font-black text-accent/60 bg-accent/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-3 py-20 flex flex-col items-center justify-center text-text-muted/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <div className="text-6xl mb-6 opacity-20">◈</div>
                                <span className="text-[11px] font-black uppercase tracking-[0.5em]">Awaiting Intel Input</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Result Area */}
            {project.result && (
                <div className="animate-in slide-in-from-bottom-12 fade-in duration-1000 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-16 bg-accent rounded-full"></div>
                            <div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter font-display">Intelligence Vault</h3>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.4em] mt-1">Proprietary Strategic Analysis</p>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={handleCopy} className="btn-secondary px-6 py-3 rounded-xl flex items-center gap-2">
                                {copied ? <CheckIcon /> : <CopyIcon />} <span>{copied ? 'SECURED' : 'CLONE INTEL'}</span>
                            </button>
                            <button onClick={() => handleDownload('pdf')} className="btn-primary px-10 py-3 rounded-xl flex items-center gap-2 !shadow-2xl">
                                <DownloadIcon /> <span>EXPORT DOSSIER (PDF)</span>
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-[3.5rem] p-10 md:p-20 shadow-2xl border border-white/5 relative bg-white/[0.01] overflow-hidden">
                        {/* Decorative Background Branding */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                            <img src={LOGO_IMAGE_URL} className="w-[800px]" alt="Watermark" />
                        </div>

                        <div 
                            className={`relative z-10 prose prose-invert max-w-none text-text-secondary leading-loose suggestions-scrollbar overflow-y-auto max-h-[2000px] ${project.language === 'ar' ? 'text-right' : 'text-left'}`} 
                            style={{ direction: project.language === 'ar' ? 'rtl' : 'ltr' }}
                        >
                            {project.result.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <h1 key={i} className="text-6xl font-black text-white mt-16 mb-12 border-b border-white/10 pb-10 uppercase tracking-tighter font-display leading-tight">{line.replace('# ', '')}</h1>;
                                if (line.startsWith('## ')) return <h2 key={i} className="text-3xl font-black text-accent mt-16 mb-6 uppercase tracking-tight font-display">{line.replace('## ', '')}</h2>;
                                if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-black text-white/90 mt-10 mb-4 uppercase tracking-widest flex items-center gap-4"><div className="w-2 h-6 bg-accent rounded-full"></div> {line.replace('### ', '')}</h3>;
                                if (line.trim() === '') return <div key={i} className="h-6"></div>;
                                return <p key={i} className="mb-6 text-text-secondary/90 text-lg font-light leading-relaxed">{line}</p>;
                            })}
                        </div>
                    </div>
                </div>
            )}

            {project.error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-card border-red-500/30 bg-red-500/10 px-10 py-5 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-5">
                    {project.error}
                </div>
            )}
        </main>
    );
});

export default MarketingStudio;
