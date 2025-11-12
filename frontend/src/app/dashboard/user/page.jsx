// DatingApp/frontend/src/app/dashboard/user/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Import your components
import PhotoGallery from '@/components/PhotoGallery';
import ProfileCard from '@/components/ProfileCard';
import { authFetch, clearAuthToken } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {

    // State to hold profiles, current index, and loading status
    const [allProfiles, setAllProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true); // Now needed for API calls
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [isActionPending, setIsActionPending] = useState(false);
    const router = useRouter();

    // --- API FETCH LOGIC (UNCOMMENTED) ---

    const fetchProfiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await authFetch('/api/user/dashboard', {
                method: 'GET',
            });
            setAllProfiles(Array.isArray(data.matches) ? data.matches : []);
            setCurrentIndex(0);
            setError(null);
        } catch (fetchError) {
            console.error("Failed to fetch profiles:", fetchError);
            setError(fetchError.message);
            if (fetchError.status === 401) {
                clearAuthToken();
                router.push('/signin');
            }
            setAllProfiles([]);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]); // Empty array means "run once"

    // --- END API FETCH LOGIC ---

    const advanceProfiles = useCallback((index) => {
        setAllProfiles((prev) => {
            if (prev.length === 0) return prev;
            const updated = prev.filter((_, i) => i !== index);
            const nextIndex =
                updated.length === 0
                    ? 0
                    : index >= updated.length
                        ? 0
                        : index;
            setCurrentIndex(nextIndex);
            if (updated.length === 0) {
                setTimeout(() => {
                    fetchProfiles();
                }, 0);
            }
            return updated;
        });
    }, [fetchProfiles]);

    const handleDislike = async () => {
        const currentProfile = allProfiles[currentIndex];
        if (!currentProfile || isActionPending) return;
        setActionMessage(null);
        setIsActionPending(true);
        try {
            await authFetch('/api/user/dislike', {
                method: 'POST',
                body: { targetUserId: currentProfile.id },
            });
            advanceProfiles(currentIndex);
        } catch (dislikeError) {
            console.error("Failed to dislike profile:", dislikeError);
            setActionMessage(dislikeError.message || "Failed to hide profile.");
            if (dislikeError.status === 401) {
                clearAuthToken();
                router.push('/signin');
            }
        } finally {
            setIsActionPending(false);
        }
    };

    const handleLike = async () => {
        setActionMessage(null);
        const currentProfile = allProfiles[currentIndex];
        if (!currentProfile || isActionPending) return;
        setIsActionPending(true);
        try {
            await authFetch('/api/user/like', {
                method: 'POST',
                body: { targetUserId: currentProfile.id },
            });
            advanceProfiles(currentIndex);
        } catch (likeError) {
            console.error("Failed to like profile:", likeError);
            setActionMessage(likeError.message || "Failed to like profile.");
            if (likeError.status === 401) {
                clearAuthToken();
                router.push('/signin');
            }
        } finally {
            setIsActionPending(false);
        }
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

    if (error) {
        return (
            <div className="flex h-screen w-full justify-center items-center text-center px-6">
                <div>
                    <p className="text-xl text-red-500 mb-3">Unable to load matches</p>
                    <p className="text-gray-600">{error}</p>
                </div>
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
                    <ProfileCard
                        profile={currentProfile}
                        onLike={handleLike}
                        onSkip={handleDislike}
                    />

                    {actionMessage && (
                        <div className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm">
                            {actionMessage}
                        </div>
                    )}

                    <div className="flex-grow"></div>
                </main>

                {/* Show the photo gallery */}
                <PhotoGallery profile={currentProfile} />

            </div>
        </div>
    );
}