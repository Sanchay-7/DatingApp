// DatingApp/frontend/src/app/dashboard/user/profile/page.jsx
'use client';

import React from 'react';
// Import the components
import ProfileEditor from '@/components/ProfileEditor';
import PhotoGallery from '@/components/PhotoGallery';
import Image from 'next/image';

// Dummy Data to simulate the current user's profile for the PhotoGallery
// NOTE: This uses 'via.placeholder.com' which we whitelisted earlier!
const DUMMY_USER_PROFILE = {
    name: "Jane Doe",
    mainPhoto: "https://via.placeholder.com/600x480/cccccc/333333?text=Jane+Main+Photo",
    extraPhotos: [
        "https://via.placeholder.com/300x300?text=Jane-2",
        "https://via.placeholder.com/300x300?text=Jane-3",
        "https://via.placeholder.com/300x300?text=Jane-4",
        "https://via.placeholder.com/300x300?text=Jane-5"
    ]
};


export default function ProfilePage() {
    return (
        <div className="p-8 h-full bg-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile & Photos</h1>

            {/* MAIN CONTAINER: Standard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Column 1 (Photos) - Takes 4/12 (1/3) of the space */}
                <div className="lg:col-span-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Your Photos</h2>

                    {/* PhotoGallery Component */}
                    <PhotoGallery profile={DUMMY_USER_PROFILE} isEditing={true} />

                    {/* Tip Box */}
                    <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">Profile Tip:</p>
                        <p className="text-xs text-gray-500 mt-1">Photos are crucial! Ensure you have at least 3 great photos.</p>
                    </div>
                </div>

                {/* Column 2 (Forms) - Takes 8/12 (2/3) of the space */}
                <div className="lg:col-span-8">
                    {/* Profile Editor Forms */}
                    <ProfileEditor />
                </div>
            </div>
        </div>
    );
}