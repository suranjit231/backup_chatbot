import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import styles from "./ChatApp.module.css";

// Establish socket connection
const socket = io.connect(process.env.REACT_APP_SERVER_URL || "http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const ChatApp = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState(null);
  const [inputType, setInputType] = useState("text");
  const [placeholder, setPlaceholder] = useState("Type your message...");
  const [isLoading, setIsLoading] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [agentInfo, setAgentInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat and handle connection events
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      addMessage('Connection error. Please try again later.', 'error');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      addMessage('Disconnected from server. Attempting to reconnect...', 'error');
      setIsAgentMode(false);
      setAgentInfo(null);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  // Listen for bot and agent responses
  useEffect(() => {
    const handleResponse = (response) => {
      console.log('Received response:', response);
      setIsLoading(false);

      if (response.type === 'agent_handoff') {
        setIsAgentMode(true);
        if (response.agentInfo) {
          setAgentInfo(response.agentInfo);
        }
        addMessage(response.message, 'system');
        return;
      }

      if (response.type === 'system' && response.message.includes('Lost connection')) {
        setIsAgentMode(false);
        setAgentInfo(null);
      }

      switch (response.type) {
        case 'agent_message':
          addMessage(response.message, 'agent');
          break;

        case 'message':
          addMessage(response.message, 'received');
          break;

        case 'question':
          addMessage(response.message, 'received');
          setCurrentOptions(response.options);
          break;

        case 'input':
          addMessage(response.message, 'received');
          setPlaceholder(response.placeholder || 'Type your message...');
          setInputType(response.inputType || 'text');
          break;

        case 'error':
          addMessage(response.message, 'error');
          break;

        case 'system':
          addMessage(response.message, 'system');
          break;

        default:
          console.warn('Unknown response type:', response.type);
          addMessage(response.message || 'Received message', 'received');
      }
    };

    socket.on('bot_response', handleResponse);
    console.log('Registered response listener');

    return () => {
      socket.off('bot_response', handleResponse);
    };
  }, []);

  const handleClickSendMessageButton = () => {
    if (message.trim() === "") return;

    const userMessage = message.trim();
    addMessage(userMessage, "send");
    setMessage("");
    setCurrentOptions(null);
    setIsLoading(true);

    console.log('Sending message in mode:', isAgentMode ? 'agent' : 'bot');

    // Send message based on mode
    if (isAgentMode) {
      socket.emit("agent_message", userMessage);
    } else {
      socket.emit("send_message", userMessage);
    }
  };

  const handleOptionClick = (option) => {
    addMessage(option.label, "send");
    setCurrentOptions(null);
    setIsLoading(true);

    // Send just the value string as server expects
    console.log('Sending option to server:', option.value);
    socket.emit("send_message", option.value);
  };

  const addMessage = (text, type) => {
    setMessages(prev => [...prev, { msg: text, messageType: type }]);
  };

  return (
    <div className={styles.chatContainer}>
      {agentInfo && (
        <div className={styles.agentHeader}>
          <span>Speaking with {agentInfo.name}</span>
        </div>
      )}
      <div className={styles.messages}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.messageType === "send" ? styles.sendBox :
              m.messageType === "error" ? styles.errorBox :
              m.messageType === "agent" ? styles.agentBox :
              m.messageType === "system" ? styles.systemBox :
              styles.receivedBox
            }
          >
            <p>{m.msg}</p>
          </div>
        ))}
        {isLoading && (
          <div className={styles.receivedBox}>
            <p>...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentOptions && (
        <div className={styles.optionsContainer}>
          {currentOptions.map((option, index) => (
            <button
              key={index}
              className={styles.optionButton}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputContainer}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.input}
          onKeyPress={(e) => e.key === "Enter" && handleClickSendMessageButton()}
          disabled={isLoading || (currentOptions && currentOptions.length > 0)}
        />
        <button 
          className={styles.sendButton} 
          onClick={handleClickSendMessageButton}
          disabled={isLoading || (currentOptions && currentOptions.length > 0)}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
