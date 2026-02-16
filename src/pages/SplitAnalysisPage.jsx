import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { SubjectAnalysisPage } from './SubjectAnalysisPage';
import { ArrowLeft, Cpu } from 'lucide-react';
import { NeoButton } from '../components/neo/NeoComponents';

export function SplitAnalysisPage() {
    const { documentId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden animate-in fade-in duration-500">
            {/* Global Split Header (Optional, if we want one common header or back button) */}
            <div className="shrink-0 h-14 border-b border-neutral-800 bg-neo-black flex items-center px-4 justify-between">
                <div className="flex items-center gap-4">
                    <NeoButton variant="ghost" onClick={() => navigate('/upload')} className="text-neutral-400 hover:text-white pl-0">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </NeoButton>
                    <div className="h-6 w-px bg-neutral-800"></div>
                    <div className="flex items-center gap-2 text-neo-orange">
                        <Cpu className="w-4 h-4" />
                        <span className="font-mono font-bold text-sm tracking-widest uppercase">
                            Analysis Console
                        </span>
                    </div>
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                    ID: {documentId?.split('-')[0]}
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Dashboard (40%) */}
                <div className="w-[40%] border-r border-neutral-800 bg-neo-surface relative">
                    {/* We pass isEmbedded=true to strip internal headers/nav */}
                    <DashboardPage isEmbedded={true} documentId={documentId} />
                </div>

                {/* Right Panel: Chat (60%) */}
                <div className="w-[60%] bg-neo-black relative">
                    <SubjectAnalysisPage isEmbedded={true} documentId={documentId} />
                </div>
            </div>
        </div>
    );
}
