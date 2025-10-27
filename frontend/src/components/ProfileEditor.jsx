// DatingApp/frontend/src/components/ProfileEditor.jsx
'use client';

import React, { useState } from 'react';

export default function ProfileEditor() {
    // State to hold the current profile data (using dummy data for now)
    const [profileData, setProfileData] = useState({
        name: "Jane Doe",
        age: 28,
        bio: "Coffee enthusiast, avid hiker, and cat mom. Looking for someone who can make me laugh.",
        job: "Software Engineer",
        location: "San Francisco, CA",
        interests: ["Hiking", "Cooking", "Travel", "Reading"],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Profile Data Saved:", profileData);
        alert("Profile Updated Locally! (Check console for data)");
        // NOTE: In the future, this is where you would call your backend API.
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-2xl">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">Edit Your Profile</h1>

            <form onSubmit={handleSave} className="space-y-8">

                {/* SECTION 1: Personal Details */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" value={profileData.name} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>

                        {/* Age Input */}
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                            <input type="number" name="age" id="age" value={profileData.age} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>

                        {/* Job Input */}
                        <div className="md:col-span-2">
                            <label htmlFor="job" className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input type="text" name="job" id="job" value={profileData.job} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>

                        {/* Location Input */}
                        <div className="md:col-span-2">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" name="location" id="location" value={profileData.location} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Bio */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Bio</h2>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Tell us about yourself</label>
                        <textarea name="bio" id="bio" rows="4" value={profileData.bio} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
                            maxLength={500}
                        ></textarea>
                        <p className="mt-2 text-sm text-gray-500">Max 500 characters.</p>
                    </div>
                </section>

                {/* SECTION 3: Interests/Tags (Simplified) */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Interests</h2>
                    <p className="text-sm text-gray-600">Current Interests: {profileData.interests.join(', ')}</p>
                    <p className="text-sm text-gray-500"> (Note: Advanced tag management can be built here later.)</p>
                </section>


                {/* SAVE BUTTON */}
                <div className="pt-5 border-t">
                    <button
                        type="submit"
                        className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-150"
                    >
                        Save Profile Changes
                    </button>
                </div>
            </form>
        </div>
    );
}