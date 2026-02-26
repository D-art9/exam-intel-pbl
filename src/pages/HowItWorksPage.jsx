import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { ArrowRight, Box, Cpu, Database, FileText, Layers, Search, Server, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const WorkflowStep = ({ icon: Icon, title, description, step, color = "text-neo-primary" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 relative"
        >
            {/* Connector Line */}
            <div className="absolute left-6 top-16 bottom-[-2rem] w-0.5 bg-neutral-800 last:hidden" />

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}>
                    <Icon size={24} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-neo-black border border-neutral-700 rounded-full flex items-center justify-center text-xs font-mono text-neutral-400">
                    {step}
                </div>
            </div>

            <div className="pb-12 flex-1">
                <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm md:text-base">{description}</p>
            </div>
        </motion.div>
    );
};

const TechItem = ({ name, description, color = "bg-neutral-800" }) => (
    <NeoCard className="p-4" hover>
        <div className={`w-2 h-2 rounded-full mb-3 ${color}`} />
        <h4 className="font-bold mb-1">{name}</h4>
        <p className="text-xs text-neutral-500">{description}</p>
    </NeoCard>
);

export function HowItWorksPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-neo-black text-white selection:bg-neo-primary selection:text-black pt-24 pb-20">

            {/* Hero Section */}
            <section className="px-4 mb-20">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neo-primary mb-6"
                    >
                        SYSTEM ARCHITECTURE & WORKFLOW
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tight">
                        Under the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neo-primary to-neo-accent">Hood</span>
                    </h1>

                    <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        A detailed technical breakdown of how Exam Intel ingests, processes, and understands your academic curriculum using RAG (Retrieval-Augmented Generation).
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: The Pipeline (Sticky) */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="sticky top-32">
                        <NeoCard className="p-8 border-l-4 border-l-neo-primary" glow>
                            <h2 className="text-2xl font-bold mb-8 font-display flex items-center gap-3">
                                <Database className="text-neo-primary" />
                                Ingestion Pipeline
                            </h2>

                            <div className="space-y-2">
                                <WorkflowStep
                                    step="01"
                                    icon={FileText}
                                    title="PDF Standardization"
                                    description="Raw PDF binary is processed using PyMuPDF4LLM. Complex layouts, tables, and headers are standardized into GitHub-Flavored Markdown to preserve semantic structure."
                                    color="text-blue-400"
                                />
                                <WorkflowStep
                                    step="02"
                                    icon={Layers}
                                    title="Recursive Chunking"
                                    description="The Markdown text is split into semantic overlapping chunks of 1000 characters (with 200 char overlap). This ensures no context is lost between segments."
                                    color="text-purple-400"
                                />
                                <WorkflowStep
                                    step="03"
                                    icon={Box}
                                    title="Vector Embedding"
                                    description="Each text chunk is passed through the 'all-MiniLM-L6-v2' model, converting it into a 384-dimensional vector representation of its meaning."
                                    color="text-green-400"
                                />
                                <WorkflowStep
                                    step="04"
                                    icon={Server}
                                    title="Vector Storage"
                                    description="Embeddings and metadata are stored in PostgreSQL equipped with the pgvector extension for high-performance similarity search."
                                    color="text-orange-400"
                                />
                            </div>
                        </NeoCard>
                    </div>
                </div>

                {/* Right Column: RAG & Tech Stack */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-16">

                    {/* RAG Workflow */}
                    <section>
                        <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
                            <Zap className="text-neo-accent" />
                            The RAG Workflow
                        </h2>

                        <div className="grid gap-6">
                            <NeoCard className="p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Search size={120} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-neo-accent">1. Semantic Retrieval</h3>
                                <p className="text-neutral-400">
                                    When you ask a question, we don't just keyword match. We convert your query into a vector and find the "nearest neighbors" in our database using **Cosine Similarity**. This enables the system to understand *concepts*, not just words.
                                </p>
                            </NeoCard>

                            <NeoCard className="p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Cpu size={120} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-neo-accent">2. Context Fusion</h3>
                                <p className="text-neutral-400">
                                    We construct a specialized prompt that includes:
                                    <br />• System Instructions ("You are a helpful academic assistant...")
                                    <br />• The User's Query
                                    <br />• The **Top 5 Retrieved Chunks** strictly as context.
                                </p>
                            </NeoCard>

                            <NeoCard className="p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Zap size={120} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-neo-accent">3. LPU Inference (Groq)</h3>
                                <p className="text-neutral-400">
                                    The fused prompt is sent to the **Groq LPU** running **Llama-3-70b**. The LPU (Language Processing Unit) architecture allows for blazing-fast token generation, delivering complex answers in &lt;2 seconds.
                                </p>
                            </NeoCard>
                        </div>
                    </section>

                    {/* Tech Stack Grid */}
                    <section>
                        <h2 className="text-3xl font-display font-bold mb-8">Technology Stack</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <TechItem name="React 18" description="Frontend UI Library" color="bg-cyan-400" />
                            <TechItem name="Vite" description="Build Tool" color="bg-yellow-400" />
                            <TechItem name="Tailwind" description="Utility CSS" color="bg-cyan-300" />
                            <TechItem name="Framer Motion" description="Animations" color="bg-purple-500" />

                            <TechItem name="Django" description="Backend Framework" color="bg-green-600" />
                            <TechItem name="DRF" description="REST API" color="bg-red-500" />
                            <TechItem name="PostgreSQL" description="Database" color="bg-blue-500" />
                            <TechItem name="pgvector" description="Vector Extension" color="bg-blue-300" />

                            <TechItem name="LangChain" description="LLM Framework" color="bg-orange-500" />
                            <TechItem name="Groq API" description="LPU Inference" color="bg-orange-600" />
                            <TechItem name="Llama-3" description="LLM Model" color="bg-blue-600" />
                            <TechItem name="HuggingFace" description="Embeddings" color="bg-yellow-500" />
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">
                        <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-3 text-white">
                            <Shield className="text-green-500" />
                            Enterprise-Grade Security
                        </h2>
                        <p className="text-neutral-400 mb-6">
                            We use industry-standard **JWT (JSON Web Token)** authentication via `SimpleJWT`. This ensures stateless, secure user sessions.
                            Your API keys and database credentials are fully isolated using environment variables (`python-dotenv`).
                        </p>
                        <div className="flex gap-4">
                            <Link to="/upload">
                                <NeoButton variant="primary" icon={ArrowRight}>
                                    Try the Pipeline
                                </NeoButton>
                            </Link>
                            <Link to="/">
                                <NeoButton variant="secondary">
                                    Back Home
                                </NeoButton>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
