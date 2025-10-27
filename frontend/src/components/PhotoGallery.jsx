// DatingApp/frontend/src/components/PhotoGallery.jsx (CORRECTED FOR FLEXIBLE LAYOUT)

import React from 'react';

// Added isEditing prop to control button visibility and text
export default function PhotoGallery({ profile, isEditing }) {

    if (!profile) return null;

    // Renders the 2x2 photo grid
    const renderGallery = () => (
        <div className="grid grid-cols-2 gap-4">
            {profile.extraPhotos.map((src, index) => (
                <div
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group"
                >
                    <img
                        src={src}
                        alt={`${profile.name} photo ${index + 2}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Add Drag/Delete Overlays only if we are in Editing mode */}
                    {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button className="text-white text-sm bg-red-600 hover:bg-red-700 p-2 rounded-full font-bold">
                                🗑️
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        // FIX: Removed the rigid 'w-1/3 p-8 border-l border-gray-200 bg-white' classes
        <div className="space-y-6">

            {/* Main Profile Photo - Prominently displayed */}
            <div className="aspect-square w-full bg-gray-300 rounded-xl overflow-hidden shadow-lg relative group">
                <img
                    src={profile.mainPhoto}
                    alt={`${profile.name} main photo`}
                    className="w-full h-full object-cover"
                />
                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-700">
                            Upload New Main Photo
                        </button>
                    </div>
                )}
            </div>

            {/* Gallery Grid */}
            <h3 className="text-lg font-semibold text-gray-800 pt-2 border-t">Photo Gallery</h3>
            {renderGallery()}

            {/* Button only visible in editing mode */}
            {isEditing && (
                <div className="mt-8 text-center">
                    <button className="w-full bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition">
                        + Add Another Photo
                    </button>
                </div>
            )}

            {/* The 'View Full Profile' button is only needed on the Discover page, not here */}
            {/* You can re-add it here if it's required for the editing flow */}

        </div>
    );
}