import React from 'react';

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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-4 antialiased">
      <div className="max-w-md w-full text-center border border-pink-300 rounded-2xl bg-gray-50 p-8 shadow-2xl shadow-pink-500/20 flex flex-col items-center">
        <div className="mb-6">
          <RotatingClockIcon />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-pink-500">One moment…</h1>
        <p className="text-gray-600 text-base max-w-xs">
          Your profile is hidden while we're verifying your identity. It should only take a few minutes to complete.
        </p>
      </div>
    </div>
  );
}