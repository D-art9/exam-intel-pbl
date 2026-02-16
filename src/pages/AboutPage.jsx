import { Card, CardContent } from '../components/ui/Card';
import { User, Github, Linkedin, Instagram } from 'lucide-react';

export function AboutPage() {
    return (
        <div className="container max-w-3xl mx-auto py-12 px-4">
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur border-muj-yellow/40 dark:border-muj-yellow/20 shadow-xl">
                <CardContent className="p-10 space-y-8 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-8 border-b border-gray-100 dark:border-gray-800 pb-8">
                        <img
                            src="/devang_profile.jpg"
                            alt="Devang Aswani"
                            className="w-32 h-32 shrink-0 rounded-full shadow-lg object-cover border-4 border-muj-orange"
                        />
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">About the Developer</h1>
                            <p className="text-muj-orange font-bold text-xl uppercase tracking-wide">Devang Aswani</p>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Computer Science Undergraduate</p>

                            <div className="flex gap-4 justify-center md:justify-start pt-2">
                                <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-muj-orange dark:hover:bg-muj-orange hover:text-white dark:hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-muj-orange dark:hover:bg-muj-orange hover:text-white dark:hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-muj-orange dark:hover:bg-muj-orange hover:text-white dark:hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Github className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            I am a Computer Science undergraduate with a strong interest in building practical, high-impact software systems that solve real problems faced by students in academic environments.
                        </p>
                        <p>
                            This project was created to address a common challenge in university exams: students often have access to syllabi and past papers, but lack clarity on what actually matters when time is limited. By combining document analysis, pattern recognition, and structured exam intelligence, this platform aims to help students focus on high-yield topics and prepare more efficiently.
                        </p>
                        <p>
                            My technical interests include full-stack development, backend systems, and applied machine learning, with a focus on creating tools that are reliable, intuitive, and genuinely useful rather than overly complex. I believe good software should reduce cognitive load, provide clear insights, and respect the user’s time—principles that guided the design of this application.
                        </p>
                        <p>
                            This platform is built as a modular system, with a clean frontend experience and an extensible backend architecture, allowing it to evolve as academic needs grow.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
