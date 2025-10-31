// src/app/admin/users/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit } from 'lucide-react';

// DUMMY_USERS array has been removed.

// Helper component for the status badge color
const StatusBadge = ({ status }) => {
    const color = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
            {status}
        </span>
    );
};

export default function UserManagementPage() {
    // State is now initialized to an empty array
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- API FETCH LOGIC (SAVED FOR LATER) ---
    /*
    // TODO: After this PR is merged, uncomment this block.
    
    useEffect(() => {
        const API_ENDPOINT = "http://localhost:5000/api/admin/users"; 
        
        async function fetchUsers() {
            setIsLoading(true); 
            try {
                const response = await fetch(API_ENDPOINT); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json(); 
                setUsers(data.users || data); 
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setUsers([]); 
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, []); // Empty array means "run once"
    */

    // --- TEMPORARY: Simulate loading complete (since fetch is commented) ---
    useEffect(() => {
        setIsLoading(false);
    }, []);
    // --- END TEMPORARY ---

    const handleBan = (userId) => {
        // In a real app, this would call an API endpoint: POST /admin/user/ban/:userId
        console.log(`Banning user ID: ${userId}`);
        // REMOVED: alert(`Banning user ID: ${userId}`);

        // This local update is temporary. After the API call,
        // we would ideally re-fetch the user list or update based on success.
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'Suspended' } : u));
    };

    // Filtered users for the search bar
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>

            <div className="bg-gray-700 p-6 rounded-xl shadow-2xl">

                {/* Header and Search/Action Bar */}
                <div className="flex justify-between items-center mb-6 space-x-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    <button className="bg-pink-600 text-white py-3 px-5 rounded-lg hover:bg-pink-700 transition flex items-center space-x-2">
                        <UserPlus className="w-5 h-5" />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto bg-gray-800 rounded-lg">
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
                                            <button className="text-indigo-400 hover:text-indigo-300 transition">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                className="text-red-400 hover:text-red-300 transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}