'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// An animated clock icon that rotates continuously.
const RotatingClockIcon = () => {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* The non-rotating part: the clock face circle */}
      <circle cx="30" cy="30" r="26" stroke="#EC4899" strokeWidth="4" />

      {/* The rotating part: the clock hands */}
      <g style={{ animation: 'spin 2s linear infinite', transformOrigin: '30px 30px' }}>
        <path
          d="M30 18 V30 H42" // A simple path for two hands at 90 degrees
          stroke="#EC4899"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default function WaitingPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState(
    "Your profile is hidden while we're verifying your identity. It should only take a few minutes."
  );

  useEffect(() => {
    // Function to check the user's status
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('valise_token');
        
        // If no token, they shouldn't be here. Send to login.
        if (!token) {
          router.push('/signin');
          return;
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        
        // Call the new status endpoint
        const res = await fetch(`${API_BASE}/api/auth/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          // If token is invalid (401), send to signin
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('valise_token');
            router.push('/signin');
          }
          throw new Error('Status check failed');
        }

        const data = await res.json();

        // --- LOGIC: Redirect based on status ---
        if (data.status === 'ACTIVE') {
          // ✅ ADMIN APPROVED! Go to dashboard
          router.push('/dashboard/user');
        } 
        else if (data.status === 'REJECTED' || data.status === 'BANNED') {
          // ❌ ADMIN REJECTED
          setStatusMessage('Your account has been rejected or suspended. Please contact support.');
          // Stop polling
          if (window.pollingInterval) clearInterval(window.pollingInterval);
        }
        // If 'PENDING_APPROVAL', do nothing. The loop will run again in 5s.

      } catch (error) {
        console.error("Polling error:", error.message);
      }
    };

    // 1. Run immediately on load
    checkStatus();

    // 2. Run every 5 seconds
    const intervalId = setInterval(checkStatus, 5000);
    window.pollingInterval = intervalId;

    // 3. Cleanup when leaving page
    return () => {
      clearInterval(intervalId);
      window.pollingInterval = null;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-4 antialiased">
      <div className="max-w-md w-full text-center border border-pink-300 rounded-2xl bg-gray-50 p-8 shadow-2xl shadow-pink-500/20 flex flex-col items-center">
        <div className="mb-6">
          <RotatingClockIcon />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-pink-500">One moment…</h1>
        <p className="text-gray-600 text-base max-w-xs">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}