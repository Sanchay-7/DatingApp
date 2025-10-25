// components/Sidebar.jsx (Completion % Removed)
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const currentPath = usePathname();

    const navLinks = [
        { name: "Discover", href: "/", icon: "👀" },
        { name: "Messages", href: "/messages", icon: "✉️" },
        { name: "Likes You", href: "/likes", icon: "👍" },
        { name: "My Profile", href: "/profile", icon: "👤" },
        { name: "Settings", href: "/settings", icon: "⚙️" },
    ];

    const activeClass = "flex items-center p-3 rounded-lg bg-pink-600 text-white font-semibold";
    const inactiveClass = "flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700";

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-lg z-10">

            {/* Logo */}
            <div className="text-2xl font-bold text-pink-500 mb-8">DatingApp</div>

            {/* Navigation Links */}
            <nav className="space-y-2 flex-grow">

                {navLinks.map((link) => {
                    const isActive = currentPath === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={isActive ? activeClass : inactiveClass}
                        >
                            <span className="mr-3">{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}

            </nav>

            {/* Mini-Profile at the bottom */}
            <div className="pt-4 border-t border-gray-700 mt-auto text-sm text-gray-300 flex items-center">
                <img src="https://via.placeholder.com/32" alt="User" className="w-8 h-8 rounded-full object-cover mr-3" />
                <div>
                    <p className="font-semibold text-white">Jane Doe</p>
                    <p className="text-xs text-green-400">Active</p>

                    {/* These lines were REMOVED:
                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-green-500 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs mt-1">75% Complete</p>
                    */}
                </div>
            </div>

        </aside>
    );
}