# Lingo Bridge

Lingo Bridge is a powerful browser extension designed to bridge language barriers and simplify content consumption. It offers seamless in-page translation and AI-powered summarization for selected text, enhancing your browsing experience without leaving the current page.

## Features

### 🌐 Contextual Translation
- **In-Place Translation**: Instantly translate selected text on any webpage. The translated text replaces the original while preserving the original font styles, size, and color.
- **Multi-Language Support**: Easily switch between target languages including Hindi, English, Spanish, French, German, and Japanese via the extension popup.
- **Smart Skeleton Loading**: Experience a smooth transition with a skeleton loader that mimics the dimensions and theme (light/dark mode) of the selected text while the translation is being fetched.

### 🧠 AI Summarization
- **Gemini AI Integration**: Leverages Google's Gemini 1.5 Flash model to generate concise summaries of long articles or paragraphs.
- **Real-Time Streaming**: Watch the summary generate in real-time with a streaming response, so you don't have to wait for the entire process to finish.
- **Interactive Popup**: Summaries are displayed in a clean overlay popup on the webpage.

### 🖱️ Easy Access
- **Context Menu Integration**: Simply select text, right-click, and choose "Translate Selection" or "Summarise Selection" from the context menu.
- **Popup Interface**: Use the browser toolbar popup to quickly change your target translation language.

## Tech Stack

- **Frontend**: React, Vite
- **AI & Translation**: 
  - [Lingo.dev SDK](https://lingo.dev/) for accurate translations.
  - [Google Gemini API](https://ai.google.dev/) for intelligent summarization.
- **Platform**: Chrome Extension Manifest V3

## Installation & Setup

Follow these steps to run Lingo Bridge locally on your machine.

### Prerequisites
- Node.js installed (v14 or higher recommended).
- A Google Gemini API Key.
- A Lingo.dev API Key.

### Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd lingo_Bridge
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your API keys:
    ```env
    VITE_LINGO_API_KEY=your_lingo_api_key_here
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Build the Extension**
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the compiled extension.

5.  **Load into Chrome**
    1.  Open Chrome and navigate to `chrome://extensions/`.
    2.  Enable **Developer mode** in the top right corner.
    3.  Click **Load unpacked**.
    4.  Select the `dist` folder generated in the previous step.
