# Gemini AI Chatbot

A modern, responsive web-based chatbot powered by Google Gemini AI, built with Node.js, Express, and Vanilla JavaScript.

---

## Features

- **Conversational AI**: Uses Google Gemini API for natural language chat.
- **Modern UI**: Responsive, clean design with custom dialogs and smooth animations.
- **Markdown & Code Support**: AI responses are rendered with Markdown formatting and syntax-highlighted code blocks.
- **Conversation Management**: Easily clear messages or start a new chat session.
- **Suggestion Chips**: Quick-start prompts for users.
- **Accessibility**: Keyboard navigation and focus management in dialogs.
- **Frontend/Backend Separation**: RESTful API backend and static frontend.

---

## Project Structure

```
gemini-chatbot-api/
├── index.js                # Express backend server
├── package.json            # Project dependencies and scripts
├── extract-text.js         # Utility for extracting text from Gemini API responses
├── public/
│   ├── index.html          # Main frontend HTML
│   ├── style.css           # Custom styles for chatbot UI
│   ├── script.js           # Frontend chat logic (API calls, DOM updates)
│   └── controls.js         # Chat control logic (dialogs, clear/reset actions)
└── README.md               # Project documentation
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd gemini-chatbot-api
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```
API_KEY=your_google_gemini_api_key
PORT=3000
```

### 3. Run the Server

```bash
npm start
```

The server will start at `http://localhost:3000`.

---

## Usage

- Open `http://localhost:3000` in your browser.
- Type a message and hit **Send**.
- Use **Clear Messages** to clear the chat but keep the session.
- Use **New Chat** to reset and return to the welcome screen.
- Click suggestion chips to try example prompts.

---

## Key Files

### [`index.js`](./index.js)
- Express server setup
- `/api/chat` POST endpoint for Gemini API
- Serves static files from `/public`

### [`package.json`](./package.json)
- Dependencies: `express`, `@google/genai`, `dotenv`, `cors`
- Scripts: `start`, `watch`

### [`public/controls.js`](./public/controls.js)
- Handles chat controls (clear, reset)
- Implements custom modal dialogs

### [`public/script.js`](./public/script.js)
- Handles chat form, API requests, message rendering
- Supports Markdown and code formatting

### [`public/style.css`](./public/style.css)
- Responsive layout
- Custom dialog, chat bubbles, suggestion chips, and animations

---

## Custom Dialogs

- Replaces browser `confirm` dialogs with a clean, animated modal.
- Keyboard accessible (Enter/ESC).
- Used for "Clear Messages" and "New Chat" actions.

---

## API Reference

### `POST /api/chat`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello, Gemini!" }
  ]
}
```

**Response:**
```json
{
  "result": "Hello! How can I assist you today?"
}
```

---

## Extending & Customizing

- **Styling**: Edit `public/style.css` for colors, layout, and animations.
- **Frontend Logic**: Add features in `public/script.js` or `controls.js`.
- **Backend**: Extend API endpoints in `index.js`.

---

## License

This project is licensed under the ISC License.

---

## Credits

- [Google Gemini AI](https://ai.google.dev/)
- [Express](https://expressjs.com/)
- [Marked.js](https://marked.js.org/) (for Markdown parsing)
- [Highlight.js](https://highlightjs.org/) (for code syntax highlighting)

---

## Author

Built by [Your Name] — 2024
