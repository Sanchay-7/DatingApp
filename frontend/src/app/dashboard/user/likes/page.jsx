// app/likes/page.jsx (New Design)
'use client';

import React from 'react';
import Image from 'next/image'; // We will use the Image component

// New, upgraded LikedUserCard component
const LikedUserCard = ({ name, age, imageUrl, isNew }) => (
    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
        {/* Background Image */}
        <Image
            src={imageUrl}
            alt={name}
            fill={true}
            style={{ objectFit: 'cover' }}
            className="rounded-xl"
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
    return (
        <div className="p-8 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                Who Likes You <span className="text-pink-500 ml-3">💖</span>
                <span className="ml-3 text-lg font-normal text-pink-500">(5 New Likes)</span>
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <p className="text-md text-gray-600 mb-6">
                    These users have liked your profile. Click to view their profile and match instantly!
                </p>

                {/* User Grid: Will dynamically map data from the backend */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

                    {/* Example Cards (using new design) */}
                    <LikedUserCard
                        name="Priya"
                        age={27}
                        imageUrl="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=2788&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        isNew={true}
                    />
                    <LikedUserCard
                        name="Alex"
                        age={30}
                        imageUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=2874&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        isNew={true}
                    />
                    <LikedUserCard
                        name="Sam"
                        age={25}
                        imageUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        isNew={true}
                    />
                    <LikedUserCard
                        name="Jane"
                        age={29}
                        imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=2864&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        isNew={true}
                    />
                    <LikedUserCard
                        name="Mike"
                        age={32}
                        imageUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        isNew={true}
                    />
                    <LikedUserCard
                        name="Chris"
                        age={28}
                        imageUrl="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=2823&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        isNew={false}
                    />

                </div>

            </div>
        </div>
    );
};