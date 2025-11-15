// src/app/admin/moderation/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckSquare } from 'lucide-react';
import ImageComponent from 'next/image';
// IMPORT THE NEW COMPONENT
import AdminCard from '@/components/AdminCard';

// Dummy data for moderation queue - REMOVED

// Reusable Moderation Card Component
const ModerationCard = ({ item, onDismiss, onBan, isProcessing }) => {
    const hasPhoto = item.content && item.content.length > 0;
    
    return (
        <AdminCard title={`Report ID: ${item.id}`}>
            <div className="flex justify-between items-center mb-3 border-b border-gray-600 pb-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${hasPhoto ? 'bg-pink-600' : 'bg-indigo-600'} text-white`}>
                    {hasPhoto ? 'PHOTO REPORT' : 'REASON REPORT'}
                </span>
                <p className="text-xs text-gray-400">By: {item.reporter}</p>
            </div>
            <p className="text-sm text-gray-300 mb-3"><strong>User:</strong> {item.reportedUser}</p>

            {hasPhoto ? (
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
                    <p className="text-xs text-gray-500 mt-2">Reported at: {new Date(item.createdAt).toLocaleString()}</p>
                </div>
            )}

            <div className="flex space-x-2 mt-4">
                <button 
                    onClick={() => onDismiss(item.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-600 transition"
                >
                    {isProcessing ? 'Processing...' : 'Dismiss'}
                </button>
                <button 
                    onClick={() => onBan(item.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-600 transition"
                >
                    {isProcessing ? 'Processing...' : 'Ban User'}
                </button>
            </div>
        </AdminCard>
    );
};


export default function ModerationPage() {
    // State is now initialized to an empty array
    const [moderationQueue, setModerationQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [processingReportId, setProcessingReportId] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);

    const fetchQueue = async () => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        setIsLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                console.warn('No admin token.');
                window.location.href = '/admin/login';
                return;
            }

            const res = await fetch(`${API_BASE}/api/v1/admin/moderation`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/admin/login';
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const body = await res.json();
            setModerationQueue(body.queue || []);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Moderation queue error:', error);
            setModerationQueue([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = async (reportId) => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        setProcessingReportId(reportId);
        setActionMessage(null);
        
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setActionMessage('No admin token found');
                return;
            }

            const res = await fetch(`${API_BASE}/api/v1/admin/moderation/dismiss`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reportId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setActionMessage(`Error: ${data.error || 'Failed to dismiss report'}`);
                return;
            }

            setActionMessage(`✅ Report dismissed successfully`);
            // Remove the dismissed report from the queue
            setModerationQueue(prev => prev.filter(item => item.id !== reportId));
            
            // Clear message after 2 seconds
            setTimeout(() => setActionMessage(null), 2000);
        } catch (error) {
            console.error('Dismiss error:', error);
            setActionMessage(`Error: ${error.message}`);
        } finally {
            setProcessingReportId(null);
        }
    };

    const handleBan = async (reportId) => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        setProcessingReportId(reportId);
        setActionMessage(null);
        
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setActionMessage('No admin token found');
                return;
            }

            const res = await fetch(`${API_BASE}/api/v1/admin/moderation/ban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reportId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setActionMessage(`Error: ${data.error || 'Failed to ban user'}`);
                return;
            }

            setActionMessage(`✅ User banned successfully`);
            // Remove the report from the queue
            setModerationQueue(prev => prev.filter(item => item.id !== reportId));
            
            // Clear message after 2 seconds
            setTimeout(() => setActionMessage(null), 2000);
        } catch (error) {
            console.error('Ban error:', error);
            setActionMessage(`Error: ${error.message}`);
        } finally {
            setProcessingReportId(null);
        }
    };

    useEffect(() => {
        fetchQueue();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, []);

    const totalPending = moderationQueue.length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
                <ShieldAlert className="w-7 h-7 mr-3 text-red-500" />
                Content Moderation Queue
            </h1>

            {/* Action Message */}
            {actionMessage && (
                <div className={`mb-4 p-4 rounded-lg text-white ${actionMessage.includes('Error') ? 'bg-red-600' : 'bg-green-600'}`}>
                    {actionMessage}
                </div>
            )}

            {/* Overview Stats */}
            <div className="mb-8">
                <AdminCard title="Queue Status">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg text-gray-300 font-medium">
                                Total Pending Items: <span className="text-red-500 font-bold">{totalPending}</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Last updated: {lastRefresh.toLocaleTimeString()}</p>
                        </div>
                        <button
                            onClick={fetchQueue}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold transition"
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </AdminCard>
            </div>


            {/* Moderation Queue Grid */}
            {isLoading ? (
                <AdminCard title="Loading Queue...">
                    <p className="text-center text-gray-400">Loading items...</p>
                </AdminCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {totalPending > 0 ? (
                        moderationQueue.map(item => (
                            <ModerationCard 
                                key={item.id} 
                                item={item}
                                onDismiss={handleDismiss}
                                onBan={handleBan}
                                isProcessing={processingReportId === item.id}
                            />
                        ))
                    ) : (
                        <div className="lg:col-span-3 text-center p-12 bg-gray-800 rounded-xl">
                            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <p className="text-xl text-gray-300">Queue Cleared! No pending moderation items.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}