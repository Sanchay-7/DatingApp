// src/app/dashboard/admin/users/page.jsx
'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Trash2, Edit } from 'lucide-react';

// Dummy data for the table
const DUMMY_USERS = [
    { id: 1, name: "Alex Johnson", email: "alexj@email.com", status: "Active", joined: "12/02/23", gender: "Male" },
    { id: 2, name: "Sarah Lee", email: "sarahL@email.com", status: "Suspended", joined: "05/10/22", gender: "Female" },
    { id: 3, name: "Omar Khan", email: "omark@email.com", status: "Active", joined: "01/01/24", gender: "Male" },
    { id: 4, name: "Jane Doe", email: "janeD@email.com", status: "Active", joined: "08/15/23", gender: "Female" },
    { id: 5, name: "Chris Brown", email: "chrisb@email.com", status: "Suspended", joined: "03/20/23", gender: "Male" },
];

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
    const [users, setUsers] = useState(DUMMY_USERS);
    const [searchTerm, setSearchTerm] = useState('');

    const handleBan = (userId) => {
        // In a real app, this would call an API endpoint: POST /admin/user/ban/:userId
        alert(`Banning user ID: ${userId}`);
        // Locally update state to show change
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'Suspended' } : u));
    };

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
                            {users.filter(user =>
                                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((user) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}