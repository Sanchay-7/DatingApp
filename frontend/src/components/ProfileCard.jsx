// components/ProfileCard.jsx

import React from 'react';

// Receives the current profile data and the swipe function from page.tsx
export default function ProfileCard({ profile, onSwipe }) {

    if (!profile) return null;

    // Local function to render interest tags
    const renderTags = () => (
        <div className="flex space-x-2">
            {profile.tags.map((tag, index) => (
                <span
                    key={index}
                    className="bg-white/30 text-sm px-4 py-1 rounded-full backdrop-blur-sm"
                >
                    #{tag}
                </span>
            ))}
        </div>
    );

    return (
        // Wrapper for the header and card
        <>
            {/* Header/Search Bar */}
            <header className="w-full max-w-xl flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Discover Matches Near You</h1>
                <input
                    type="search"
                    placeholder="Search and Filter..."
                    className="p-2 border border-gray-400 rounded-lg w-40 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
            </header>

            {/* THE ACTUAL SINGLE PROFILE CARD */}
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="relative">

                    {/* DYNAMIC PHOTO SOURCE */}
                    <img
                        src={profile.mainPhoto}
                        alt={`Current Match: ${profile.name}`}
                        className="w-full h-[480px] object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

                        {/* DYNAMIC NAME AND AGE */}
                        <h2 className="text-4xl font-extrabold">{profile.name}, {profile.age}</h2>

                        {/* DYNAMIC DISTANCE AND JOB */}
                        <p className="text-lg font-light mb-4">{profile.distance} | {profile.job}</p>

                        {/* DYNAMIC INTEREST TAGS */}
                        {renderTags()}
                    </div>
                </div>

                {/* Action Buttons: Like and Skip (Calls onSwipe) */}
                <div className="flex justify-center space-x-8 p-6 bg-white">
                    <button
                        onClick={onSwipe}
                        className="bg-gray-200 text-gray-600 p-4 rounded-full shadow-lg hover:bg-gray-300 transition transform hover:scale-105"
                    >
                        <span className="text-3xl">❌ SKIP</span>
                    </button>
                    <button
                        onClick={onSwipe}
                        className="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition transform hover:scale-105"
                    >
                        <span className="text-3xl">❤️ LIKE</span>
                    </button>
                </div>
            </div>
        </>
    );
}