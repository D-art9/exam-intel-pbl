import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Maximize2, FileText, Scissors, Cpu, Database, 
    ChevronRight, Zap, LucideIcon 
} from 'lucide-react';
import { NeoCard, NeoButton } from '../neo/NeoComponents';

const steps = [
    { 
        id: 1, 
        title: "PDF Ingestion", 
        description: "Parsing raw syllabus & past papers via PyMuPDF4LLM engine.",
        icon: FileText,
        color: "text-blue-400"
    },
    { 
        id: 2, 
        title: "Semantic Chunking", 
        description: "Recursive 1000-char splitting with 200-char context overlap.",
        icon: Scissors,
        color: "text-purple-400"
    },
    { 
        id: 3, 
        title: "Vector Encoding", 
        description: "Generating 384-dim neural embeddings for semantic intelligence.",
        icon: Cpu,
        color: "text-green-400"
    },
    { 
        id: 4, 
        title: "pgvector Indexing", 
        description: "Storing mathematical knowledge in PostgreSQL vectors.",
        icon: Database,
        color: "text-orange-400"
    },
    { 
        id: 5, 
        title: "RAG Inference", 
        description: "Executing context-aware Llama-3 queries via Groq LPU.",
        icon: Zap,
        color: "text-neo-orange"
    }
];

export function WorkflowModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Show after a small delay on first mount
        const hasSeen = localStorage.getItem('hasSeenWorkflow');
        if (!hasSeen) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (isOpen && currentStep < steps.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentStep]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenWorkflow', 'true');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            y: 0,
                            width: isMaximized ? '95%' : '600px',
                            height: isMaximized ? '90vh' : 'auto'
                        }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-neo-black border-2 border-neo-orange shadow-[8px_8px_0px_0px_rgba(255,85,0,0.5)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-neo-surface p-4 border-b-2 border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={handleClose} />
                                <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-4 font-mono text-xs text-neutral-400 uppercase tracking-widest">
                                    System_Init // Neural_Pipeline_v4.0
                                </span>
                            </div>
                            <button onClick={handleClose} className="text-neutral-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-display font-black text-white uppercase italic">
                                    Exam Intel <span className="text-neo-orange">Inertia</span>
                                </h1>
                                <p className="text-neutral-500 text-sm font-mono">
                                    Initializing Retrieval-Augmented Generation pipeline...
                                </p>
                            </div>

                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ 
                                            opacity: index <= currentStep ? 1 : 0.2,
                                            x: 0,
                                            scale: index === currentStep ? 1.02 : 1
                                        }}
                                        className={`flex gap-4 p-4 rounded-none border ${
                                            index === currentStep 
                                                ? 'border-neo-orange bg-neo-orange/5' 
                                                : 'border-neutral-800 bg-transparent'
                                        } transition-all duration-300`}
                                    >
                                        <div className={`p-3 bg-neutral-900 border border-neutral-800 ${step.color}`}>
                                            <step.icon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                {step.title}
                                                {index < currentStep && <Zap size={14} className="text-neo-orange" />}
                                                {index === currentStep && (
                                                    <motion.span 
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1 }}
                                                        className="text-[10px] text-neo-orange font-mono font-normal bg-neo-orange/10 px-2 py-0.5"
                                                    >
                                                        ACTIVE
                                                    </motion.span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-neutral-500 mt-1">{step.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div 
                                className="pt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: currentStep >= steps.length ? 1 : 0.4 }}
                            >
                                <NeoButton 
                                    variant="primary" 
                                    className="w-full" 
                                    onClick={handleClose}
                                >
                                    {currentStep >= steps.length ? "ACCESS DASHBOARD" : "INITIALIZING CORE..."}
                                </NeoButton>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
