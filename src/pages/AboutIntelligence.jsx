import { motion } from 'framer-motion';
import { 
    Cpu, Target, Sparkles, Youtube, Zap, 
    ShieldCheck, Database, Layout, BookOpen, 
    ChevronRight, Brain, Workflow, Gauge
} from 'lucide-react';
import { NeoCard } from '../components/neo/NeoComponents';

const features = [
    {
        category: "Core Intelligent Ingestion",
        icon: Brain,
        items: [
            { 
                title: "Dual-Mission Support", 
                desc: "Switch between Handout Mode (notes analysis) and Smart Paper Mode (exam correlation)." 
            },
            { 
                title: "Neural Extraction Engine", 
                desc: "Uses Llama-3-70B to parse messy PDFs into structured JSON question banks." 
            },
            { 
                title: "PyMuPDF4LLM Pipeline", 
                desc: "High-fidelity Markdown conversion preserving syllabus structures." 
            },
            { 
                title: "Recursive Fragmentation", 
                desc: "1000-char 'knowledge nodes' with context overlap for perfect RAG retrieval." 
            }
        ]
    },
    {
        category: "Coverage & Analytics",
        icon: Target,
        items: [
            { 
                title: "Intelligence Matrix", 
                desc: "Full-screen dashboard mapping syllabus topics to historical exam questions." 
            },
            { 
                title: "Blind Spot Detection", 
                desc: "Automatically flags topics never asked in past exams for surprise prevention." 
            },
            { 
                title: "High-Frequency Tagging", 
                desc: "Identifies 'Red Zone' topics appearing in 3+ distinct exam years." 
            },
            { 
                title: "Difficulty Heatmap", 
                desc: "Color-coded complexity (Basic to Complex) based on historical mark weight." 
            }
        ]
    },
    {
        category: "Smart Generation",
        icon: Sparkles,
        items: [
            { 
                title: "Automated Synthesis", 
                desc: "Generates custom mock papers echoing your university's specific style." 
            },
            { 
                title: "LPU-Inference", 
                desc: "Executed on Groq LPUs for near-instant, context-aware AI responses." 
            }
        ]
    },
    {
        category: "Learning Resources",
        icon: Youtube,
        items: [
            { 
                title: "Curated YouTube Integration", 
                desc: "Instant search links for every syllabus topic directly from the matrix." 
            },
            { 
                title: "RAG-Powered Chat", 
                desc: "Interactive interface to 'talk' to your lecture notes with zero hallucination." 
            }
        ]
    }
];

export default function AboutIntelligence() {
    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neo-orange/10 border border-neo-orange/20">
                        <Workflow className="w-6 h-6 text-neo-orange" />
                    </div>
                    <span className="text-neo-orange font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">
                        System_Manifest // v4.0.1
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Mission <span className="text-neo-orange">Intelligence</span>
                </h1>
                <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest max-w-2xl">
                    A comprehensive overview of the technologies and features powering the Exam Intel Neural Pipeline.
                </p>
            </header>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {features.map((group, gIdx) => (
                    <motion.div
                        key={group.category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gIdx * 0.1 }}
                    >
                        <NeoCard className="h-full border-neutral-800 bg-neo-surface group hover:border-neo-orange/50 transition-all">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <group.icon className="w-8 h-8 text-neo-orange" />
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                        {group.category}
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {group.items.map((item, iIdx) => (
                                        <div key={item.title} className="group/item flex gap-4">
                                            <div className="mt-1.5 w-1.5 h-1.5 bg-neo-orange rounded-full opacity-40 group-hover/item:scale-150 group-hover/item:opacity-100 transition-all" />
                                            <div>
                                                <h4 className="text-sm font-bold text-neutral-200 uppercase tracking-wide group-hover/item:text-neo-orange transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </NeoCard>
                    </motion.div>
                ))}
            </div>

            {/* Tech Stack Footer */}
            <NeoCard className="bg-black border-neutral-900 border-dashed p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-neutral-600 font-mono text-[10px] uppercase">
                            <Database className="w-3 h-3" /> Dedicated Infrastructure
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Neural Tech Stack</h3>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col items-center gap-2">
                            <Layout className="w-6 h-6" />
                            <span className="text-[9px] font-mono">REACT/VITE</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Zap className="w-6 h-6" />
                            <span className="text-[9px] font-mono">GROQ/LPU</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <ShieldCheck className="w-6 h-6" />
                            <span className="text-[9px] font-mono">SUPABASE</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Gauge className="w-6 h-6" />
                            <span className="text-[9px] font-mono">PGVECTOR</span>
                        </div>
                    </div>
                </div>
            </NeoCard>
        </div>
    );
}
