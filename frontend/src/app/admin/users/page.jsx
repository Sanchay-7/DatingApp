'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
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
    const handleReject = async (userId) => {
        if(!confirm("Are you sure you want to reject/ban this user?")) return;

        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/reject`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, accountStatus: 'REJECTED' } : u));
            }
        } catch (error) {
            console.error("Failed to reject user:", error);
        }
    };

    // --- HANDLE APPROVE ---
    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('admin_token');
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, accountStatus: 'ACTIVE' } : u));
            }
        } catch (error) {
            console.error("Failed to approve user:", error);
        }
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
                                                <button onClick={() => handleApprove(user.id)} className="text-green-400 hover:text-green-300" title="Approve">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
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
                                        <button onClick={() => handleApprove(user.id)} className="flex-1 p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                        </button>
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
        </div>
    );
}