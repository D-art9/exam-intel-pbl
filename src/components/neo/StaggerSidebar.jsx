
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Brain, BarChart, Settings, Mail, Info, Cpu } from 'lucide-react';

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
    const links = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/upload', icon: Upload, label: 'Upload' },
        { path: '/analysis', icon: Brain, label: 'Brain' }, // Or whatever your analysis route is
        { path: '/how-it-works', icon: Cpu, label: 'How It Works' },
        { path: '/about', icon: Info, label: 'About' },
        { path: '/contact', icon: Mail, label: 'Contact' },
    ];

    return (
        <motion.nav
            className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-neo-black border-r border-neutral-800 z-50 flex flex-col py-8"
            initial="closed"
            animate="open"
            variants={sidebarVariants}
        >
            {/* Logo Area */}
            <motion.div variants={itemVariants} className="px-6 mb-12">
                <div className="h-10 w-10 bg-neo-orange rounded-none shadow-neo flex items-center justify-center">
                    <span className="font-bold text-neo-black text-xl">EI</span>
                </div>
                <h1 className="hidden md:block mt-4 text-2xl font-bold tracking-tighter text-white">
                    EXAM<span className="text-neo-orange">INTEL</span>
                </h1>
            </motion.div>

            {/* Menu Items */}
            <div className="flex-1 space-y-2 px-3">
                {links.map((link) => (
                    <motion.div key={link.path} variants={itemVariants}>
                        <NavLink
                            to={link.path}
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
