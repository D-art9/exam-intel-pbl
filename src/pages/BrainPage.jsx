
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { Brain, FileText, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function BrainPage() {
    const navigate = useNavigate();

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.get(`${API_URL}/api/documents/`);
            return response.data;
        }
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-neo-orange border-2 border-neo-black shadow-neo">
                        <Brain className="w-8 h-8 text-neo-black" />
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Memory Core</h1>
                    <p className="text-neutral-400 mt-1">Access all analyzed documents and conversation history.</p>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-neo-surface border border-neutral-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {documents.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-neo-surface border border-neutral-800 rounded-xl">
                            <FileText className="w-16 h-16 text-neutral-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Memories Found</h3>
                            <p className="text-neutral-500 mb-6">Upload a document to start building your knowledge base.</p>
                            <NeoButton onClick={() => navigate('/upload')}>
                                Upload Document <ArrowRight className="w-4 h-4 ml-2" />
                            </NeoButton>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <motion.div key={doc.id} variants={item}>
                                <div onClick={() => navigate(`/subject-results/${doc.id}`)}>
                                    <NeoCard className="h-full flex flex-col group cursor-pointer hover:bg-neutral-900 transition-colors duration-300">
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2 bg-neutral-900 rounded border border-neutral-800 group-hover:border-neo-orange transition-colors">
                                                    <FileText className="w-6 h-6 text-neutral-400 group-hover:text-neo-orange" />
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${doc.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    doc.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    {doc.status}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-neo-orange transition-colors">
                                                {doc.title || "Untitled Document"}
                                            </h3>

                                            <div className="space-y-2 mt-4">
                                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span>Chat History Available</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-neutral-800 bg-black/20 flex justify-between items-center group-hover:bg-neo-orange/10 transition-colors">
                                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neo-orange">
                                                Open Analysis
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:translate-x-1 group-hover:text-neo-orange transition-all" />
                                        </div>
                                    </NeoCard>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
        </div>
    );
}
