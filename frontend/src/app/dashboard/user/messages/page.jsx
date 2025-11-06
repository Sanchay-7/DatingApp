'use client';

import React, { useState } from 'react';
import { Send, ArrowLeft } from 'lucide-react';

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    // --- THIS IS THE FIX ---
    // The dummy data has been removed.
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    // --- END OF FIX ---

    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const newMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'self',
        };

        setMessages([...messages, newMessage]);
        setInput('');
    };

    const isChatOpenOnMobile = selectedChat !== null;
    const isListOpenOnMobile = selectedChat === null;


    return (
        <div className="p-4 md:p-8 h-full bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 hidden lg:block">Messages</h1>

            <div className="flex flex-col lg:flex-row lg:h-[80vh] min-h-full border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">

                {/* COLUMN 1: Conversation List */}
                <div className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50 overflow-y-auto ${isChatOpenOnMobile ? 'hidden lg:block' : 'block'}`}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 lg:hidden">Chats</h1>
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 text-gray-900"
                        />
                    </div>

                    <div className="space-y-1">
                        {conversations.length > 0 ? (
                            conversations.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat.id)}
                                    className={`p-3 flex items-center cursor-pointer ${selectedChat === chat.id ? 'bg-indigo-100 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                                >
                                    <div className={`w-10 h-10 ${selectedChat === chat.id ? 'bg-indigo-200' : 'bg-gray-200'} rounded-full mr-3`}></div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{chat.name}</p>
                                        <p className={`text-xs truncate ${selectedChat === chat.id ? 'text-indigo-600' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No conversations found.</p>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: Chat Window */}
                <div className={`w-full flex-grow flex flex-col ${isListOpenOnMobile ? 'hidden lg:flex' : 'flex'}`}>

                    <header className="p-4 border-b border-gray-100 shadow-sm flex items-center flex-shrink-0">
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="lg:hidden p-1 mr-3 text-gray-700 hover:text-indigo-600"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <p className="text-lg font-bold text-gray-800">
                            {selectedChat
                                ? conversations.find(c => c.id === selectedChat)?.name || "Chat"
                                : "Select a conversation"}
                        </p>
                    </header>

                    <div className="overflow-y-auto p-6 space-y-4 flex-grow">
                        {messages.length > 0 ? (
                            messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-xl max-w-xs ${msg.sender === 'self' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500 text-center flex-grow flex items-center justify-center">
                                {selectedChat ? 'No messages yet.' : 'Select a conversation to start chatting.'}
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className={`border-t p-4 flex space-x-2 bg-white flex-shrink-0 ${!selectedChat ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                            disabled={!selectedChat}
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center"
                            disabled={!selectedChat}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}