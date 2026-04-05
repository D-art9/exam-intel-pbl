import { motion } from 'framer-motion';
import { Target, AlertTriangle, Star, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CoverageMatrix({ matrix }) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-800 rounded-xl bg-neo-black/40">
        <Info className="w-12 h-12 text-neutral-600 mb-4" />
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
    <div className="space-y-4">
      {matrix.map((row, idx) => (
        <motion.div
          key={row.id || idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
          className={cn(
            "group relative bg-neo-surface border border-neutral-800 p-5 rounded-none transition-all duration-300 hover:border-neo-orange overflow-hidden",
            row.blind_spot && "border-red-500/20 bg-red-500/[0.02]"
          )}
        >
          {/* Subtle Side Marker */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-1",
            getStrengthColor(row.coverage_strength)
          )} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Lecture Identification */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-black border border-neutral-800 shadow-sm">
                <span className="text-[10px] font-mono text-neutral-500 uppercase leading-none">Lec</span>
                <span className="text-xl font-black text-white leading-tight">{row.lecture_number || '??'}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm md:text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-neo-orange transition-colors">
                    {row.topic || 'Untitled Session'}
                  </h3>
                  
                  {/* Frequency Badge */}
                  {row.is_high_frequency && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-neo-orange text-black text-[9px] font-black uppercase tracking-tighter rounded-sm animate-pulse-slow">
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
                  CO: <span className={row.co_mapped ? "text-neo-orange" : "text-neutral-700"}>
                    {row.co_mapped || 'Not Linked'}
                  </span>
                </p>
              </div>
            </div>

            {/* Coverage Analytics */}
            <div className="w-full md:w-64 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
                <span className="text-neutral-500">Coverage Strength</span>
                <span className={cn("font-black", row.blind_spot ? "text-red-500" : "text-white")}>
                  {row.match_count} Matches
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-black border border-neutral-800 rounded-none overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="h-full bg-transparent"
                >
                  <div className={cn(
                    "h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                    getStrengthProgress(row.coverage_strength),
                    getStrengthColor(row.coverage_strength)
                  )} />
                </motion.div>
              </div>
            </div>

          </div>

          {/* Expanded Data Tooltip - visible on hover */}
          <div className="mt-4 pt-4 border-t border-neutral-800/50 hidden group-hover:block transition-all duration-300">
             <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest text-neutral-600">
               <div className="flex items-center gap-1.5">
                 <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                 <span>Semantic Map: Ready</span>
               </div>
               {row.best_match && (
                 <div className="flex items-center gap-1.5">
                   <Target className="w-3 h-3 text-neo-orange" />
                   <span>Top Source: {row.best_match.source_paper}</span>
                 </div>
               )}
             </div>
          </div>

        </motion.div>
      ))}
    </div>
  );
}
