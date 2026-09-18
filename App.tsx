
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppView, 
  ImageFile,
  CreatorStudioProject, 
  PhotoshootDirectorProject, 
  PromptStudioProject,
  VoiceOverStudioProject,
  BrandingStudioProject,
  CampaignStudioProject,
  PlanStudioProject,
  EditStudioProject,
  StoryboardStudioProject,
  MarketingStudioProject,
  AdCreativeStudioProject
} from './types';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES, VOICES } from './constants';
import ChatWidget from './components/ChatWidget';
import TabBar from './components/TabBar';

// Lazy load studio components for better performance
const CreatorStudio = React.lazy(() => import('./components/CreatorStudio'));
const PhotoshootDirector = React.lazy(() => import('./components/PhotoshootDirector'));
const PromptStudio = React.lazy(() => import('./components/PromptStudio'));
const VoiceOverStudio = React.lazy(() => import('./components/VoiceOverStudio'));
const BrandingStudio = React.lazy(() => import('./components/BrandingStudio'));
const CampaignStudio = React.lazy(() => import('./components/CampaignStudio'));
const VideoStudio = React.lazy(() => import('./components/VideoStudio'));
const PlanStudio = React.lazy(() => import('./components/PlanStudio'));
const EditStudio = React.lazy(() => import('./components/EditStudio'));
const StoryboardStudio = React.lazy(() => import('./components/StoryboardStudio'));
const MarketingStudio = React.lazy(() => import('./components/MarketingStudio'));
const AdCreativeStudio = React.lazy(() => import('./components/AdCreativeStudio'));
const AssetGallery = React.lazy(() => import('./components/AssetGallery'));

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059 0-2.689-1.046-5.217-2.946-7.117s-4.429-2.945-7.118-2.945c-5.548 0-10.059 4.51-10.061 10.059-.001 2.013.569 3.425 1.539 5.074l-.991 3.621 3.717-.975zm11.367-7.374c-.19-.094-1.129-.558-1.303-.622-.174-.064-.301-.094-.427.095-.127.189-.491.622-.601.75-.11.127-.221.143-.411.048-.19-.094-.803-.296-1.53-0.941-.566-.505-.948-1.129-1.06-1.318-.11-.189-.012-.292.083-.386.085-.085.19-.221.285-.331.095-.11.127-.189.19-.315.064-.127.032-.238-.016-.331-.048-.094-.427-1.029-.586-1.408-.154-.37-.311-.318-.427-.324-.11-.005-.238-.006-.364-.006s-.333.048-.507.238c-.174.189-.665.65-.665 1.585 0 .935.681 1.838.777 1.964.095.126 1.34 2.046 3.245 2.87.453.196.806.313 1.082.401.455.144.869.124 1.196.075.365-.054 1.129-.462 1.287-.908.158-.445.158-.826.111-.908-.048-.082-.174-.126-.364-.221z"/>
    </svg>
);

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
    </svg>
);

const Typewriter = () => {
    const words = ["AUTOMATE", "GENERATE", "OPTIMIZE", "SCALE"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const fullWord = words[currentWordIndex % words.length];

            setCurrentText(prev => {
                if (isDeleting) {
                    return fullWord.substring(0, prev.length - 1);
                } else {
                    return fullWord.substring(0, prev.length + 1);
                }
            });

            if (isDeleting) {
                setTypingSpeed(75);
            } else {
                setTypingSpeed(150);
            }

            if (!isDeleting && currentText === fullWord) {
                setTypingSpeed(2000);
                setIsDeleting(true);
            } else if (isDeleting && currentText === "") {
                setIsDeleting(false);
                setCurrentWordIndex(prev => prev + 1);
                setTypingSpeed(500);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, words, typingSpeed]);

    return (
        <span className="text-[var(--color-accent)] inline-flex items-center">
            {currentText}
            <span className="animate-pulse ml-1 text-[var(--color-accent)] font-light">|</span>
        </span>
    );
};

const InteractiveLogo = () => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
  
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 400;
  
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const moveX = -(dx / dist) * 120 * force;
          const moveY = -(dy / dist) * 120 * force;
          setOffset({ x: moveX, y: moveY });
        } else {
          setOffset({ x: 0, y: 0 });
        }
      };
  
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
  
    return (
      <div
        ref={ref}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative z-0"
      >
          <div className="relative w-64 h-64 md:w-96 md:h-96 animate-float">
              {/* Ultra-Glow */}
              <div className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-full blur-[80px] animate-pulse"></div>
              
              {/* Outer Rings */}
              <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.4] rotate-12"></div>
              <div className="absolute inset-0 border border-[var(--color-accent)]/20 rounded-full scale-[1.2] -rotate-12"></div>

              {/* Core Sphere */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#1e1b4b] via-[#020617] to-black border border-white/10 shadow-[0_0_100px_rgba(var(--color-accent-rgb),0.2)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(var(--color-accent-rgb),0.3)_0%,transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-3xl"></div>
                
                {/* Floating Nucleus */}
                <div className="absolute inset-[30%] rounded-2xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.8)] rotate-12 animate-pulse">
                   <span className="text-6xl md:text-8xl font-black text-white font-display -rotate-12 italic">V</span>
                </div>
              </div>
          </div>
      </div>
    );
  };

const createNewCreatorProject = (projectCount: number): CreatorStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  productImages: [],
  styleImages: [], 
  generatedImage: null,
  history: [],
  options: {
    lightingStyle: LIGHTING_STYLES[0].value,
    cameraPerspective: CAMERA_PERSPECTIVES[0].value,
  },
  prompt: '',
  isPromptAutoGenerated: false,
  styleDescription: null,
  isAnalyzingStyle: false,
  isLoading: false,
  error: null,
  uploadingTarget: null,
  translatedPrompt: null,
  isTranslating: false,
  editPrompt: '',
  isEditing: false,
  rotationImages: [],
  isGeneratingRotation: false,
});

const createNewPhotoshootProject = (projectCount: number): PhotoshootDirectorProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  productImages: [],
  selectedShotTypes: [],
  results: [],
  isGenerating: false,
  error: null,
  isUploading: false,
  customStylePrompt: '',
});

const createNewPromptStudioProject = (projectCount: number): PromptStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  images: [],
  instructions: '',
  generatedPrompt: null,
  history: [],
  isLoading: false,
  isUploading: false,
  error: null,
});

const createNewVoiceOverStudioProject = (projectCount: number): VoiceOverStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  text: '',
  styleInstructions: '',
  selectedVoice: VOICES[0].value,
  generatedAudio: null,
  isLoading: false,
  error: null,
  history: [],
  isPlaying: false,
  voiceGenderFilter: 'All',
  previewLoadingVoice: null,
  previewPlayingVoice: null,
});

const createNewBrandingStudioProject = (projectCount: number): BrandingStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  logos: [], 
  isUploading: false,
  error: null,
  results: [],
  colors: [],
  isAnalyzing: false,
  isGenerating: false,
  aspectRatio: '1:1',
});

const createNewCampaignProject = (projectCount: number): CampaignStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Project ${projectCount + 1}`,
    productImages: [],
    isUploading: false,
    isAnalyzing: false,
    isGenerating: false,
    error: null,
    results: [],
    productAnalysis: null,
    selectedMood: 'Original',
    customPrompt: '',
    mode: 'auto',
    customIdeas: ['', '', '', '', '', ''],
    suggestedScenarios: [],
});

const createNewPlanProject = (projectCount: number): PlanStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Plan ${projectCount + 1}`,
    productImages: [],
    logos: [],
    prompt: '',
    targetMarket: 'Egypt',
    dialect: 'Egyptian Arabic',
    categoryAnalysis: null,
    isAnalyzingCategory: false,
    ideas: [],
    isGeneratingPlan: false,
    isUploading: false,
    error: null,
});

const createNewStoryboardProject = (projectCount: number): StoryboardStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Board ${projectCount + 1}`,
    subjectImages: [],
    customInstructions: '',
    aspectRatio: '16:9',
    scenes: [],
    gridImage: null,
    isGeneratingPlan: false,
    isGeneratingGrid: false,
    isUploading: false,
    error: null,
});

const createNewMarketingProject = (projectCount: number): MarketingStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Strategy ${projectCount + 1}`,
    brandType: 'new',
    brandName: '',
    specialty: '',
    brief: '',
    websiteLink: '',
    language: 'ar',
    result: null,
    brandImages: [],
    socialDrafts: [],
    isGenerating: false,
    error: null,
});

const createNewEditProject = (projectCount: number): EditStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Edit ${projectCount + 1}`,
    baseImages: [], 
    localTexts: {},
    committedTexts: {},
    globalLayers: [],
    adjustments: {
        sharpness: 100,
        lut: 'Original'
    },
    isUploading: false,
    error: null,
});

const createNewAdCreativeProject = (projectCount: number): AdCreativeStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Ads ${projectCount + 1}`,
    productImages: [],
    adPlatform: 'Facebook',
    targetAudience: '',
    competitorLinks: [],
    isAnalyzing: false,
    isGenerating: false,
    variations: [],
    error: null,
    isUploading: false,
    isSuggesting: false,
    targetingSuggestions: [],
});

function useStudioHandlers<T>(
  setProjects: React.Dispatch<React.SetStateAction<T[]>>,
  activeIndex: number,
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
  createFn: (count: number) => T,
  updateProject: <U>(setProjects: React.Dispatch<React.SetStateAction<U[]>>, activeIndex: number, action: React.SetStateAction<U>) => void,
  addTab: <U>(setProjects: React.Dispatch<React.SetStateAction<U[]>>, setActiveIndex: React.Dispatch<React.SetStateAction<number>>, createFn: (count: number) => U) => void,
  closeTab: <U>(index: number, setProjects: React.Dispatch<React.SetStateAction<U[]>>, activeIndex: number, setActiveIndex: React.Dispatch<React.SetStateAction<number>>, createFn: (count: number) => U) => void
) {
  const setProject = useCallback((action: React.SetStateAction<T>) => {
    updateProject(setProjects, activeIndex, action);
  }, [setProjects, activeIndex, updateProject]);

  const onAddTab = useCallback(() => {
    addTab(setProjects, setActiveIndex, createFn);
  }, [setProjects, setActiveIndex, createFn, addTab]);

  const onCloseTab = useCallback((idx: number) => {
    closeTab(idx, setProjects, activeIndex, setActiveIndex, createFn);
  }, [setProjects, activeIndex, setActiveIndex, createFn, closeTab]);

  return { setProject, onAddTab, onCloseTab };
}

function App() {
  const [view, setView] = useState<AppView>('creator_studio');
  const [theme, setTheme] = useState('dark');
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [creatorProjects, setCreatorProjects] = useState<CreatorStudioProject[]>([createNewCreatorProject(0)]);
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(0);

  const [photoshootProjects, setPhotoshootProjects] = useState<PhotoshootDirectorProject[]>([createNewPhotoshootProject(0)]);
  const [activePhotoshootIndex, setActivePhotoshootIndex] = useState(0);

  const [promptStudioProjects, setPromptStudioProjects] = useState<PromptStudioProject[]>([createNewPromptStudioProject(0)]);
  const [activePromptStudioIndex, setActivePromptStudioIndex] = useState(0);

  const [voiceOverProjects, setVoiceOverProjects] = useState<VoiceOverStudioProject[]>([createNewVoiceOverStudioProject(0)]);
  const [activeVoiceOverIndex, setActiveVoiceOverIndex] = useState(0);

  const [brandingProjects, setBrandingProjects] = useState<BrandingStudioProject[]>([createNewBrandingStudioProject(0)]);
  const [activeBrandingIndex, setActiveBrandingIndex] = useState(0);

  const [campaignProjects, setCampaignProjects] = useState<CampaignStudioProject[]>([createNewCampaignProject(0)]);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);

  const [planProjects, setPlanProjects] = useState<PlanStudioProject[]>([createNewPlanProject(0)]);
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  const [storyboardProjects, setStoryboardProjects] = useState<StoryboardStudioProject[]>([createNewStoryboardProject(0)]);
  const [activeStoryboardIndex, setActiveStoryboardIndex] = useState(0);

  const [marketingProjects, setMarketingProjects] = useState<MarketingStudioProject[]>([createNewMarketingProject(0)]);
  const [activeMarketingIndex, setActiveMarketingIndex] = useState(0);

  const [editProjects, setEditProjects] = useState<EditStudioProject[]>([createNewEditProject(0)]);
  const [activeEditIndex, setActiveEditIndex] = useState(0);

  const [adCreativeProjects, setAdCreativeProjects] = useState<AdCreativeStudioProject[]>([createNewAdCreativeProject(0)]);
  const [activeAdCreativeIndex, setActiveAdCreativeIndex] = useState(0);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollMobileNav = (direction: 'left' | 'right') => {
    if (mobileNavRef.current) {
        const scrollAmount = direction === 'left' ? -100 : 100;
        mobileNavRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const addTab = useCallback(<T,>(
    setProjects: React.Dispatch<React.SetStateAction<T[]>>,
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
    createFn: (count: number) => T
  ) => {
    setProjects(prev => {
        const newProjects = [...prev, createFn(prev.length)];
        setActiveIndex(newProjects.length - 1);
        return newProjects;
    });
  }, []);

  const closeTab = useCallback(<T,>(
    index: number,
    setProjects: React.Dispatch<React.SetStateAction<T[]>>,
    activeIndex: number,
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
    createFn: (count: number) => T
  ) => {
     setProjects(prev => {
         const newProjects = prev.filter((_, i) => i !== index);
         if (newProjects.length === 0) {
             setActiveIndex(0);
             return [createFn(0)];
         }
         
         if (index === activeIndex) {
             setActiveIndex(curr => Math.max(0, curr - 1));
         } else if (index < activeIndex) {
             setActiveIndex(curr => Math.max(0, curr - 1));
         }
         return newProjects;
     });
  }, []);

  const updateProject = useCallback(<T,>(
    setProjects: React.Dispatch<React.SetStateAction<T[]>>,
    activeIndex: number,
    action: React.SetStateAction<T>
  ) => {
    setProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeIndex] = updated;
        return newProjects;
    });
  }, []);

  const creatorHandlers = useStudioHandlers(setCreatorProjects, activeCreatorIndex, setActiveCreatorIndex, createNewCreatorProject, updateProject, addTab, closeTab);
  const photoshootHandlers = useStudioHandlers(setPhotoshootProjects, activePhotoshootIndex, setActivePhotoshootIndex, createNewPhotoshootProject, updateProject, addTab, closeTab);
  const promptHandlers = useStudioHandlers(setPromptStudioProjects, activePromptStudioIndex, setActivePromptStudioIndex, createNewPromptStudioProject, updateProject, addTab, closeTab);
  const voiceOverHandlers = useStudioHandlers(setVoiceOverProjects, activeVoiceOverIndex, setActiveVoiceOverIndex, createNewVoiceOverStudioProject, updateProject, addTab, closeTab);
  const brandingHandlers = useStudioHandlers(setBrandingProjects, activeBrandingIndex, setActiveBrandingIndex, createNewBrandingStudioProject, updateProject, addTab, closeTab);
  const campaignHandlers = useStudioHandlers(setCampaignProjects, activeCampaignIndex, setActiveCampaignIndex, createNewCampaignProject, updateProject, addTab, closeTab);
  const planHandlers = useStudioHandlers(setPlanProjects, activePlanIndex, setActivePlanIndex, createNewPlanProject, updateProject, addTab, closeTab);
  const storyboardHandlers = useStudioHandlers(setStoryboardProjects, activeStoryboardIndex, setActiveStoryboardIndex, createNewStoryboardProject, updateProject, addTab, closeTab);
  const marketingHandlers = useStudioHandlers(setMarketingProjects, activeMarketingIndex, setActiveMarketingIndex, createNewMarketingProject, updateProject, addTab, closeTab);
  const editHandlers = useStudioHandlers(setEditProjects, activeEditIndex, setActiveEditIndex, createNewEditProject, updateProject, addTab, closeTab);
  const adCreativeHandlers = useStudioHandlers(setAdCreativeProjects, activeAdCreativeIndex, setActiveAdCreativeIndex, createNewAdCreativeProject, updateProject, addTab, closeTab);
  
  const [globalAssets, setGlobalAssets] = useState<{ id: string; type: string; image: ImageFile; createdAt: Date }[]>([]);

  const deleteGlobalAsset = useCallback((id: string) => {
      setGlobalAssets(prev => prev.filter(a => a.id !== id));
  }, []);

    const renderContent = () => {
    const wrappingDivClass = "flex flex-col w-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700";

    const suspenseWrapper = (children: React.ReactNode) => (
      <React.Suspense fallback={
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
           <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[var(--color-text-secondary)] font-bold animate-pulse uppercase tracking-widest text-xs">Loading Studio...</p>
        </div>
      }>
        {children}
      </React.Suspense>
    );

    switch (view) {
        case 'creator_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={creatorProjects}
                        activeProjectIndex={activeCreatorIndex}
                        onSelectTab={setActiveCreatorIndex}
                        onAddTab={creatorHandlers.onAddTab}
                        onCloseTab={creatorHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <CreatorStudio 
                          project={creatorProjects[activeCreatorIndex] || creatorProjects[0]}
                          setProject={creatorHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'photoshoot_director':
            return (
                <div className={wrappingDivClass}>
                     <TabBar
                        projects={photoshootProjects}
                        activeProjectIndex={activePhotoshootIndex}
                        onSelectTab={setActivePhotoshootIndex}
                        onAddTab={photoshootHandlers.onAddTab}
                        onCloseTab={photoshootHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <PhotoshootDirector 
                          project={photoshootProjects[activePhotoshootIndex] || photoshootProjects[0]}
                          setProject={photoshootHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'prompt_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={promptStudioProjects}
                        activeProjectIndex={activePromptStudioIndex}
                        onSelectTab={setActivePromptStudioIndex}
                        onAddTab={promptHandlers.onAddTab}
                        onCloseTab={promptHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <PromptStudio
                          project={promptStudioProjects[activePromptStudioIndex] || promptStudioProjects[0]}
                          setProject={promptHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'voice_over_studio':
             return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={voiceOverProjects}
                        activeProjectIndex={activeVoiceOverIndex}
                        onSelectTab={setActiveVoiceOverIndex}
                        onAddTab={voiceOverHandlers.onAddTab}
                        onCloseTab={voiceOverHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <VoiceOverStudio
                          project={voiceOverProjects[activeVoiceOverIndex] || voiceOverProjects[0]}
                          setProject={voiceOverHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'branding_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={brandingProjects}
                        activeProjectIndex={activeBrandingIndex}
                        onSelectTab={setActiveBrandingIndex}
                        onAddTab={brandingHandlers.onAddTab}
                        onCloseTab={brandingHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <BrandingStudio
                          project={brandingProjects[activeBrandingIndex] || brandingProjects[0]}
                          setProject={brandingHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'campaign_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={campaignProjects}
                        activeProjectIndex={activeCampaignIndex}
                        onSelectTab={setActiveCampaignIndex}
                        onAddTab={campaignHandlers.onAddTab}
                        onCloseTab={campaignHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <CampaignStudio
                          project={campaignProjects[activeCampaignIndex] || campaignProjects[0]}
                          setProject={campaignHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'plan_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={planProjects}
                        activeProjectIndex={activePlanIndex}
                        onSelectTab={setActivePlanIndex}
                        onAddTab={planHandlers.onAddTab}
                        onCloseTab={planHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <PlanStudio
                          project={planProjects[activePlanIndex] || planProjects[0]}
                          setProject={planHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'storyboard_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={storyboardProjects}
                        activeProjectIndex={activeStoryboardIndex}
                        onSelectTab={setActiveStoryboardIndex}
                        onAddTab={storyboardHandlers.onAddTab}
                        onCloseTab={storyboardHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <StoryboardStudio
                          project={storyboardProjects[activeStoryboardIndex] || storyboardProjects[0]}
                          setProject={storyboardHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'marketing_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={marketingProjects}
                        activeProjectIndex={activeMarketingIndex}
                        onSelectTab={setActiveMarketingIndex}
                        onAddTab={marketingHandlers.onAddTab}
                        onCloseTab={marketingHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <MarketingStudio
                          project={marketingProjects[activeMarketingIndex] || marketingProjects[0]}
                          setProject={marketingHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'edit_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={editProjects}
                        activeProjectIndex={activeEditIndex}
                        onSelectTab={setActiveEditIndex}
                        onAddTab={editHandlers.onAddTab}
                        onCloseTab={editHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <EditStudio
                          project={editProjects[activeEditIndex] || editProjects[0]}
                          setProject={editHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'ad_creative_studio':
            return (
                <div className={wrappingDivClass}>
                    <TabBar
                        projects={adCreativeProjects}
                        activeProjectIndex={activeAdCreativeIndex}
                        onSelectTab={setActiveAdCreativeIndex}
                        onAddTab={adCreativeHandlers.onAddTab}
                        onCloseTab={adCreativeHandlers.onCloseTab}
                    />
                    {suspenseWrapper(
                      <AdCreativeStudio
                          project={adCreativeProjects[activeAdCreativeIndex] || adCreativeProjects[0]}
                          setProject={adCreativeHandlers.setProject}
                      />
                    )}
                </div>
            );
        case 'asset_vault':
            return (
                <div className={wrappingDivClass}>
                    {suspenseWrapper(<AssetGallery assets={globalAssets} onDelete={deleteGlobalAsset} />)}
                </div>
            );
        case 'video_studio':
            return (
              suspenseWrapper(<VideoStudio />)
            );
        default:
            return null;
    }
  }

  const NavItem = ({ label, targetView, isMobile }: { label: string, targetView: AppView, isMobile?: boolean }) => (
      <button 
        id={`nav-item-${targetView}${isMobile ? '-mobile' : ''}`}
        onClick={() => { setView(targetView); scrollToContent(); }}
        className={`${isMobile ? 'flex-shrink-0 px-4 py-2 text-[10px]' : 'px-4 py-2 text-xs'} font-black tracking-[0.2em] uppercase transition-all border-b-2 ${view === targetView ? 'text-accent border-accent bg-accent/5' : 'text-white/30 border-transparent hover:text-white/80 hover:bg-white/5 whitespace-nowrap'} rounded-t-xl`}
      >
          {label}
      </button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative bg-transparent">
      <nav id="main-navigation" className="sticky top-0 z-50 w-full backdrop-blur-3xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div id="brand-logo-container" className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                   <span className="text-white font-black text-2xl font-display">V</span>
                </div>
                <div className="flex flex-col -gap-1">
                  <span className="text-2xl font-black text-white tracking-tighter font-display italic">VORA <span className="text-accent not-italic">AI</span></span>
                  <span className="text-[8px] font-black text-accent/50 uppercase tracking-[0.4em] leading-none">Creative OS</span>
                </div>
            </div>
            
            <div className="hidden xl:flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center">
                  <NavItem label="Design" targetView="creator_studio" />
                  <NavItem label="Photoshoot" targetView="photoshoot_director" />
                  <NavItem label="Ads" targetView="ad_creative_studio" />
                </div>
                <div className="w-px h-4 bg-white/10 mx-2"></div>
                <div className="flex items-center">
                  <NavItem label="Strategy" targetView="marketing_studio" />
                  <NavItem label="Campaign" targetView="campaign_studio" />
                  <NavItem label="Storyboard" targetView="storyboard_studio" />
                </div>
                <div className="w-px h-4 bg-white/10 mx-2"></div>
                <div className="flex items-center">
                  <NavItem label="Voice" targetView="voice_over_studio" />
                  <NavItem label="Video" targetView="video_studio" />
                  <NavItem label="Vault" targetView="asset_vault" />
                </div>
            </div>

            <div className="flex items-center gap-4">
               <button className="hidden sm:flex px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                 System v3.1
               </button>
            </div>
        </div>
      </nav>

      <section id="hero-section" className="w-full max-w-7xl mx-auto px-4 pt-20 md:pt-32 pb-24 flex flex-col lg:flex-row items-center gap-16 min-h-[85vh] relative">
           <div id="hero-content-wrapper" className="flex-1 relative z-10 text-center lg:text-left">
              <div id="hero-badge" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-pulse-soft">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>
                The Future of eCommerce Creative
              </div>
              <h1 id="hero-title" className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] text-white font-display mb-10">
                 BEYOND<br/>
                 THE<br/>
                 <span className="text-accent underline decoration-white/10 underline-offset-8"><Typewriter /></span>
              </h1>
              <div id="hero-description-container" className="mt-12 lg:pl-10 lg:border-l-4 border-accent max-w-2xl mx-auto lg:mx-0">
                  <p id="hero-description" className="text-xl sm:text-2xl text-text-secondary leading-relaxed font-light">
                    Transform abstract ideas into production-ready visual assets. <br/>
                    <span className="font-bold text-white/80">AI-powered, commercial-grade, instant delivery.</span>
                  </p>
              </div>
              <div id="hero-actions" className="mt-16 flex flex-wrap justify-center lg:justify-start gap-6 items-center">
                  <button 
                    id="enter-studio-btn"
                    onClick={scrollToContent}
                    className="flex items-center gap-4 bg-accent hover:bg-accent-dark text-white px-12 py-6 rounded-[2rem] transition-all group shadow-[0_25px_60px_rgba(var(--color-accent-rgb),0.5)] hover:-translate-y-2 active:translate-y-0"
                  >
                    <span className="font-black text-base uppercase tracking-[0.25em] font-display">Launch Workspace</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                      <ArrowRightIcon />
                    </div>
                  </button>
                  
                  <div className="h-12 w-px bg-white/10 hidden sm:block"></div>

                  <div id="hero-ratings" className="flex flex-col gap-2 items-center lg:items-start">
                    <div className="flex -space-x-3">
                       {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-bg-base overflow-hidden bg-slate-900 flex items-center justify-center ring-1 ring-white/10 group cursor-pointer hover:z-10 hover:scale-110 transition-all">
                              <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                       ))}
                    </div>
                    <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">
                      Powering <span className="text-accent font-black">2.5k+</span> Campaigns
                    </div>
                  </div>
              </div>
           </div>
           
           <div className="flex-1 flex justify-center items-center relative py-20 lg:py-0">
               <div className="absolute inset-0 bg-accent/10 blur-[120px] rounded-full scale-150 animate-pulse"></div>
               <InteractiveLogo />
               
               {/* Floating Stats */}
               <div className="absolute top-0 right-0 glass-card p-6 rounded-3xl animate-float" style={{ animationDelay: '1s' }}>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Processing</p>
                  <p className="text-2xl font-black text-white">4.2k <span className="text-xs text-white/30">G/s</span></p>
               </div>
               <div className="absolute bottom-10 left-0 glass-card p-6 rounded-3xl animate-float" style={{ animationDelay: '3s' }}>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Quality Score</p>
                  <p className="text-2xl font-black text-white">99.8%</p>
               </div>
           </div>
      </section>
      
      <div className="xl:hidden sticky top-20 z-40 w-full bg-black/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-center gap-1 px-4 py-2">
            <div className="absolute left-4 opacity-40 hidden sm:block">
                 <div className="w-1 h-3 bg-accent/40 rounded-full"></div>
            </div>
            <button 
                onClick={() => scrollMobileNav('left')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shrink-0"
             >
                <ChevronLeftIcon />
            </button>
            <div 
                ref={mobileNavRef}
                className="flex items-center gap-1 overflow-x-auto suggestions-scrollbar scroll-smooth flex-1 px-4 no-scrollbar"
            >
                <NavItem label="Design" targetView="creator_studio" isMobile />
                <NavItem label="Edit" targetView="edit_studio" isMobile />
                <NavItem label="Storyboard" targetView="storyboard_studio" isMobile />
                <NavItem label="Photoshoot" targetView="photoshoot_director" isMobile />
                <NavItem label="Ads" targetView="ad_creative_studio" isMobile />
                <NavItem label="Strategy" targetView="marketing_studio" isMobile />
                <NavItem label="Plan" targetView="plan_studio" isMobile />
                <NavItem label="Campaign" targetView="campaign_studio" isMobile />
                <NavItem label="Video" targetView="video_studio" isMobile />
                <NavItem label="Prompt" targetView="prompt_studio" isMobile />
                <NavItem label="Voice" targetView="voice_over_studio" isMobile />
                <NavItem label="Vault" targetView="asset_vault" isMobile />
            </div>
            <button 
                onClick={() => scrollMobileNav('right')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shrink-0"
             >
                <ChevronRightIcon />
            </button>
      </div>

      <div id="content-container" ref={contentRef} className="w-full max-w-7xl flex-grow pt-8 pb-20 px-2 sm:px-4 z-10">
        {renderContent()}
        <ChatWidget />
        <footer id="app-footer" className="w-full border-t border-white/5 flex-shrink-0 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center gap-10 text-white/50">
              
              <div id="footer-logo-container" className="flex flex-col items-center gap-6 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-accent-rgb),0.5)] group-hover:scale-110 transition-transform">
                   <span className="text-white font-black text-2xl font-display">V</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-black text-white tracking-widest font-display">VORA <span className="text-[var(--color-accent)]">AI</span></span>
                  <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold mt-1">Creative Operating System</p>
                </div>
              </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
