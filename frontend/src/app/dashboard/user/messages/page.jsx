// src/app/dashboard/user/messages/page.jsx
'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function MessagesPage() {
    // 1. State for chat messages - DUMMY DATA REMOVED
    const [messages, setMessages] = useState([]);

    // State for the current input text
    const [input, setInput] = useState('');

    // State for the conversation list - DUMMY DATA REMOVED
    const [conversations, setConversations] = useState([]);

    // NOTE: A loading state and useEffect hook will be added here
    // by the backend team to fetch data from /api/conversations

    // 2. Function to handle sending a new message
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents page reload if called from a form
        if (input.trim() === '') return; // Don't send empty messages

        // This logic is temporary. The backend team will replace this
        // with an API call to send the message to the server.
        const newMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'self',
        };

        setMessages([...messages, newMessage]); // Add the new message to the list
        setInput(''); // Clear the input field
    };

    // NOTE: The hard-coded 'conversations' array was removed.
    // The component now maps over the empty 'conversations' state.

    return (
        <div className="p-8 h-full bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

            {/* 2nd & 3rd Column Container */}
            <div className="flex h-[80vh] border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">

                {/* Column 2: Conversation List (Left Panel - 1/3 Width) */}
                <div className="w-1/3 border-r border-gray-100 bg-gray-50 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 text-gray-900"
                        />
                    </div>

                    {/* This will now be empty until the API is connected */}
                    <div className="space-y-1">
                        {conversations.length > 0 ? (
                            conversations.map(chat => (
                                <div
                                    key={chat.id}
                                    // NOTE: 'isActive' logic will be replaced with a 'selectedChat' state
                                    className={`p-3 flex items-center cursor-pointer ${chat.isActive ? 'bg-indigo-100 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                                >
                                    <div className={`w-10 h-10 ${chat.isActive ? 'bg-indigo-200' : 'bg-gray-200'} rounded-full mr-3`}></div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{chat.name} ({chat.status})</p>
                                        <p className={`text-xs ${chat.isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No conversations found.</p>
                        )}
                    </div>
                </div>

                {/* Column 3: Chat Window (Right Panel - 2/3 Width) */}
                <div className="w-2/3 flex flex-col justify-between">
                    <header className="p-4 border-b border-gray-100 shadow-sm">
                        {/* NOTE: This will be dynamic based on selected chat */}
                        <p className="text-lg font-bold text-gray-800">Chat</p>
                    </header>

                    {/* Message Display Area */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {messages.length > 0 ? (
                            messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-xl max-w-xs ${msg.sender === 'self' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500 text-center">Select a conversation to start chatting.</p>
                        )}
                    </div>

                    {/* Message Input with Send Button */}
                    <form onSubmit={handleSubmit} className="border-t p-4 flex space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input} // Connects input value to React state
                            onChange={(e) => setInput(e.target.value)} // Updates state as user types
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}