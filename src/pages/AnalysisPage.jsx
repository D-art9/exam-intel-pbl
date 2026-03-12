import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NeoCard } from '../components/neo/NeoComponents';
import { Loader2, Cpu, Zap, Shield, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnalysisPage() {
    const navigate = useNavigate();
    const { documentId } = useParams();
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        { label: "Initializing Neural Ingestion", icon: <Cpu className="w-5 h-5" /> },
        { label: "Scanning PDF Structure", icon: <Zap className="w-5 h-5 text-neo-orange" /> },
        { label: "Extracting Meta-Syllabus Data", icon: <Terminal className="w-5 h-5 text-emerald-400" /> },
        { label: "Generating LLaMA-3 Semantic Map", icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
        { label: "Synchronizing Document History", icon: <Shield className="w-5 h-5 text-blue-400" /> }
    ];

    useEffect(() => {
        const totalTime = 4500; // 4.5 seconds for a cool effect
        const intervalTime = 30;
        const increment = 100 / (totalTime / intervalTime);

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
        setStep(currentStepIndex);

        if (progress >= 100) {
            setTimeout(() => navigate(`/dashboard/${documentId}`), 800);
        }
    }, [progress, navigate, documentId, steps.length]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] bg-neo-black p-6">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header Area */}
                <div className="text-center space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-4"
                    >
                        <div className="p-3 bg-neo-orange/10 border border-neo-orange/30 rounded-none transform rotate-3 shadow-[4px_4px_0px_#FF5500]">
                            <Cpu className="w-8 h-8 text-neo-orange animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            Analyzing <span className="text-neo-orange">Data</span>
                        </h2>
                    </motion.div>
                    <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase">
                        Establishing Quantum Connection with Ingestion Engine...
                    </p>
                </div>

                {/* Progress Card */}
                <NeoCard className="p-10 border-2 border-neutral-800 bg-neo-surface relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neo-orange/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    
                    <div className="space-y-12 relative z-10">
                        {/* Status Icon & Text */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-black border border-neutral-800 text-neo-orange shadow-[2px_2px_0px_rgba(255,85,0,0.5)]">
                                    {steps[step].icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                                        {steps[step].label}
                                    </h3>
                                    <p className="text-xs text-neutral-500 font-mono">STATUS: EXECUTING_PROTOCOL_0{step + 1}</p>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-neo-orange font-mono">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="space-y-2">
                            <div className="h-4 bg-black border border-neutral-800 rounded-none p-1 overflow-hidden">
                                <motion.div
                                    className="h-full bg-neo-orange shadow-[0_0_15px_rgba(255,85,0,0.4)]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ ease: "easeOut" }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                                <span>Input Stream Loaded</span>
                                <span>Finalizing Nodes</span>
                            </div>
                        </div>

                        {/* Animated Step Dots */}
                        <div className="flex justify-center gap-2">
                            {steps.map((_, i) => (
                                <div 
                                    key={i}
                                    className={`w-2 h-2 transition-all duration-300 ${
                                        i <= step ? "bg-neo-orange scale-125 shadow-[0_0_8px_#FF5500]" : "bg-neutral-800"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </NeoCard>

                {/* Footer Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex items-center justify-center gap-4 text-neutral-600 font-mono text-[10px] uppercase tracking-[0.3em]"
                >
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Hybrid-RAG v2.0</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <span>Llama-3 Integration Ready</span>
                </motion.div>
            </div>
        </div>
    );
}
