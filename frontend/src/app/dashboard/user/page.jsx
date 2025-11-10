'use client';

import React, { useState, useEffect } from 'react';
// Import your components
import PhotoGallery from '@/components/PhotoGallery';
import ProfileCard from '@/components/ProfileCard';

// Get the API base URL from environment variables
// This should be http://localhost:5000 from your .env.local file
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
    // Make sure we have the correct token name from your signin page
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
      console.log("Attempting to fetch profiles..."); // New console log
      setIsLoading(true);
      try {
        // THIS IS THE CORRECT ENDPOINT
        const data = await apiFetch('/api/v1/users/discover');
        
        console.log("Fetched data:", data); // New console log

        // Our backend sends { success: true, users: [...] }
        setAllProfiles(data.users || []);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        // If auth fails (e.g., bad token), redirect to login
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          console.error("Auth error, user should be redirected to signin.");
          // window.location.href = '/signin';
        }
        setAllProfiles([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Check if the API URL is loaded
    if (!API_BASE_URL) {
      console.error("FATAL: NEXT_PUBLIC_API_BASE_URL is not defined.");
      console.log("Please check your .env.local file in the /frontend folder.");
      setIsLoading(false);
      setAllProfiles([]);
      return;
    }

    fetchProfiles();
  }, []); // Empty array means "run once"


  // --- USER ACTIONS (LIKE/SKIP) ---

  // Removes the top card (profile) from the stack
  const goToNextProfile = () => {
    setAllProfiles((currentProfiles) => currentProfiles.slice(1));
  };

  const handleLike = async (profileId) => {
    console.log("Liking profile:", profileId);
    try {
      // Call the 'like' endpoint
      const data = await apiFetch('/api/v1/users/like', {
        method: 'POST',
        body: JSON.stringify({ swipedUserId: profileId }),
      });

      console.log('Liked response:', data);
      
      // Check if it was a match!
      if (data.match) {
        // TODO: Show a "It's a Match!" modal
        alert("It's a Match!");
      }
      goToNextProfile();

    } catch (error) {
      console.error("Failed to 'like' user:", error);
    }
  };

  const handleSkip = async (profileId) => {
    console.log("Skipping profile:", profileId);
    try {
      // Call the 'skip' endpoint
      await apiFetch('/api/v1/users/skip', {
        method: 'POST',
        body: JSON.stringify({ swipedUserId: profileId }),
      });
      console.log('Skipped profile');
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