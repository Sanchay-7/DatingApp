// src/app/admin/moderation/page.jsx
'use client';

import React from 'react';
import { ShieldAlert, CheckSquare } from 'lucide-react';
import ImageComponent from 'next/image';
// IMPORT THE NEW COMPONENT
import AdminCard from '@/components/AdminCard';

// Dummy data for moderation queue
const MODERATION_QUEUE = [
    {
        id: 1,
        type: 'photo',
        content: 'https://via.placeholder.com/300x200/ff0000/ffffff?text=Reported+Photo',
        reason: 'Flagged for explicit content',
        reporter: 'User A',
        reportedUser: 'User X'
    },
    {
        id: 2,
        type: 'bio',
        content: 'I hate people who...',
        reason: 'Reported for hate speech / vulgar language in bio: "I hate people who..."',
        reporter: 'User B',
        reportedUser: 'User Y'
    },
    {
        id: 3,
        type: 'photo',
        content: 'https://via.placeholder.com/300x200/0000ff/ffffff?text=Photo+Inappropriate',
        reason: 'Flagged for non-person image (ad/spam)',
        reporter: 'User C',
        reportedUser: 'User Z'
    },
];

// Reusable Moderation Card Component - NOW WRAPPED IN <AdminCard />
const ModerationCard = ({ item }) => (
    // Removed all background/border styling from the div below, AdminCard handles it
    <AdminCard title={`Item ID: ${item.id} (For ${item.reportedUser})`}>
        <div className="flex justify-between items-center mb-3 border-b border-gray-600 pb-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.type === 'photo' ? 'bg-pink-600' : 'bg-indigo-600'} text-white`}>
                {item.type === 'photo' ? 'PHOTO REVIEW' : 'BIO/TEXT REVIEW'}
            </span>
            <p className="text-xs text-gray-400">Reported by: {item.reporter}</p>
        </div>

        {/* Content Display Area */}
        {item.type === 'photo' ? (
            <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                <ImageComponent
                    src={item.content}
                    alt="Reported Content"
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized={true}
                />
            </div>
        ) : (
            <div className="bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-sm text-red-400 font-medium mb-1">Reason:</p>
                <p className="text-sm text-white">{item.reason}</p>
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
            <button className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition">
                Approve (Dismiss Report)
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition">
                Take Action (Ban/Delete)
            </button>
        </div>
    </AdminCard>
);


export default function ModerationPage() {
    const totalPending = MODERATION_QUEUE.length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
                <ShieldAlert className="w-7 h-7 mr-3 text-red-500" />
                Content Moderation Queue
            </h1>

            {/* Overview Stats - NOW WRAPPED IN <AdminCard /> */}
            <div className="mb-8">
                <AdminCard title="Queue Status">
                    <p className="text-lg text-gray-300 font-medium">
                        Total Pending Items: <span className="text-red-500 font-bold">{totalPending}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Focus on items reported within the last 24 hours.</p>
                </AdminCard>
            </div>


            {/* Moderation Queue Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {totalPending > 0 ? (
                    MODERATION_QUEUE.map(item => (
                        <ModerationCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="lg:col-span-3 text-center p-12 bg-gray-800 rounded-xl">
                        <CheckSquare className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-xl text-gray-300">Queue Cleared! No pending moderation items.</p>
                    </div>
                )}
            </div>
        </div>
    );
}