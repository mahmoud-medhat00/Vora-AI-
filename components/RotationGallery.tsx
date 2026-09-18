
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageFile } from '../types';

interface RotationGalleryProps {
  images: ImageFile[];
  isGenerating: boolean;
}

const RotationGallery: React.FC<RotationGalleryProps> = ({ images, isGenerating }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length > 0 && !isGenerating) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [images, isGenerating]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic animate-pulse">Scanning and Rotating AI Universe...</p>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Magic 360 Spin</h3>
            <span className="text-[8px] font-bold text-[var(--color-accent)] uppercase">Auto-Carousel Active</span>
        </div>
        <div className="relative aspect-square glass-card rounded-[2.5rem] overflow-hidden border border-white/10 group bg-black/40">
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentIndex}
                    src={`data:${images[currentIndex].mimeType};base64,${images[currentIndex].base64}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-contain p-6"
                />
            </AnimatePresence>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                {images.map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === i ? 'bg-[var(--color-accent)] w-4' : 'bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

export default RotationGallery;
