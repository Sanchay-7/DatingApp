// DatingApp/frontend/src/app/dashboard/user/settings/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Bell, User, XCircle } from 'lucide-react'; // Icons for visual appeal

// Default values for a new user, or if loading fails
const DEFAULT_SETTINGS = {
    maxDistance: 50,
    minAge: 20,
    maxAge: 35,
    showMe: true,
    newMatchNotify: true,
};

export default function SettingsPage() {
    // State to manage settings values, initialized to null
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- API FETCH LOGIC (SAVED FOR LATER) ---
    /*
    // TODO: After this PR is merged, uncomment this block.
    
    useEffect(() => {
        const API_ENDPOINT = "http://localhost:5000/api/settings"; 
        
        async function fetchSettings() {
            setIsLoading(true); 
            try {
                const response = await fetch(API_ENDPOINT); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json(); 
                setSettings(data.settings || DEFAULT_SETTINGS); 
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                setSettings(DEFAULT_SETTINGS); // Fallback to defaults on error
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettings();
    }, []); // Empty array means "run once"
    */

    // --- TEMPORARY: Simulate loading settings (since fetch is commented) ---
    // We will set the settings to the defaults so the page is usable.
    useEffect(() => {
        setSettings(DEFAULT_SETTINGS);
        setIsLoading(false);
    }, []);
    // --- END TEMPORARY ---


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value)
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // This is where the API call (POST/PUT) would go
        console.log("Settings Saved:", settings);
        // REMOVED: alert("Settings Saved Locally!");
    };

    const deleteAccount = () => {
        // REMOVED: if (confirm("Are you sure..."))
        // A real app would use a custom modal pop-up here.
        // For API-ready prep, we just log to console.
        console.warn("Account Deletion Clicked. API call would go here.");
        // REMOVED: alert("Account Deletion Simulated.");
    };

    // Show loading spinner while settings are fetched
    if (isLoading || !settings) {
        return (
            <div className="p-8 h-full bg-gray-50 flex justify-center items-center">
                <p className="text-gray-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-8 h-full bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

            <form onSubmit={handleSave} className="space-y-10">

                {/* Section 1: Discovery Preferences */}
                <section className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-500">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Sliders className="w-6 h-6 mr-3 text-pink-600" /> Discovery Preferences
                    </h2>

                    {/* Max Distance Slider */}
                    <div className="mb-6">
                        <label htmlFor="maxDistance" className="block text-lg font-medium text-gray-700 mb-2">
                            Maximum Distance: <span className="text-pink-600 font-bold">{settings.maxDistance} km</span>
                        </label>
                        <input
                            type="range" min="1" max="500" step="5"
                            name="maxDistance" id="maxDistance"
                            value={settings.maxDistance}
                            onChange={handleChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Age Range Inputs */}
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Age Range: <span className="text-pink-600 font-bold">{settings.minAge} - {settings.maxAge}</span>
                        </label>
                        <div className="flex space-x-4">
                            <input type="number" name="minAge" value={settings.minAge} onChange={handleChange} min="18" max={Number(settings.maxAge)}
                                className="p-3 border rounded-lg w-1/2 focus:ring-pink-500 focus:border-pink-500"
                            />
                            <input type="number" name="maxAge" value={settings.maxAge} onChange={handleChange} min={Number(settings.minAge)} max="99"
                                className="p-3 border rounded-lg w-1/2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                    </div>

                    {/* Show Me Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-md text-gray-700">Show me in Discover (Pause your profile)</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="showMe" checked={settings.showMe} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                    </div>
                </section>

                {/* Section 2: Notifications */}
                <section className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Bell className="w-6 h-6 mr-3 text-indigo-600" /> Notifications
                    </h2>

                    {/* New Match Notification Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-md text-gray-700">New Match Alerts</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="newMatchNotify" checked={settings.newMatchNotify} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </section>

                {/* Section 3: Account Actions */}
                <section className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-gray-400">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <User className="w-6 h-6 mr-3 text-gray-600" /> Account
                    </h2>
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={deleteAccount}
                            className="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150"
                        >
                            <XCircle className="w-5 h-5 mr-2" /> Permanently Delete Account
                        </button>
                        <p className="mt-3 text-xs text-gray-500">Warning: Deleting your account will erase all matches and messages.</p>
                    </div>
                </section>

                {/* Main Save Button */}
                <div className="pt-6">
                    <button
                        type="submit"
                        className="w-full py-3 px-6 rounded-md shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150"
                    >
                        Save All Settings
                    </button>
                </div>
            </form>
        </div>
    );
}