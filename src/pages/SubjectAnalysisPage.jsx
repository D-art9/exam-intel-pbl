import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NeoButton, NeoCard } from '../components/neo/NeoComponents';
import { ArrowLeft, Send, Bot, User, FileText, Sparkles, Terminal, Cpu } from 'lucide-react';
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
    const [isFullScreen, setIsFullScreen] = useState(false);
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
            const response = await axios.get(`http://127.0.0.1:8000/api/documents/${documentId}/history/`);
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

        // Trigger full screen on first message if not already
        if (!isFullScreen && !isEmbedded) setIsFullScreen(true);

        const userMessage = { role: 'user', text: input, isNew: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log("Calling API...");
            const response = await axios.post(`http://127.0.0.1:8000/api/documents/${documentId}/ask/`, {
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
        <div className={`flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-500 ${isEmbedded ? 'h-full p-0 gap-0' : ''}`}>
            {/* Sidebar Context - HIDE if embedded to save space for split view */}
            <AnimatePresence>
                {!isFullScreen && !isEmbedded && (
                    <motion.div
                        initial={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ width: 320, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="hidden lg:flex flex-col gap-6 shrink-0"
                    >
                        <NeoButton variant="secondary" onClick={() => navigate('/upload')} className="w-full justify-start pl-4 gap-3 border-neutral-800 text-neutral-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4" /> Return to Upload
                        </NeoButton>


                        <NeoCard className="p-6 flex-1 bg-neo-surface border-neutral-800 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-neo-orange/20">
                                <Cpu className="w-10 h-10 text-neo-orange" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Neural Link</h2>
                            {/* ... sidebar content ... */}
                            <div className="flex items-center gap-2 text-xs text-green-500 font-mono mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Active Connection
                            </div>

                            <div className="w-full text-left space-y-4">
                                <div className="p-3 bg-black/50 border border-neutral-800 rounded">
                                    <p className="text-xs text-neutral-500 uppercase">Document ID</p>
                                    <p className="text-xs text-white font-mono truncate">{documentId}</p>
                                </div>
                                <div className="p-3 bg-black/50 border border-neutral-800 rounded">
                                    <p className="text-xs text-neutral-500 uppercase">Model</p>
                                    <p className="text-sm text-neo-orange font-bold font-mono">Llama-3-70B</p>
                                </div>
                            </div>
                        </NeoCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Interface */}
            <div className={`flex-1 flex flex-col h-full bg-neo-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative ${isEmbedded ? 'rounded-none border-0' : ''}`}>

                {/* Header */}
                <div className="h-16 border-b border-neutral-800 flex items-center px-6 bg-neo-surface/80 backdrop-blur justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-neo-orange" />
                        <span className="font-bold text-white tracking-wide">COMMAND TERMINAL</span>
                    </div>
                    {!isEmbedded && (
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="text-xs font-mono text-neutral-500 hover:text-neo-orange transition-colors uppercase"
                            >
                                {isFullScreen ? '[ Restore View ]' : '[ Maximize ]'}
                            </button>
                            <div className="text-xs font-mono text-neutral-500">v2.4.0</div>
                        </div>
                    )}
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

                            <div className={`max-w-[80%] rounded-lg p-4 font-mono text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-neo-orange/10 border border-neo-orange/30 text-neo-orange'
                                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300'}
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
                                placeholder="Enter command or query..."
                                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-4 pr-12 text-sm text-white font-mono focus:outline-none focus:border-neo-orange focus:ring-1 focus:ring-neo-orange transition-all placeholder:text-neutral-600"
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
