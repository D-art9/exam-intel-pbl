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

    return (
        <div className="container max-w-5xl mx-auto space-y-12 pb-24 h-full">
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
