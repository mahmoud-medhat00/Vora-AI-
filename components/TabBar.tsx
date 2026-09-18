
import React from 'react';
import { CreatorStudioProject, PhotoshootDirectorProject, PromptStudioProject, VoiceOverStudioProject, BrandingStudioProject, CampaignStudioProject, PlanStudioProject, EditStudioProject, StoryboardStudioProject, MarketingStudioProject, AdCreativeStudioProject } from '../types';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

type ProjectUnion = 
  | CreatorStudioProject 
  | PhotoshootDirectorProject 
  | PromptStudioProject 
  | VoiceOverStudioProject 
  | BrandingStudioProject 
  | CampaignStudioProject 
  | PlanStudioProject 
  | EditStudioProject 
  | StoryboardStudioProject 
  | MarketingStudioProject
  | AdCreativeStudioProject;

interface TabBarProps {
  projects: ProjectUnion[];
  activeProjectIndex: number;
  onSelectTab: (index: number) => void;
  onAddTab: () => void;
  onCloseTab: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = React.memo(({ projects, activeProjectIndex, onSelectTab, onAddTab, onCloseTab }) => {
  return (
    <div className="w-full max-w-7xl flex items-center border-b border-white/5 pb-2">
      <div className="flex items-center -mb-px overflow-x-auto suggestions-scrollbar scroll-smooth no-scrollbar gap-2 py-2">
        {projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => onSelectTab(index)}
            className={`flex-shrink-0 cursor-pointer flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 group relative ${
              index === activeProjectIndex
                ? 'bg-accent/10 border border-accent/30 text-white shadow-lg shadow-accent/5'
                : 'bg-white/[0.02] border border-white/5 text-text-muted hover:bg-white/[0.05] hover:border-white/10 hover:text-white'
            }`}
          >
            {index === activeProjectIndex && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">{project.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(index);
              }}
              className="rounded-full p-1 -mr-1 text-white/20 hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover:opacity-100"
              aria-label={`Close ${project.name}`}
            >
              <XIcon />
            </button>
          </div>
        ))}
        <button
          onClick={onAddTab}
          className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white/20 hover:text-accent hover:border-accent/20 hover:bg-accent/5 transition-all flex-shrink-0"
          aria-label="Add new project"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
});

export default TabBar;
