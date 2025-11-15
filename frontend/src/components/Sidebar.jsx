"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authFetch, clearAuthToken } from "@/lib/apiClient";
import { Eye, MessageCircle, ThumbsUp, User as UserIcon, Settings as SettingsIcon, LogOut } from "lucide-react";

export default function Sidebar() {
    const currentPath = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadUser = async () => {
            try {
                const data = await authFetch("/api/user/me");
                if (isMounted) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to load user info:", error);
                if (error.status === 401) {
                    clearAuthToken();
                    router.push("/signin");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadUser();
        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleLogout = () => {
        clearAuthToken();
        router.push("/signin");
    };

    const navLinks = [
        { name: "Discover", href: "/dashboard/user", icon: Eye },
        { name: "Messages", href: "/dashboard/user/messages", icon: MessageCircle },
        { name: "Likes You", href: "/dashboard/user/likes", icon: ThumbsUp },
        { name: "My Profile", href: "/dashboard/user/profile", icon: UserIcon },
        { name: "Settings", href: "/dashboard/user/settings", icon: SettingsIcon },
    ];

    const activeClass = "flex flex-row items-center p-2 lg:p-3 rounded-lg bg-pink-600 text-white font-semibold text-base whitespace-nowrap";
    const inactiveClass = "flex flex-row items-center p-2 lg:p-3 rounded-lg text-gray-300 hover:bg-gray-700 text-base whitespace-nowrap";

    return (
        <>
            {/* Desktop / Tablet Sidebar */}
            <aside className="hidden lg:flex w-full h-full bg-gray-900 text-white flex-col p-4 shadow-lg z-10 items-stretch">
                <div className="flex items-center text-2xl font-bold text-pink-500 mb-8 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center mr-2 shrink-0">
                        <span className="text-xl font-bold text-white">V</span>
                    </div>
                    <span>Valise Dating</span>
                </div>

                <nav className="flex flex-col space-y-2 justify-start">
                    {navLinks.map((link) => {
                        const isActive = currentPath === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={isActive ? activeClass : inactiveClass}
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-4 border-t border-gray-700 mt-auto text-sm text-gray-300 flex items-center justify-between w-full gap-3">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center mr-3 text-sm font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() ||
                                user?.firstName?.charAt(0)?.toUpperCase() ||
                                "U"}
                        </div>
                        <div>
                            <p className="font-semibold text-white">
                                {isLoading
                                    ? "Loading..."
                                    : user?.name || user?.firstName || "Your Profile"}
                            </p>
                            <p className="text-xs text-green-400">Active</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md text-white z-40">
                <div className="rounded-2xl bg-gray-900/90 backdrop-blur border border-white/10 shadow-xl px-3 py-2 flex items-center justify-between">
                    {navLinks.map((link) => {
                        const isActive = currentPath === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition ${isActive ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`}
                                title={link.name}
                            >
                                <link.icon className="w-5 h-5" />
                                <span className="text-[10px] leading-tight mt-0.5">{link.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-xs font-semibold"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </nav>
        </>
    );
}