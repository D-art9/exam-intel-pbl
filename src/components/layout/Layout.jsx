import { StaggerSidebar } from '../neo/StaggerSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { WorkflowModal } from '../modals/WorkflowModal';

export function Layout() {
    const location = useLocation();

    // Determine if we should go full-screen for the generator mission
    const isGenerator = location.pathname.startsWith('/paper-generator');

    return (
        <div className="flex min-h-screen bg-neo-black text-white font-sans overflow-hidden">
            <WorkflowModal />
            {/* Sidebar (Fixed Navigation) - Hidden in focused generator mode */}
            {!isGenerator && <StaggerSidebar />}

            {/* Main Content Area - Expands to full screen if in generator */}
            <main className={`flex-1 relative z-0 h-screen overflow-y-auto scrollbar-hide transition-all duration-500 ${!isGenerator ? 'ml-20 md:ml-64' : 'ml-0'}`}>
                <div key={location.pathname} className={`animate-blur-in ${isGenerator ? 'w-full h-full' : 'p-6 md:p-12 max-w-7xl mx-auto'}`}>
                    <Outlet />
                </div>
            </main>

            {/* Optional: Add a subtle overlay texture or noise here */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-50"></div>
        </div>
    );
}
