# 🎓 CBSE Exam Question Generator (AI-Powered)

Experience the future of exam preparation with this intelligent Question Paper Generator. Built for CBSE Class 9-12 standards, it uses local AI (Llama 3 via Ollama) to create high-quality, exam-oriented questions in seconds.

## ✨ Key Features

-   **🤖 AI-Powered Generation**: Generates specific questions (Numerical, Case-Based, HOTS) using Llama 3.
-   **🧮 Smart Math & Science Support**:
    -   **Strict LaTeX Rendering**: Beautifully formatted equations ($E=mc^2$) and formulas.
    -   **Numerical Enforcement**: Math questions are strictly problem-solving oriented (No pure theory).
-   **⚡ High-Performance Architecture**:
    -   **Backend Caching**: Instant responses for previously generated topics (0ms latency).
    -   **Streaming Typewriter Effect**: Engaging, real-time text display for questions.
-   **📄 Practice Paper Mode**: Generate full-length 10-question practice papers with "Expert Solutions".
-   **📥 PDF Download**: Export succinct, formatted questions and answers as PDFs.
-   **💡 Educational Facts**: "Did You Know?" loading screen with 100+ curriculum-aligned facts.

## 🚀 Tech Stack

-   **Frontend**: React + Vite + TailwindCSS
-   **Backend**: Node.js + Express
-   **AI Engine**: Ollama (Llama 3)
-   **Rendering**: React Markdown + Katex (for Math)

## 🛠️ Installation & Setup

1.  **Prerequisites**:
    -   Node.js installed.
    -   [Ollama](https://ollama.com/) installed and running (`ollama run llama3`).

2.  **Backend Setup**:
    ```bash
    # Install dependencies
    npm install express cors body-parser dotenv pdf-parse

    # Start the server (Runs on port 3000)
    node server.js
    ```

3.  **Frontend Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access**: Open `http://localhost:5173` in your browser.

## 🔒 Security Note

-   **Sensitive Files Ignored**: This project includes a `.gitignore` file to ensure strictly local files (like `.env`, `node_modules`, and local data caches) are **never** committed to GitHub.
-   **Safe Deployment**: All API keys and secrets should be managed via environment variables.

## 📝 Usage Guide

1.  Select **Class**, **Subject**, and **Chapter**.
2.  Choose **Question Type** (e.g., Numerical, Case-Based).
3.  Click **Generate**.
4.  For Math, notice the **Strict Numerical** enforcement!
5.  Use **Practice Mode** to take a mock test.
6.  **Download PDF** to save your work.

---
*Developed with ❤️ by Gagandeep Singh*
