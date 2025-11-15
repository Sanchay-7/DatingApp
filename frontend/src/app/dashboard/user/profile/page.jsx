// DatingApp/frontend/src/app/dashboard/user/profile/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileEditor from "@/components/ProfileEditor";
import PhotoGallery from "@/components/PhotoGallery";
import { authFetch, clearAuthToken } from "@/lib/apiClient";

const PLACEHOLDER_GALLERY = {
    name: "Your Gallery",
    mainPhoto: "https://via.placeholder.com/400x400?text=Add+Photo",
    extraPhotos: [],
};

const calculateAge = (birthday) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return "";
    const diffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const buildEditorProfile = (user) => {
    if (!user) return null;
    const prefs = user.preferences || {};
    return {
        name: user.name || user.firstName || "",
        age: calculateAge(user.birthday),
        bio: prefs.bio || "",
        job: user.work || "",
        location: user.currentLocation || "",
        interests: Array.isArray(prefs.interests) ? prefs.interests : [],
    };
};

const buildGalleryProfile = (user) => {
    if (!user) return PLACEHOLDER_GALLERY;
    const photos = Array.isArray(user.photos) ? user.photos : [];
    return {
        name: user.name || user.firstName || "You",
        mainPhoto: photos[0] || PLACEHOLDER_GALLERY.mainPhoto,
        extraPhotos: photos.slice(1),
    };
};

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const router = useRouter();

    const loadUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await authFetch("/api/user/me");
            setUser(data.user || null);
            setError(null);
        } catch (err) {
            console.error("Failed to load profile:", err);
            setError(err.message);
            setUser(null);
            if (err.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const editorProfile = useMemo(() => buildEditorProfile(user), [user]);
    const galleryProfile = useMemo(() => buildGalleryProfile(user), [user]);

    const handleProfileSave = async (draftProfile) => {
        setIsSaving(true);
        setFeedback(null);
        try {
            const profilePayload = {
                name: draftProfile.name,
                work: draftProfile.job,
                currentLocation: draftProfile.location,
            };

            await authFetch("/api/user/update-profile", {
                method: "PUT",
                body: profilePayload,
            });

            await authFetch("/api/user/update-preferences", {
                method: "PUT",
                body: {
                    bio: draftProfile.bio,
                    interests: draftProfile.interests,
                },
            });

            setFeedback("Profile updated successfully.");
            await loadUser();
        } catch (err) {
            console.error("Failed to save profile:", err);
            setFeedback(err.message || "Failed to update profile.");
            if (err.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-xl text-red-500 font-semibold">
                    We hit a snag loading your profile.
                </p>
                <p className="text-gray-600 max-w-md">{error}</p>
                <button
                    onClick={loadUser}
                    className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 pb-24 lg:pb-0">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                My Profile & Photos
            </h1>

            {feedback && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-sm text-yellow-700 rounded-lg">
                    {feedback}
                </div>
            )}

            {/* MAIN CONTAINER: Standard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Column 1 (Photos) */}
                <div className="lg:col-span-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Your Photos
                    </h2>
                    <PhotoGallery profile={galleryProfile} isEditing={true} />
                    <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">
                            Profile Tip:
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Photos are crucial! Ensure you have at least 3 great
                            photos.
                        </p>
                    </div>
                </div>

                {/* Column 2 (Forms) */}
                <div className="lg:col-span-8">
                    <ProfileEditor
                        initialProfile={editorProfile}
                        onSave={handleProfileSave}
                        isSaving={isSaving}
                    />
                </div>
            </div>
        </div>
    );
}