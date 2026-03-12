import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { ArrowLeft, BookOpen, GraduationCap, LayoutDashboard, BrainCircuit, Share2, Maximize2, X, FileText, RotateCw } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function DashboardPage({ isEmbedded = false, documentId: propDocId }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { documentId: paramDocId } = useParams();
    const documentId = propDocId || paramDocId;
    const [showTableModal, setShowTableModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await queryClient.invalidateQueries(['lectureOutcomes', documentId]);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Fetch Lecture Outcomes
    const { data: outcomes, isLoading: outcomesLoading } = useQuery({
        queryKey: ['lectureOutcomes', documentId],
        queryFn: async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.get(`${API_URL}/api/documents/${documentId}/lecture_outcomes/`);
            return response.data;
        },
        enabled: !!documentId,
    });

    // Fetch Document Details (for title)
    const { data: documentData, isLoading: docLoading } = useQuery({
        queryKey: ['document', documentId],
        queryFn: async () => {
            // Re-using the detail endpoint if available, or just mocking title if not easily accessible without a dedicated endpoint
            // Assuming standard DRF ModelViewSet retrieve endpoint exists
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.get(`${API_URL}/api/documents/${documentId}/`);
            return response.data;
        },
        enabled: !!documentId,
    });

    const isLoading = outcomesLoading || docLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-black text-neo-orange font-mono p-10">
                <span className="animate-pulse">INITIALIZING DASHBOARD...</span>
            </div>
        );
    }

    return (
        <div className={`space-y-8 animate-in fade-in duration-700 ${isEmbedded ? 'p-6 h-full overflow-y-auto' : 'container mx-auto p-6'}`}>
            {/* Header Section */}
            {!isEmbedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-neo-orange mb-2">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-xs font-mono uppercase tracking-widest">Operator Console</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                            {documentData?.title || "Unknown Document"}
                        </h1>
                        <p className="text-neutral-500 font-mono mt-2">
                            ID: {documentId?.split('-')[0]}... • STATUS: <span className="text-green-500">READY</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <NeoButton
                            variant="secondary"
                            onClick={() => navigate('/upload')}
                            className="border-neutral-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Upload New
                        </NeoButton>
                        <NeoButton
                            onClick={() => navigate(`/subject-results/${documentId}`)}
                            className="bg-neo-orange text-black hover:bg-white"
                        >
                            <BrainCircuit className="w-4 h-4 mr-2" /> Subject Analysis
                        </NeoButton>
                    </div>
                </div>
            )}

            {/* Embedded Header */}
            {isEmbedded && (
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                            {documentData?.title}
                        </h2>
                        <span className="text-xs font-mono text-neo-orange">
                            // DASHBOARD_VIEW
                        </span>
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className={`grid grid-cols-1 gap-6 ${isEmbedded ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>

                {/* Left Column: Quick Stats / Overview */}
                {/* If embedded, maybe we hide stats or put them on top? Let's keep them for now but maybe single column */}
                <div className="space-y-6">
                    <NeoCard className="p-6 border-l-4 border-l-neo-orange bg-neo-surface">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-neo-orange" />
                            Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-black/40 p-3 rounded border border-neutral-800 flex justify-between items-center group/item hover:border-neo-orange transition-colors">
                                <div>
                                    <span className="text-xs text-neutral-500 block uppercase tracking-tighter">Total Lectures</span>
                                    <span className="text-2xl font-mono text-white">{outcomes?.length || 0}</span>
                                </div>
                                <NeoButton 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShowTableModal(true)}
                                    className="p-2 text-neutral-500 hover:text-neo-orange hover:bg-neo-orange/10 border-0"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </NeoButton>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-neutral-800">
                                <span className="text-xs text-neutral-500 block uppercase tracking-tighter">Processing Engine</span>
                                <span className="text-sm font-mono text-white tracking-widest">Hybrid-RAG v2.0</span>
                            </div>
                        </div>
                    </NeoCard>
                </div>

                {/* Right Column: Lecture Outcomes List */}
                <div className={`${isEmbedded ? '' : 'lg:col-span-2'} space-y-6`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <GraduationCap className="w-6 h-6 text-neo-orange" />
                            Lecture Outcomes
                        </h2>
                        <div className="flex items-center gap-3">
                            <NeoButton 
                                variant="secondary"
                                onClick={handleRefresh}
                                className="p-2 border-neutral-800 hover:border-neo-orange text-white"
                                title="Refresh Data"
                            >
                                <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </NeoButton>
                            <NeoButton 
                                variant="secondary"
                                onClick={() => setShowTableModal(true)}
                                className="text-[10px] py-1 px-3 border-neutral-800 hover:border-neo-orange text-white gap-2 uppercase tracking-widest font-black"
                            >
                                <Maximize2 className="w-3 h-3" /> Go Fullscreen
                            </NeoButton>
                            <span className="text-xs font-mono text-neutral-500 px-2 py-1 bg-neutral-900 rounded border border-neutral-800 hidden sm:block">
                                EXTRACTED
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-neo-surface border border-neutral-800 rounded-xl shadow-2xl">
                        {outcomes?.length > 0 ? (
                            <table className="w-full text-left text-sm text-neutral-300">
                                <thead className="text-xs uppercase bg-black/50 text-neutral-400 border-b border-neutral-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">LEC</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Topic</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider hidden md:table-cell">Description</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">CO Mapped</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outcomes.map((outcome, idx) => (
                                        <motion.tr 
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="border-b border-neutral-800/50 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-mono font-bold text-neo-orange whitespace-nowrap">
                                                {outcome.lecture_number}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white max-w-xs md:max-w-md">
                                                {outcome.topic}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400 hidden md:table-cell text-xs leading-relaxed max-w-sm">
                                                {outcome.description || <span className="text-neutral-600 block italic">No detailed description</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {outcome.co_mapped ? (
                                                    <span className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs px-2 py-1 rounded font-mono">
                                                        {outcome.co_mapped}
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-600">-</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center border-dashed border-neutral-700">
                                <p className="text-neutral-500">No structured lecture plan found in this document.</p>
                                <p className="text-xs text-neutral-600 mt-2">Try uploading a syllabus document with a clear "Lecture Plan" table.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Table Modal */}
            <AnimatePresence>
                {showTableModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-neo-black border border-neutral-800 rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neo-surface">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-neo-orange/10 rounded-lg">
                                        <FileText className="text-neo-orange w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter uppercase">
                                            FULL CURRICULUM DATA
                                        </h3>
                                        <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{documentData?.title}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowTableModal(false)}
                                    className="p-3 text-neutral-500 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all border border-neutral-800 hover:border-neutral-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-0 scrollbar-hide">
                                <table className="w-full text-left text-sm text-neutral-300 border-collapse">
                                    <thead className="sticky top-0 z-10 text-xs uppercase bg-neutral-900/95 backdrop-blur text-neutral-400 border-b border-neutral-800">
                                        <tr>
                                            <th className="px-8 py-5 font-bold tracking-widest">Lec</th>
                                            <th className="px-8 py-5 font-bold tracking-widest w-1/4">Topic</th>
                                            <th className="px-8 py-5 font-bold tracking-widest">Detailed Session Description</th>
                                            <th className="px-8 py-5 font-bold tracking-widest whitespace-nowrap">CO Mapping</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/50">
                                        {outcomes.map((row, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-6 font-mono text-neo-orange font-black text-lg">{row.lecture_number}</td>
                                                <td className="px-8 py-6">
                                                    <span className="text-white font-bold text-base block mb-1 tracking-tight">{row.topic}</span>
                                                </td>
                                                <td className="px-8 py-6 text-neutral-400 text-sm leading-relaxed max-w-2xl font-sans">
                                                    {row.description || <span className="italic text-neutral-600">No content extracted for this session.</span>}
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    {row.co_mapped ? (
                                                        <span className="bg-neo-orange/10 border border-neo-orange/20 text-neo-orange px-3 py-1.5 rounded-lg font-mono text-xs font-bold ring-1 ring-neo-orange/5">
                                                            {row.co_mapped}
                                                        </span>
                                                    ) : <span className="text-neutral-700 font-mono">-</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 bg-neo-surface border-t border-neutral-800 flex justify-end">
                                <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.2em]">Generated via Hybrid-RAG v2.0 • Data Compliant</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

