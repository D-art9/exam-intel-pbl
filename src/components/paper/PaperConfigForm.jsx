import { useState } from 'react';
import { Plus, Trash2, ShieldCheck, History, Edit3, Settings2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoButton } from '../neo/NeoComponents';
import { cn } from '../../lib/utils';

export default function PaperConfigForm({ onSubmit, isGenerating }) {
  const [config, setConfig] = useState({
    title: '',
    total_marks: 100,
    sections: [
      { type: 'short', marks_per_q: 2, count: 10 },
      { type: 'medium', marks_per_q: 5, count: 6 },
      { type: 'long', marks_per_q: 10, count: 4 }
    ],
    prefer_recent: true,
    cover_all_outcomes: true
  });

  const cumulativeMarks = config.sections.reduce((sum, sec) => sum + (sec.marks_per_q * sec.count), 0);
  const isMarksValid = cumulativeMarks === config.total_marks;

  const handleAddSection = () => {
    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, { type: 'medium', marks_per_q: 5, count: 1 }]
    }));
  };

  const handleRemoveSection = (index) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index, field, value) => {
    const newSections = [...config.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setConfig(prev => ({ ...prev, sections: newSections }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isMarksValid) return;
    onSubmit(config);
  };

  const inputClasses = "w-full bg-black border border-neutral-800 rounded-none p-3 text-white font-mono text-sm focus:outline-none focus:border-neo-orange focus:ring-1 focus:ring-neo-orange transition-shadow shadow-inner";

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 pb-12">
      
      {/* Title & Basic Meta */}
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5" /> Paper Subject Title
          </span>
          <input 
            type="text"
            placeholder="e.g. End-Semester Digital Electronics"
            className={cn(inputClasses, "text-base py-4")}
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            required
            disabled={isGenerating}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5" /> Target Total Marks
          </span>
          <input 
            type="number"
            className={cn(inputClasses, "text-xl font-black text-neo-orange")}
            value={config.total_marks}
            onChange={(e) => setConfig({ ...config, total_marks: parseInt(e.target.value) || 0 })}
            required
            disabled={isGenerating}
          />
        </label>
      </div>

      {/* Sections Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest pl-1">Structure Config</span>
          <button 
            type="button" 
            onClick={handleAddSection}
            disabled={isGenerating}
            className="text-[10px] font-mono text-neo-orange hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
          >
            <Plus className="w-3 h-3" /> Add Section
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {config.sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-12 gap-2 items-end group"
              >
                {/* Type Select */}
                <div className="col-span-4 space-y-1">
                  <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-[0.2em] block pl-1">Type</span>
                  <select 
                    className={inputClasses}
                    value={section.type}
                    onChange={(e) => updateSection(idx, 'type', e.target.value)}
                    disabled={isGenerating}
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>

                {/* Marks/Q */}
                <div className="col-span-3 space-y-1">
                  <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-[0.2em] block pl-1">Pt/Q</span>
                  <input 
                    type="number"
                    className={inputClasses}
                    value={section.marks_per_q}
                    onChange={(e) => updateSection(idx, 'marks_per_q', parseInt(e.target.value) || 0)}
                    disabled={isGenerating}
                  />
                </div>

                {/* Count */}
                <div className="col-span-3 space-y-1">
                  <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-[0.2em] block pl-1">Qty</span>
                  <input 
                    type="number"
                    className={inputClasses}
                    value={section.count}
                    onChange={(e) => updateSection(idx, 'count', parseInt(e.target.value) || 0)}
                    disabled={isGenerating}
                  />
                </div>

                {/* Remove */}
                <div className="col-span-2 pb-1.5 flex justify-center">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSection(idx)}
                    disabled={isGenerating || config.sections.length <= 1}
                    className="p-3 text-neutral-700 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <label className="flex items-center justify-between p-4 bg-black/40 border border-neutral-900 cursor-pointer hover:border-neutral-700 transition-colors group">
          <div className="flex items-center gap-3">
            <History className={cn("w-5 h-5", config.prefer_recent ? "text-neo-orange" : "text-neutral-700")} />
            <div>
              <span className="block text-sm font-bold text-white uppercase tracking-tight">Prefer Recency</span>
              <span className="block text-[10px] font-mono text-neutral-600 uppercase tracking-widest leading-none mt-1">Weight recent years higher</span>
            </div>
          </div>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={config.prefer_recent}
            onChange={(e) => setConfig({...config, prefer_recent: e.target.checked})}
            disabled={isGenerating}
          />
          <div className={cn("w-10 h-10 border-2 flex items-center justify-center transition-all", 
            config.prefer_recent ? "border-neo-orange text-neo-orange" : "border-neutral-800 text-transparent"
          )}>
            <div className={cn("w-4 h-4 bg-current")} />
          </div>
        </label>

        <label className="flex items-center justify-between p-4 bg-black/40 border border-neutral-900 cursor-pointer hover:border-neutral-700 transition-colors group">
          <div className="flex items-center gap-3">
            <ShieldCheck className={cn("w-5 h-5", config.cover_all_outcomes ? "text-emerald-500" : "text-neutral-700")} />
            <div>
              <span className="block text-sm font-bold text-white uppercase tracking-tight">Full Coverage</span>
              <span className="block text-[10px] font-mono text-neutral-600 uppercase tracking-widest leading-none mt-1">Force coverage of all outcomes</span>
            </div>
          </div>
          <input 
            type="checkbox" 
            className="hidden"
            checked={config.cover_all_outcomes}
            onChange={(e) => setConfig({...config, cover_all_outcomes: e.target.checked})}
            disabled={isGenerating}
          />
          <div className={cn("w-10 h-10 border-2 flex items-center justify-center transition-all", 
            config.cover_all_outcomes ? "border-emerald-500 text-emerald-500" : "border-neutral-800 text-transparent"
          )}>
            <div className={cn("w-4 h-4 bg-current")} />
          </div>
        </label>
      </div>

      {/* Validation & Submit */}
      <div className="space-y-4 pt-6">
        {!isMarksValid && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-500/30 rounded-none mb-4"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-mono text-[10px] uppercase text-red-400 tracking-widest">
              Marks mismatch: <span className="text-white font-bold">{cumulativeMarks}</span> 
              / <span className="text-neo-orange font-black">{config.total_marks}</span>
            </span>
          </motion.div>
        )}

        <NeoButton 
          type="submit" 
          disabled={!isMarksValid || isGenerating || !config.title}
          className="w-full py-5 rounded-none flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,85,0,0.2)]"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2 animate-pulse">
              Generating Synthesis <div className="w-2 h-2 rounded-full bg-black animate-ping" />
            </span>
          ) : (
            <>Synthesize Mission Paper</>
          )}
        </NeoButton>
      </div>

    </form>
  );
}
