// app/settings/page.jsx (FIXED)
'use client';

// FIX: We need 'useState' to track the slider's value
import React, { useState } from 'react';

export default function SettingsPage() {

    // FIX: Create a 'state' to hold the distance value
    const [distance, setDistance] = useState(50);

    return (
        <div className="p-8 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Navigation / Categories */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit border border-gray-100">
                    <nav className="space-y-2 font-medium">
                        <a href="#" className="block p-3 rounded-lg bg-indigo-100 text-indigo-700">Discovery Preferences</a>
                        <a href="#" className="block p-3 rounded-lg text-gray-600 hover:bg-gray-100">Notifications</a>
                        <a href="#" className="block p-3 rounded-lg text-gray-600 hover:bg-gray-100">Privacy & Security</a>
                        <a href="#" className="block p-3 rounded-lg text-red-600 hover:bg-red-50">Delete Account</a>
                    </nav>
                </div>

                {/* Right Col: Settings Form */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Discovery Preferences</h2>

                    <form className="space-y-6">

                        {/* Max Distance Setting */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Distance (km)</label>
                            <input
                                type="range"
                                min="5"
                                max="500"
                                // FIX: Connect slider value and change event to our state
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                            />
                            {/* FIX: Display the real value from state */}
                            <div className="text-sm text-gray-500 mt-1">Currently set to {distance} km</div>
                        </div>

                        {/* Age Range Setting */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                            <div className="flex space-x-4">
                                {/* FIX: Add 'text-gray-900' to make typed text dark */}
                                <input type="number" defaultValue="20" min="18" max="99" className="p-2 border border-gray-300 rounded-lg w-1/2 text-gray-900" />
                                <input type="number" defaultValue="35" min="18" max="99" className="p-2 border border-gray-300 rounded-lg w-1/2 text-gray-900" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-6 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save Preferences
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};