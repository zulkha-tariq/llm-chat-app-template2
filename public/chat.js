/**
 * LLM Chat App Frontend
 * Fully Functional Version
 * Features:
 * ✅ Chat history persistence using localStorage
 * ✅ Hyperlink rendering
 * ✅ Markdown-style links support
 * ✅ Typing indicator
 * ✅ Auto scroll
 * ✅ Clear history support
 * ✅ Assistant/User message styling support
 */

// DOM Elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Chat State
let isProcessing = false;

// Load chat history from localStorage
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [
  {
    role: "assistant",
    content:
      "Hello! I'm an AI chatbot powered by Cloudflare Workers AI. How can I help you today?",
  },
];

// ==========================
// INITIALIZE CHAT
// ==========================
renderChatHistory();

// Auto-resize textarea
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Send message with Enter
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Send button click
sendButton.addEventListener("click", sendMessage);

// ==========================
// SEND MESSAGE
// ==========================
async function sendMessage() {
  const message = userInput.value.trim();

  if (!message || isProcessing) return;

  isProcessing = true;

  // Disable input
  userInput.disabled = true;
  sendButton.disabled = true;

  // Add user message
  addMessage("user", message);

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";

  // Show typing
  typingIndicator.style.display = "flex";

  try {
    // API Request
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
      }),
    });

    const data = await response.json();

    typingIndicator.style.display = "none";

    // Assistant response
    const aiMessage =
      data.response || "Sorry, I could not process your request.";

    addMessage("assistant", aiMessage);
  } catch (error) {
    typingIndicator.style.display = "none";

    addMessage(
      "assistant",
      "❌ Error connecting to the server. Please try again."
    );

    console.error(error);
  }

  // Enable input
  isProcessing = false;
  userInput.disabled = false;
  sendButton.disabled = false;

  userInput.focus();
}

// ==========================
// ADD MESSAGE
// ==========================
function addMessage(role, content) {
  // Save in history
  chatHistory.push({
    role,
    content,
  });

  // Save to localStorage
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

  // Create message element
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  // Convert links
  messageDiv.innerHTML = formatMessage(content);

  chatMessages.appendChild(messageDiv);

  // Auto scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================
// FORMAT MESSAGE
// ==========================
function formatMessage(text) {
  // Escape HTML first
  let formatted = text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert markdown links
  // Example: [Google](https://google.com)
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // Convert plain URLs into clickable links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );

  // Line breaks
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
}

// ==========================
// RENDER SAVED HISTORY
// ==========================
function renderChatHistory() {
  chatMessages.innerHTML = "";

  chatHistory.forEach((msg) => {
    const messageDiv = document.createElement("div");

    messageDiv.className = `message ${msg.role}`;

    messageDiv.innerHTML = formatMessage(msg.content);

    chatMessages.appendChild(messageDiv);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================
// CLEAR CHAT HISTORY
// ==========================
function clearChatHistory() {
  localStorage.removeItem("chatHistory");

  chatHistory = [
    {
      role: "assistant",
      content:
        "Chat history cleared successfully. How can I help you now?",
    },
  ];

  renderChatHistory();
}

// ==========================
// OPTIONAL: ADD CLEAR BUTTON
// ==========================

// Example:
// <button onclick="clearChatHistory()">Clear Chat</button>

// ==========================
// OPTIONAL: DARK MODE SUPPORT
// ==========================

// CSS classes expected:
// .message.user
// .message.assistant
// .message a
// .typing-indicator

console.log("✅ Chat app initialized successfully");
