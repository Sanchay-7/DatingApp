'use client';

import React, {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authFetch, clearAuthToken } from "@/lib/apiClient";
import { decryptPayload } from "@/lib/crypto";
import { getChatClient } from "@/lib/chatClient";
import { notifyNewMessage } from "@/lib/notifications";

const keyStorageKey = (conversationId) =>
    `conversation-key:${conversationId}`;

const storeConversationKey = (conversationId, key) => {
    if (typeof window === "undefined" || !key) return;
    window.sessionStorage.setItem(keyStorageKey(conversationId), key);
};

const loadConversationKey = (conversationId) => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(keyStorageKey(conversationId));
};

const decryptMessages = async (messages, key) => {
    return Promise.all(
    decryptMessages.map(async (msg) => {
            try {
                const text = await decryptPayload(key, msg);
                return { ...msg, text };
            } catch (err) {
                console.error("Failed to decrypt message:", err);
                return { ...msg, text: "[Unable to decrypt message]" };
            }
        })
    );
};

function MessagesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [messageError, setMessageError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const messagesEndRef = useRef(null);

    const activeConversation = useMemo(
        () =>
            conversations.find((conversation) => conversation.id === selectedConversationId) ||
            null,
        [conversations, selectedConversationId]
    );

    const activeKey = useMemo(() => {
        if (!activeConversation) return null;
        return (
            activeConversation.secretKey ||
            loadConversationKey(activeConversation.id)
        );
    }, [activeConversation]);

    const updateConversationPreview = useCallback(
        (conversationId, encryptedMessage, previewText) => {
            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.id === conversationId
                        ? {
                              ...conversation,
                              lastMessage: encryptedMessage,
                              preview: previewText,
                          }
                        : conversation
                )
            );
        },
        []
    );

    const loadConversations = useCallback(async () => {
        setIsLoadingConversations(true);
        try {
            const response = await authFetch("/api/chat/conversations");
            const items = response.conversations || [];

            const prepared = await Promise.all(
                items.map(async (conversation) => {
                    if (conversation.secretKey) {
                        storeConversationKey(
                            conversation.id,
                            conversation.secretKey
                        );
                    }

                    let preview = "";
                    if (conversation.lastMessage) {
                        try {
                            preview = await decryptPayload(
                                conversation.secretKey,
                                conversation.lastMessage
                            );
                        } catch (err) {
                            console.error("Failed to decrypt preview:", err);
                            preview = "[Encrypted message]";
                        }
                    }

                    return {
                        ...conversation,
                        preview,
                    };
                })
            );

            setConversations(prepared);

            const queryConversationId =
                searchParams.get("conversationId") || null;
            if (queryConversationId) {
                const exists = prepared.some(
                    (conversation) => conversation.id === queryConversationId
                );
                if (exists) {
                    setSelectedConversationId(queryConversationId);
                } else if (prepared.length > 0) {
                    setSelectedConversationId(prepared[0].id);
                } else {
                    setSelectedConversationId(null);
                }
            } else if (!selectedConversationId && prepared.length > 0) {
                setSelectedConversationId(prepared[0].id);
            } else if (prepared.length === 0) {
                setSelectedConversationId(null);
            }
        } catch (err) {
            console.error("Failed to load conversations:", err);
            setError(err.message || "Unable to load conversations.");
            if (err.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setIsLoadingConversations(false);
        }
    }, [router, searchParams, selectedConversationId]);

    useEffect(() => {
        loadConversations();
        
        // Load current user ID
        authFetch("/api/user/me")
            .then((response) => {
                if (response?.user?.id) {
                    setCurrentUserId(response.user.id);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch current user:", err);
            });
    }, [loadConversations]);

    useEffect(() => {
        const conversationId = searchParams.get("conversationId");
        if (conversationId) {
            setSelectedConversationId(conversationId);
        }
    }, [searchParams]);

    useEffect(() => {
        let cancelled = false;
        const fetchMessages = async () => {
            if (!selectedConversationId) {
                setMessages([]);
                return;
            }

            setIsLoadingMessages(true);
            try {
                const response = await authFetch(
                    `/api/chat/messages/${selectedConversationId}`
                );
                const key =
                    response.secretKey ||
                    loadConversationKey(selectedConversationId);

                if (key) {
                    storeConversationKey(selectedConversationId, key);
                }

                const decrypted = await decryptMessages(
                    response.messages || [],
                    key
                );

                if (!cancelled) {
                    setMessages(decrypted);
                    setMessageError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load messages:", err);
                    setMessageError(err.message || "Unable to load messages.");
                    setMessages([]);
                }
                if (err.status === 401) {
                    clearAuthToken();
                    router.push("/signin");
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingMessages(false);
                }
            }
        };

        fetchMessages();
        return () => {
            cancelled = true;
        };
    }, [selectedConversationId, router]);

    useEffect(() => {
        let channel;
        let isCancelled = false;

        const subscribe = async () => {
            if (!activeConversation || !currentUserId) return;
            const key = activeKey;
            if (!key) return;

            try {
                const client = await getChatClient();
                channel = client.channels.get(activeConversation.channel);
                channel.subscribe("message", async (msg) => {
                    if (isCancelled || !msg?.data) return;
                    const data = msg.data;
                    try {
                        const text = await decryptPayload(key, data);
                        
                        // Check if this is an incoming message (not from the current user)
                        const isIncomingMessage = data.senderId !== currentUserId;
                        
                        // Send notification for incoming message if enabled
                        if (isIncomingMessage) {
                            const notificationSettings = localStorage.getItem("userSettings");
                            const isNotificationEnabled = notificationSettings 
                                ? JSON.parse(notificationSettings).newMatchNotify 
                                : true;
                            
                            if (isNotificationEnabled) {
                                const senderName = activeConversation?.participants?.find(p => p.user?.id === data.senderId)?.user?.name 
                                    || activeConversation?.participants?.find(p => p.user?.id === data.senderId)?.user?.firstName 
                                    || "Someone";
                                notifyNewMessage(senderName, activeConversation.id);
                            }
                        }
                        
                        setMessages((prev) => {
                            if (prev.some((item) => item.id === data.id)) {
                                return prev;
                            }
                            return [
                                ...prev,
                                {
                                    id: data.id,
                                    senderId: data.senderId,
                                    createdAt: data.createdAt,
                                    text,
                                },
                            ];
                        });
                        updateConversationPreview(
                            activeConversation.id,
                            data,
                            text
                        );
                    } catch (err) {
                        console.error("Failed to decrypt incoming message:", err);
                    }
                });
            } catch (err) {
                console.error("Failed to subscribe to conversation:", err);
            }
        };

        subscribe();

        return () => {
            isCancelled = true;
            if (channel) {
                channel.unsubscribe("message");
            }
        };
    }, [activeConversation, activeKey, currentUserId, updateConversationPreview]);

    // Subscribe to all user's conversations for live conversation list updates
    useEffect(() => {
        let channels = [];
        let isCancelled = false;

        const subscribeToAllConversations = async () => {
            if (!currentUserId || conversations.length === 0) return;

            try {
                const client = await getChatClient();
                
                for (const conversation of conversations) {
                    const channel = client.channels.get(conversation.channel);
                    channels.push(channel);
                    
                    channel.subscribe("message", async (msg) => {
                        if (isCancelled || !msg?.data) return;
                        const data = msg.data;
                        
                        // Only update conversation list if this is NOT the active conversation
                        // (active conversation updates are handled separately)
                        if (conversation.id !== selectedConversationId) {
                            try {
                                const key = conversation.secretKey || loadConversationKey(conversation.id);
                                if (key) {
                                    const text = await decryptPayload(key, data);
                                    updateConversationPreview(conversation.id, data, text);
                                }
                            } catch (err) {
                                console.error("Failed to decrypt conversation preview:", err);
                            }
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to subscribe to conversations:", err);
            }
        };

        subscribeToAllConversations();

        return () => {
            isCancelled = true;
            channels.forEach((channel) => {
                try {
                    channel.unsubscribe("message");
                } catch (err) {
                    console.error("Failed to unsubscribe:", err);
                }
            });
        };
    }, [conversations, currentUserId, selectedConversationId, updateConversationPreview]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSelectConversation = (conversationId) => {
        setSelectedConversationId(conversationId);
        router.push(
            `/dashboard/user/messages?conversationId=${conversationId}`,
            { scroll: false }
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!activeConversation || !input.trim()) return;

        setIsSending(true);
        setMessageError(null);
        const plainText = input.trim();

        try {
            const response = await authFetch("/api/chat/messages", {
                method: "POST",
                body: {
                    conversationId: activeConversation.id,
                    message: plainText,
                },
            });

            const encryptedMessage = response.message;
            const key = activeKey;
            let text = plainText;

            if (key) {
                try {
                    text = await decryptPayload(key, encryptedMessage);
                } catch (err) {
                    console.error("Failed to decrypt sent message:", err);
                }
            }

            setInput("");

            setMessages((prev) => {
                if (prev.some((item) => item.id === encryptedMessage.id)) {
                    return prev;
                }
                return [
                    ...prev,
                    {
                        id: encryptedMessage.id,
                        senderId: encryptedMessage.senderId,
                        createdAt: encryptedMessage.createdAt,
                        text,
                    },
                ];
            });

            updateConversationPreview(
                activeConversation.id,
                encryptedMessage,
                text
            );
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessageError(err.message || "Failed to send message.");
            if (err.status === 401) {
                clearAuthToken();
                router.push("/signin");
            }
        } finally {
            setIsSending(false);
        }
    };

    const isChatOpenOnMobile = Boolean(selectedConversationId);
    const isListOpenOnMobile = !isChatOpenOnMobile;

    return (
        <div className="p-4 md:p-8 h-full bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 hidden lg:block">
                Messages
            </h1>

            <div className="flex flex-col lg:flex-row lg:h-[80vh] min-h-full border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
                <div
                    className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50 overflow-y-auto ${
                        isChatOpenOnMobile ? "hidden lg:block" : "block"
                    }`}
                >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 lg:hidden">
                            Chats
                        </h1>
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 text-gray-900"
                            disabled
                        />
                    </div>

                    <div className="space-y-1">
                        {isLoadingConversations ? (
                            <p className="p-4 text-sm text-gray-500">
                                Loading conversations...
                            </p>
                        ) : conversations.length > 0 ? (
                            conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() =>
                                        handleSelectConversation(
                                            conversation.id
                                        )
                                    }
                                    className={`p-3 flex items-center cursor-pointer ${
                                        selectedConversationId ===
                                        conversation.id
                                            ? "bg-indigo-100 border-l-4 border-indigo-600"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden relative">
                                        {conversation.participant?.photo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={conversation.participant.photo}
                                                alt={conversation.participant.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : null}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                                            conversation.participant?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                    </div>
                                    <div className="grow">
                                        <p className="font-semibold text-gray-800">
                                            {conversation.participant?.name ||
                                                "Conversation"}
                                        </p>
                                        <p
                                            className={`text-xs truncate ${
                                                selectedConversationId ===
                                                conversation.id
                                                    ? "text-indigo-600"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {conversation.preview ||
                                                "Tap to start chatting"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">
                                No conversations yet. Start one by liking a
                                profile.
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className={`w-full grow flex flex-col ${
                        isListOpenOnMobile ? "hidden lg:flex" : "flex"
                    }`}
                >
                    <header className="p-4 border-b border-gray-100 shadow-sm flex items-center shrink-0">
                        <button
                            onClick={() => setSelectedConversationId(null)}
                            className="lg:hidden p-1 mr-3 text-gray-700 hover:text-indigo-600"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3">
                            <p className="text-lg font-bold text-gray-800">
                                {activeConversation
                                    ? activeConversation.participant?.name ||
                                      "Chat"
                                    : "Select a conversation"}
                            </p>
                            {activeConversation?.participant && (
                                <span className={`flex items-center gap-1.5 text-xs font-medium ${
                                    activeConversation.participant.isOnline ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        activeConversation.participant.isOnline 
                                            ? 'bg-green-500 animate-pulse' 
                                            : 'bg-gray-400'
                                    }`}></div>
                                    {activeConversation.participant.isOnline ? 'Online' : 'Offline'}
                                </span>
                            )}
                        </div>
                    </header>

                    <div className="overflow-y-auto p-6 space-y-4 grow">
                        {messageError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {messageError}
                            </div>
                        )}

                        {isLoadingMessages ? (
                            <p className="text-center text-sm text-gray-500">
                                Loading messages...
                            </p>
                        ) : messages.length > 0 ? (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.senderId === activeConversation?.participant?.id
                                            ? "justify-start"
                                            : "justify-end"
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-xl max-w-xs ${
                                            msg.senderId ===
                                            activeConversation?.participant?.id
                                                ? "bg-gray-200 text-gray-800 rounded-tl-none"
                                                : "bg-indigo-600 text-white rounded-tr-none"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        ) : activeConversation ? (
                            <p className="p-4 text-sm text-gray-500 text-center grow flex items-center justify-center">
                                No messages yet. Say hi!
                            </p>
                        ) : (
                            <p className="p-4 text-sm text-gray-500 text-center grow flex items-center justify-center">
                                Select a conversation to start chatting.
                            </p>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className={`border-t p-4 flex space-x-2 bg-white shrink-0 ${
                            !activeConversation ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            className="grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                            disabled={!activeConversation}
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={!activeConversation || isSending}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="p-4 md:p-8 h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        }>
            <MessagesPageContent />
        </Suspense>
    );
}