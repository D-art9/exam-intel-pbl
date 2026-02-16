
import { cn } from '../../lib/utils'; // Assuming you have a utility for merging classes

export function NeoCard({ children, className, glow = false }) {
    return (
        <div className={cn(
            "relative bg-neo-surface border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300",
            "group hover:-translate-y-1 hover:shadow-neo", // Hover effect
            glow && "shadow-[0_0_20px_rgba(255,85,0,0.15)]",
            className
        )}>
            {/* Glass layer */}
            <div className="absolute inset-0 bg-glass-white backdrop-blur-[2px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-neo-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    );
}

export function NeoButton({ children, variant = 'primary', className, ...props }) {
    const baseStyle = "px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo disabled:hover:bg-neo-orange disabled:hover:text-neo-black";

    const variants = {
        primary: "bg-neo-orange border-neo-orange text-neo-black hover:bg-transparent hover:text-neo-orange shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
        secondary: "bg-transparent border-neutral-700 text-neutral-400 hover:border-neo-orange hover:text-neo-orange",
        glass: "bg-glass-white border-glass-border text-white backdrop-blur-md hover:bg-glass-dim"
    };

    return (
        <button
            className={cn(baseStyle, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
