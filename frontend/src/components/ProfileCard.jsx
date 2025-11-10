// components/ProfileCard.jsx

import React from 'react';

// --- Helper function to calculate age ---
function calculateAge(birthday) {
  if (!birthday) return '';
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Receives the new props: profile, onLike, and onSkip
export default function ProfileCard({ profile, onLike, onSkip }) {
  if (!profile) return null;

  // --- Get correct data from the profile object ---
  const name = profile.firstName || 'User';
  const age = calculateAge(profile.birthday);
  const location = profile.currentLocation || 'Unknown location';
  const job = profile.work || 'No job listed';
  
  // Use the first photo from the 'photos' array, or a placeholder
  const mainPhoto = (profile.photos && profile.photos[0]) 
    ? profile.photos[0]
    : `https://placehold.co/600x600/f0f0f0/333?text=${name}`; // Placeholder

  // We don't have 'tags' in the new profile, so this is commented out.
  // const renderTags = () => ( ... );

  return (
    // Wrapper for the header and card
    <>
      {/* Header/Search Bar */}
      <header className="w-full max-w-xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Discover</h1>
        <input
          type="search"
          placeholder="Search (coming soon)..."
          disabled
          className="p-2 border border-gray-400 rounded-lg w-40 text-gray-800 placeholder-gray-500 focus:outline-none"
        />
      </header>

      {/* THE ACTUAL SINGLE PROFILE CARD */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="relative">
          {/* DYNAMIC PHOTO SOURCE */}
          <img
            src={mainPhoto}
            alt={`Current Match: ${name}`}
            className="w-full h-[480px] object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {/* DYNAMIC NAME AND AGE */}
            <h2 className="text-4xl font-extrabold">
              {name}{age ? `, ${age}` : ''}
            </h2>

            {/* DYNAMIC LOCATION AND JOB */}
            <p className="text-lg font-light mb-4">
              {location} | {job}
            </p>

            {/* DYNAMIC INTEREST TAGS - Removed as 'tags' data is not available */}
            {/* {renderTags()} */}
          </div>
        </div>

        {/* Action Buttons: Hooked up to onSkip and onLike */}
        <div className="flex justify-center space-x-8 p-6 bg-white">
          <button
            onClick={onSkip} // <-- UPDATED
            className="bg-gray-200 text-gray-600 p-4 rounded-full shadow-lg hover:bg-gray-300 transition transform hover:scale-105"
          >
            <span className="text-3xl">❌ SKIP</span>
          </button>
          <button
            onClick={onLike} // <-- UPDATED
            className="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition transform hover:scale-105"
          >
            <span className="text-3xl">❤️ LIKE</span>
          </button>
        </div>
      </div>
    </>
  );
}