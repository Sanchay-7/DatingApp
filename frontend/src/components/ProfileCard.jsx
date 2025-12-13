// components/ProfileCard.jsx

import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageCircle, Heart, X } from 'lucide-react';

// Receives the current profile data and action handlers from dashboard page
export default function ProfileCard({ profile, onLike, onSkip, onReport }) {

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [profileLocation, setProfileLocation] = useState(null);
    const [calculatedDistance, setCalculatedDistance] = useState(profile?.distance || 'Nearby');

    // Function to calculate distance in km between two coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    // Function to reverse geocode coordinates to place name (city/district only)
    const reverseGeocode = async (latLng) => {
        try {
            const [lat, lng] = latLng.split(',').map(s => s.trim());
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
            );
            const data = await response.json();
            if (data.address) {
                // Priority: city > town > village > district > county (shows Bangalore instead of Bangalore Urban)
                const location = data.address.city || data.address.town || data.address.village || data.address.district || data.address.county;
                setProfileLocation(location || 'Unknown');
            } else {
                setProfileLocation('Unknown');
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            setProfileLocation('Unknown');
        }
    };

    // Get current user location and calculate distance
    useEffect(() => {
        if (profile?.currentLocation && profile.currentLocation.includes(',')) {
            // Reverse geocode the profile location
            reverseGeocode(profile.currentLocation);
            
            // Try to get current user location for distance calculation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLat = position.coords.latitude;
                        const userLon = position.coords.longitude;
                        const [profileLat, profileLon] = profile.currentLocation.split(',').map(s => parseFloat(s.trim()));
                        const distance = calculateDistance(userLat, userLon, profileLat, profileLon);
                        setCalculatedDistance(`${distance} km away`);
                    },
                    () => {
                        // If location permission denied, just show the stored distance
                        setCalculatedDistance(profile?.distance || 'Nearby');
                    }
                );
            }
        }
    }, [profile?.currentLocation, profile?.distance]);

    if (!profile) return null;

    const images = [
        profile?.mainPhoto,
        ...((profile?.extraPhotos || []))
    ].filter(Boolean);
    const fallback = "https://via.placeholder.com/600x600?text=Add+Photos";
    const [selectedIndex, setSelectedIndex] = useState(0);
    const mainSrc = images[selectedIndex] || fallback;

    const handleSubmitReport = async () => {
        if (!reportReason.trim()) return;
        setIsReporting(true);
        try {
            await onReport(reportReason);
            setShowReportModal(false);
            setReportReason('');
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <>
            {/* Main Discover Layout */}
            <div className="w-full h-full flex flex-col md:flex-row gap-4 md:gap-6 bg-gray-50">

                {/* LEFT SIDE - Photos Gallery (shows ALL images) */}
                <div className="flex-1 md:flex-[1.2] p-0 sm:p-2 md:p-4 rounded-2xl overflow-visible bg-transparent shadow-none">
                    {/* Main image with thumbnails (product-like gallery) */}
                    <div className="w-full flex flex-col md:flex-row gap-2 sm:gap-3 items-stretch">
                        {/* Thumbnails (left on desktop, below on mobile) */}
                        <div className="order-2 md:order-1 md:w-28 lg:w-32 md:flex md:flex-col md:gap-2 md:overflow-y-auto md:max-h-[70vh]">
                            {/* Mobile thumbnails row */}
                            <div className="md:hidden flex gap-2 overflow-x-auto px-2">
                                {images.length > 0 ? images.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`shrink-0 rounded-md overflow-hidden border ${selectedIndex === idx ? 'border-rose-500' : 'border-transparent'}`}
                                        title={`Photo ${idx + 1}`}
                                    >
                                        <img src={src} alt={`Photo ${idx + 1}`} className="w-20 h-20 object-cover" />
                                    </button>
                                )) : null}
                            </div>

                            {/* Desktop thumbnails column */}
                            <div className="hidden md:flex md:flex-col md:gap-2">
                                {images.length > 0 ? images.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`rounded-md overflow-hidden border ${selectedIndex === idx ? 'border-rose-500' : 'border-transparent'}`}
                                        title={`Photo ${idx + 1}`}
                                    >
                                        <img src={src} alt={`Photo ${idx + 1}`} className="w-24 h-24 lg:w-28 lg:h-28 object-cover" />
                                    </button>
                                )) : null}
                            </div>
                        </div>

                        {/* Main image */}
                        <div className="order-1 md:order-2 flex-1">
                            <div className="w-full rounded-xl overflow-hidden relative">
                                <img
                                    src={mainSrc}
                                    alt={`Profile main: ${profile.name}`}
                                    className="w-full h-80 sm:h-[420px] md:h-[70vh] object-cover"
                                />
                                {/* Mobile: Single centered action bar overlay */}
                                <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 transform w-11/12 max-w-sm flex gap-2">
                                    <button
                                        onClick={onSkip}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-bold py-2 rounded-full shadow"
                                    >
                                        <X className="w-5 h-5" />
                                        Skip
                                    </button>
                                    <button
                                        onClick={onLike}
                                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold py-2 rounded-full shadow"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                        Like
                                    </button>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 font-semibold py-2 rounded-full shadow"
                                        title="Report this profile"
                                    >
                                        <AlertCircle className="w-5 h-5" />
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Profile Info and Interests */}
                <div className="flex-1 md:flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
                    
                    {/* Profile Header */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-2">
                            {profile.name}
                            {profile.age ? `, ${profile.age}` : ""}
                        </h2>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-2 sm:mb-4">
                            {calculatedDistance}
                        </p>
                        <p className="text-base sm:text-lg text-gray-500 mb-2">
                            {profileLocation || 'Location loading...'}
                        </p>
                        <p className="text-base sm:text-lg text-pink-600 font-semibold">
                            {profile.job || "LuveKg Member"}
                        </p>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="mb-6 sm:mb-8">
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                "{profile.bio}"
                            </p>
                        </div>
                    )}

                    {/* Interests Section */}
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Interests & Passions</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {(profile.tags || []).length > 0 ? (
                                profile.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-linear-to-r from-pink-500 to-rose-500 text-white text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
                                    >
                                        ✨ {tag}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">Interests not specified</p>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-6">
                        <div className="p-3 sm:p-4 bg-white rounded-lg shadow-md">
                            <p className="text-gray-600 text-xs sm:text-sm">Location</p>
                            <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                {profileLocation || "Location loading..."}
                            </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-white rounded-lg shadow-md">
                            <p className="text-gray-600 text-xs sm:text-sm">Profession</p>
                            <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                {profile.job || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons (hidden on mobile, visible on sm+) */}
                    <div className="hidden sm:flex flex-row gap-4 mt-8">
                        <button
                            onClick={onSkip}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg hover:bg-gray-300 transition transform hover:scale-105 text-sm sm:text-base"
                        >
                            <X className="w-5 sm:w-6 h-5 sm:h-6" />
                            SKIP
                        </button>
                        <button
                            onClick={onLike}
                            className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 text-sm sm:text-base"
                        >
                            <Heart className="w-5 sm:w-6 h-5 sm:h-6 fill-current" />
                            LIKE
                        </button>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-100 text-red-600 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg hover:bg-red-200 transition text-sm sm:text-base"
                            title="Report this profile"
                        >
                            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                            Report
                        </button>
                    </div>

                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-4 sm:p-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Report Profile</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Why are you reporting {profile.name}?
                        </p>
                        
                        <div className="mb-4 space-y-2">
                            {['Fake profile', 'Inappropriate content', 'Harassment', 'Spam', 'Other'].map((reason) => (
                                <label key={reason} className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="text-sm sm:text-base text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportReason('');
                                }}
                                disabled={isReporting}
                                className="px-4 py-2 rounded-lg text-sm sm:text-base text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                disabled={isReporting || !reportReason}
                                className="px-4 py-2 rounded-lg text-sm sm:text-base text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {isReporting ? 'Reporting...' : 'Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}