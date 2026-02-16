import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ScanSearch } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Navbar() {
    const navigate = useNavigate();
    return (
        <nav className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50 border-gray-100/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 transition-colors duration-300">
            <div className="flex h-16 items-center px-6 max-w-7xl mx-auto justify-between">
                <Link to="/" className="flex items-center gap-3 font-bold text-xl text-gray-900 dark:text-gray-100 group">
                    <img
                        src="/logo.png"
                        alt="ExamIntel Logo"
                        className="h-10 w-10 object-contain transition-all group-hover:scale-105"
                    />
                    <span className="tracking-tight font-display">MUJ ExamIntel</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-sm font-medium text-gray-800 dark:text-gray-300 hover:text-muj-orange dark:hover:text-muj-orange transition-colors">
                        Home
                    </Link>
                    <Link to="/about" className="text-sm font-medium text-gray-800 dark:text-gray-300 hover:text-muj-orange dark:hover:text-muj-orange transition-colors">
                        About Me
                    </Link>
                    <Link to="/contact" className="text-sm font-medium text-gray-800 dark:text-gray-300 hover:text-muj-orange dark:hover:text-muj-orange transition-colors">
                        Contact
                    </Link>
                    <Link to="/upload" className="text-sm font-medium text-gray-800 dark:text-gray-300 hover:text-muj-orange dark:hover:text-muj-orange transition-colors">
                        Analyze Papers
                    </Link>
                    <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                        <ThemeToggle />
                        <Button size="sm" variant="primary" onClick={() => navigate('/upload')}>
                            Faculty Portal
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
