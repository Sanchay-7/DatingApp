// DatingApp/frontend/src/components/AdminCard.jsx
import React from 'react';

/**
 * A reusable container for all Admin Dashboard sections (tables, charts, metrics).
 * It enforces the consistent dark background and rounded style.
 * * @param {string} title - The title of the card (e.g., "User Growth" or "Key Metrics")
 * @param {React.ReactNode} children - The content (chart, table, or metrics) to be displayed inside the card.
 */
export default function AdminCard({ title, children }) {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 h-full">
            {/* Title with consistent Admin styling */}
            {title && (
                <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">
                    {title}
                </h2>
            )}

            {/* The main content (chart, table, etc.) goes here */}
            <div className="mt-2">
                {children}
            </div>
        </div>
    );
}