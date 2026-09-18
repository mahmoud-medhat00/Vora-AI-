
import React, { useCallback, useState, useEffect } from 'react';
import { PlanStudioProject, ImageFile, PlanIdea } from '../types';
import { resizeImage } from '../utils';
import { generateCampaignPlan, generateImage, analyzeProductForCampaign } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2m3 2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3m0 0l-3-3m3 3l3-3" />
    </svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const TARGET_MARKETS = [
    'Egypt', 'Saudi Arabia (KSA)', 'United Arab Emirates (UAE)', 'Oman (Sultanate of Oman)', 'The Gulf (General)', 'Global / International', 'Europe', 'North America'
];

// New dynamic dialect structure
const BASE_LANGUAGES = [
    { id: 'egy', label: 'Egyptian / مصرية' },
    { id: 'sau', label: 'Saudi / سعودية' },
    { id: 'oma', label: 'Omani / عمانية' },
    { id: 'gulf', label: 'Gulf / خليجية عامة' },
    { id: 'msa', label: 'Modern Standard / فصحى' },
    { id: 'lev', label: 'Levantine / شامي' },
    { id: 'eng', label: 'English / إنجليزية' }
];

const FORMALITY_OPTIONS = [
    { id: 'slang', label: 'Slang / عامية دارجة' },
    { id: 'formal', label: 'Formal / رسمي - فصحى' }
];

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const PlanStudio: React.FC<{
    project: PlanStudioProject;
    setProject: React.Dispatch<React.SetStateAction<PlanStudioProject>>;
}> = React.memo(({ project, setProject }) => {

    if (!project) return null;

    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [selectedLang, setSelectedLang] = useState('egy');
    const [selectedFormality, setSelectedFormality] = useState('slang');

    useEffect(() => {
        const langLabel = BASE_LANGUAGES.find(l => l.id === selectedLang)?.label || 'Arabic';
        const formLabel = FORMALITY_OPTIONS.find(f => f.id === selectedFormality)?.label || 'Slang';
        
        let finalDialect = `${langLabel} (${formLabel})`;
        if (selectedLang === 'sau' && selectedFormality === 'slang') {
            finalDialect = "اللهجة السعودية الدارجة الصرفة (Native Pure Saudi Slang)";
        } else if (selectedLang === 'oma' && selectedFormality === 'slang') {
            finalDialect = "اللهجة العمانية الدارجة (Omani Slang)";
        }
        
        setProject(s => ({ ...s, dialect: finalDialect }));
    }, [selectedLang, selectedFormality, setProject]);

    const productImages = project.productImages || [];
    const ideas = project.ideas || [];

    useEffect(() => {
        if (productImages.length > 0 && !project.categoryAnalysis && !project.isAnalyzingCategory) {
            const runAnalysis = async () => {
                setProject(s => ({ ...s, isAnalyzingCategory: true }));
                try {
                    const analysis = await analyzeProductForCampaign(productImages);
                    setProject(s => ({ ...s, categoryAnalysis: analysis, isAnalyzingCategory: false }));
                } catch (err) {
                    setProject(s => ({ ...s, isAnalyzingCategory: false }));
                }
            };
            runAnalysis();
        }
    }, [productImages.length, project.categoryAnalysis, project.isAnalyzingCategory, setProject]);

    const handleFileUpload = (target: 'product') => async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null, categoryAnalysis: null }));
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
                productImages: [...(s.productImages || []), ...uploaded],
                isUploading: false
            }));
        } catch (err) {
            setProject(s => ({ ...s, isUploading: false, error: "Upload failed" }));
        }
    };

    const onCreatePlan = async () => {
        if (!(project.prompt || '').trim()) {
            setProject(s => ({ ...s, error: 'Please describe your goal or campaign vision.' }));
            return;
        }
        setProject(s => ({ ...s, isGeneratingPlan: true, error: null }));
        try {
            const plan = await generateCampaignPlan(productImages, project.prompt, project.targetMarket, project.dialect);
            const generatedIdeas: PlanIdea[] = plan.map(p => ({
                ...p,
                image: null,
                isLoadingImage: false,
                imageError: null
            }));
            setProject(s => ({ ...s, ideas: generatedIdeas, isGeneratingPlan: false }));
        } catch (err) {
            setProject(s => ({ ...s, isGeneratingPlan: false, error: "Plan generation failed" }));
        }
    };

    const onGenerateIdeaImage = async (ideaId: string) => {
        const ideaIdx = ideas.findIndex(i => i.id === ideaId);
        if (ideaIdx === -1) return;

        setProject(s => {
            const next = [...(s.ideas || [])];
            if (next[ideaIdx]) next[ideaIdx] = { ...next[ideaIdx], isLoadingImage: true, imageError: null };
            return { ...s, ideas: next };
        });

        try {
            const textConstraint = "STRICTLY PRESERVE all original branding from the product images if provided. NO EXTRA generated text in the scene.";
            const categoryContext = project.categoryAnalysis ? `Product Category context: ${project.categoryAnalysis}.` : '';
            const finalPrompt = `Professional commercial photography for social media. ${categoryContext} Scenario: ${ideas[ideaIdx].scenario}. Style: Photorealistic, high-end commercial shot. ${textConstraint}`;
            
            const image = await generateImage(productImages, finalPrompt, null, "3:4");
            
            setProject(s => {
                const next = [...(s.ideas || [])];
                if (next[ideaIdx]) next[ideaIdx] = { ...next[ideaIdx], image, isLoadingImage: false };
                return { ...s, ideas: next };
            });
        } catch (err) {
            setProject(s => {
                const next = [...(s.ideas || [])];
                if (next[ideaIdx]) next[ideaIdx] = { ...next[ideaIdx], isLoadingImage: false, imageError: "Failed to generate image" };
                return { ...s, ideas: next };
            });
        }
    };

    const handleDownload = (image: ImageFile, label: string, resolution: '2k' | '4k' | 'original' = 'original') => {
        if (resolution === 'original') {
            const link = document.createElement('a');
            link.href = `data:${image.mimeType};base64,${image.base64}`;
            link.download = `Jenta-Plan-${label.replace(/\s+/g, '-')}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        setIsDownloading(`${label}-${resolution}`);
        const img = new Image();
        img.src = `data:${image.mimeType};base64,${image.base64}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setIsDownloading(null);
                return;
            };

            const targetWidth = resolution === '4k' ? 4096 : 2048;
            const aspectRatio = img.width / img.height;
            
            canvas.width = targetWidth;
            canvas.height = targetWidth / aspectRatio;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const link = document.createElement('a');
            link.download = `Jenta-Plan-${label.replace(/\s+/g, '-')}-${resolution}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsDownloading(null);
        };
        img.onerror = () => setIsDownloading(null);
    };

    const updateIdea = (id: string, field: keyof PlanIdea, value: string) => {
        setProject(s => ({
            ...s,
            ideas: (s.ideas || []).map(i => i.id === id ? { ...i, [field]: value } : i)
        }));
    };

    const handleExportFullReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const ideasRows = ideas.map((idea, idx) => `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; width: 50px;">${idx + 1}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #ff0000; width: 150px;">${idea.tov}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; line-height: 1.6;">${idea.caption}</td>
                <td style="padding: 15px; border-bottom: 1px solid #eee; font-size: 11px; color: #666; width: 120px;">${idea.schedule}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Jenta Campaign Plan - ${project.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #ff0000; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { height: 60px; }
                    .title-box h1 { margin: 0; color: #000; font-size: 28px; }
                    .title-box p { margin: 5px 0 0 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #f9f9f9; padding: 15px; text-align: right; border-bottom: 2px solid #eee; font-size: 14px; text-transform: uppercase; }
                    .footer { margin-top: 50px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 25px; }
                    .footer a { color: #ff0000; text-decoration: none; font-weight: bold; border-bottom: 1px dashed #ff0000; }
                    @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title-box">
                        <h1>خطة الحملة الإعلانية الذكية</h1>
                        <p>بواسطة Jenta Design Tool PRO</p>
                    </div>
                    <img src="${LOGO_IMAGE_URL}" class="logo" />
                </div>
                
                <div style="margin-bottom: 30px; background: #fff5f5; padding: 20px; border-radius: 10px; border-right: 5px solid #ff0000;">
                    <h3 style="margin-top: 0; color: #ff0000;">تفاصيل الحملة:</h3>
                    <p><strong>السوق المستهدف:</strong> ${project.targetMarket}</p>
                    <p><strong>اللهجة:</strong> ${project.dialect}</p>
                    <p><strong>الرؤية:</strong> ${project.prompt}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>العنوان / الخطاف</th>
                            <th>نص المنشور (Caption)</th>
                            <th>وقت النشر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ideasRows}
                    </tbody>
                </table>

                <div class="footer">
                    تم إنشاء هذا التقرير آلياً بواسطة Jenta AI. جميع الحقوق محفوظة لـ 
                    <a href="https://linktr.ee/mahmoudredaph" target="_blank">محمود رضا</a>.
                </div>

                <div class="no-print" style="position: fixed; bottom: 30px; left: 30px;">
                    <button onclick="window.print()" style="background: #ff0000; color: white; border: none; padding: 18px 35px; border-radius: 50px; font-weight: bold; cursor: pointer; box-shadow: 0 15px 30px rgba(255,0,0,0.4); font-size: 16px; transition: transform 0.2s;">
                        تأكيد وتحميل كـ PDF / طباعة
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <main className="w-full flex flex-col gap-12 pt-8 pb-24 animate-in fade-in duration-700 studio-container">
            {/* Header section */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4">
                            Strategic Deployment Matrix
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter font-display uppercase leading-none">
                           Campaign Planner
                        </h2>
                        <p className="text-text-secondary text-base font-light mt-3 max-w-xl">
                            Orchestrate multi-asset social media blitzes with hyper-localized narrative hooks and AI-generated production photography.
                        </p>
                    </div>
                    {ideas.length > 0 && (
                        <button
                            onClick={handleExportFullReport}
                            className="btn-primary px-10 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-accent/20"
                        >
                            <ExportIcon /> <span className="text-[10px] font-black uppercase tracking-widest">Master Dossier (PDF)</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col gap-8">
                            <div className="space-y-4">
                                <h3 className="input-label !mb-0">Product DNA</h3>
                                <div className="bg-black/20 p-4 rounded-3xl border border-white/5 aspect-square max-w-[400px] mx-auto w-full">
                                    <ImageWorkspace
                                        id="plan-product-up"
                                        images={productImages}
                                        onImagesUpload={handleFileUpload('product')}
                                        onImageRemove={(i) => setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, idx) => idx !== i), categoryAnalysis: null }))}
                                        isUploading={project.isUploading}
                                        title="Branded Product Reference"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="input-label !mb-0">Strategic Objective</label>
                                <textarea
                                    value={project.prompt}
                                    onChange={(e) => setProject(s => ({ ...s, prompt: e.target.value }))}
                                    placeholder="Describe the campaign mission... e.g. 'Launching a limited edition luxury perfume. Focus on mystery and elegance.'"
                                    className="glass-input min-h-[140px] resize-none text-xs leading-loose"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="input-label !mb-0 text-[9px] opacity-40">Target Geography</label>
                                    <div className="relative group/select">
                                        <select 
                                            value={project.targetMarket}
                                            onChange={(e) => setProject(s => ({ ...s, targetMarket: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[11px] font-black text-white appearance-none cursor-pointer hover:bg-white/10 transition-all uppercase tracking-widest"
                                        >
                                            {TARGET_MARKETS.map(m => <option key={m} value={m} className="bg-[#111]">{m}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <GlobeIcon />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="input-label !mb-0 text-[9px] opacity-40">Dialect Selection</label>
                                   <div className="relative group/select">
                                        <select 
                                            value={selectedLang}
                                            onChange={(e) => setSelectedLang(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[11px] font-black text-white appearance-none cursor-pointer hover:bg-white/10 transition-all uppercase tracking-widest"
                                        >
                                            {BASE_LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-[#111]">{l.label}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <ChatIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onCreatePlan}
                                disabled={project.isGeneratingPlan || !(project.prompt || '').trim()}
                                className="btn-primary w-full py-5 rounded-2xl shadow-[0_20px_40px_rgba(var(--color-accent-rgb),0.2)] text-base mt-2"
                            >
                                {project.isGeneratingPlan ? 'SYNTHESIZING MATRIX...' : 'ORCHESTRATE 9-POST BLITZ'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Intelligence & Output */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="glass-card p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 flex flex-col gap-8 h-full">
                            <div className="space-y-6">
                                <h3 className="input-label !mb-0">Market Intelligence Pulse</h3>
                                <div className="bg-accent/5 border border-accent/20 rounded-[2rem] p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] -mr-16 -mt-16 rounded-full group-hover:bg-accent/20 transition-all"></div>
                                    {project.isAnalyzingCategory ? (
                                        <div className="flex items-center gap-6 text-accent animate-pulse py-4">
                                            <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                                            <span className="text-sm font-black uppercase tracking-[0.3em]">Decoding Product DNA...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-[13px] text-text-secondary leading-relaxed font-medium">
                                                {project.categoryAnalysis || "Awaiting Product DNA upload for competitive vectoring..."}
                                            </p>
                                            {project.categoryAnalysis && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {['Persona Optimized', 'Channel Responsive', 'Geo-Targeted'].map(tag => (
                                                        <span key={tag} className="text-[8px] font-black text-accent/60 px-3 py-1 rounded-full border border-accent/20 uppercase tracking-widest">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!project.ideas || project.ideas.length === 0 ? (
                                <div className="flex-grow flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/5 rounded-[2.5rem] py-20">
                                    <div className="text-6xl mb-6">◈</div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em]">Awaiting Strategic Activation</p>
                                </div>
                            ) : (
                                <div className="flex-grow space-y-4 p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                   <div className="flex items-center gap-3 text-accent mb-4">
                                       <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                                       <span className="text-[10px] font-black uppercase tracking-widest leading-none">Blitz Plan Initialized • 9 Assets Calculated</span>
                                   </div>
                                   <p className="text-xs text-text-muted leading-relaxed">
                                       The matrix has generated a phased 9-post sequence optimized for <span className="text-white font-bold">{project.targetMarket}</span> using <span className="text-white font-bold">{project.dialect}</span>. Each asset is engineered for maximum retention.
                                   </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid display for the posts */}
            {ideas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {ideas.map((idea, idx) => (
                        <div key={idea.id} className="flex flex-col gap-6 animate-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="relative aspect-[3/4] bg-[#050505] rounded-[2.5rem] overflow-hidden border border-white/5 group hover:border-accent/40 shadow-2xl transition-all duration-500 box-content">
                                {idea.isLoadingImage ? (
                                    <div className="flex flex-col items-center justify-center h-full bg-black/60 backdrop-blur-2xl px-10 text-center">
                                        <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin mb-6"></div>
                                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Rendering Production Visual</span>
                                    </div>
                                ) : idea.image ? (
                                    <>
                                        <img src={`data:${idea.image.mimeType};base64,${idea.image.base64}`} alt="Asset" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 gap-4 pointer-events-none">
                                            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 w-fit pointer-events-auto">
                                                <button onClick={() => handleDownload(idea.image!, `P${idx+1}`, '2k')} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-accent text-[9px] font-black text-white rounded-xl transition-all">2K</button>
                                                <button onClick={() => handleDownload(idea.image!, `P${idx+1}`, '4k')} className="w-10 h-10 flex items-center justify-center bg-accent text-[9px] font-black text-white rounded-xl shadow-xl transition-all transform hover:scale-110">4K</button>
                                                <button onClick={() => onGenerateIdeaImage(idea.id)} className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-accent hover:text-white text-white rounded-xl transition-all"><MagicIcon /></button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full bg-black/40 px-10 text-center gap-6">
                                        <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center opacity-20">
                                            <MagicIcon />
                                        </div>
                                        <button 
                                            onClick={() => onGenerateIdeaImage(idea.id)}
                                            className="btn-primary px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest !shadow-none"
                                        >
                                            Generate Production
                                        </button>
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Asset 0{idx + 1}</span>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-[2rem] bg-black/40 border border-white/5 flex flex-col gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[9px] font-black text-accent uppercase tracking-[0.3em]">Narrative Copy</span>
                                        <span className="text-[8px] font-bold text-text-muted uppercase">{project.dialect} Blitz</span>
                                    </div>
                                    <textarea
                                        value={idea.caption}
                                        onChange={(e) => updateIdea(idea.id, 'caption', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[13px] text-white/90 focus:border-accent/40 focus:bg-white/[0.08] transition-all resize-none h-[120px] leading-relaxed suggestions-scrollbar"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Display Title / Hook</span>
                                        <input
                                            value={idea.tov}
                                            onChange={(e) => updateIdea(idea.id, 'tov', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-black text-accent uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Visual Neural Prompt</span>
                                        <textarea
                                            value={idea.scenario}
                                            onChange={(e) => updateIdea(idea.id, 'scenario', e.target.value)}
                                            className="w-full bg-black/20 rounded-xl px-4 py-3 text-[10px] text-text-muted font-medium border border-dashed border-white/10 min-h-[60px] focus:border-white/30 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
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

export default PlanStudio;
