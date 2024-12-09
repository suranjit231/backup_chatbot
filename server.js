import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import FlowData from "./FlowData.js";
import { ChatbotEngine } from './ChatbotEngine.js';

// Import routes
import apiRoutes from './routes/api.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Initialize ChatbotEngine with flow data
const chatbotEngine = new ChatbotEngine(FlowData);

// Agent management
const agents = new Map(); // Store agent socket connections
const userToAgentMap = new Map(); // Map user sessions to agents
const userSockets = new Map(); // Store user socket IDs

// Routes
app.use('/api', apiRoutes);

// Socket Connection Handler
io.on('connection', async(socket) => {
    console.log('User connected with ID:', socket.id);

    // Handle agent registration
    socket.on('register_agent', (data) => {
        console.log('Agent registering:', data);
        const agent = {
            id: socket.id,
            name: data.name,
            available: true
        };
        agents.set(socket.id, agent);
        console.log('Agent registered:', data.name);
    });

    // Handle agent responses to users
    socket.on('agent_response', (data) => {
        console.log('Agent sending response:', {
            fromAgent: socket.id,
            toUser: data.userId,
            message: data.message
        });

        io.to(data.userId).emit('bot_response', {
            type: 'agent_message',
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    // Handle messages from users in agent mode
    socket.on('agent_message', (message) => {
        console.log('Received message from user in agent mode:', {
            fromUser: socket.id,
            message: message
        });
        
        // Find the agent this user is connected to
        const agentId = userToAgentMap.get(socket.id);
        
        console.log('Looking up agent for user:', {
            userId: socket.id,
            foundAgentId: agentId,
            allMappings: Array.from(userToAgentMap.entries())
        });

        // ================== here user message is sening to agent ====================//
        if (agentId && agents.has(agentId)) {
            // Forward message to connected agent
            io.to(agentId).emit('user_message', {
                userId: socket.id,
                message: message,
                timestamp: new Date().toISOString()
            });
        } else {
            // No agent found - notify user and revert to bot mode
            socket.emit('bot_response', {
                type: 'system',
                message: 'Lost connection with agent. Returning to bot mode.',
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle user messages
    socket.on('send_message', async (message) => {
        try {
            console.log("send_message is triggered in line 120========================================")
            // Check if user is connected to an agent
            const agentId = userToAgentMap.get(socket.id);
            console.log("User message routing - Connected agent:", agentId);
            
            if (agentId && agents.has(agentId)) {
                // Skip forwarding - message will be handled by agent_message event
                return;
            }

            // No agent connection - process through chatbot
            const result = await chatbotEngine.processUserInput(socket.id, message);
            
            if (result.type === 'agent_handoff') {
                // User requested agent - find available one
                const availableAgent = Array.from(agents.values()).find(agent => agent.available);
                
                if (availableAgent) {
                    console.log('Connecting user to agent:', {
                        userId: socket.id,
                        agentId: availableAgent.id
                    });

                    // Create user-agent connection
                    userToAgentMap.set(socket.id, availableAgent.id);
                    agents.get(availableAgent.id).available = false;

                    // Send chat history to agent
                    io.to(availableAgent.id).emit('new_user_chat', {
                        userId: socket.id,
                        chatHistory: result.context.messages || [],
                        timestamp: new Date().toISOString()
                    });

                    // Notify user
                    socket.emit('bot_response', {
                        type: 'agent_handoff',
                        message: `Connected to ${availableAgent.name}. They will assist you shortly.`,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    socket.emit('bot_response', {
                        type: 'error',
                        message: 'All agents are currently busy. Please try again later.',
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                // Normal bot response
            console.log("normal boat response to users========================================")
                socket.emit('bot_response', {
                    type: result.type || 'message',
                    message: result.message,
                    options: result.options,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
            socket.emit('bot_response', {
                type: 'error',
                message: 'Error processing your message'
            });
        }
    });

    //================= Handle disconnection of socket so there is no memory leak ======//
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        
        if (agents.has(socket.id)) {
            // Agent disconnected
            console.log('Agent disconnected:', socket.id);
            
            // Notify any connected user
            for (const [userId, agentId] of userToAgentMap.entries()) {
                if (agentId === socket.id) {
                    io.to(userId).emit('bot_response', {
                        type: 'system',
                        message: 'Agent disconnected. You have been returned to the bot.'
                    });
                    userToAgentMap.delete(userId);
                }
            }
            
            agents.delete(socket.id);
        } else {
            // User disconnected - clean up any agent connection
            const agentId = userToAgentMap.get(socket.id);
            if (agentId && agents.has(agentId)) {
                agents.get(agentId).available = true;
                io.to(agentId).emit('user_disconnected', {
                    userId: socket.id,
                    timestamp: new Date().toISOString()
                });
                userToAgentMap.delete(socket.id);
            }
        }
    });

    // Initialize chat session
    try {
        const initResult = await chatbotEngine.initializeSession(socket.id);
        if (initResult.success) {
            socket.emit('bot_response', {
                type: 'message',
                message: initResult.message
            });
        }
    } catch (error) {
        console.error('Error initializing chat session:', error);
        socket.emit('bot_response', {
            type: 'error',
            message: 'Failed to initialize chat session'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
