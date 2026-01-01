import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./index.css";

function ChatApp() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- 1. Auto-scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 2. Socket Logic ---
  useEffect(() => {
    // This effect runs ONLY when 'joined' becomes true
    if (joined) {
      // Initialize socket
      socketRef.current = io("http://localhost:5000");
      
      // Send join event
      socketRef.current.emit("join", username);

      // LISTENERS
      // Listen for messages (Chat AND Notifications)
      socketRef.current.on("message", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      // Listen for user list updates
      socketRef.current.on("users", (userList) => {
        setUsers(userList);
      });

      // Cleanup on unmount or logout
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [joined]); // Dependency on 'joined'

  const handleJoin = () => {
    if (username.trim()) {
      setJoined(true); // This triggers the useEffect above
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("sendMessage", { username, message });
      setMessage("");
    }
  };

  const handleLogout = () => {
    setJoined(false);
    setMessages([]);
    setUsers([]);
    setUsername("");
    // Socket cleanup handled by useEffect return
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") action();
  };

  return (
    <div className="chat-container">
      {!joined ? (
        <div className="chat-header">
          <h2>UN PERU PODU</h2>
          <div className="username-input">
            <input
              type="text"
              placeholder="Enter Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleJoin)}
            />
            <button onClick={handleJoin}>Join</button>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-header joined">
            <h3>Welcome, {username}!</h3>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="users">
            <strong>Online:</strong> {users.join(", ")}
          </div>

          <div className="message-list">
            {messages.map((msg, index) => {
              // Identify if it is a System Notification or a User Message
              const isSystem = msg.username === "System";
              const isMe = msg.username === username;

              return (
                <div
                  key={index}
                  className={`message ${
                    isSystem ? "system" : isMe ? "me" : "other"
                  }`}
                >
                  {!isSystem && <div className="msg-user">{msg.username}</div>}
                  <div className="msg-text">{msg.message}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSendMessage)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatApp;