'use client';

import React, { useState, useEffect } from 'react';
// Import your components
import PhotoGallery from '@/components/PhotoGallery';
import ProfileCard from '@/components/ProfileCard';

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DashboardPage() {
  // State to hold profiles and loading status
  const [allProfiles, setAllProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- API HELPER FUNCTION ---
  /**
   * A helper function to make authenticated API calls.
   * It automatically gets the token from localStorage and sets headers.
   */
  const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('valise_token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers, // Allow custom headers
    };

    // Add the token if we have one
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies (good practice)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchProfiles() {
      setIsLoading(true);
      try {
        // Use our new endpoint and helper function!
        const data = await apiFetch('/api/v1/users/discover');
        
        // Our backend sends { success: true, users: [...] }
        setAllProfiles(data.users || []);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        // If auth fails (e.g., bad token), redirect to login
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          // window.location.href = '/signin';
          console.error("Auth error, user should be redirected to signin.");
        }
        setAllProfiles([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfiles();
  }, []); // Empty array means "run once"


  // --- USER ACTIONS (LIKE/SKIP) ---

  // Removes the top card (profile) from the stack
  const goToNextProfile = () => {
    // This removes the *first* profile from the array,
    // and the UI will re-render to show the *new* first profile.
    setAllProfiles((currentProfiles) => currentProfiles.slice(1));
  };

  const handleLike = async (profileId) => {
    try {
      // Call the 'like' endpoint
      const data = await apiFetch('/api/v1/users/like', {
        method: 'POST',
        body: JSON.stringify({ swipedUserId: profileId }),
      });

      console.log('Liked:', data);
      
      // Check if it was a match!
      if (data.match) {
        // TODO: Show a "It's a Match!" modal
        alert("It's a Match!");
      }

      // Go to the next profile
      goToNextProfile();

    } catch (error) {
      console.error("Failed to 'like' user:", error);
    }
  };

  const handleSkip = async (profileId) => {
    try {
      // Call the 'skip' endpoint
      await apiFetch('/api/v1/users/skip', {
        method: 'POST',
        body: JSON.stringify({ swipedUserId: profileId }),
      });

      // Go to the next profile
      goToNextProfile();

    } catch (error) {
      console.error("Failed to 'skip' user:", error);
    }
  };

  // The current profile is always the first one in the array
  const currentProfile = allProfiles[0];

  // --- LOADING AND ERROR STATES ---

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center text-xl text-gray-400">
        Finding profiles...
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex h-screen w-full justify-center items-center text-xl text-gray-500">
        No more profiles! Try checking back later.
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <main className="w-2/3 p-10 flex flex-col items-center overflow-y-auto">
          
          {/* We now pass the 'onLike' and 'onSkip' functions to the ProfileCard.
            Your ProfileCard component must have buttons that call these functions.
            I'm passing the full profileId to them.
          */}
          <ProfileCard 
            profile={currentProfile} 
            onLike={() => handleLike(currentProfile.id)} 
            onSkip={() => handleSkip(currentProfile.id)}
          />

          <div className="flex-grow"></div>
        </main>

        <PhotoGallery profile={currentProfile} />
      </div>
    </div>
  );
}