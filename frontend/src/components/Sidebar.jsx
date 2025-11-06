'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const currentPath = usePathname();

    const navLinks = [
        { name: "Discover", href: "/dashboard/user", icon: "👀" },
        { name: "Messages", href: "/dashboard/user/messages", icon: "✉️" },
        { name: "Likes You", href: "/dashboard/user/likes", icon: "👍" },
        { name: "My Profile", href: "/dashboard/user/profile", icon: "👤" },
        { name: "Settings", href: "/dashboard/user/settings", icon: "⚙️" },
    ];

    const activeClass = "flex flex-row items-center p-2 lg:p-3 rounded-lg bg-pink-600 text-white font-semibold text-base whitespace-nowrap";
    const inactiveClass = "flex flex-row items-center p-2 lg:p-3 rounded-lg text-gray-300 hover:bg-gray-700 text-base whitespace-nowrap";

    return (
        <aside className="w-full h-full bg-gray-900 text-white flex flex-row lg:flex-col p-2 lg:p-4 shadow-lg z-10 items-center lg:items-stretch">

            {/* --- THIS IS THE FIX (BRANDING) --- */}
            {/* Replaced "DatingApp" with new "Valise Dating" logo and name */}
            <div className="flex items-center text-lg lg:text-2xl font-bold text-pink-500 lg:mb-8 flex-shrink-0">
                {/* Pink V Logo */}
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-pink-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-lg lg:text-xl font-bold text-white">V</span>
                </div>
                {/* Desktop Text */}
                <span className="hidden lg:inline">Valise Dating</span>
                {/* Mobile Text (Shorter) */}
                <span className="lg:hidden">Valise</span>
            </div>
            {/* --- END OF FIX --- */}

            <nav className="flex flex-row justify-around flex-grow w-full lg:flex-col lg:space-y-2 lg:justify-start">
                {navLinks.map((link) => {
                    const isActive = currentPath === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={isActive ? activeClass : inactiveClass}
                        >
                            <span className="mr-0 lg:mr-3">{link.icon}</span>
                            <span className="hidden lg:inline">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-gray-700 lg:mt-auto text-sm text-gray-300 flex items-center flex-shrink-0">
                <img src="https://via.placeholder.com/32" alt="User" className="w-8 h-8 rounded-full object-cover mr-0 lg:mr-3" />
                <div className="hidden lg:block">
                    <p className="font-semibold text-white">Jane Doe</p>
                    <p className="text-xs text-green-400">Active</p>
                </div>
            </div>
        </aside>
    );
}