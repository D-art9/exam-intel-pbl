
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { UploadCloud, File, X, ArrowRight, Loader2, FileType } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadPage() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/documents/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("Upload Success:", response.data);
            if (response.data.id) {
                navigate(`/dashboard/${response.data.id}`);
            }

        } catch (error) {
            console.error("Upload Error:", error);
            alert("Upload failed. Check backend connection.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles((prev) => [...prev, ...droppedFiles]);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto space-y-8">
            <div className="space-y-4 pt-12">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    UPLOAD <span className="text-neo-orange">DOCUMENTS</span>
                </h1>
                <p className="text-xl text-neutral-400">
                    Feed the Engine. Upload your PDF syllabus or past papers.
                </p>
            </div>

            <NeoCard className="p-12 border-2 border-dashed border-neutral-700 hover:border-neo-orange transition-colors">
                <div
                    className={cn(
                        "flex flex-col items-center justify-center text-center space-y-6 transition-all duration-300 cursor-pointer",
                        isDragging ? "scale-105 opacity-80" : ""
                    )}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <div className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all bg-neutral-900",
                        isDragging ? "bg-neo-orange text-black" : "text-neo-orange"
                    )}>
                        <UploadCloud className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-2xl font-bold text-white uppercase tracking-wide">
                            Drag & Drop Files Here
                        </p>
                        <p className="text-neutral-500 font-mono text-sm">
                            OR CLICK TO BROWSE LOCAL FILES
                        </p>
                    </div>

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        multiple
                        onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])}
                    />
                </div>
            </NeoCard>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white uppercase border-l-4 border-neo-orange pl-4">
                            Selected Files ({files.length})
                        </h2>

                        <div className="grid gap-4">
                            {files.map((file, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center justify-between p-4 bg-neo-surface border border-neutral-800 hover:border-neo-orange transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-neutral-900 text-neo-orange rounded-none border border-neutral-800 group-hover:bg-neo-orange group-hover:text-black transition-colors">
                                            <FileType className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white tracking-wide">{file.name}</p>
                                            <p className="text-xs text-neutral-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setFiles(files.filter((_, index) => index !== i))}
                                        className="p-2 text-neutral-500 hover:text-neo-orange transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-8">
                            <NeoButton
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full md:w-auto text-lg py-4 flex items-center justify-center gap-3"
                            >
                                {isUploading ? (
                                    <>Processing <Loader2 className="animate-spin" /></>
                                ) : (
                                    <>Initiate Analysis <ArrowRight /></>
                                )}
                            </NeoButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
