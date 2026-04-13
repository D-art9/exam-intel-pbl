import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { UploadCloud, File, X, ArrowRight, Loader2, FileType, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PYQUploadZone from '../components/upload/PYQUploadZone';

export function UploadPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'handout';

    // State for Handout Mode (Existing)
    const [classicFiles, setClassicFiles] = useState([]);

    // State for Smart Paper Mode (New)
    const [handoutFile, setHandoutFile] = useState([]); // Array of 1 for consistency with component
    const [pyqFiles, setPyqFiles] = useState([]);
    
    const [isUploading, setIsUploading] = useState(false);

    // 1. Existing Analysis Pipeline (Handout Mode)
    const handleClassicUpload = async () => {
        if (classicFiles.length === 0) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', classicFiles[0]);

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/api/documents/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.id) {
                navigate(`/processing/${response.data.id}`);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Upload failed. Check backend connection.");
        } finally {
            setIsUploading(false);
        }
    };

    // 2. New Dual-Pipeline (Smart Paper Mode)
    const handleBatchUpload = async () => {
        if (handoutFile.length === 0 || pyqFiles.length === 0) {
            alert("Mission Logic Error: Requires exactly 1 syllabus and at least 1 PYQ paper.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('handout_file', handoutFile[0]);
        pyqFiles.forEach(file => {
            formData.append('pyq_files', file);
        });

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/api/pyq/upload-batch/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // Redirect to Generator with the new syllabus_id and context
            if (response.data.syllabus_id) {
                navigate(`/paper-generator/${response.data.syllabus_id}`, {
                    state: { 
                        mode: 'smart-paper', 
                        documentId: response.data.syllabus_id,
                        question_count: response.data.question_count 
                    }
                });
            }
        } catch (error) {
            console.error("Batch Upload Error:", error);
            alert("Batch ingestion failed. Mission aborted.");
        } finally {
            setIsUploading(false);
        }
    };

    const [processingStep, setProcessingStep] = useState(0);

    const steps = [
        "Initializing Neural Handshake...",
        "Parsing Mission Payload...",
        "Identifying Syllabus Patterns...",
        "Extracting PYQ Question Blocks...",
        "Generating 384-dim Vectors...",
        "Indexing Knowledge Base..."
    ];

    useEffect(() => {
        let interval;
        if (isUploading) {
            interval = setInterval(() => {
                setProcessingStep(prev => (prev + 1) % steps.length);
            }, 3000);
        } else {
            setProcessingStep(0);
        }
        return () => clearInterval(interval);
    }, [isUploading]);

    return (
        <div className="container max-w-5xl mx-auto space-y-12 pb-24 h-full">
            {/* Mission Processing Overlay */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-neo-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="relative mb-20">
                            {/* Outer Rings */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="absolute -inset-16 border border-neo-orange/10 rounded-full"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                                className="absolute -inset-10 border-2 border-dashed border-neo-orange/20 rounded-full"
                            />
                            
                            {/* Core Icon */}
                            <div className="relative w-32 h-32 bg-neo-orange/5 border-2 border-neo-orange flex items-center justify-center shadow-[0_0_50px_rgba(255,85,0,0.2)]">
                                <Cpu className="w-16 h-16 text-neo-orange animate-pulse" />
                                
                                {/* Corner Accents */}
                                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-neo-orange" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-neo-orange" />
                            </div>
                        </div>

                        <div className="max-w-md w-full space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                                    Synthesizing <span className="text-neo-orange">Payload</span>
                                </h2>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-1 w-12 bg-neo-orange animate-pulse" />
                                    <span className="text-neo-orange font-mono text-[10px] uppercase tracking-[0.3em]">
                                        Pipeline Level 4 Active
                                    </span>
                                    <div className="h-1 w-12 bg-neo-orange animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={processingStep}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-neutral-400 font-mono text-xs uppercase tracking-widest min-h-[1.5rem]"
                                    >
                                        {steps[processingStep]}
                                    </motion.p>
                                </AnimatePresence>

                                <div className="relative h-1.5 w-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                                    <motion.div 
                                        className="absolute inset-y-0 left-0 bg-neo-orange"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ 
                                            duration: 15, // Slow progress simulation
                                            ease: "linear",
                                            repeat: Infinity 
                                        }}
                                    />
                                    {/* Scan Line */}
                                    <motion.div 
                                        className="absolute inset-y-0 w-20 bg-white/20 blur-md"
                                        animate={{ x: ["-100%", "500%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-3 border border-neutral-900 bg-neutral-900/50 text-left">
                                    <p className="text-[8px] text-neutral-600 uppercase font-bold mb-1">Vector Scale</p>
                                    <p className="text-xs font-mono text-neo-orange">384 Dimensions</p>
                                </div>
                                <div className="p-3 border border-neutral-900 bg-neutral-900/50 text-left">
                                    <p className="text-[8px] text-neutral-600 uppercase font-bold mb-1">Compute Core</p>
                                    <p className="text-xs font-mono text-neo-orange">LPU Optimized</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Tech Text */}
                        <div className="absolute top-10 left-10 pointer-events-none hidden lg:block opacity-30">
                            <p className="text-[9px] font-mono text-neutral-500 text-left leading-relaxed">
                                DB_HANDSHAKE: OK<br/>
                                CLUSTER_INDEX: BUILDING<br/>
                                FRAG_COUNT: AUTOMATIC<br/>
                                ANALYTICS_v4: INIT
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="space-y-4 pt-12 relative">
                <div className="absolute -left-12 top-16 hidden lg:block">
                     <div className="rotate-90 origin-left text-[10px] font-mono text-neutral-800 uppercase tracking-[0.5em] whitespace-nowrap">
                         Mission: {mode === 'smart-paper' ? 'Dual Synthesis' : 'RAG Pipeline'}
                     </div>
                </div>
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-neo-orange/10 border border-neo-orange/20 rounded">
                        <Cpu className="w-5 h-5 text-neo-orange" />
                    </div>
                    <span className="text-neo-orange font-mono text-xs uppercase tracking-widest animate-pulse">
                        Engine Status: Operational
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Upload <span className="text-neo-orange">{mode === 'smart-paper' ? 'Mission Payload' : 'Document'}</span>
                </h1>
                <p className="text-lg text-neutral-500 font-mono uppercase tracking-tight">
                    {mode === 'smart-paper' 
                        ? 'Provision Syllabus + Past Papers for Neural Synthesis.' 
                        : 'Feed the RAG engine with your lecture handout for deep analysis.'}
                </p>
            </div>

            {/* Upload Interface */}
            {mode === 'smart-paper' ? (
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Zone 1: Handout */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <PYQUploadZone 
                            files={handoutFile}
                            setFiles={(f) => setHandoutFile(f.slice(-1))} // Only one handout
                            title="1. Current Syllabus"
                            description="Upload the main handout/syllabus PDF"
                            maxFiles={1}
                        />
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-widest pl-2 font-bold">
                            <ShieldCheck className={cn("w-4 h-4", handoutFile.length > 0 ? "text-emerald-500" : "text-neutral-800")} />
                            {handoutFile.length > 0 ? "Targeting Base Validated" : "Awaiting Target Base"}
                        </div>
                    </motion.div>

                    {/* Zone 2: PYQs */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <PYQUploadZone 
                            files={pyqFiles}
                            setFiles={setPyqFiles}
                            title="2. Past Exams"
                            description="Upload 1 or more past paper PDFs"
                        />
                         <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-widest pl-2 font-bold">
                            <CheckCircle2 className={cn("w-4 h-4", pyqFiles.length > 0 ? "text-emerald-500" : "text-neutral-800")} />
                            Loaded {pyqFiles.length} Reference Buffers
                        </div>
                    </motion.div>
                </div>
            ) : (
                /* Classic Handout Upload */
                <div className="max-w-2xl mx-auto">
                    <PYQUploadZone 
                        files={classicFiles}
                        setFiles={(f) => setClassicFiles(f.slice(-1))}
                        title="Neural Ingestion"
                        description="Drag & Drop your Syllabus PDF here"
                        maxFiles={1}
                    />
                </div>
            )}

            {/* Action Area */}
            <AnimatePresence>
                {(mode === 'smart-paper' ? (handoutFile.length > 0 && pyqFiles.length > 0) : (classicFiles.length > 0)) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50"
                    >
                        <NeoButton
                            onClick={mode === 'smart-paper' ? handleBatchUpload : handleClassicUpload}
                            disabled={isUploading}
                            className="w-full py-6 text-xl tracking-tighter flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(255,85,0,0.3)] border-2"
                        >
                            {isUploading ? (
                                <>PROCESSING PAYLOAD <Loader2 className="animate-spin w-6 h-6" /></>
                            ) : (
                                <>INITIATE MISSION <ArrowRight className="w-6 h-6" /></>
                            )}
                        </NeoButton>
                        <div className="text-center mt-4">
                            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.4em] font-bold">
                                Authentication Status: Encrypted
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
