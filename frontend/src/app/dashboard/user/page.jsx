// DatingApp/frontend/src/app/dashboard/user/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Import your components
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
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(65);
    const [showAgeFilter, setShowAgeFilter] = useState(false);
    const [viewedProfiles, setViewedProfiles] = useState([]); // Track viewed profiles for backtrack
    const [userSubscription, setUserSubscription] = useState({ 
        tier: 'FREE', 
        backtrackAvailable: false,
        dailyLikesUsed: 0,
        dailyLikesLimit: 10,
        remainingLikes: 10,
        dailyBacktracksUsed: 0,
        dailyBacktracksLimit: 0,
        remainingBacktracks: 0,
    });
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

    // Fetch user settings to get age preferences
    const fetchSettings = useCallback(async () => {
        try {
            const data = await authFetch('/api/user/settings', {
                method: 'GET',
            });
            if (data && data.settings) {
                setMinAge(data.settings.minAge || 18);
                setMaxAge(data.settings.maxAge || 65);
            } else {
                setMinAge(18);
                setMaxAge(65);
            }
        } catch (settingsError) {
            console.error("[DASHBOARD] Failed to fetch settings:", settingsError);
            // Use default values if fetch fails
            setMinAge(18);
            setMaxAge(65);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchProfiles();
        fetchUserSubscription();
    }, [fetchSettings, fetchProfiles]); // Empty array means "run once"

    // Fetch user subscription info
    const fetchUserSubscription = async () => {
        try {
            const data = await authFetch('/api/user/me', { method: 'GET' });
            if (data && data.user) {
                setUserSubscription({
                    tier: data.user.subscriptionTier || 'FREE',
                    backtrackAvailable: data.user.backtrackAvailable || false,
                    dailyLikesUsed: data.user.dailyLikesUsed || 0,
                    dailyLikesLimit: data.user.dailyLikesLimit || 10,
                    remainingLikes: data.user.remainingLikes !== null ? data.user.remainingLikes : 10,
                    dailyBacktracksUsed: data.user.dailyBacktracksUsed || 0,
                    dailyBacktracksLimit: data.user.dailyBacktracksLimit || 0,
                    remainingBacktracks: data.user.remainingBacktracks !== null ? data.user.remainingBacktracks : 0,
                });
            }
        } catch (err) {
            console.error('Failed to fetch subscription:', err);
        }
    };

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

    // Function to calculate age from birthday
    const calculateAge = (birthday) => {
        if (!birthday) {
            return null;
        }
        const today = new Date();
        const birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime())) {
            return null;
        }
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Filter profiles based on age range
    const filteredProfiles = allProfiles.filter((profile) => {
        const age = calculateAge(profile.birthday);
        const matches = age !== null && age >= minAge && age <= maxAge;
        // Debug logs removed
        if (age === null) return false;
        return matches;
    });
    

    // Get current profile from filtered list
    const currentProfile = filteredProfiles[currentIndex];

    const handleDislike = async () => {
        const profile = allProfiles[currentIndex];
        if (!profile || isActionPending) return;
        setActionMessage(null);
        setIsActionPending(true);
        
        // Save current profile to viewed history before advancing
        setViewedProfiles(prev => [...prev, { profile, action: 'dislike', index: currentIndex }]);
        
        try {
            await authFetch('/api/user/dislike', {
                method: 'POST',
                body: { targetUserId: profile.id },
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
        const profile = allProfiles[currentIndex];
        if (!profile || isActionPending) return;
        setIsActionPending(true);
        
        // Save current profile to viewed history before advancing
        setViewedProfiles(prev => [...prev, { profile, action: 'like', index: currentIndex }]);
        
        try {
            const response = await authFetch('/api/user/like', {
                method: 'POST',
                body: { targetUserId: profile.id },
            });
            
            // Update remaining likes
            if (response.remainingLikes !== null && response.remainingLikes !== undefined) {
                setUserSubscription(prev => ({
                    ...prev,
                    dailyLikesUsed: response.dailyLikesUsed,
                    remainingLikes: response.remainingLikes,
                }));
            }
            
            advanceProfiles(currentIndex);
        } catch (likeError) {
            console.error("Failed to like profile:", likeError);
            
            // Handle daily limit reached
            if (likeError.status === 403 && likeError.message.includes('Daily like limit')) {
                const tier = userSubscription.tier;
                if (tier === 'FREE') {
                    setActionMessage('❤️ Daily limit reached (10 likes). Upgrade to Premium for 30 likes/day or Boost for unlimited!');
                } else if (tier === 'PREMIUM') {
                    setActionMessage('❤️ Daily limit reached (30 likes). Upgrade to Boost for unlimited likes!');
                }
            } else {
                setActionMessage(likeError.message || "Failed to like profile.");
            }
            
            if (likeError.status === 401) {
                clearAuthToken();
                router.push('/signin');
            }
        } finally {
            setIsActionPending(false);
        }
    };

    const handleBacktrack = async () => {
        if (viewedProfiles.length === 0) {
            setActionMessage("No previous profiles to go back to");
            return;
        }

        const tier = userSubscription.tier;
        if (tier === 'FREE') {
            setActionMessage("⭐ Backtrack is a Premium feature. Upgrade to Premium for 2 backtracks/day or Boost for unlimited!");
            return;
        }

        // Check daily limit for PREMIUM users
        if (tier === 'PREMIUM' && userSubscription.remainingBacktracks <= 0) {
            setActionMessage("↩️ Daily backtrack limit reached (2/day). Upgrade to Boost for unlimited backtracks!");
            return;
        }

        setIsActionPending(true);
        try {
            // Call backtrack API to track usage
            const response = await authFetch('/api/user/backtrack', {
                method: 'POST',
            });

            // Update remaining backtracks
            if (response.remainingBacktracks !== null && response.remainingBacktracks !== undefined) {
                setUserSubscription(prev => ({
                    ...prev,
                    dailyBacktracksUsed: response.dailyBacktracksUsed,
                    remainingBacktracks: response.remainingBacktracks,
                }));
            }

            // Get the last viewed profile
            const lastViewed = viewedProfiles[viewedProfiles.length - 1];
            
            // Remove it from viewed history
            setViewedProfiles(prev => prev.slice(0, -1));
            
            // Add it back to the beginning of allProfiles
            setAllProfiles(prev => [lastViewed.profile, ...prev]);
            setCurrentIndex(0);
            
            const remaining = response.remainingBacktracks !== null ? ` (${response.remainingBacktracks} left today)` : '';
            setActionMessage(`↩️ Went back to ${lastViewed.profile.name || 'previous profile'}${remaining}`);
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            console.error('Backtrack error:', err);
            if (err.status === 403) {
                setActionMessage(err.message || 'Backtrack limit reached');
            } else {
                setActionMessage('Failed to use backtrack');
            }
        } finally {
            setIsActionPending(false);
        }
    };

    const handleReport = async (reason) => {
        const profile = allProfiles[currentIndex];
        if (!profile || isActionPending) return;
        setActionMessage(null);
        setIsActionPending(true);
        
        
        
        try {
            const payload = {
                reportedUserId: profile.id,
                reason: reason,
            };
            
            
            // Check if token exists
            const token = localStorage.getItem('valise_token');
            if (!token) {
                throw new Error('No auth token found');
            }
            
            const response = await authFetch('/api/user/report', {
                method: 'POST',
                body: payload,
            });
            
            setActionMessage(`✅ Report submitted. ${profile.name}'s account has been flagged for moderation.`);
            // Move to next profile after reporting
            setTimeout(() => {
                advanceProfiles(currentIndex);
            }, 1500);
        } catch (reportError) {
            console.error("[REPORT-FRONTEND] Error:", reportError);
            console.error("[REPORT-FRONTEND] Error message:", reportError.message);
            console.error("[REPORT-FRONTEND] Error status:", reportError.status);
            setActionMessage(reportError.message || "Failed to report profile.");
            if (reportError.status === 401) {
                clearAuthToken();
                router.push('/signin');
            }
        } finally {
            setIsActionPending(false);
        }
    };

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
    if (!currentProfile || filteredProfiles.length === 0) {
        return (
            <div className="flex h-screen w-full justify-center items-center text-xl text-gray-500">
                {filteredProfiles.length === 0 && allProfiles.length > 0 
                    ? `No matches found in age range ${minAge} - ${maxAge}. Try adjusting filters.`
                    : 'No more matches! Try checking back later.'}
            </div>
        );
    }

    // --- MAIN RENDER ---
    return (
        <div className="flex flex-1 overflow-hidden bg-gray-50 h-screen">
            <main className="w-full flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-8">
                {/* Header with Title and Filter Button */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                        Discover Matches Near You
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBacktrack}
                            disabled={viewedProfiles.length === 0}
                            className={`px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                                viewedProfiles.length === 0 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                            title={!userSubscription.backtrackAvailable && userSubscription.tier === 'FREE' ? 'Premium Feature' : 'Go back to previous profile'}
                        >
                            ↩️ Backtrack {!userSubscription.backtrackAvailable && userSubscription.tier === 'FREE' && '⭐'}
                        </button>
                        <button
                            onClick={() => setShowAgeFilter(!showAgeFilter)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm sm:text-base whitespace-nowrap"
                        >
                            {showAgeFilter ? 'Hide Filters' : 'Age Filter'}
                        </button>
                    </div>
                </div>

                {showAgeFilter && (
                    <div className="w-full max-w-2xl mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Age Preference</h2>
                        
                        <div className="space-y-3 sm:space-y-4">
                            {/* Min Age Slider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Age: <span className="text-blue-600 font-bold">{minAge}</span>
                                </label>
                                <input
                                    type="range"
                                    min="18"
                                    max="100"
                                    value={minAge}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val <= maxAge) setMinAge(val);
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>18</span>
                                    <span>100</span>
                                </div>
                            </div>

                            {/* Max Age Slider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Age: <span className="text-blue-600 font-bold">{maxAge}</span>
                                </label>
                                <input
                                    type="range"
                                    min="18"
                                    max="100"
                                    value={maxAge}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val >= minAge) setMaxAge(val);
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>18</span>
                                    <span>100</span>
                                </div>
                            </div>

                            <p className="text-center text-gray-600 font-medium">
                                Showing profiles aged {minAge} - {maxAge} years old
                            </p>
                        </div>
                    </div>
                )}

                {/* Show the profile card with beautiful layout */}
                <div className="w-full h-auto md:h-[80vh] min-h-[500px] md:min-h-0">
                    <ProfileCard
                        profile={currentProfile}
                        onLike={handleLike}
                        onSkip={handleDislike}
                        onReport={handleReport}
                    />
                </div>

                {actionMessage && (
                    <div className={`mt-4 px-4 py-2 rounded-lg text-sm max-w-2xl ${actionMessage.includes('✅') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {actionMessage}
                    </div>
                )}
            </main>
        </div>
    );
}