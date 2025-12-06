"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Bell, User, XCircle } from "lucide-react";
import { authFetch, clearAuthToken } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

const DEFAULT_SETTINGS = {
    maxDistance: 50,
    minAge: 20,
    maxAge: 35,
    showMe: true,
    newMatchNotify: true,
};

// Define the minimum age requirement
const MIN_AGE_LIMIT = 18;

export default function SettingsPage() {
    const [settings, setSettings] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationName, setLocationName] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const [settingsData, meData] = await Promise.all([
                    authFetch("/api/user/settings"),
                    authFetch("/api/user/me"),
                ]);
                if (isMounted) {
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...(settingsData.settings || {}),
                    });
                    const location = meData?.user?.currentLocation || null;
                    setCurrentLocation(location);
                    // Convert lat/lng to place name
                    if (location && location.includes(',')) {
                        reverseGeocode(location);
                    }
                    setFeedback(null);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                if (isMounted) {
                    setSettings({ ...DEFAULT_SETTINGS });
                    setFeedback(error.message);
                }
                if (error.status === 401) {
                    clearAuthToken();
                    router.push("/signin");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSettings();
        return () => {
            isMounted = false;
        };
    }, [router]);

    // --- THIS IS THE FIX (PART 1) ---
    // This function now only allows valid characters (digits or empty)
    // It stores a STRING in the state while typing.
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setSettings(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === "minAge" || name === "maxAge") {
            // This regex ensures only digits (0-9) or an empty string are allowed
            if (value === "" || /^\d+$/.test(value)) {
                setSettings(prev => ({
                    ...prev,
                    [name]: value // Store the raw string value (e.g., "1", "19", "")
                }));
            }
            // If they type "abc", the state simply doesn't update
            return;
        }

        // Handle other inputs (like the slider)
        setSettings(prev => ({
            ...prev,
            [name]: parseInt(value, 10)
        }));
    };

    // --- THIS IS THE FIX (PART 2) ---
    // This new function validates the age when the user clicks away
    const handleAgeBlur = (e) => {
        const { name, value } = e.target;

        let num = parseInt(value, 10);

        // 1. Validate: Check if it's Not-a-Number or less than 18
        if (isNaN(num) || num < MIN_AGE_LIMIT) {
            num = MIN_AGE_LIMIT; // Default to 18
        }

        // 2. Cross-Validate: Check min/max logic
        if (name === "minAge") {
            // Don't let min age be greater than max age
            const maxAge = Number(settings.maxAge) || 99; // Get max age, default to 99 if empty
            if (num > maxAge) {
                num = maxAge; // Set it to be the same as maxAge
            }
        } else if (name === "maxAge") {
            // Don't let max age be less than min age
            const minAge = Number(settings.minAge) || MIN_AGE_LIMIT; // Get min age, default to 18 if empty
            if (num < minAge) {
                num = minAge; // Set it to be the same as minAge
            }
        }

        // 3. Commit: Update the state with the final, validated NUMBER
        setSettings(prev => ({
            ...prev,
            [name]: num
        }));
    };
    // --- END OF FIX ---

    const handleSave = (e) => {
        e.preventDefault();
        if (!settings) return;
        setIsSaving(true);
        setFeedback(null);

        const payload = {
            settings: {
                ...settings,
                maxDistance: Number(settings.maxDistance),
                minAge: Number(settings.minAge),
                maxAge: Number(settings.maxAge),
            },
        };

        authFetch("/api/user/update-preferences", {
            method: "PUT",
            body: payload,
        })
            .then(() => {
                // Save settings to localStorage for client-side notification checking
                if (typeof window !== "undefined") {
                    localStorage.setItem("userSettings", JSON.stringify(payload.settings));
                }
                setFeedback("Settings saved successfully.");
            })
            .catch((error) => {
                console.error("Failed to save settings:", error);
                setFeedback(error.message || "Failed to save settings.");
                if (error.status === 401) {
                    clearAuthToken();
                    router.push("/signin");
                }
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    const reverseGeocode = async (latLng) => {
        try {
            const [lat, lng] = latLng.split(',').map(s => s.trim());
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
            );
            const data = await response.json();
            if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county;
                const state = data.address.state;
                const country = data.address.country;
                const placeName = [city, state, country].filter(Boolean).join(', ');
                setLocationName(placeName || 'Unknown location');
            } else {
                setLocationName('Unknown location');
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            setLocationName('Unknown location');
        }
    };

    const refreshLocation = async () => {
        setFeedback(null);
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setFeedback("Geolocation not supported by browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const latLng = `${pos.coords.latitude},${pos.coords.longitude}`;
                await authFetch("/api/user/update-location", {
                    method: "PUT",
                    body: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                });
                setCurrentLocation(latLng);
                await reverseGeocode(latLng);
                setFeedback("Location updated");
            } catch (err) {
                setFeedback(err.message || "Failed to update location");
            }
        }, (err) => {
            setFeedback(err?.message || "Location permission denied");
        });
    };

    const deleteAccount = async () => {
        if (!deletePassword) {
            setFeedback("Please enter your password to delete your account");
            return;
        }

        setIsDeleting(true);
        setFeedback(null);

        try {
            await authFetch("/api/user/delete-account", {
                method: "DELETE",
                body: { password: deletePassword },
            });

            // Clear auth token and redirect to signin
            clearAuthToken();
            setShowDeleteModal(false);
            router.push("/signin?deleted=true");
        } catch (error) {
            console.error("Account deletion failed:", error);
            setFeedback(error.message || "Failed to delete account. Please check your password.");
            if (error.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setIsDeleting(false);
            setDeletePassword("");
        }
    };

    if (isLoading || !settings) {
        return (
            <div className="p-8 h-full bg-gray-50 flex justify-center items-center">
                <p className="text-gray-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 pb-24 lg:pb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
            {feedback && (
                <div className="mb-6 p-4 rounded-lg border bg-white text-sm">
                    {feedback}
                </div>
            )}
            <form onSubmit={handleSave} className="space-y-10">
                <section className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-500">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Sliders className="w-6 h-6 mr-3 text-pink-600" /> Discovery Preferences
                    </h2>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Current location</p>
                            <p className="text-gray-900 text-sm font-medium">{locationName || 'Unknown'}</p>
                        </div>
                        <button type="button" onClick={refreshLocation} className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">
                            Refresh Location
                        </button>
                    </div>
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
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Age Range: <span className="text-pink-600 font-bold">{settings.minAge || '...'} - {settings.maxAge || '...'}</span>
                        </label>

                        {/* --- THIS IS THE FIX (PART 3) --- */}
                        {/* Added onBlur={handleAgeBlur} to both inputs */}
                        {/* Updated min/max logic to handle string state */}
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <input
                                type="number"
                                name="minAge"
                                value={settings.minAge}
                                onChange={handleChange}
                                onBlur={handleAgeBlur} // <-- ADDED
                                min="18"
                                max={Number(settings.maxAge) || 99} // <-- UPDATED
                                placeholder="Min Age (18+)"
                                className="p-3 border rounded-lg w-full md:w-1/2 focus:ring-pink-500 focus:border-pink-500"
                            />
                            <input
                                type="number"
                                name="maxAge"
                                value={settings.maxAge}
                                onChange={handleChange}
                                onBlur={handleAgeBlur} // <-- ADDED
                                min={Number(settings.minAge) || MIN_AGE_LIMIT} // <-- UPDATED
                                max="99"
                                placeholder="Max Age"
                                className="p-3 border rounded-lg w-full md:w-1/2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                        {/* --- END OF FIX --- */}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-md text-gray-700">Show me in Discover (Pause your profile)</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="showMe" checked={settings.showMe} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                    </div>
                </section>
                <section className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Bell className="w-6 h-6 mr-3 text-indigo-600" /> Notifications
                    </h2>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-md text-gray-700">New Match Alerts</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="newMatchNotify" checked={settings.newMatchNotify} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </section>
                <section className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-gray-400">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <User className="w-6 h-6 mr-3 text-gray-600" /> Account
                    </h2>
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150"
                        >
                            <XCircle className="w-5 h-5 mr-2" /> Permanently Delete Account
                        </button>
                        <p className="mt-3 text-xs text-gray-500">Warning: Deleting your account will erase all matches and messages.</p>
                    </div>
                </section>
                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 px-6 rounded-md shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150"
                    >
                        {isSaving ? "Saving..." : "Save All Settings"}
                    </button>
                </div>
            </form>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Account?</h3>
                        <p className="text-gray-600 mb-4">
                            This action cannot be undone. Your account, messages, likes, and matches will be permanently deleted.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter your password to confirm:
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        {feedback && (
                            <div className="mb-4 p-3 rounded-lg border bg-red-50 text-sm text-red-600">
                                {feedback}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword("");
                                    setFeedback(null);
                                }}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteAccount}
                                disabled={isDeleting || !deletePassword}
                                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}