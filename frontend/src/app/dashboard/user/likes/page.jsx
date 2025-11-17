// app/dashboard/user/likes/page.jsx (API-Ready)
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authFetch, clearAuthToken } from "@/lib/apiClient";
import { notifyNewMatch } from "@/lib/notifications";

// New, upgraded LikedUserCard component
// This component is perfect and needs no changes.
const LikedUserCard = ({
    name,
    age,
    imageUrl,
    likedAt,
    interests,
    onAccept,
    onReject,
    isProcessing,
    isOnline,
    lastActive,
}) => {
    const resolvedImage = imageUrl || PLACEHOLDER_IMAGE;
    return (
        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
        {/* Background Image */}
        <Image
            src={resolvedImage}
            alt={name}
            fill={true}
            style={{ objectFit: 'cover' }}
            className="rounded-xl"
        />
        
        {/* Online/Offline Status Indicator */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg ${
            isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`}>
            <div className={`w-2 h-2 bg-white rounded-full ${isOnline ? 'animate-pulse' : ''}`}></div>
            {isOnline ? 'Online' : 'Offline'}
        </div>

        {/* Gradient Overlay for text */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-black/80 to-transparent"></div>

        {/* Text Content */}
        <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">
                {name}
                {age ? `, ${age}` : ""}
            </h3>
            <p className="text-sm opacity-90">
                Liked you {likedAt ? new Date(likedAt).toLocaleDateString() : ""}
            </p>
            {interests && interests.length > 0 && (
                <p className="text-xs mt-1 opacity-80">
                    {interests.slice(0, 3).join(" • ")}
                    {interests.length > 3 ? "..." : ""}
                </p>
            )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-between gap-2 bg-linear-to-t from-black/70 via-black/40 to-transparent">
            <button
                onClick={onReject}
                disabled={isProcessing}
                className="flex-1 bg-white/10 hover:bg-white/20 text-red-200 hover:text-white border border-red-300/40 backdrop-blur-sm text-sm font-semibold py-2 rounded-full transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isProcessing ? "Working..." : "Reject"}
            </button>
            <button
                onClick={onAccept}
                disabled={isProcessing}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-2 rounded-full shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isProcessing ? "Working..." : "Message"}
            </button>
        </div>
    </div>
    );
};


const PLACEHOLDER_IMAGE =
    "https://via.placeholder.com/300x300?text=No+Image";

export default function LikesYouPage() {
    // State to hold the list of users who liked you
    const [likedUsers, setLikedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [pendingLikeId, setPendingLikeId] = useState(null);
    const prevCountRef = useRef(0);
    const router = useRouter();

    // --- API FETCH LOGIC (SAVED FOR LATER) ---
    useEffect(() => {
        const loadLikes = async () => {
            setIsLoading(true);
            try {
                const data = await authFetch("/api/user/likes");
                const likes = Array.isArray(data.likes) ? data.likes : [];
                
                // Check if new likes arrived (send notification for each new one)
                if (likes.length > prevCountRef.current) {
                    const newLikes = likes.length - prevCountRef.current;
                    const notificationSettings = localStorage.getItem("userSettings");
                    const isNotificationEnabled = notificationSettings 
                        ? JSON.parse(notificationSettings).newMatchNotify 
                        : true;

                    if (isNotificationEnabled && newLikes > 0) {
                        // Notify for the newest like(s)
                        for (let i = 0; i < Math.min(newLikes, 3); i++) {
                          const like = likes[i];
                            if (like && like.name) {
                                notifyNewMatch(like.name);
                            }
                        }
                    }
                }

                prevCountRef.current = likes.length;
                setLikedUsers(likes);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch likes:", error);
                setError(error.message);
                setLikedUsers([]);
                if (error.status === 401) {
                    clearAuthToken();
                    router.push("/signin");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadLikes();

        // Poll for new likes every 10 seconds
        const interval = setInterval(loadLikes, 10000);

        return () => clearInterval(interval);
    }, [router]);

    const removeLikeEntry = (id) => {
        setLikedUsers((prev) => prev.filter((entry) => entry.id !== id));
    };

    const handleAccept = async (entry) => {
        if (!entry) return;
        setActionError(null);
        setPendingLikeId(entry.id);
        try {
            await authFetch("/api/user/like", {
                method: "POST",
                body: { targetUserId: entry.userId },
            });

            const startResponse = await authFetch("/api/chat/start", {
                method: "POST",
                body: { targetUserId: entry.userId },
            });

            const conversation = startResponse.conversation;

            if (conversation?.secretKey && typeof window !== "undefined") {
                window.sessionStorage.setItem(
                    `conversation-key:${conversation.id}`,
                    conversation.secretKey
                );
            }

            removeLikeEntry(entry.id);

            if (conversation?.id) {
                router.push(
                    `/dashboard/user/messages?conversationId=${conversation.id}`
                );
            } else {
                router.push("/dashboard/user/messages");
            }
        } catch (err) {
            console.error("Failed to accept like:", err);
            setActionError(err.message || "Failed to respond to like.");
            if (err.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setPendingLikeId(null);
        }
    };

    const handleReject = async (entry) => {
        if (!entry) return;
        setActionError(null);
        setPendingLikeId(entry.id);
        try {
            await authFetch("/api/user/dislike", {
                method: "POST",
                body: { targetUserId: entry.userId },
            });
            removeLikeEntry(entry.id);
        } catch (err) {
            console.error("Failed to reject like:", err);
            setActionError(err.message || "Failed to reject like.");
            if (err.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setPendingLikeId(null);
        }
    };


    return (
        <div className="p-8 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                Who Likes You <span className="text-pink-500 ml-3">💖</span>
                {/* This is now dynamic based on the API data */}
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <p className="text-md text-gray-600 mb-6">
                    These users have liked your profile. Click to view their profile and match instantly!
                </p>
                {actionError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                {/* --- DYNAMIC USER GRID --- */}
                {isLoading ? (
                    <p className="text-center text-gray-500">
                        Loading new likes...
                    </p>
                ) : error ? (
                    <p className="text-center text-red-500">
                        Unable to load likes: {error}
                    </p>
                ) : likedUsers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {/* Map over data from the API */}
                        {likedUsers.map((user) => (
                            <LikedUserCard
                                key={user.id}
                                name={user.name}
                                age={user.age}
                                imageUrl={user.imageUrl || PLACEHOLDER_IMAGE}
                                likedAt={user.likedAt}
                                interests={user.interests}
                                isProcessing={pendingLikeId === user.id}
                                onAccept={() => handleAccept(user)}
                                onReject={() => handleReject(user)}
                                isOnline={user.isOnline}
                                lastActive={user.lastActive}
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