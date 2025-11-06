'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const color = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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

    // --- THIS IS THE FIX ---
    // This useEffect is now back to its original "API-ready" state.
    // It doesn't add any dummy data, just sets loading to false.
    useEffect(() => {
        setIsLoading(false);
    }, []);
    // --- END OF FIX ---

    const handleBan = (userId) => {
        console.log(`Banning user ID: ${userId}`);
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'Suspended' } : u));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>

            <div className="bg-gray-700 p-4 md:p-6 rounded-xl shadow-2xl">

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
                    <button className="bg-pink-600 text-white py-3 px-5 rounded-lg hover:bg-pink-700 transition flex items-center justify-center space-x-2 w-full md:w-auto flex-shrink-0">
                        <UserPlus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add New User</span>
                    </button>
                </div>

                {/* 1. DESKTOP-ONLY TABLE (Hidden on mobile) */}
                <div className="hidden lg:block overflow-x-auto bg-gray-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Status', 'Joined', 'Gender', 'Actions'].map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 text-gray-300">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-400">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.joined}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button className="text-indigo-400 hover:text-indigo-300 transition"><Edit className="w-5 h-5" /></button>
                                            <button onClick={() => handleBan(user.id)} className="text-red-400 hover:text-red-300 transition"><Trash2 className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    {/* This is the "empty state" that will now show */}
                                    <td colSpan="6" className="text-center py-10 text-gray-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 2. MOBILE-ONLY CARD LIST (Hidden on large screens) */}
                <div className="lg:hidden space-y-4">
                    {isLoading ? (
                        <p className="text-center py-10 text-gray-400">Loading users...</p>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-lg font-bold text-white">{user.name}</p>
                                    <StatusBadge status={user.status} />
                                </div>
                                <div className="space-y-1 text-sm text-gray-300 mb-4">
                                    <p><span className="font-semibold text-gray-400">Email:</span> {user.email}</p>
                                    <p><span className="font-semibold text-gray-400">Joined:</span> {user.joined}</p>
                                    <p><span className="font-semibold text-gray-400">Gender:</span> {user.gender}</p>
                                </div>
                                <div className="flex space-x-3 pt-3 border-t border-gray-700">
                                    <button className="flex-1 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center space-x-2">
                                        <Edit className="w-4 h-4" /> <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleBan(user.id)}
                                        className="flex-1 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> <span>{user.status === 'Active' ? 'Ban' : 'Banned'}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        // This is the "empty state" that will now show
                        <p className="text-center py-10 text-gray-400">No users found.</p>
                    )}
                </div>

            </div>
        </div>
    );
}