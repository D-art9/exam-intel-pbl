import { StaggerSidebar } from '../neo/StaggerSidebar';
import { Outlet, useLocation } from 'react-router-dom';

export function Layout() {
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-neo-black text-white font-sans overflow-hidden">
            {/* Sidebar (Fixed Navigation) */}
            <StaggerSidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-20 md:ml-64 relative z-0 h-screen overflow-y-auto scrollbar-hide">
                <div key={location.pathname} className="animate-blur-in p-6 md:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Optional: Add a subtle overlay texture or noise here */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-50"></div>
        </div>
    );
}
