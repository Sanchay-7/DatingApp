// app/profile/page.jsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Briefcase, Star, ChevronDown, CheckCircle, Heart } from 'lucide-react';

export default function MyProfilePage() {
    const [profile, setProfile] = useState({
        name: "Jane Doe",
        age: 29,
        job: "HR Manager",
        location: "3 miles away",
        status: "Active",
        isPremium: true,
        tags: ["Hiking", "Travel", "Cooking", "Photography", "Reading"],
        aboutMe: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        basics: {
            height: "5'7\"",
            education: "University of XYZ",
            zodiacSign: "Leo"
        },
        photos: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=2864&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=2874&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=2788&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            // FIX: Replaced the broken 404 image link with a new one
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ]
    });

    return (
        <div className="p-8 h-full bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden relative">

                <button className="absolute top-6 right-6 bg-white text-gray-800 py-2 px-4 rounded-full shadow-md text-sm font-semibold hover:bg-gray-100 transition-colors duration-200">
                    Edit Photos
                </button>

                <div className="flex flex-col lg:flex-row">
                    {/* Left Section: Photos */}
                    <div className="w-full lg:w-2/5 p-6 space-y-4 relative">
                        <div className="w-full h-80 rounded-2xl overflow-hidden relative shadow-md">
                            <Image
                                src={profile.photos[0]}
                                alt="Main Profile"
                                // FIX: Updated to new Next.js Image props
                                fill={true}
                                style={{ objectFit: 'cover' }}
                                className="rounded-2xl"
                            />
                            <div className="absolute bottom-4 left-4 bg-white p-2 rounded-full shadow-md text-pink-500">
                                <Heart size={20} fill="currentColor" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {profile.photos.slice(1, 5).map((photo, index) => (
                                <div key={index} className="w-full h-32 rounded-xl overflow-hidden relative shadow-sm">
                                    <Image
                                        src={photo}
                                        alt={`Profile Photo ${index + 2}`}
                                        // FIX: Updated to new Next.js Image props
                                        fill={true}
                                        style={{ objectFit: 'cover' }}
                                        className="rounded-xl"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section: Profile Details */}
                    <div className="w-full lg:w-3/5 p-6 lg:p-10 space-y-6">
                        {/* ... (rest of the code is unchanged) ... */}
                        <div className="flex justify-between items-start">
                            <h2 className="text-4xl font-bold text-gray-900">{profile.name}, {profile.age}</h2>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <CheckCircle size={18} className="text-green-500" />
                                <span>{profile.status}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-600 text-lg space-x-4">
                            <div className="flex items-center">
                                <Briefcase size={20} className="mr-2 text-gray-500" /> {profile.job}
                            </div>
                            <div className="flex items-center">
                                <MapPin size={20} className="mr-2 text-gray-500" /> {profile.location}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {profile.tags.map((tag, index) => (
                                <span key={index} className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">About Me</h3>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {profile.aboutMe}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">My Basics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-gray-700">Height</span>
                                    <span className="text-gray-900 font-medium">{profile.basics.height}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-gray-700">Education</span>
                                    <span className="text-gray-900 font-medium">{profile.basics.education}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-gray-700">Zodiac Sign</span>
                                    <span className="text-gray-900 font-medium">{profile.basics.zodiacSign}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4 mt-8">
                            <button className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold shadow-md hover:from-pink-600 hover:to-purple-700 transition duration-200">
                                Save Changes
                            </button>
                            <button className="flex-1 py-3 px-6 rounded-full border border-gray-300 text-gray-700 text-lg font-semibold shadow-md hover:bg-gray-50 transition duration-200">
                                Share Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}