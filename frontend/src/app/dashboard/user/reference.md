// DatingApp/frontend/src/app/dashboard/user/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
// Import your components
import PhotoGallery from '@/components/PhotoGallery';
import ProfileCard from '@/components/ProfileCard';

export default function DashboardPage() {

    // State to hold profiles, current index, and loading status
    const [allProfiles, setAllProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true); // Now needed for API calls

    // --- API FETCH LOGIC (UNCOMMENTED) ---

    useEffect(() => {
        const API_ENDPOINT = "http://localhost:5000/api/matches";

        async function fetchProfiles() {
            setIsLoading(true);
            try {
                const response = await fetch(API_ENDPOINT);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllProfiles(data.profiles || data);
                setCurrentIndex(0);
            } catch (error) {
                console.error("Failed to fetch profiles:", error);
                setAllProfiles([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfiles();
    }, []); // Empty array means "run once"

    // --- END API FETCH LOGIC ---


    // Function to handle the "swipe" action
    const handleSwipe = () => {
        if (allProfiles.length === 0) return;
        const nextIndex = (currentIndex + 1) % allProfiles.length;
        setCurrentIndex(nextIndex);
    };

    const currentProfile = allProfiles[currentIndex];

    // --- LOADING AND ERROR STATES ---

    // 1. Show Loading State
    if (isLoading) {
        return (
            <div className="flex h-screen w-full justify-center items-center text-xl text-gray-400">
                Loading profiles...
            </div>
        );
    }

    // 2. Show No Matches State
    // If we have no profiles after loading, show "No more matches"
    if (!currentProfile || allProfiles.length === 0) {
        return (
            <div className="flex h-screen w-full justify-center items-center text-xl text-gray-500">
                No more matches! Try checking back later.
            </div>
        );
    }

    // --- MAIN RENDER ---
    return (
        <div className="flex flex-1 overflow-hidden bg-gray-50">

            <div className="flex flex-1 overflow-hidden">

                <main className="w-2/3 p-10 flex flex-col items-center overflow-y-auto">

                    {/* Show the profile card */}
                    <ProfileCard profile={currentProfile} onSwipe={handleSwipe} />

                    <div className="flex-grow"></div>
                </main>

                {/* Show the photo gallery */}
                <PhotoGallery profile={currentProfile} />

            </div>
        </div>
    );
}