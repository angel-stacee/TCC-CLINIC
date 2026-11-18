import React, { useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { PageLoadingContent } from "./PageLoading";
import ErrorBoundary from "./ErrorBoundary";

interface MainLayoutProps {
    children?: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps): React.JSX.Element {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);

    useEffect(() => {
        setIsPageTransitioning(true);
        const timer = setTimeout(() => {
            setIsPageTransitioning(false);
        }, 120);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    useEffect(() => {
        const isDark = localStorage.getItem("tcc-theme") === "dark";
        document.documentElement.classList.toggle("tcc-dark", isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen bg-[#fcf8f8] dark:bg-[#15120f] transition-colors duration-200">
            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-[#70091f]/20 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden dark:bg-[#1a1412]/95 dark:border-[#382f25]">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[#70091f] transition duration-200 hover:scale-105 hover:bg-[#fcebe7] active:scale-95"
                    aria-label="Toggle menu"
                    aria-controls="primary-navigation"
                    aria-expanded={sidebarOpen}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="ml-3 flex items-center gap-2">
                    <img
                        src="/tcc-logo.jpg"
                        alt="TCC Logo"
                        className="h-9 w-9 rounded-full object-contain ring-1 ring-[#70091f]/30"
                    />

                    <div className="leading-tight">
                        <p className="text-sm font-bold text-[#70091f]">
                            TCC Clinic
                        </p>
                        <p className="text-[10px] text-stone-500">
                            Management System
                        </p>
                    </div>
                </div>
            </header>

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                    className="tcc-sidebar-overlay fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
                />
            )}

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Top Route Transition Loading Bar */}
            {isPageTransitioning && (
                <div className="fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden bg-stone-200/40 dark:bg-stone-800/40 pointer-events-none">
                    <div className="h-full w-full bg-gradient-to-r from-[#8a6f50] via-[#70091f] to-[#8a6f50] animate-pulse" />
                </div>
            )}

            <main className="min-h-screen w-full pt-16 lg:ml-[264px] lg:w-[calc(100%-264px)] lg:pt-0">
                <div className="w-full max-w-full">
                    <ErrorBoundary>
                        <Suspense fallback={<PageLoadingContent />}>
                            {children || <Outlet />}
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
}

export default MainLayout;
