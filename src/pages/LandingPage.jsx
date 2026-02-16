import { Button } from '../components/ui/Button';
import { NeoCard, NeoButton } from '../components/neo/NeoComponents';
import { FileText, ShieldCheck, BarChart3, GraduationCap, BookOpen, ArrowRight, Zap, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BlurText = ({ text, delay = 0, className = "" }) => {
    return (
        <motion.span
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block ${className}`}
        >
            {text}
        </motion.span>
    );
};

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-neo-orange/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 text-center z-10">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neo-orange/30 bg-neo-orange/10 backdrop-blur-md"
                    >
                        <GraduationCap className="w-4 h-4 text-neo-orange" />
                        <span className="text-sm font-bold tracking-wider uppercase text-neo-orange">Manipal University Jaipur</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.1]">
                        <BlurText text="YOUR EXAMS." delay={0.1} /> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neo-orange to-yellow-500">
                            <BlurText text="JUST SMART." delay={0.3} />
                        </span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium"
                    >
                        Upload your syllabus. Get a high-yield study plan. <br />
                        <span className="text-white">Skip the noise. Focus on what matters.</span>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-wrap justify-center gap-6 pt-8"
                    >
                        <NeoButton onClick={() => navigate('/upload')} className="text-lg px-8 py-4 flex items-center gap-2">
                            Start Analysis <ArrowRight className="w-5 h-5" />
                        </NeoButton>
                        <NeoButton variant="secondary" onClick={() => navigate('/flow')} className="text-lg px-8 py-4">
                            How it Works
                        </NeoButton>
                    </motion.div>
                </div>
            </section>

            {/* Magic Bento Grid */}
            <section className="py-20 px-4 max-w-7xl mx-auto w-full z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">

                    {/* Large Card */}
                    <NeoCard className="md:col-span-2 row-span-1 md:row-span-2 p-8 flex flex-col justify-between group overflow-hidden" glow>
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                            <BrainCircuit className="w-64 h-64 text-neo-orange rotate-12" />
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-neo-orange rounded-none flex items-center justify-center mb-4 shadow-neo">
                                <Zap className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">High-Yield Topics</h3>
                            <p className="text-neutral-400 text-lg">Our AI analyzes past papers to identify the topics that appear most frequently. Stop studying blindly.</p>
                        </div>
                        <div className="mt-8">
                            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-neo-orange w-3/4 animate-pulse" />
                            </div>
                            <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                                <span>ANALYSIS CONFIDENCE</span>
                                <span>98.5%</span>
                            </div>
                        </div>
                    </NeoCard>

                    {/* Small Card 1 */}
                    <NeoCard className="p-6 flex flex-col justify-center items-center text-center hover:bg-neo-surface/80">
                        <ShieldCheck className="w-12 h-12 text-neo-orange mb-4" />
                        <h3 className="text-xl font-bold text-white">Syllabus Aligned</h3>
                        <p className="text-sm text-neutral-500 mt-2">100% compliant with MUJ curriculum.</p>
                    </NeoCard>

                    {/* Small Card 2 */}
                    <NeoCard className="p-6 flex flex-col justify-center items-center text-center hover:bg-neo-surface/80">
                        <BarChart3 className="w-12 h-12 text-white mb-4" />
                        <h3 className="text-xl font-bold text-white">Pattern Recognition</h3>
                        <p className="text-sm text-neutral-500 mt-2">Detects repeated question formats.</p>
                    </NeoCard>

                    {/* Medium Card */}
                    <NeoCard className="md:col-span-1 p-8 flex flex-col justify-end bg-gradient-to-t from-neo-orange/10 to-transparent">
                        <h3 className="text-2xl font-bold text-white mb-2">Archive Access</h3>
                        <p className="text-neutral-400 text-sm mb-4">Browse complete B.Tech CSE curriculum.</p>
                        <NeoButton variant="secondary" className="w-full text-xs py-2" onClick={() => navigate('/syllabus-archive')}>
                            Browse Archive
                        </NeoButton>
                    </NeoCard>

                </div>
            </section>
        </div>
    );
}
