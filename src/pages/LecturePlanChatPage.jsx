import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { ArrowLeft, Send, Bot, User, FileText, Sparkles, Terminal, Cpu, Menu, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from '../components/TextType'; // Import TextType
import { useQuery } from '@tanstack/react-query'; // Import useQuery

export function LecturePlanChatPage({ isEmbedded = false, documentId: propDocId }) {
    const navigate = useNavigate();
    const { documentId: paramDocId } = useParams();
    const documentId = propDocId || paramDocId;
    
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "SYSTEM ONLINE. \nInitializing Lecture Plan Extraction Protocol...", isNew: false }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasExtracted, setHasExtracted] = useState(false);
    const [tableModalData, setTableModalData] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Automatically trigger extraction on mount
    useEffect(() => {
        if (!documentId || hasExtracted) return;
        
        const extractPlan = async () => {
            setHasExtracted(true);
            
            const promptText = `You are a curriculum analyzer. Extract the lecture plan/syllabus from the provided text.
Return ONLY a raw JSON list of objects with these keys:
- "lecture_number" (string, e.g. "1" or "1-2")
- "topic" (string, concise title)
- "description" (string, brief summary if available, else empty)
- "co_mapped" (string, course outcome if available, else empty)

If no syllabus is found, return an empty list [].
Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.`;

            // 1. Start loading (silently)
            setIsLoading(true);

            try {
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
                // Trigger the actual backend generation
                const response = await axios.post(`${API_URL}/api/documents/${documentId}/generate_plan/`);
                
                // Add the response as a table
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    text: 'Extraction complete. Rendering structured table...',
                    tableData: response.data,
                    isNew: true 
                }]);
            } catch (error) {
                console.error("API Error:", error);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "CRITICAL FAILURE. Could not extract lecture plan.",
                    isNew: true
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        // Delay slightly for effect
        setTimeout(extractPlan, 1500);
        
    }, [documentId, hasExtracted]);

    // Disable sending in this automated view
    const handleSendMessage = (e) => { e.preventDefault(); };


    return (
        <div className={`flex h-[calc(100vh-6rem)] w-full relative animate-in fade-in duration-500 overflow-hidden ${isEmbedded ? 'h-full p-0' : ''}`}>
            
            {/* Pop-out Sidebar Drawer */}
            <AnimatePresence>
                {isSidebarOpen && !isEmbedded && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute left-0 top-0 h-full w-80 bg-neo-surface border-r border-neutral-800 z-50 flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-white font-bold tracking-widest text-sm uppercase text-neutral-400">Options</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <NeoButton variant="secondary" onClick={() => navigate('/upload')} className="w-full justify-start pl-4 gap-3 border-neutral-800 text-white hover:border-neo-orange mb-3">
                                <ArrowLeft className="w-5 h-5" /> Return to Upload
                            </NeoButton>
                            
                            <NeoButton variant="secondary" onClick={() => navigate(`/subject-results/${documentId}`)} className="w-full justify-start pl-4 gap-3 border-neutral-800 text-white hover:border-neo-orange mb-6 bg-neo-orange/10 border-neo-orange/30">
                                <Terminal className="w-5 h-5 text-neo-orange" /> Return to Subject Chat
                            </NeoButton>

                            <div className="mt-auto pt-6 border-t border-neutral-800">
                                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">Current Document ID</p>
                                <p className="text-xs text-neutral-300 break-all bg-black/50 p-3 rounded border border-neutral-800 font-mono">{documentId}</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Expand Table Feature Modal */}
            <AnimatePresence>
                {tableModalData && !isEmbedded && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-neo-black border border-neutral-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neo-surface">
                                <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
                                    <FileText className="text-neo-orange w-6 h-6" /> FULL LECTURE PLAN
                                </h3>
                                <button onClick={() => setTableModalData(null)} className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto w-full">
                                <table className="w-full text-left text-sm text-neutral-300">
                                    <thead className="text-sm uppercase bg-black/80 text-neutral-400 border-b border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Lec</th>
                                            <th className="px-6 py-4 font-bold w-1/4">Topic</th>
                                            <th className="px-6 py-4 font-bold">Description</th>
                                            <th className="px-6 py-4 font-bold">CO Mapped</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableModalData.map((row, i) => (
                                            <tr key={i} className="border-b border-neutral-800/80 hover:bg-white/5 align-top">
                                                <td className="px-6 py-5 font-mono text-neo-orange font-bold whitespace-nowrap">{row.lecture_number}</td>
                                                <td className="px-6 py-5 font-medium text-white text-base">{row.topic}</td>
                                                <td className="px-6 py-5 text-neutral-400 text-sm leading-relaxed">{row.description || '-'}</td>
                                                <td className="px-6 py-5 font-mono text-neutral-300">
                                                    {row.co_mapped ? (
                                                        <span className="bg-neutral-900 border border-neutral-700 px-2 py-1 rounded inline-block">
                                                            {row.co_mapped}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Interface (Always Full Screen) */}
            <div className={`flex-1 flex flex-col h-full bg-neo-black border-0 md:border md:border-neutral-800 md:rounded-xl overflow-hidden shadow-2xl relative w-full ${isEmbedded ? 'rounded-none border-0' : ''}`}>

                {/* Header */}
                <div className="h-16 border-b border-neutral-800 flex items-center px-4 md:px-6 bg-neo-surface/80 backdrop-blur justify-between z-10 w-full">
                    <div className="flex items-center gap-4">
                        {!isEmbedded && (
                            <button onClick={() => setIsSidebarOpen(true)} className="text-neutral-400 hover:text-neo-orange transition-colors p-1 group">
                                <Menu className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(255,85,0,0.8)]" />
                            </button>
                        )}
                        <Terminal className="w-5 h-5 text-neo-orange" />
                        <span className="font-bold text-white tracking-wide text-lg font-sans">LECTURE PLAN EXTRACTION</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neo-orange/10 border border-neo-orange/20 rounded-full shadow-inner">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs md:text-sm font-bold text-emerald-400 tracking-wide font-sans">LLaMA-3-70B</span>
                        </div>
                    </div>
                </div>


                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-5 h-5 text-neo-orange" />
                                </div>
                            )}

                            <div className={`max-w-[85%] rounded-xl p-5 font-sans text-base leading-relaxed tracking-wide shadow-sm
                                ${msg.role === 'user'
                                    ? 'bg-neo-orange/10 border border-neo-orange/20 text-white'
                                    : 'bg-neutral-900 border border-neutral-800 text-neutral-100'}
                            `}>
                                {msg.role === 'assistant' && !msg.tableData ? (
                                    <TextType
                                        text={msg.text}
                                        animate={msg.isNew}
                                        typingSpeed={50}
                                        cursorCharacter="_"
                                    />
                                ) : msg.role === 'assistant' && msg.tableData ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-emerald-400 font-mono text-sm">{msg.text}</p>
                                            <NeoButton 
                                                variant="secondary" 
                                                className="text-xs py-1.5 px-3 border border-neo-orange/30 text-neo-orange hover:bg-neo-orange hover:text-black gap-2 transition-colors"
                                                onClick={() => setTableModalData(msg.tableData)}
                                            >
                                                Expand Table View
                                            </NeoButton>
                                        </div>
                                        <div className="overflow-x-auto bg-black/50 border border-neutral-800 rounded-lg max-h-96">
                                            <table className="w-full text-left text-sm text-neutral-300">
                                                <thead className="text-xs uppercase bg-black/80 text-neutral-400 border-b border-neutral-800">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold">Lec</th>
                                                        <th className="px-4 py-3 font-bold w-1/3">Topic</th>
                                                        <th className="px-4 py-3 font-bold hidden md:table-cell">Description</th>
                                                        <th className="px-4 py-3 font-bold">CO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {msg.tableData.map((row, i) => (
                                                        <motion.tr 
                                                            key={i}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="border-b border-neutral-800/50 hover:bg-white/5"
                                                        >
                                                            <td className="px-4 py-3 font-mono text-neo-orange whitespace-nowrap">{row.lecture_number}</td>
                                                            <td className="px-4 py-3 font-medium text-white">{row.topic}</td>
                                                            <td className="px-4 py-3 hidden md:table-cell text-xs">{row.description}</td>
                                                            <td className="px-4 py-3 font-mono">{row.co_mapped || '-'}</td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-5 h-5 text-neutral-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Matrix Loader */}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-5 h-5 text-neo-orange animate-pulse" />
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-neo-orange rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-neo-surface border-t border-neutral-800">
                    <form onSubmit={handleSendMessage} className="flex gap-4 relative">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="..."
                                className="w-full bg-black border border-neutral-700 rounded-xl px-5 py-4 pr-12 text-base text-white font-sans focus:outline-none focus:border-neo-orange focus:ring-1 focus:ring-neo-orange transition-all placeholder:text-neutral-500 shadow-inner"
                                value={''}
                                disabled={true}
                                readOnly
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></span>
                            </div>
                        </div>
                        <NeoButton
                            type="submit"
                            disabled={isLoading} // REMOVED !input.trim() condition to allow clicks
                            className="px-6 border-neutral-700 hover:border-neo-orange"
                        >
                            <Send className="w-5 h-5" />
                        </NeoButton>
                    </form>
                </div>


            </div>
        </div>
    );
}
