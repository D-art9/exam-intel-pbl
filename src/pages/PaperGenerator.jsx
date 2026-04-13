import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react'; // FIXED: Added missing useState
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, AlertCircle, Loader2, Sparkles, Download, Target, Home } from 'lucide-react'; 
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { usePaperGenerator } from '../hooks/usePaperGenerator';
import PaperConfigForm from '../components/paper/PaperConfigForm';
import CoverageMatrix from '../components/paper/CoverageMatrix';

export function PaperGenerator() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('coverage');
  const [isGeneratingModal, setIsGeneratingModal] = useState(false);

  // Mode Guard: Only accessible in Smart Paper Mode
  useEffect(() => {
    const currentMode = location.state?.mode;
    if (currentMode !== 'smart-paper') {
      console.warn("Unauthorized Mode Access. Terminating Generation Protocol.");
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const { 
    coverage, 
    isCoverageLoading, 
    isCoverageError, 
    generatePaper, 
    isGenerating,
    generationError
  } = usePaperGenerator(documentId);

  const handleGenerate = (config) => {
    generatePaper(config);
  };

  if (isCoverageLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] bg-neo-black text-neo-orange font-mono p-10">
        <Cpu className="w-12 h-12 mb-4 animate-pulse" />
        <span className="animate-pulse tracking-[0.2em]">SYNCHRONIZING COVERAGE DATA...</span>
      </div>
    );
  }

  // FIXED: Adjusted coverage matrix prop access to handle the new response structure
  const matrixData = coverage?.matrix || []; // FIXED

  if (isCoverageError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] bg-neo-black p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Connection Fault</h2>
        <p className="text-neutral-500 font-mono mb-8 max-w-md uppercase text-sm leading-relaxed">
          Failed to retrieve Syllabus coverage map. Ensure the ingestion pipeline is operational.
        </p>
        <NeoButton onClick={() => navigate(-1)} variant="secondary">
          Return to Console
        </NeoButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden bg-neo-black animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="shrink-0 h-16 border-b border-neutral-800 bg-neo-surface flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-neo-orange/10 rounded-lg">
            <FileText className="text-neo-orange w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">
              Smart Paper <span className="text-neo-orange">Generator</span>
            </h1>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-none mt-1">
              Mission: Neural Paper Synthesis v4.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NeoButton 
            variant="secondary" 
            onClick={() => navigate('/')}
            className="px-4 py-2 border-neutral-800 hover:border-neo-orange flex items-center gap-2 group transition-all"
          >
            <Home className="w-4 h-4 group-hover:text-neo-orange transition-colors" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Return Home</span>
          </NeoButton>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-black border border-neutral-800 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Pipeline Active</span>
          </div>
        </div>
      </div>

      {/* Single Column Content Layout */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-neo-black relative">
        
        {/* Coverage Matrix - Full Width */}
        <div className="w-full max-w-6xl mx-auto p-8 pb-32">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neo-surface p-6 border border-neutral-800 border-l-4 border-l-neo-orange">
             <div className="flex items-center gap-3">
               <Target className="w-6 h-6 text-neo-orange" />
               <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                    Coverage <span className="text-neo-orange">Intelligence</span>
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
                    Mapping Exam Source: {documentId?.split('-')[0]}
                  </p>
               </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-mono text-neutral-500 uppercase">Analysis Confidence</p>
                   <p className="text-sm font-black text-emerald-500">94.2% SYNCHRONIZED</p>
                </div>
                <NeoButton 
                  onClick={() => setIsGeneratingModal(true)}
                  className="px-8 py-3 bg-neo-orange text-black font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_10px_30px_rgba(255,85,0,0.3)] hover:translate-y-[-2px] transition-all"
                >
                  <Sparkles size={16} />
                  Compile Smart Paper
                </NeoButton>
             </div>
          </div>

          <CoverageMatrix matrix={matrixData} />
        </div>

        {/* Floating Paper Config Modal (Replacing the sidebar) */}
        <AnimatePresence>
          {isGeneratingModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.9, y: 20 }}
                 className="w-full max-w-2xl bg-neo-black border-2 border-neo-orange shadow-[20px_20px_0px_0px_rgba(255,85,0,0.2)]"
               >
                  <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neo-surface">
                     <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                        <Cpu className="text-neo-orange" /> Synthesis Config
                     </h2>
                     <button onClick={() => setIsGeneratingModal(false)} className="text-neutral-500 hover:text-white">
                        <Home size={20} />
                     </button>
                  </div>
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <PaperConfigForm 
                      onSubmit={(config) => {
                        setIsGeneratingModal(false);
                        handleGenerate(config);
                      }} 
                      isGenerating={isGenerating} 
                    />
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading Overlay for Generation - Moved out of the panel */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center"
            >
               <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-4 border-neo-orange/20 border-t-neo-orange rounded-full mb-12 shadow-[0_0_50px_rgba(255,85,0,0.2)]"
               />
               <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">
                  Neural <span className="text-neo-orange">Synthesis</span>
               </h3>
               <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.4em] animate-pulse">
                  Selecting Optimized Question Nodes...
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Notifications */}
      <AnimatePresence>
        {generationError && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 right-8 bg-red-950 border-2 border-red-500 p-4 rounded-none shadow-2xl flex items-center gap-4 z-[100]"
          >
            <div className="bg-red-500 p-2">
              <AlertCircle className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-white font-bold uppercase tracking-tight text-sm">Targeting Error</p>
              <p className="text-red-400 font-mono text-[10px] uppercase">Paper Generation Protocol Failed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
