# 🇮🇳 ECI Voting Assistant

A highly optimized, secure, and accessible AI-powered assistant designed to help Indian citizens navigate the election process, registration timelines, and necessary forms using official data from the Election Commission of India.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)
![Express](https://img.shields.io/badge/Express-5.2-000000.svg?logo=express)
![Google Gemini](https://img.shields.io/badge/Powered_by-Google_Gemini-4285F4.svg?logo=google)
![Tests](https://img.shields.io/badge/Tests-23_passing-brightgreen.svg)

---

## 🎯 Chosen Vertical
**Civic Technology & Public Utility**

We chose this vertical to address the critical need for accessible, accurate, and personalized voting information. Navigating government portals can be overwhelming; this assistant bridges the gap by providing conversational, tailored guidance based strictly on official data from [voters.eci.gov.in](https://voters.eci.gov.in/).

---

## 🚀 Key Features & Architectural Highlights

### 🧹 Code Quality
* **PropTypes Validation:** All React components (`ChatInput`, `MessageList`, `ChatHeader`) enforce strict runtime type-checking using `prop-types`.
* **JSDoc Documentation:** All core functions and API endpoints include comprehensive JSDoc comments for maintainability.
* **Error Boundary:** A dedicated `ErrorBoundary` component wraps the entire React application, preventing white-screen-of-death crashes and displaying graceful fallback UI.
* **Zero Lint Errors:** ESLint is configured and passes with zero errors and zero warnings across the entire codebase.
* **Clean Architecture:** Strict separation of concerns — API logic (`geminiService.js`), UI components (`/components`), and backend (`server.js`) are fully decoupled.

### 🛡️ Security
* **Helmet.js:** The Express backend enforces strict Content Security Policies (CSP) to mitigate XSS and clickjacking attacks.
* **Rate Limiting:** `express-rate-limit` restricts each IP to 100 requests per 15 minutes, preventing abuse and protecting the Google Gemini API quota.
* **CORS Restrictions:** Origin-based CORS policy restricts API access to only authorized domains (localhost + Render deployment).
* **Input Validation:** Backend enforces strict type-checking (`typeof`, `Array.isArray`) and a 2000-character max input length to prevent prompt injection attacks.
* **Payload Size Limiting:** `express.json({ limit: '16kb' })` prevents oversized request body attacks.
* **DOMPurify Sanitization:** All AI-generated Markdown is sanitized with an explicit allowlist of safe HTML tags and attributes before rendering, preventing XSS.
* **Secure Links:** All rendered links automatically include `target="_blank" rel="noopener noreferrer"` to prevent tabnapping vulnerabilities.

### ⚡ Efficiency
* **Response Compression:** `compression` middleware applies gzip to all server responses, drastically reducing network transfer sizes.
* **In-Memory API Caching:** A native `Map`-based cache with automatic eviction (max 500 entries) instantly serves repeated queries without calling the Google Gemini API, reducing latency and cost.
* **Optimized Markdown Parsing:** Uses the industry-standard `marked` library (with GFM enabled) instead of custom Regex for fast, reliable rendering.
* **React Performance:** Components use `React.memo` and `useCallback` to eliminate unnecessary re-renders.

### 🧪 Testing (23 Tests Passing)
* **Frontend Tests (15):** Covers rendering, user interaction, accessibility attributes, context switching, form submission, and AI response display using `vitest` + React Testing Library.
* **Backend API Tests (8):** Uses `supertest` to validate input validation (type checking, missing fields, max length), successful responses, context defaults, and security header presence.
* **CI/CD Pipeline:** GitHub Actions workflow (`.github/workflows/test.yml`) automatically runs linting and the full test suite on every push and pull request.

### ♿ Accessibility (A11y)
* **Semantic HTML:** Uses `<main>`, `<header>`, `<form>` elements for proper document structure.
* **Skip-to-Content Link:** A hidden "Skip to chat input" link becomes visible on `Tab` focus, allowing keyboard users to bypass the header.
* **Screen Reader Support:** `aria-live="polite"`, `aria-label`, `role="log"`, and `aria-labelledby` attributes throughout.
* **SVG Titles:** All inline SVGs include `<title>` tags for screen reader interpretation.
* **Focus Indicators:** Global `*:focus-visible` CSS rule ensures clear blue outlines on all interactive elements during keyboard navigation.
* **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables all animations and transitions for users with vestibular disorders.
* **Responsive Design:** Full mobile support via `@media (max-width: 768px)` breakpoint with optimized layout and typography.
* **Link Visibility:** AI response links use visible underlines (`text-decoration: underline`) for WCAG compliance.

### 🤖 Google Services
* **Google Gemini API:** Integrated via the official `@google/genai` SDK for conversational AI responses.
* **Context-Aware Prompting:** The system dynamically injects the user's selected voter profile into the Gemini system instruction, enabling personalized, context-aware responses.
* **Deterministic Output:** Temperature is set to `0.1` for factual, consistent, and non-hallucinating answers.
* **Strict Guardrails:** The system prompt constrains the model to only answer questions about Indian voting processes sourced from `voters.eci.gov.in`.
* **Explicit Error Handling:** Backend catches and translates all Google-specific HTTP error codes (429, 503, 403, 404) into user-friendly messages.
* **Efficient API Usage:** Caching layer prevents duplicate calls to the Gemini API, conserving quota.

---

## 🧠 Approach and Logic

1. **Strict Guardrails**: The Gemini API is constrained by a detailed System Prompt. Its *only* source of truth is `https://voters.eci.gov.in/`. If unsure, it admits ignorance rather than guessing.
2. **Deterministic Output**: Temperature is set to `0.1` to ensure highly factual, predictable responses.
3. **Dynamic User Context**: By selecting a "Voter Profile" (e.g., "First-Time Voter" or "NRI Voter"), the application injects this context into the AI's system instruction, tailoring output dynamically (e.g., recommending Form 6A exclusively to NRIs).

---

## ⚙️ How the Solution Works

1. **Context Selection**: The user selects their demographic profile from the dropdown.
2. **Payload Construction**: The app bundles the message, chat history, and context into a JSON payload and sends it to the Express Backend (`POST /api/chat`).
3. **Backend Validation**: The server validates input types, lengths, and checks the in-memory cache.
4. **Google Gemini Integration**: On cache miss, the backend calls the Google Gemini API with the constructed prompt and chat history.
5. **Sanitization & Rendering**: The AI Markdown response is parsed by `marked`, sanitized by `DOMPurify` with an explicit allowlist, and rendered into the glassmorphism UI.

---

## 🤔 Assumptions Made

* **Source of Truth**: `https://voters.eci.gov.in/` contains the most up-to-date and legally accurate election information.
* **Connectivity**: The user has a stable internet connection.
* **Model Capability**: `gemini-flash-lite-latest` provides optimal balance of reasoning and low-latency for real-time chat.

---

## 💻 Getting Started

### Prerequisites
* Node.js v18+
* A Google AI Studio API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
git clone <repository-url>
cd ai-assistant
npm install
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_key_here
```

### Running the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```
