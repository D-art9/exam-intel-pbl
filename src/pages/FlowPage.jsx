import { ArrowRight, Upload, Scan, FileCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export function FlowPage() {
    const steps = [
        {
            icon: <Upload className="w-8 h-8 text-white" />,
            title: "1. Upload Documents",
            desc: "Submit your Course Handouts, Exam Papers, or Syllabus files via the portal.",
            color: "bg-blue-500"
        },
        {
            icon: <Scan className="w-8 h-8 text-white" />,
            title: "2. AI Analysis",
            desc: "The system scans for structure, mandatory sections (CLO/PLO), and formatting compliance.",
            color: "bg-muj-orange"
        },
        {
            icon: <FileCheck className="w-8 h-8 text-white" />,
            title: "3. Verification",
            desc: "Receive an instant report highlighting missing elements or deviations from MUJ standards.",
            color: "bg-green-500"
        }
    ];

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">How It Works</h1>
                <p className="text-gray-800 text-lg">The automated workflow for academic compliance.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">

                {steps.map((step, i) => (
                    <div key={i} className="relative z-10 w-full md:w-1/3 max-w-sm">
                        <Card className="bg-white/90 backdrop-blur border-white shadow-xl hover:-translate-y-2 transition-transform">
                            <CardHeader className="text-center pb-2">
                                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-4 ${step.color}`}>
                                    {step.icon}
                                </div>
                                <CardTitle className="text-xl">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-gray-600">{step.desc}</p>
                            </CardContent>
                        </Card>
                        {/* Connector Arrow */}
                        {i !== steps.length - 1 && (
                            <div className="hidden md:flex absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-0 text-muj-orange">
                                <ArrowRight className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </div>
    );
}
