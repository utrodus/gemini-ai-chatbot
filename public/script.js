const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Store conversation history
let conversationHistory = [];
let isProcessing = false;
let thinkingMessageElement = null;
let hasMessages = false;
let isInitializing = true;

// DOM elements
const emptyStateElement = document.getElementById("empty-state");
const typingIndicator = document.getElementById("typing-indicator");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Prevent multiple submissions while processing
  if (isProcessing) return;

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Disable input and button during processing
  isProcessing = true;
  toggleInputState(false);

  // Show typing indicator
  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.classList.add("active");

  // Hide empty state if this is the first message
  if (!hasMessages) {
    // Add hiding class for smooth animation
    if (emptyStateElement) {
      emptyStateElement.classList.add("hiding");
      emptyStateElement.style.opacity = "0";
      emptyStateElement.style.transform = "scale(0.9)";

      // After animation completes, hide it completely
      setTimeout(() => {
        if (emptyStateElement) {
          emptyStateElement.style.display = "none";
        }
      }, 500);
    }
    hasMessages = true;
  }

  // Add user message to UI
  appendMessage("user", userMessage);
  input.value = "";

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  console.log("Added user message, hasMessages:", hasMessages);

  // Create a temporary bot message for "thinking" state
  thinkingMessageElement = appendMessage("bot", "Gemini is thinking...");

  try {
    // Prepare the request to the backend
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();

    if (data.result) {
      // Update the bot's reply in the conversation history
      conversationHistory.push({
        role: "model",
        content: data.result,
      });

      // Replace the thinking message with the actual response
      // Instead of setting textContent, we'll remove the thinking message
      // and append a new message with markdown formatting
      if (thinkingMessageElement && thinkingMessageElement.parentNode) {
        chatBox.removeChild(thinkingMessageElement);
      }
      appendMessage("bot", data.result);
    } else {
      if (thinkingMessageElement && thinkingMessageElement.parentNode) {
        chatBox.removeChild(thinkingMessageElement);
      }
      appendMessage("bot", "Sorry, no response received.");
    }
  } catch (error) {
    console.error("Error fetching response:", error);
    if (thinkingMessageElement && thinkingMessageElement.parentNode) {
      chatBox.removeChild(thinkingMessageElement);
    }
    appendMessage("bot", "Failed to get response from server.");
    thinkingMessageElement = null;
  } finally {
    // Re-enable input and button after processing
    isProcessing = false;
    toggleInputState(true);

    // Save conversation history to local storage
    if (conversationHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
    }

    // Hide typing indicator
    typingIndicator.classList.remove("active");
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // For user messages, just use text with line breaks
  if (sender === "user") {
    // Process text to handle line breaks
    const formattedText = text
      .split("\n")
      .map((line) => document.createTextNode(line))
      .reduce((fragment, textNode, index, array) => {
        fragment.appendChild(textNode);
        // Add line break between lines, but not after the last line
        if (index < array.length - 1) {
          fragment.appendChild(document.createElement("br"));
        }
        return fragment;
      }, document.createDocumentFragment());

    msg.appendChild(formattedText);
  } else {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false,
      sanitize: false,
      highlight: function (code, language) {
        if (language && hljs.getLanguage(language)) {
          try {
            return hljs.highlight(code, { language }).value;
          } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
      },
    });

    // Clean the text to ensure proper markdown parsing
    const cleanText = text.replace(/\\n/g, "\n");

    // For bot messages, parse markdown using marked library
    msg.innerHTML = marked.parse(cleanText);

    // Add target="_blank" to all links to open in new tab
    const links = msg.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    // Apply syntax highlighting to code blocks
    const codeBlocks = msg.querySelectorAll("pre code");
    if (codeBlocks.length > 0) {
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block);

        // Add language badge if available
        const language = block.className.match(/language-(\w+)/)?.[1];
        if (language) {
          const pre = block.parentElement;
          const langBadge = document.createElement("div");
          langBadge.className = "code-language";
          langBadge.textContent = language;
          pre.insertBefore(langBadge, block);
        }
      });
    }
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element for potential updates
}

/**
 * Enable or disable the input field and submit button
 * @param {boolean} enabled - Whether the inputs should be enabled
 */
function toggleInputState(enabled) {
  input.disabled = !enabled;
  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = !enabled;

  // Optional: Add visual indicator
  if (enabled) {
    submitButton.querySelector("span").textContent = "Send";
    // Focus the input field after sending a message
    if (isProcessing === false && !isInitializing) {
      input.focus();
    }
  } else {
    submitButton.querySelector("span").textContent = "Sending...";
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Add animation classes to empty state elements
  animateEmptyState();

  // Set up suggestion chip functionality
  setupSuggestionChips();

  // Get chat box and check if it has messages
  const messagesInDOM = chatBox.querySelectorAll(".message").length > 0;

  // Only show empty state if there are no messages in the DOM
  if (!messagesInDOM) {
    // Show empty state
    if (emptyStateElement) {
      emptyStateElement.style.display = "flex"; // Ensure it's visible
      emptyStateElement.classList.remove("hiding"); // Remove any hiding class

      // Animate in
      setTimeout(() => {
        if (emptyStateElement) {
          emptyStateElement.style.opacity = "1";
          emptyStateElement.style.transform = "scale(1)";
        }
      }, 50);
    }
    hasMessages = false;
  } else {
    // Hide empty state if there are messages
    if (emptyStateElement) {
      emptyStateElement.style.display = "none";
    }
    hasMessages = true;
  }

  // Check if chat history exists in local storage
  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    try {
      conversationHistory = JSON.parse(savedHistory);

      // Restore messages in the UI if there are no messages already
      if (conversationHistory.length > 0 && !messagesInDOM) {
        // Hide empty state
        const emptyState = document.getElementById("empty-state");
        if (emptyState) {
          emptyState.style.display = "none";
        }
        hasMessages = true;

        // Restore messages from history
        conversationHistory.forEach((msg) => {
          appendMessage(msg.role === "user" ? "user" : "bot", msg.content);
        });
      }
    } catch (e) {
      console.error("Error parsing saved chat history", e);
      localStorage.removeItem("chatHistory");
    }
  }

  // Focus the input field on page load
  input.focus();
  isInitializing = false;
});

// Add staggered animation to empty state elements
function animateEmptyState() {
  const emptyState = document.getElementById("empty-state");
  if (emptyState) {
    // Add animation to icon
    const icon = emptyState.querySelector(".empty-state-icon");
    if (icon) {
      icon.style.opacity = "0";
      icon.style.animation = "fadeIn 0.5s ease-out forwards";
    }

    // Add animation to heading and paragraph
    const heading = emptyState.querySelector("h3");
    const paragraph = emptyState.querySelector("p");

    if (heading) {
      heading.style.opacity = "0";
      heading.style.animation = "fadeIn 0.5s ease-out 0.2s forwards";
    }

    if (paragraph) {
      paragraph.style.opacity = "0";
      paragraph.style.animation = "fadeIn 0.5s ease-out 0.3s forwards";
    }
  }
}

// Setup suggestion chips click handlers
function setupSuggestionChips() {
  const chips = document.querySelectorAll(".suggestion-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", function () {
      const message = this.getAttribute("data-message");
      if (message) {
        // Fill the input with the suggestion
        input.value = message;

        // Hide the empty state with animation
        if (emptyStateElement) {
          emptyStateElement.classList.add("hiding");
          hasMessages = true; // Mark that we now have messages

          // After animation completes, hide it completely
          setTimeout(() => {
            emptyStateElement.style.display = "none";
          }, 500);

          // State has already been updated
        }

        // Submit the form
        form.dispatchEvent(new Event("submit"));
      }
    });
  });
}

// Make conversation history accessible to controls.js
window.getConversationHistory = function () {
  return conversationHistory;
};

window.setConversationHistory = function (history) {
  conversationHistory = history;
};

window.addBotMessage = function (text) {
  return appendMessage("bot", text);
};
