import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileQuestion, ChevronRight, Zap, Target } from 'lucide-react';
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { cn } from '../lib/utils';

export default function ModeSelection() {
  const [selectedMode, setSelectedMode] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedMode) {
      navigate('/upload', { state: { mode: selectedMode } });
    }
  };

  const modes = [
    {
      id: 'handout',
      title: 'Handout Mode',
      description: 'Upload your syllabus or handout and chat with your notes instantly.',
      icon: BookOpen,
      badge: 'Quick Start',
      badgeIcon: Zap,
      color: 'neo-orange',
    },
    {
      id: 'smart-paper',
      title: 'Smart Paper Mode',
      description: 'Upload your handout AND previous year papers to generate a tailored sample paper.',
      icon: FileQuestion,
      badge: 'Recommended',
      badgeIcon: Target,
      color: 'blue-500',
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-black">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4">
          Select Your <span className="text-neo-orange">Mission</span>
        </h1>
        <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">
          Choose a pipeline to begin your analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {modes.map((mode) => (
          <motion.div
            key={mode.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMode(mode.id)}
            className="cursor-pointer h-full"
          >
            <NeoCard
              className={cn(
                "h-full p-8 flex flex-col items-center text-center border-2 transition-all duration-300",
                selectedMode === mode.id 
                  ? "border-neo-orange bg-neo-orange/5 ring-4 ring-neo-orange/10 shadow-neo" 
                  : "border-neutral-800 hover:border-neutral-700"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl mb-6 transition-colors duration-300",
                selectedMode === mode.id ? "bg-neo-orange text-black" : "bg-neutral-900 text-neo-orange"
              )}>
                <mode.icon className="w-10 h-10" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  mode.id === 'smart-paper' ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-neo-orange/30 bg-neo-orange/10 text-neo-orange"
                )}>
                  <mode.badgeIcon className="w-3 h-3" />
                  {mode.badge}
                </div>
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                {mode.title}
              </h3>
              
              <p className="text-neutral-400 font-medium leading-relaxed mb-6">
                {mode.description}
              </p>

              {/* Status Indicator */}
              <div className="mt-auto w-full pt-6 border-t border-neutral-800/50">
                <div className="flex items-center justify-center gap-2 text-xs font-mono">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    selectedMode === mode.id ? "bg-neo-orange" : "bg-neutral-700"
                  )} />
                  <span className={cn(
                    "uppercase tracking-widest",
                    selectedMode === mode.id ? "text-neo-orange font-bold" : "text-neutral-600"
                  )}>
                    {selectedMode === mode.id ? 'System Selected' : 'Standby'}
                  </span>
                </div>
              </div>
            </NeoCard>
          </motion.div>
        ))}
      </div>

      <div className="h-24 mt-12 flex items-center justify-center">
        <AnimatePresence>
          {selectedMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
            >
              <NeoButton
                onClick={handleContinue}
                className="group px-12 py-4 flex items-center gap-3 text-lg"
              >
                Continue to Mission
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NeoButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-4 text-neutral-700 font-mono text-[10px] uppercase tracking-[0.3em]"
      >
        <span>Secure Ingestion</span>
        <div className="w-1 h-1 rounded-full bg-neutral-800" />
        <span>RAG Pipeline v3.2</span>
        <div className="w-1 h-1 rounded-full bg-neutral-800" />
        <span>Neural Extraction</span>
      </motion.div>
    </div>
  );
}
