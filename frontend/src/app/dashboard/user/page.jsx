// DatingApp/frontend/src/app/dashboard/user/page.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
// Import your components
import PhotoGallery from '@/components/PhotoGallery';
import ProfileCard from '@/components/ProfileCard';

// --- DUMMY DATA FOR PR REVIEW ---
// We are putting this back so your team can see your UI.
const DUMMY_PROFILES = [
    { id: 1, name: "Rohan API", age: 31, distance: "8 miles away", job: "Developer", tags: ["Hiking", "Travel", "Cooking"], mainPhoto: "https://via.placeholder.com/600x480/cccccc/333333?text=Rohan+API+Main", extraPhotos: ["https://via.placeholder.com/300x300?text=Rohan-2", "https://via.placeholder.com/300x300?text=Rohan-3", "https://via.placeholder.com/300x300?text=Rohan-4", "https://via.placeholder.com/300x300?text=Rohan-5"] },
    { id: 2, name: "Priya API", age: 27, distance: "3 miles away", job: "Designer", tags: ["Reading", "Yoga"], mainPhoto: "https://via.placeholder.com/600x480/dddddd/333333?text=Priya+API+Main", extraPhotos: ["https://via.placeholder.com/300x300?text=Priya-2", "https://via.placeholder.com/300x300?text=Priya-3", "https://via.placeholder.com/300x300?text=Priya-4", "https://via.placeholder.com/300x300?text=Priya-5"] },
];
// --- END DUMMY DATA ---


export default function DashboardPage() {

    // State to hold profiles and current index
    const [allProfiles, setAllProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    // NOTE: We don't need isLoading for dummy data
    // const [isLoading, setIsLoading] = useState(true); 

    // Use useMemo to prevent re-creating the dummy data on every render
    const apiReadyProfiles = useMemo(() => DUMMY_PROFILES, []);

    // --- USE DUMMY DATA (FOR PR REVIEW) ---
    useEffect(() => {
        // This code uses the dummy data so your team can see the UI
        setAllProfiles(apiReadyProfiles);
        setCurrentIndex(0);
    }, [apiReadyProfiles]); // Dependency on the dummy data


    // --- API FETCH LOGIC (SAVED FOR LATER) ---
    /*
    // TODO: After this PR is merged, uncomment this block and delete the dummy data above.
    
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
    */
    // --- END API FETCH LOGIC ---


    // Function to handle the "swipe" action
    const handleSwipe = () => {
        if (allProfiles.length === 0) return;
        const nextIndex = (currentIndex + 1) % allProfiles.length;
        setCurrentIndex(nextIndex);
    };

    const currentProfile = allProfiles[currentIndex];

    // --- LOADING AND ERROR STATES ---

    // If we have no profiles (even dummy ones), show "No more matches"
    if (!currentProfile || allProfiles.length === 0) {
        return (
            <div className="flex h-screen w-full justify-center items-center text-xl text-gray-500">
                No more matches! Try checking back later.
            </div>
        );
    }

    // --- MAIN RENDER (Shows the dummy data) ---
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