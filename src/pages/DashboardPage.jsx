import { useNavigate, useParams } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { ArrowLeft, BookOpen, GraduationCap, LayoutDashboard, BrainCircuit, Share2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

export function DashboardPage({ isEmbedded = false, documentId: propDocId }) {
    const navigate = useNavigate();
    const { documentId: paramDocId } = useParams();
    const documentId = propDocId || paramDocId;

    // Fetch Lecture Outcomes
    const { data: outcomes, isLoading: outcomesLoading } = useQuery({
        queryKey: ['lectureOutcomes', documentId],
        queryFn: async () => {
            const response = await axios.get(`http://127.0.0.1:8000/api/documents/${documentId}/lecture_outcomes/`);
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
            const response = await axios.get(`http://127.0.0.1:8000/api/documents/${documentId}/`);
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
                            <div className="bg-black/40 p-3 rounded border border-neutral-800">
                                <span className="text-xs text-neutral-500 block uppercase">Total Lectures</span>
                                <span className="text-2xl font-mono text-white">{outcomes?.length || 0}</span>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-neutral-800">
                                <span className="text-xs text-neutral-500 block uppercase">Processing Engine</span>
                                <span className="text-sm font-mono text-white">Hybrid-RAG v2.0</span>
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
                        <span className="text-xs font-mono text-neutral-500 px-2 py-1 bg-neutral-900 rounded border border-neutral-800">
                            EXTRACTED DATA
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {outcomes?.length > 0 ? (
                            outcomes.map((outcome, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <NeoCard className="p-5 hover:border-neo-orange transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-neutral-900 text-neo-orange text-xs font-bold px-2 py-1 rounded border border-neutral-800">
                                                        LEC {outcome.lecture_number}
                                                    </span>
                                                    {outcome.co_mapped && (
                                                        <span className="text-xs text-neutral-500 font-mono">
                                                            CO: {outcome.co_mapped}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-white font-medium text-lg group-hover:text-neo-orange transition-colors">
                                                    {outcome.topic}
                                                </h4>
                                                {outcome.description && (
                                                    <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
                                                        {outcome.description}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </NeoCard>
                                </motion.div>
                            ))
                        ) : (
                            <NeoCard className="p-8 text-center border-dashed border-neutral-700">
                                <p className="text-neutral-500">No structured lecture plan found in this document.</p>
                                <p className="text-xs text-neutral-600 mt-2">Try uploading a syllabus document with a clear "Lecture Plan" table.</p>
                            </NeoCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
