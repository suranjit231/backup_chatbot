import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './AgentPanel.css';

const AgentPanel = () => {
    const [chats, setChats] = useState(new Map());
    const [activeChat, setActiveChat] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [agentName] = useState('Agent ' + Math.floor(Math.random() * 1000));
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Create socket connection
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Register as agent
        newSocket.emit('register_agent', { name: agentName });
        console.log('Registering as agent:', agentName);

        // Listen for new user chats
        newSocket.on('new_user_chat', (data) => {
            console.log('New user chat received:', data);
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                newChats.set(data.userId, {
                    messages: data.chatHistory || [],
                    unread: true
                });
                return newChats;
            });
        });

        // Listen for user messages
        newSocket.on('user_message', (data) => {
            console.log('User message received:', data);
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                const chat = newChats.get(data.userId) || { messages: [] };
                
                // Check if this message already exists in the chat
                const messageExists = chat.messages.some(msg => 
                    msg.content === data.message && 
                    msg.timestamp === data.timestamp
                );
                
                if (!messageExists) {
                    chat.messages = [...chat.messages, {
                        sender: 'user',
                        content: data.message,
                        timestamp: data.timestamp
                    }];
                    chat.unread = activeChat !== data.userId;
                    newChats.set(data.userId, chat);
                }
                
                return newChats;
            });
        });

        // Listen for user disconnections
        newSocket.on('user_disconnected', (data) => {
            console.log('User disconnected:', data);
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                newChats.delete(data.userId);
                if (activeChat === data.userId) {
                    setActiveChat(null);
                }
                return newChats;
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [agentName]); // Only recreate socket when agentName changes



    // Toggle agent availability
    const toggleAvailability = () => {
        const newStatus = !isAvailable;
        setIsAvailable(newStatus);
        socket.emit('agent_status', { available: newStatus });
    };

    // Handle chat selection
    const selectChat = (userId) => {
        setActiveChat(userId);
        setChats(prevChats => {
            const newChats = new Map(prevChats);
            const chat = newChats.get(userId);
            if (chat) {
                chat.unread = false;
                newChats.set(userId, chat);
            }
            return newChats;
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (message.trim() && activeChat && socket) {
            const timestamp = new Date().toISOString();
            console.log('Agent sending message:', {
                toUser: activeChat,
                message: message.trim()
            });

            // Send message using agent_response event
            socket.emit('agent_response', {
                userId: activeChat,
                message: message.trim(),
                timestamp: timestamp
            });

            // Update local chat state
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                const chat = newChats.get(activeChat) || { messages: [] };
                
                // Check if this message already exists
                const messageExists = chat.messages.some(msg => 
                    msg.content === message.trim() && 
                    msg.sender === 'agent'
                );
                
                if (!messageExists) {
                    chat.messages = [...chat.messages, {
                        sender: 'agent',
                        content: message.trim(),
                        timestamp: timestamp
                    }];
                    newChats.set(activeChat, chat);
                }
                
                return newChats;
            });

            // Clear message input
            setMessage('');
        }
    };

    return (
        <div className="agent-panel">
            <div className="agent-header">
                <h2>{agentName}</h2>
                <div className="status-toggle">
                    <label>
                        Available:
                        <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={toggleAvailability}
                        />
                    </label>
                </div>
                <div className="active-chats">
                    Active Chats: {chats.size}
                </div>
            </div>
            
            <div className="chat-container">
                <div className="chat-list">
                    {chats.size === 0 ? (
                        <div className="no-chats">No active chats</div>
                    ) : (
                        Array.from(chats.entries()).map(([userId, chat]) => (
                            <div
                                key={userId}
                                className={`chat-item ${activeChat === userId ? 'active' : ''} ${chat.unread ? 'unread' : ''}`}
                                onClick={() => selectChat(userId)}
                            >
                                <div className="chat-preview">
                                    <span className="user-id">User {userId.slice(0, 6)}</span>
                                    {chat.unread && <span className="unread-indicator">●</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="chat-window">
                    {activeChat ? (
                        <>
                            <div className="messages">
                                {chats.get(activeChat)?.messages.map((msg, idx) => (
                                    <div key={idx} className={`message ${msg.sender}`}>
                                        <div className="message-content">{msg.content}</div>
                                        <div className="message-timestamp">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="message-input">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                />
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            Select a chat to start messaging
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentPanel;
