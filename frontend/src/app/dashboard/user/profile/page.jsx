// DatingApp/frontend/src/app/dashboard/user/profile/page.jsx
'use client';

import React from 'react';
// Import the components
import ProfileEditor from '@/components/ProfileEditor';
import PhotoGallery from '@/components/PhotoGallery';
import Image from 'next/image';

// NOTE: DUMMY_USER_PROFILE data has been removed to prepare for API integration.

export default function ProfilePage() {
    return (
        <div className="p-8 h-full bg-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile & Photos</h1>

            {/* MAIN CONTAINER: Standard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Column 1 (Photos) - Takes 4/12 (1/3) of the space */}
                <div className="lg:col-span-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Your Photos</h2>

                    {/* PhotoGallery Component - The 'profile' prop is removed as it 
                        will eventually be passed down from a parent component 
                        fetching the real data, or the editor itself will manage the state. */}
                    <PhotoGallery isEditing={true} />

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