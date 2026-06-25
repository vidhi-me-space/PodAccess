# PodAccess 🎙️

**PodAccess** is a full-stack, AI-powered platform that makes podcasts accessible to everyone. It converts audio into high-fidelity transcripts, creates substantial summaries, and supports multi-podcast management in a modern, dark-mode interface.

![Tech Stack](https://img.shields.io/badge/React-Tailwind-61DAFB?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square)
![Groq AI](https://img.shields.io/badge/Groq-AI%20Llama%203.3-orange?style=flat-square)

---

## 🚀 Key Features & Recent Updates

- **🌐 Multi-Podcast Tab System**: Just like a web browser, open multiple podcasts at once and switch between them instantly using the new top-level tab bar.
- **➕ Quick Start Button**: Use the "+" button in the tab bar to start processing new audio while keeping your current work open.
- **🌍 Professional Translation**: 
    - Full support for **Hindi** and **English**.
    - Intelligent paragraph formatting that recognizes Hindi punctuation (`।`).
    - Verbatim dialogue translation ensuring no part of the conversation is missed.
- **✍️ Enforced AI Summaries**:
    - **Short Summary**: Substantial ~120-word overview.
    - **Detailed Summary**: Exhaustive 350-400 word analysis with 5-6 structured paragraphs.
- **📄 Customizable PDF Export**: Export your transcripts and summaries into beautifully formatted PDFs with one click.
- **📱 Mobile & Android Ready**: Fully responsive design for mobile browsers and Capacitor-ready for APK generation.

---

## 🛠️ Technical Stack

This is a **MERN Stack** application:
- **Frontend**: React.js with Tailwind CSS (for modern UI).
- **Backend**: Node.js & Express.js.
- **Database**: MongoDB Atlas (Cloud Database).
- **AI Engine**: Groq (Llama 3.3-70b) & OpenAI Whisper.
- **Mobile**: Capacitor (for Android APK).

---

## ☁️ Cloud Deployment Guide

To use PodAccess on any device even when your laptop is turned off:

### 1. Backend (Render)
1. Push your code to a GitHub repository.
2. Create a **Web Service** on [Render.com](https://render.com).
3. Connect your GitHub and add your `.env` variables (`MONGODB_URI`, `GROQ_API_KEY`).
4. Render will provide an API URL (e.g., `https://pod-api.onrender.com`).

### 2. Frontend (Vercel)
1. Update your `frontend/.env` to point `VITE_API_URL` to your Render URL.
2. Create a project on [Vercel.com](https://vercel.com).
3. Connect your GitHub and deploy.
4. Vercel will give you your final website link (e.g., `https://podaccess.vercel.app`).

### 3. Android APK Sync
If you add new features and want them in your APK:
1. `cd frontend`
2. `npm run build`
3. `npx cap copy` (Moves web code to the `android/` folder)
4. Open the `android` folder in **Android Studio** and build a new APK.

---

## 📂 Project Structure

```
Podcast/
├── backend/
│   ├── Procfile                  # Deployment config for cloud hosts
│   ├── controllers/
│   │   └── podcastController.js  # Unified translation and summary logic
│   ├── services/
│   │   ├── transcriptionService.js  # Whisper API integration
│   │   └── summaryService.js        # High-fidelity AI summaries
│   └── server.js                 # Express server with CORS & File Serving
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── PodcastContext.jsx # Global tab & state management
│   │   ├── components/
│   │   │   └── PodcastTabBar.jsx # Horizontal global navigation
│   │   └── pages/
│   │       ├── DashboardPage.jsx # Feature-rich dashboard
│   │       └── HomePage.jsx      # Multi-mode upload start
│   └── capacitor.config.json     # Android mobile config
└── README.md
```

## 🚀 Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. **Run Locally**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

---
## 📜 License
MIT
