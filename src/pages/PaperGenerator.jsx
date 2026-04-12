import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react'; // FIXED: Added missing useState
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, AlertCircle, Loader2, Sparkles, Download, Target } from 'lucide-react'; // FIXED: Added Target from lucide
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { usePaperGenerator } from '../hooks/usePaperGenerator';
import PaperConfigForm from '../components/paper/PaperConfigForm';
import CoverageMatrix from '../components/paper/CoverageMatrix';

export function PaperGenerator() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('coverage');

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
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-black border border-neutral-800 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Pipeline Active</span>
          </div>
        </div>
      </div>

      {/* Split Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Configuration (40%) */}
        <div className="w-full md:w-[40%] border-r border-neutral-800 bg-neo-surface overflow-y-auto custom-scrollbar relative">
          <div className="p-8">
             <div className="mb-8 flex items-center gap-3">
               <Cpu className="w-5 h-5 text-neo-orange" />
               <h2 className="text-lg font-bold text-white uppercase tracking-widest border-b-2 border-neo-orange pb-1">
                 Payload Config
               </h2>
             </div>
             
             <PaperConfigForm 
               onSubmit={handleGenerate} 
               isGenerating={isGenerating} 
             />
          </div>

          {/* Loading Overlay for Generation */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-24 h-24 border-4 border-neo-orange/20 rounded-none absolute -inset-2"
                  />
                  <div className="relative bg-neo-orange p-6 shadow-[0_0_30px_rgba(255,85,0,0.4)]">
                    <Sparkles className="w-12 h-12 text-black animate-pulse" />
                  </div>
                </div>
                
                <div className="mt-12 space-y-4">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    Synthesizing <span className="text-neo-orange">Paper</span>
                  </h3>
                  <div className="flex flex-col gap-2 items-center">
                    <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
                      Greedy Selection Protocol in Progress...
                    </p>
                    <div className="w-48 h-1 bg-neutral-900 overflow-hidden">
                      <motion.div 
                        animate={{ x: [-200, 200] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-full bg-neo-orange"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Coverage Matrix (60%) */}
        <div className="hidden md:block md:w-[60%] bg-neo-black overflow-y-auto custom-scrollbar">
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Target className="w-5 h-5 text-neo-orange" />
                 <h2 className="text-lg font-bold text-white uppercase tracking-widest border-b-2 border-neo-orange pb-1">
                   Coverage Matrix
                 </h2>
               </div>
               <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900 px-3 py-1 border border-neutral-800">
                 Source: {documentId?.split('-')[0]}
               </span>
            </div>

            <CoverageMatrix matrix={matrixData} />
          </div>
        </div>

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
