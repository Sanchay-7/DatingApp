// app/dashboard/user/likes/page.jsx (API-Ready)
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // We will use the Image component

// New, upgraded LikedUserCard component
// This component is perfect and needs no changes.
const LikedUserCard = ({ name, age, imageUrl, isNew }) => (
    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
        {/* Background Image */}
        <Image
            src={imageUrl}
            alt={name}
            fill={true}
            style={{ objectFit: 'cover' }}
            className="rounded-xl"
            // Add a simple error handler for broken images
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Missing'; }}
        />

        {/* Gradient Overlay for text */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

        {/* 'New' Badge */}
        {isNew && (
            <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                NEW
            </div>
        )}

        {/* Text Content */}
        <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{name}, {age}</h3>
            <p className="text-sm opacity-90">Liked you!</p>
        </div>
    </div>
);


export default function LikesYouPage() {
    // State to hold the list of users who liked you
    const [likedUsers, setLikedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Calculate new likes count dynamically
    const newLikesCount = likedUsers.filter(user => user.isNew).length;

    // --- API FETCH LOGIC (SAVED FOR LATER) ---
    /*
    // TODO: After this PR is merged, uncomment this block.
    
    useEffect(() => {
        const API_ENDPOINT = "http://localhost:5000/api/likes"; 
        
        async function fetchLikes() {
            setIsLoading(true); 
            try {
                const response = await fetch(API_ENDPOINT); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json(); 
                setLikedUsers(data.likes || data); 
            } catch (error) {
                console.error("Failed to fetch likes:", error);
                setLikedUsers([]); 
            } finally {
                setIsLoading(false);
            }
        }
        fetchLikes();
    }, []); // Empty array means "run once"
    */

    // --- TEMPORARY: Simulate loading complete (since fetch is commented) ---
    // We will set loading to false so we can see the "No new likes" message
    // instead of an infinite "Loading..." screen.
    useEffect(() => {
        setIsLoading(false);
    }, []);
    // --- END TEMPORARY ---


    return (
        <div className="p-8 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                Who Likes You <span className="text-pink-500 ml-3">💖</span>
                {/* This is now dynamic based on the API data */}
                {newLikesCount > 0 && (
                    <span className="ml-3 text-lg font-normal text-pink-500">({newLikesCount} New Likes)</span>
                )}
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <p className="text-md text-gray-600 mb-6">
                    These users have liked your profile. Click to view their profile and match instantly!
                </p>

                {/* --- DYNAMIC USER GRID --- */}
                {isLoading ? (
                    <p className="text-center text-gray-500">Loading new likes...</p>
                ) : likedUsers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {/* Map over data from the API */}
                        {likedUsers.map(user => (
                            <LikedUserCard
                                key={user.id}
                                name={user.name}
                                age={user.age}
                                imageUrl={user.imageUrl}
                                isNew={user.isNew}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">You have no new likes right now.</p>
                )}
                {/* --- END DYNAMIC GRID --- */}

            </div>
        </div>
    );
};