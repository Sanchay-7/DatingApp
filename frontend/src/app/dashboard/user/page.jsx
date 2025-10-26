// DatingApp/frontend/src/app/dashboard/user/page.jsx

"use client";

import { useState, useEffect, useMemo } from 'react';
// CORRECT IMPORTS using the team's path alias
import PhotoGallery from '@/components/PhotoGallery';
import ProfileCard from '@/components/ProfileCard';

// DUMMY DATA IS DEFINED AS A CONSTANT (Simulates API response)
const DUMMY_PROFILES = [
    { id: 1, name: "Rohan API", age: 31, distance: "8 miles away", job: "Developer", tags: ["Hiking", "Travel", "Cooking"], mainPhoto: "https://via.placeholder.com/600x480/cccccc/333333?text=Rohan+API+Main", extraPhotos: ["https://via.placeholder.com/300x300?text=Rohan-2", "https://via.placeholder.com/300x300?text=Rohan-3", "https://via.placeholder.com/300x300?text=Rohan-4", "https://via.placeholder.com/300x300?text=Rohan-5"] },
    { id: 2, name: "Priya API", age: 27, distance: "3 miles away", job: "Designer", tags: ["Reading", "Yoga"], mainPhoto: "https://via.placeholder.com/600x480/dddddd/333333?text=Priya+API+Main", extraPhotos: ["https://via.placeholder.com/300x300?text=Priya-2", "https://via.placeholder.com/300x300?text=Priya-3", "https://via.placeholder.com/300x300?text=Priya-4", "https://via.placeholder.com/300x300?text=Priya-5"] },
];

export default function UserDashboardPage() {

    const apiReadyProfiles = useMemo(() => DUMMY_PROFILES, []);

    const [allProfiles, setAllProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Simulate a small delay for data fetching
        setTimeout(() => {
            setAllProfiles(apiReadyProfiles);
            setCurrentIndex(0);
        }, 100);
    }, [apiReadyProfiles]);

    const handleSwipe = () => {
        if (allProfiles.length === 0) return;
        const nextIndex = (currentIndex + 1) % allProfiles.length;
        setCurrentIndex(nextIndex);
    };

    const currentProfile = allProfiles[currentIndex];

    if (!currentProfile) {
        return (
            <div className="flex h-screen w-full justify-center items-center text-xl text-gray-500">
                {allProfiles.length === 0 ? "Loading profiles..." : "No more matches! Come back later."}
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-hidden bg-gray-50">

            {/* MAIN CONTENT BLOCK: Contains Center Profile Card and Right Gallery */}
            <div className="flex flex-1 overflow-hidden">

                <main className="w-2/3 p-10 flex flex-col items-center overflow-y-auto">

                    {/* CENTER COLUMN: Profile Card Component (Passed data and action) */}
                    <ProfileCard profile={currentProfile} onSwipe={handleSwipe} />

                    <div className="flex-grow"></div>
                </main>

                {/* RIGHT COLUMN: Photo Gallery Component (Passed data) */}
                <PhotoGallery profile={currentProfile} />

            </div>
        </div>
    );
}