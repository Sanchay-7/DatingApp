// components/PhotoGallery.jsx

import React from 'react';

export default function PhotoGallery({ profile }) {

    if (!profile) return null;

    // Renders the 2x2 photo grid
    const renderGallery = () => (
        <div className="grid grid-cols-2 gap-4">
            {profile.extraPhotos.map((src, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                        src={src}
                        alt={`${profile.name} photo ${index + 2}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );

    return (
        <aside className="w-1/3 p-8 border-l border-gray-200 bg-white overflow-y-auto">

            <h2 className="text-xl font-semibold text-gray-800 mb-4">{profile.name}'s Photos</h2>

            {renderGallery()}

            <div className="mt-8 text-center">
                <button className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-200 transition">
                    View Full Profile
                </button>
            </div>

        </aside>
    );
}