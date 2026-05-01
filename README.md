# 🇮🇳 ECI Voting Assistant

A highly optimized, secure, and dynamic AI assistant designed to help Indian citizens navigate the election process, registration timelines, and necessary forms in an interactive and easy-to-follow way.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)
![Express](https://img.shields.io/badge/Express-5.2-000000.svg?logo=express)
![Google Gemini](https://img.shields.io/badge/Powered_by-Google_Gemini-4285F4.svg?logo=google)

---

## 🎯 Chosen Vertical
**Civic Technology & Public Utility**

We chose this vertical to address the critical need for accessible, accurate, and personalized voting information. Navigating government portals can be overwhelming; this assistant bridges the gap by providing conversational, tailored guidance based strictly on official data.

---

## 🚀 Key Features & Architectural Upgrades

This application has been meticulously engineered to meet the highest standards of modern web development:

### 🛡️ Security
* **Helmet.js:** The Express backend is fortified with `helmet` to automatically enforce strict Content Security Policies (CSP), mitigating XSS and clickjacking attacks.
* **Rate Limiting:** Protects the Google Gemini API from abuse and DDoS attacks by enforcing a strict 100-request per 15-minute quota per IP using `express-rate-limit`.
* **Sanitization:** All AI-generated Markdown is stripped of malicious payloads using `DOMPurify` before rendering on the frontend.

### ⚡ Efficiency & Performance
* **Response Compression:** The Express backend utilizes `compression` to gzip all static files and API JSON payloads, drastically reducing network transfer sizes.
* **Optimized Parsing:** Swapped basic Regex parsing for the highly optimized `marked` library to render complex AI markdown responses instantly.
* **Component Rendering:** React components utilize `React.memo` and `useCallback` to completely eliminate unnecessary re-renders during state changes.

### ♿ Accessibility (A11y)
* **Semantic HTML:** Fully semantic DOM structure utilizing `<main>`, `<header>`, and `<form>` tags.
* **Screen Reader Support:** Comprehensive ARIA labels (`aria-live`, `aria-label`) and explicit `<title>` tags on all inline SVGs.
* **Keyboard Navigation:** Implemented global `:focus-visible` CSS rules to ensure distinct visual outlines when navigating via the `<Tab>` key.

### 🧪 Comprehensive Testing
* **Frontend Tests:** Built with `vitest` and React Testing Library to validate UI rendering, user input, and component states.
* **Backend API Tests:** Utilizes `supertest` to rigorously test the Express `/api/chat` endpoints for both valid inputs and intentional bad requests (400 errors).

---

## 🧠 Approach and Logic

Our core approach centers around **Factual Accuracy** and **Context-Aware Logic**:

1. **Strict Guardrails**: To prevent AI hallucinations or misinformation, the Google Gemini API is constrained by a strict System Prompt. It is instructed that its *only* source of truth is `https://voters.eci.gov.in/`. 
2. **Deterministic Output**: The AI's `temperature` parameter is set to `0.1` to ensure highly factual, predictable, and logical responses.
3. **Dynamic User Context**: By selecting a "Voter Profile" (e.g., "First-Time Voter" or "NRI Voter"), the application injects this context directly into the AI's logic engine, tailoring the output dynamically.

---

## ⚙️ How the Solution Works

1. **Context Selection**: The user selects their specific demographic profile from the dropdown in the header.
2. **Payload Construction**: The application bundles the user's message, the chat history, and the context into a payload and sends it to the Express Backend (`/api/chat`).
3. **Google Services Integration**: The backend securely communicates with the **Google Gemini API** (`gemini-flash-lite-latest`) using the official `@google/genai` SDK.
4. **Sanitization & Rendering**: The AI responds with structured Markdown. The frontend parses it with `marked`, sanitizes it with `DOMPurify`, and renders it into the glassmorphism UI.

---

## 🤔 Assumptions Made

* **Source of Truth**: We assume that `https://voters.eci.gov.in/` contains the most up-to-date and legally accurate information regarding Indian elections.
* **Connectivity**: We assume the user has a stable internet connection to communicate with the application.
* **Model Capability**: We assume the `gemini-flash-lite-latest` model provides the optimal balance of reasoning capabilities and low-latency response times.

---

## 💻 Getting Started

### Prerequisites
* Node.js v18+
* A Google AI Studio API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-assistant
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

### Running the Application

**Development Mode (Hot Reloading):**
Runs both the Vite React frontend and the Express backend concurrently.
```bash
npm run dev
```

**Production Mode:**
Builds the optimized React app and serves it purely through the Express server.
```bash
npm run build
npm start
```

### Running Tests
Executes both the Vitest frontend suite and the Supertest backend API suite.
```bash
npm test
```
