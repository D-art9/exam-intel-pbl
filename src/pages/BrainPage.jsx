
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { Brain, FileText, Calendar, MessageSquare, ArrowRight, Search, RefreshCw, X, Menu, Settings, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BrainPage() {
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { data: documents = [], isLoading, refetch } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.get(`${API_URL}/api/documents/`);
            return response.data;
        }
    });

    const categories = [
        { id: 'all', name: 'All Memories', icon: Brain },
        { id: 'papers', name: 'Past Papers', icon: FileText },
        { id: 'syllabi', name: 'Syllabuses', icon: MessageSquare },
    ];

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || 
            (activeCategory === 'papers' && (doc.title || '').toLowerCase().includes('paper')) ||
            (activeCategory === 'syllabi' && (doc.title || '').toLowerCase().includes('syllabus'));
        return matchesSearch && matchesCategory;
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
        <div className="flex h-screen w-full bg-neo-black overflow-hidden relative">
            {/* Pop-out Sidebar Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 h-full w-80 bg-neo-surface border-r border-neutral-800 z-[70] flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-white font-bold tracking-widest text-sm uppercase text-neutral-400">Library Control</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-4">Categories</p>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                                            activeCategory === cat.id 
                                            ? 'bg-neo-orange/10 border-neo-orange/30 text-neo-orange font-bold' 
                                            : 'text-neutral-400 border-transparent hover:bg-neutral-900'
                                        }`}
                                    >
                                        <cat.icon className="w-5 h-5" />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-neutral-800">
                                <NeoButton variant="secondary" onClick={() => navigate('/upload')} className="w-full justify-start pl-4 gap-3 bg-black border-neutral-800 text-white hover:border-neo-orange">
                                    <ArrowRight className="w-5 h-5 rotate-180" /> Back to Upload
                                </NeoButton>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header / Navbar */}
                <div className="h-16 border-b border-neutral-800 bg-neo-surface/80 backdrop-blur flex items-center px-6 justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-neutral-400 hover:text-neo-orange transition-colors p-1 group">
                            <Menu className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(255,85,0,0.8)]" />
                        </button>
                        <h2 className="text-white font-black tracking-widest text-sm uppercase flex items-center gap-2">
                            <Brain className="w-4 h-4 text-neo-orange" /> MEMORY_CORE
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                            <input 
                                type="text"
                                placeholder="Search..."
                                className="bg-black/40 border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-neo-orange transition-all w-48"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <NeoButton variant="secondary" onClick={() => refetch()} className="p-2 h-8 w-8 !rounded-lg border-neutral-800">
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </NeoButton>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header Area */}
                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                                    {categories.find(c => c.id === activeCategory)?.name}
                                </h1>
                                <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                                    Status: {isLoading ? 'SYNCING...' : 'ONLINE'} // Total: {filteredDocuments.length} units
                                </p>
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
                    {filteredDocuments.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-neo-surface border border-neutral-800 rounded-xl">
                            <FileText className="w-16 h-16 text-neutral-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Memories Found</h3>
                            <p className="text-neutral-500 mb-6">Upload a document to start building your knowledge base.</p>
                            <NeoButton onClick={() => navigate('/upload')}>
                                Upload Document <ArrowRight className="w-4 h-4 ml-2" />
                            </NeoButton>
                        </div>
                    ) : (
                        filteredDocuments.map((doc) => (
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

                                            <div className="space-y-3 mt-6">
                                                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Captured: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between border-t border-neutral-800/50 pt-3">
                                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                        <MessageSquare className={`w-3.5 h-3.5 ${doc.message_count > 0 ? 'text-neo-orange' : 'text-neutral-600'}`} />
                                                        <span className="font-bold">{doc.message_count || 0} Interactions</span>
                                                    </div>
                                                    {doc.last_message_at && (
                                                        <span className="text-[10px] text-emerald-500 font-mono">
                                                            Active {new Date(doc.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
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
                </div>
            </div>
        </div>
    );
}
