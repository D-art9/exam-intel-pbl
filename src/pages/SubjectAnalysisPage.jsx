import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { ArrowLeft, Send, Bot, User, FileText, Sparkles, Terminal, Cpu, Menu, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from '../components/TextType'; // Import TextType
import { useQuery } from '@tanstack/react-query'; // Import useQuery

export function SubjectAnalysisPage({ isEmbedded = false, documentId: propDocId }) {
    const navigate = useNavigate();
    const { documentId: paramDocId } = useParams();
    const documentId = propDocId || paramDocId;
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "SYSTEM ONLINE. \nDocument loaded. Awaiting queries...", isNew: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll to bottom on messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch Chat History with React Query
    const { data: history } = useQuery({
        queryKey: ['chatHistory', documentId],
        queryFn: async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.get(`${API_URL}/api/documents/${documentId}/history/`);
            return response.data;
        },
        enabled: !!documentId,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Sync history to messages state on load
    useEffect(() => {
        if (history && history.length > 0) {
            const formattedHistory = history.map(msg => ({
                role: msg.role,
                text: msg.content,
                isNew: false // History is NOT new
            }));
            // Only update if we haven't already loaded history (or simpler check)
            setMessages(prev => {
                // Avoid duplicates if re-mounting
                if (prev.length > 1) return prev;
                return [prev[0], ...formattedHistory];
            });
        }
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        console.log("Send Triggered"); // Debug log

        if (!input.trim() || isLoading) {
            console.log("Input empty or loading");
            return;
        }

        // Removed old isFullScreen flag mechanic

        const userMessage = { role: 'user', text: input, isNew: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log("Calling API...");
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/api/documents/${documentId}/ask/`, {
                question: userMessage.text
            });

            const aiMessage = {
                role: 'assistant',
                text: response.data.answer || "DATA CORRUPTION. No valid response generated.",
                isNew: true // New response IS new
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "CONNECTION FAILURE. Backend unreachable.",
                isNew: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ...

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
                            
                            <NeoButton variant="secondary" onClick={() => navigate(`/lecture-plan/${documentId}`)} className="w-full justify-start pl-4 gap-3 border-neutral-800 text-white hover:border-neo-orange mb-6 bg-neo-orange/10 border-neo-orange/30">
                                <FileText className="w-5 h-5 text-neo-orange" /> Extract Lecture Plan
                            </NeoButton>

                            <div className="mt-auto pt-6 border-t border-neutral-800">
                                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">Current Document ID</p>
                                <p className="text-xs text-neutral-300 break-all bg-black/50 p-3 rounded border border-neutral-800 font-mono">{documentId}</p>
                            </div>
                        </motion.div>
                    </>
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
                        <span className="font-bold text-white tracking-wide text-lg font-sans">COMMAND TERMINAL</span>
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
                                {msg.role === 'assistant' ? (
                                    <TextType
                                        text={msg.text}
                                        animate={msg.isNew}
                                        typingSpeed={50}
                                        cursorCharacter="_"
                                    />
                                ) : (
                                    msg.text.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                                    ))
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
                                placeholder="Ask a question about the document..."
                                className="w-full bg-black border border-neutral-700 rounded-xl px-5 py-4 pr-12 text-base text-white font-sans focus:outline-none focus:border-neo-orange focus:ring-1 focus:ring-neo-orange transition-all placeholder:text-neutral-500 shadow-inner"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                autoFocus
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
