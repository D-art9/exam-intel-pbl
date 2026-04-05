import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Upload, Brain, BarChart, Settings, Mail, Info, Cpu, FileText, Target, ShieldCheck } from 'lucide-react';

const sidebarVariants = {
    open: {
        x: 0,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    closed: { x: '-100%' }
};

const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
};

export function StaggerSidebar() {
    const location = useLocation();
    const mode = location.state?.mode || 'handout';
    const documentId = location.state?.documentId;

    const links = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/upload', icon: Upload, label: 'Upload', state: location.state },
        { path: '/analysis', icon: Brain, label: 'Brain', state: location.state },
        { path: '/how-it-works', icon: Cpu, label: 'How It Works' },
        { path: '/about', icon: Info, label: 'About' },
    ];

    return (
        <motion.nav
            className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-neo-black border-r border-neutral-800 z-50 flex flex-col py-8"
            initial="closed"
            animate="open"
            variants={sidebarVariants}
        >
            {/* Logo Area */}
            <motion.div variants={itemVariants} className="px-6 mb-10 flex justify-center md:justify-start">
                <NavLink to="/">
                    <img 
                        src="/logo.png" 
                        alt="ExamIntel Logo" 
                        className="h-16 md:h-20 lg:h-24 w-auto object-contain hover:scale-105 transition-transform" 
                    />
                </NavLink>
            </motion.div>

            {/* Mode Indicator Badge */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={mode}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-6 mb-6"
                >
                    <div className={`
                        flex items-center gap-2 px-3 py-2 border rounded-none text-[10px] uppercase font-black tracking-widest
                        ${mode === 'smart-paper' 
                            ? 'border-neo-orange/30 bg-neo-orange/5 text-neo-orange shadow-[0_0_10px_rgba(255,85,0,0.1)]' 
                            : 'border-neutral-800 bg-neutral-900/50 text-neutral-500'}
                    `}>
                        <div className={`w-1.5 h-1.5 rounded-full ${mode === 'smart-paper' ? 'bg-neo-orange animate-pulse' : 'bg-neutral-700'}`} />
                        {mode === 'smart-paper' ? 'Smart Paper Mode' : 'Handout Mode'}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Menu Items */}
            <div className="flex-1 space-y-2 px-3">
                {/* Regular Links */}
                {links.map((link) => (
                    <motion.div key={link.path} variants={itemVariants}>
                        <NavLink
                            to={link.path}
                            state={link.state}
                            className={({ isActive }) => `
                                group flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-300 border-l-2
                                ${isActive
                                    ? 'border-neo-orange bg-neo-surface text-neo-orange'
                                    : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <link.icon className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(255,85,0,0.8)] transition-all" />
                            <span className="hidden md:block font-medium tracking-wide uppercase text-xs">{link.label}</span>
                        </NavLink>
                    </motion.div>
                ))}

                {/* Conditional Smart Paper Link */}
                <AnimatePresence>
                    {mode === 'smart-paper' && documentId && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            variants={itemVariants}
                        >
                            <NavLink
                                to={`/paper-generator/${documentId}`}
                                state={{ mode, documentId }}
                                className={({ isActive }) => `
                                    group flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-300 border-l-2
                                    ${isActive
                                        ? 'border-neo-orange bg-neo-surface text-neo-orange'
                                        : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <FileText className="w-5 h-5 group-hover:drop-shadow-[0_0_10px_#FF5500] text-neo-orange" />
                                <span className="hidden md:block font-bold tracking-widest uppercase text-xs">Paper Generator</span>
                            </NavLink>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / User */}
            <motion.div variants={itemVariants} className="px-6 mt-auto">
                <div className="p-4 border border-neutral-800 bg-neo-surface/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-neutral-700 mb-2" />
                    <p className="hidden md:block text-xs text-neutral-500">Logged in as</p>
                    <p className="hidden md:block text-sm font-bold text-white">Student</p>
                </div>
            </motion.div>
        </motion.nav>
    );
}
