// app/messages/page.jsx
'use client';

import React from 'react';
import { Send } from 'lucide-react'; // This icon should now work after installation

const MessagesPage = () => {
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
                            // FIX: Added text-gray-900 for dark typed text
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 text-gray-900"
                        />
                    </div>
                    <div className="space-y-1">
                        {/* Placeholder for Conversations */}
                        <div className="p-3 flex items-center bg-indigo-100 border-l-4 border-indigo-600 cursor-pointer">
                            <div className="w-10 h-10 bg-indigo-200 rounded-full mr-3"></div>
                            <div>
                                <p className="font-semibold text-gray-800">Priya (Active)</p>
                                <p className="text-xs text-indigo-600">You: Hi, how are you?</p>
                            </div>
                        </div>
                        {/* Other chat placeholders... */}
                        <div className="p-3 flex items-center hover:bg-gray-50 cursor-pointer">
                            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                            <div>
                                <p className="font-semibold text-gray-800">Rohan API</p>
                                <p className="text-xs text-gray-500">I'm good, thanks!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Chat Window (Right Panel - 2/3 Width) */}
                <div className="w-2/3 flex flex-col justify-between">
                    <header className="p-4 border-b border-gray-100 shadow-sm">
                        <p className="text-lg font-bold text-gray-800">Chatting with Priya</p>
                    </header>

                    {/* Message Display Area */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        <div className="flex justify-start">
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-xl rounded-tl-none max-w-xs">
                                Hello! I saw your profile. How are you?
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white p-3 rounded-xl rounded-tr-none max-w-xs">
                                I'm great, thanks for asking!
                            </div>
                        </div>
                    </div>

                    {/* Message Input with Send Button */}
                    <div className="border-t p-4 flex space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            // FIX: Added text-gray-900 for dark typed text
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                        />
                        <button className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MessagesPage;