import { Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md mt-auto pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-3 font-bold text-xl text-gray-900 dark:text-gray-100 group md:justify-start justify-center">
                            <img
                                src="/logo.png"
                                alt="ExamIntel Logo"
                                className="h-10 w-10 object-contain"
                            />
                            <span className="tracking-tight font-display text-2xl">MUJ ExamIntel</span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-center md:text-left">
                            The intelligent exam preparation companion for Manipal University Jaipur students.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4 pt-2">
                            {/* Social Icons Placeholder - Links to be added later */}
                            <SocialIcon icon={<Instagram className="w-5 h-5" />} href="#" label="Instagram" />
                            <SocialIcon icon={<Linkedin className="w-5 h-5" />} href="#" label="LinkedIn" />
                            <SocialIcon icon={<Github className="w-5 h-5" />} href="#" label="GitHub" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link to="/upload" className="hover:text-muj-orange transition-colors">Analyze Papers</Link></li>
                            <li><Link to="/flow" className="hover:text-muj-orange transition-colors">How it Works</Link></li>
                            <li><Link to="/about" className="hover:text-muj-orange transition-colors">About Developer</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-muj-orange transition-colors">Exam Guidelines</a></li>
                            <li><Link to="/syllabus-archive" className="hover:text-muj-orange transition-colors">Syllabus Archive</Link></li>
                            <li><a href="#" className="hover:text-muj-orange transition-colors">Student Handbook</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-muj-orange transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-muj-orange transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-muj-orange transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        © 2026 ExamIntel Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">System Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon, href, label }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-muj-orange dark:hover:bg-muj-orange hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1"
        >
            {icon}
        </a>
    )
}
