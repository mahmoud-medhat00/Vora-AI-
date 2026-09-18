
import React from 'react';
import { motion } from 'motion/react';

interface Preset {
  id: string;
  name: string;
  image: string; // Thumbnails
  prompt: string;
}

const PRESETS: Preset[] = [
  { 
    id: 'scandinavian', 
    name: 'Scandinavian', 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=200', 
    prompt: 'Scandinavian minimalist interior, clean white walls, light wood furniture, natural morning light, soft shadows, high-end furniture photography style.'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk', 
    image: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=200', 
    prompt: 'Futuristic cyberpunk neon city background, rainy night, blue and pink cinematic lighting, reflections, high-tech atmosphere, vibrant glow.'
  },
  { 
    id: 'golden_hour', 
    name: 'Golden Hour', 
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=200', 
    prompt: 'Outdoor forest setting during golden hour, warm sunset light, bokeh background, forest floor, magical atmosphere, sun flares.'
  },
  { 
    id: 'luxury_marble', 
    name: 'Luxury Marble', 
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=200', 
    prompt: 'Luxury white marble countertop, elegant kitchen background, soft high-end lighting, clean and premium aesthetic, high contrast.'
  },
  { 
    id: 'desert_minimal', 
    name: 'Desert Minimal', 
    image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=200', 
    prompt: 'Minimalist desert landscape, sand dunes, clear blue sky, harsh midday sun, sharp shadows, high-fashion editorial style.'
  },
  { 
    id: 'dark_cinematic', 
    name: 'Dark Studio', 
    image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=200', 
    prompt: 'Dark moody studio background, dramatic spotlights, subtle smoke effect, carbon fiber textures, aggressive professional lighting.'
  },
];

interface EnvironmentPresetsProps {
  selectedId: string | null;
  onSelect: (preset: Preset) => void;
}

const EnvironmentPresets: React.FC<EnvironmentPresetsProps & { id?: string }> = ({ selectedId, onSelect, id }) => {
  return (
    <div id={id} className="flex flex-col gap-3">
      <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-2 mb-1 flex items-center gap-2">
          <div className="w-1 h-3 bg-accent/40 rounded-full"></div>
          World Presets
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((preset) => (
          <motion.button
            key={preset.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(preset)}
            className={`relative aspect-video rounded-xl overflow-hidden border transition-all group ${
              selectedId === preset.id ? 'border-accent shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.3)]' : 'border-white/5 hover:border-white/20'
            }`}
          >
            <img src={preset.image} alt={preset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">{preset.name}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentPresets;
