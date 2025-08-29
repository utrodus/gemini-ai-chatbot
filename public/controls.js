// Chat control functions
console.log("Controls.js loaded");

// Custom dialog functionality
function showDialog(title, message, confirmText, confirmClass, callback) {
  const dialog = document.getElementById("custom-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogMessage = document.getElementById("dialog-message");
  const confirmBtn = document.getElementById("dialog-confirm");

  // Set dialog content
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;
  confirmBtn.textContent = confirmText;

  // Set confirm button class
  confirmBtn.className = "dialog-btn dialog-confirm";
  if (confirmClass) {
    confirmBtn.classList.add(confirmClass);
  }

  // No icon handling needed

  // Show dialog with animation
  dialog.classList.add("active");

  // Need a small delay for the animation to work properly
  requestAnimationFrame(() => {
    const content = dialog.querySelector(".dialog-content");
    if (content) {
      content.classList.add("visible");
    }
  });

  // Setup event listeners
  const closeDialog = () => {
    const content = dialog.querySelector(".dialog-content");
    if (content) {
      content.classList.remove("visible");
      content.classList.add("hiding");

      // Wait for animation to finish before hiding the dialog
      setTimeout(() => {
        dialog.classList.remove("active");
        content.classList.remove("hiding");
      }, 300);
    } else {
      // Fallback if content element not found
      dialog.classList.remove("active");
    }
  };

  const handleConfirm = () => {
    closeDialog();
    if (typeof callback === "function") {
      callback();
    }
  };

  // Remove any existing event listeners
  const closeBtn = document.getElementById("dialog-close");
  const cancelBtn = document.getElementById("dialog-cancel");
  const newCloseBtn = closeBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newConfirmBtn = confirmBtn.cloneNode(true);

  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  // Add event listeners
  newCloseBtn.addEventListener("click", closeDialog);
  newCancelBtn.addEventListener("click", closeDialog);
  newConfirmBtn.addEventListener("click", handleConfirm);

  // Close dialog when clicking outside
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeDialog();
    }
  });

  // Add keyboard support
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeDialog();
    } else if (e.key === "Enter") {
      handleConfirm();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  // Clean up event listener when dialog closes
  const cleanupListener = () => {
    document.removeEventListener("keydown", handleKeyDown);
    dialog.removeEventListener("transitionend", cleanupListener);
  };

  dialog.addEventListener("transitionend", cleanupListener);

  // Focus the confirm button for better accessibility
  setTimeout(() => {
    newConfirmBtn.focus();
  }, 50);
}

window.clearChatMessages = function () {
  showDialog(
    "Clear Messages",
    "This will remove all messages from the current conversation.",
    "Clear",
    "danger",
    function () {
      // Clear messages but keep context
      const chatBox = document.getElementById("chat-box");

      // Add clearing animation
      chatBox.classList.add("clearing");

      // Create system messages for the chat history
      const userPrompt = {
        role: "user",
        content:
          "Let's start fresh with a clean chat. Please acknowledge this message.",
      };

      const systemResponse = {
        role: "model",
        content:
          "Chat cleared. I'm ready for our conversation. How can I help you today?",
      };

      // Update conversation history with just these system messages
      if (window.setConversationHistory) {
        window.setConversationHistory([userPrompt, systemResponse]);
      }

      setTimeout(() => {
        // Remove all children
        while (chatBox.firstChild) {
          chatBox.removeChild(chatBox.firstChild);
        }

        // Remove animation class
        chatBox.classList.remove("clearing");

        // Add system message
        const msg = document.createElement("div");
        msg.classList.add("message", "bot");
        msg.textContent = systemResponse.content;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Update localStorage with new conversation history
        if (window.getConversationHistory) {
          localStorage.setItem(
            "chatHistory",
            JSON.stringify(window.getConversationHistory()),
          );
        } else {
          localStorage.removeItem("chatHistory");
        }
      }, 300);
    },
  );
};

window.resetChatSession = function () {
  showDialog(
    "Start New Chat",
    "This will clear the current conversation and return to the welcome screen.",
    "New Chat",
    "danger",
    function () {
      // Clear localStorage
      localStorage.removeItem("chatHistory");

      // Reload the page to reset everything
      window.location.reload();
    },
  );
};

// Initialize event listeners when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Attach click handlers to buttons
  const clearButton = document.getElementById("clear-chat");
  const resetButton = document.getElementById("reset-chat");

  if (clearButton) {
    console.log("Clear button found:", clearButton);
    clearButton.addEventListener("click", function () {
      console.log("Clear button clicked");
      window.clearChatMessages();
    });
    console.log("Clear button listener attached");
  } else {
    console.error("Clear button not found in DOM");
  }

  if (resetButton) {
    console.log("Reset button found:", resetButton);
    resetButton.addEventListener("click", function () {
      console.log("Reset button clicked");
      window.resetChatSession();
    });
    console.log("Reset button listener attached");
  } else {
    console.error("Reset button not found in DOM");
  }

  // Initialize custom dialog if it exists
  const customDialog = document.getElementById("custom-dialog");
  if (customDialog) {
    console.log("Custom dialog found");

    // No need to add initial styles here as they're handled in CSS
  } else {
    console.error("Custom dialog not found in DOM");
  }

  // Add logging to confirm the controls script is loaded
  console.log("Chat controls initialized");

  // Verify the buttons are in the DOM
  console.log("All buttons in document:", document.querySelectorAll("button"));
  console.log("Clear button by ID:", document.getElementById("clear-chat"));
  console.log("Reset button by ID:", document.getElementById("reset-chat"));
});
