'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Helper for badge styles
const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'ACTIVE') color = 'bg-green-100 text-green-800';
    if (status === 'PENDING_APPROVAL') color = 'bg-yellow-100 text-yellow-800';
    if (status === 'REJECTED' || status === 'BANNED') color = 'bg-red-100 text-red-800';

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
            {status}
        </span>
    );
};

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); // For verification modal
    const [verificationNote, setVerificationNote] = useState('');
    const router = useRouter();

    // --- FETCH USERS FROM API ---
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('admin_token');
                if (!token) {
                    router.push('/admin/login');
                    return;
                }

                const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
                // Fetching ALL users to manage them
                const res = await fetch(`${API_BASE}/api/v1/admin/users/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        router.push('/admin/login');
                        return;
                    }
                    throw new Error('Failed to fetch users');
                }

                const data = await res.json();
                setUsers(data.users || []);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [router]);
    // --- HANDLE BAN / REJECT ---
    const handleReject = async (userId, note = '') => {
        if(!confirm("Are you sure you want to reject/ban this user?")) return;

        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/reject`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ verificationNote: note }),
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, accountStatus: 'REJECTED' } : u));
                setSelectedUser(null);
                setVerificationNote('');
            }
        } catch (error) {
            console.error("Failed to reject user:", error);
        }
    };

    // --- HANDLE APPROVE ---
    const handleApprove = async (userId, note = '') => {
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/approve`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ verificationNote: note }),
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, accountStatus: 'ACTIVE' } : u));
                setSelectedUser(null);
                setVerificationNote('');
            }
        } catch (error) {
            console.error("Failed to approve user:", error);
        }
    };

    // --- OPEN VERIFICATION MODAL ---
    const openVerificationModal = (user) => {
        setSelectedUser(user);
        setVerificationNote('');
    };


    // Filter users based on search
    const filteredUsers = users.filter(user =>
        (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>

            <div className="bg-gray-700 p-4 md:p-6 rounded-xl shadow-2xl">

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    {/* Removed "Add User" button as admins don't usually create users manually */}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden lg:block overflow-x-auto bg-gray-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Status', 'Joined', 'Actions'].map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 text-gray-300">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-400">Loading users...</td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{user.firstName} {user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={user.accountStatus} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                                            {/* Action Buttons */}
                                            {user.accountStatus === 'PENDING_APPROVAL' && (
                                                <>
                                                    <button 
                                                        onClick={() => openVerificationModal(user)} 
                                                        className="text-blue-400 hover:text-blue-300" 
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(user.id)} 
                                                        className="text-green-400 hover:text-green-300" 
                                                        title="Quick Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleReject(user.id)} className="text-red-400 hover:text-red-300" title="Ban/Reject">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-400">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE LIST */}
                <div className="lg:hidden space-y-4">
                    {isLoading ? (
                        <p className="text-center py-10 text-gray-400">Loading users...</p>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-lg font-bold text-white">{user.firstName}</p>
                                    <StatusBadge status={user.accountStatus} />
                                </div>
                                <div className="space-y-1 text-sm text-gray-300 mb-4">
                                    <p><span className="font-semibold text-gray-400">Email:</span> {user.email}</p>
                                    <p><span className="font-semibold text-gray-400">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-3 pt-3 border-t border-gray-700">
                                    {user.accountStatus === 'PENDING_APPROVAL' && (
                                        <>
                                            <button 
                                                onClick={() => openVerificationModal(user)} 
                                                className="flex-1 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                            </button>
                                            <button 
                                                onClick={() => handleApprove(user.id)} 
                                                className="flex-1 p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handleReject(user.id)} className="flex-1 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center">
                                        <Trash2 className="w-4 h-4 mr-2" /> Ban/Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-10 text-gray-400">No users found.</p>
                    )}
                </div>

            </div>

            {/* VERIFICATION MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-white">User Verification - {selectedUser.firstName}</h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Email:</span>
                                    <p className="text-white font-medium">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Gender:</span>
                                    <p className="text-white font-medium">{selectedUser.gender || 'Not specified'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Joined:</span>
                                    <p className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Status:</span>
                                    <p className="text-white font-medium"><StatusBadge status={selectedUser.accountStatus} /></p>
                                </div>
                            </div>

                            {/* Selfie Verification Section */}
                            <div className="border border-yellow-500 bg-yellow-900/20 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-yellow-400 mb-4">📸 Selfie Verification</h3>
                                {selectedUser.selfiePhotoUrl ? (
                                    <div className="flex justify-center">
                                        <img
                                            src={selectedUser.selfiePhotoUrl}
                                            alt="User selfie"
                                            className="w-64 h-64 object-cover rounded-lg border-4 border-yellow-500 shadow-lg"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-red-400 text-center">⚠️ No selfie uploaded</p>
                                )}
                            </div>

                            {/* Profile Photos Section */}
                            <div className="border border-blue-500 bg-blue-900/20 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-blue-400 mb-4">🖼️ Profile Photos</h3>
                                {selectedUser.photos && selectedUser.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {selectedUser.photos.map((photoUrl, index) => (
                                            <img
                                                key={index}
                                                src={photoUrl}
                                                alt={`Profile photo ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg border-2 border-blue-500 shadow-md"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-red-400 text-center">⚠️ No profile photos uploaded</p>
                                )}
                            </div>

                            {/* Verification Note */}
                            <div>
                                <label className="block text-gray-400 mb-2">Admin Notes (Optional):</label>
                                <textarea
                                    value={verificationNote}
                                    onChange={(e) => setVerificationNote(e.target.value)}
                                    placeholder="Add notes about this verification (visible to other admins only)..."
                                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                                    rows="3"
                                />
                            </div>

                            {/* Verification Instructions */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-bold text-white mb-2">Verification Checklist:</h4>
                                <ul className="space-y-1 text-sm text-gray-300">
                                    <li>✅ Selfie matches profile photos</li>
                                    <li>✅ Face is clearly visible in selfie</li>
                                    <li>✅ Profile photos are appropriate</li>
                                    <li>✅ No signs of fake or duplicate account</li>
                                    <li>✅ User meets age requirements (18+)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-700">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(selectedUser.id, verificationNote)}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center"
                            >
                                <XCircle className="w-5 h-5 mr-2" />
                                Reject User
                            </button>
                            <button
                                onClick={() => handleApprove(selectedUser.id, verificationNote)}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Approve User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}