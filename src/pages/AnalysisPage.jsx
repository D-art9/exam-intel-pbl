import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function AnalysisPage() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        "Uploading documents...",
        "Scanning content...",
        "Extracting entities...",
        "Generating insights...",
        "Finalizing report..."
    ];

    useEffect(() => {
        const totalTime = 4000; // 4 seconds total
        const intervalTime = 50;
        const increment = 100 / (totalTime / intervalTime);

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Update text steps based on progress
        const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
        setStep(currentStepIndex);

        if (progress >= 100) {
            setTimeout(() => navigate('/subject-results'), 800);
        }
    }, [progress, navigate, steps.length]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Analyzing Your Data</h2>
                <p className="text-gray-500">Please wait while our AI processes your documents.</p>
            </div>

            <Card className="w-full shadow-2xl shadow-indigo-100 border-0 overflow-hidden">
                <CardContent className="p-12 space-y-10">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75 duration-1000"></div>
                            <div className="relative bg-white p-4 rounded-full shadow-sm border border-indigo-50">
                                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-r-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg font-medium text-gray-900 transition-all animate-pulse duration-1000">
                                {steps[step]}
                            </span>
                            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
