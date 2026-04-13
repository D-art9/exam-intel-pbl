import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertTriangle, Star, CheckCircle2, ChevronDown, FileQuestion, Calendar, Award, Youtube as LucideYoutube } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export default function CoverageMatrix({ matrix }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-800 rounded-xl bg-neo-black/40">
        <Target className="w-12 h-12 text-neutral-600 mb-4" />
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest text-center">
          No syllabus data found. Ensure the handout ingestion is complete.
        </p>
      </div>
    );
  }

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'HIGH': return 'bg-emerald-500';
      case 'MED': return 'bg-amber-500';
      case 'LOW':
      default: return 'bg-red-500';
    }
  };

  const getStrengthProgress = (strength) => {
    switch (strength) {
      case 'HIGH': return 'w-full';
      case 'MED': return 'w-1/2';
      case 'LOW':
      default: return 'w-4';
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {matrix.map((row, idx) => {
        const isExpanded = expandedRow === row.id;
        
        return (
          <motion.div
            key={row.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={cn(
              "group relative bg-neo-surface border border-neutral-800 transition-all duration-300 overflow-hidden",
              row.blind_spot ? "border-red-500/20 bg-red-500/[0.02]" : "hover:border-neo-orange/50",
              isExpanded && "border-neo-orange bg-neo-orange/[0.02] shadow-2xl"
            )}
          >
            {/* Subtle Side Marker */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1 z-10",
              getStrengthColor(row.coverage_strength)
            )} />

            <div 
              onClick={() => setExpandedRow(isExpanded ? null : row.id)}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
            >
              
              {/* Lecture Identification */}
              <div className="flex items-start gap-4 flex-1">
                <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-black border border-neutral-800 shadow-sm transition-colors group-hover:border-neo-orange/30">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase leading-none">Lec</span>
                  <span className="text-xl font-black text-white leading-tight">{row.lecture_number || idx + 1}</span>
                </div>
                
                      <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm md:text-lg font-black text-white tracking-tight uppercase italic group-hover:text-neo-orange transition-colors">
                      {row.topic || 'Untitled Session'}
                    </h3>

                    {/* Difficulty Badge */}
                    <div className={cn(
                      "px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border",
                      row.difficulty === 'COMPLEX' ? "bg-red-500/10 border-red-500 text-red-500" :
                      row.difficulty === 'INTERMEDIATE' ? "bg-amber-500/10 border-amber-500 text-amber-500" :
                      "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                    )}>
                      {row.difficulty || 'BASIC'}
                    </div>
                    
                    {/* Frequency Badge */}
                    {row.is_high_frequency && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-neo-orange text-black text-[9px] font-black uppercase tracking-tighter rounded-sm">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        HIGH FREQ
                      </div>
                    )}

                    {/* Blind Spot Badge */}
                    {row.blind_spot && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-tighter rounded-sm">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        BLIND SPOT
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase">
                    CO_INDEX: <span className={row.co_mapped ? "text-neo-orange" : "text-neutral-700 font-normal"}>
                      {row.co_mapped || 'NOT_LINKED'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Coverage Analytics & Toggle */}
              <div className="flex items-center gap-8">
                {/* YouTube Link - Quick Access */}
                <motion.a
                  href={row.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                >
                  <LucideYoutube className="w-3 h-3" />
                  Learn
                </motion.a>

                <div className="hidden lg:block w-48 space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] mb-1">
                    <span className="text-neutral-600">Sync Status</span>
                    <span className={cn("font-black", row.blind_spot ? "text-red-500" : "text-emerald-500")}>
                      {row.match_count} Linked
                    </span>
                  </div>
                  <div className="h-1 w-full bg-black/50 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: row.blind_spot ? "10%" : row.coverage_strength === 'HIGH' ? "100%" : "50%" }}
                      className={cn("h-full", getStrengthColor(row.coverage_strength))}
                    />
                  </div>
                </div>

                <motion.div 
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-500 group-hover:text-neo-orange group-hover:border-neo-orange/50 transition-all shadow-lg"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </div>

            </div>

            {/* Dropdown Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="border-t border-neutral-800 bg-black/40"
                >
                  <div className="p-6 pt-2 space-y-6">
                    <div className="flex items-center gap-3 text-neo-orange/60 font-mono text-[10px] uppercase tracking-[0.4em] mb-4">
                      <Target className="w-3 h-3" /> Foundational Matches
                    </div>

                    {!row.matches || row.matches.length === 0 ? (
                      <div className="p-8 border border-dashed border-red-500/20 bg-red-500/5 text-center">
                         <p className="text-red-400 font-mono text-xs uppercase tracking-widest">
                           No questions found for this topic across uploaded papers.
                         </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {row.matches.map((match, mIdx) => (
                          <motion.div 
                            key={match.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: mIdx * 0.05 }}
                            className="bg-neutral-900/50 border border-neutral-800 p-4 transition-all hover:border-neo-orange/30 group/item"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black border border-neutral-800 text-[9px] font-mono text-neutral-500 uppercase">
                                  <Calendar className="w-2.5 h-2.5" /> {match.year || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neo-orange/10 border border-neo-orange/20 text-[9px] font-mono text-neo-orange uppercase">
                                  <Award className="w-2.5 h-2.5" /> {match.marks || '??'} Marks
                                </div>
                              </div>
                              <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest group-hover/item:text-neo-orange/50 transition-colors">
                                Source: {match.source_paper}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-300 leading-relaxed font-sans pl-2 border-l-2 border-neo-orange/20 group-hover/item:border-neo-orange transition-colors italic">
                              "{match.question_text}"
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-end">
                       <p className="text-[9px] font-mono text-neutral-700 uppercase tracking-[0.5em]">
                         Neural_Sync_Complete // v4.0.1
                       </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        );
      })}
    </div>
  );
}
