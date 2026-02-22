<div align="center">

  <img src="https://raw.githubusercontent.com/your-username/lingo_Bridge/main/public/icon128.png" alt="Lingo Bridge Logo" width="120" />

  <h1 align="center">Lingo Bridge</h1>

  <p align="center">
    <strong>Break down language barriers, one webpage at a time.</strong>
    <br />
    Seamless in-page translation and AI-powered summarization without ever leaving your tab.
  </p>

  <p align="center">
    <a href="https://github.com/your-username/lingo_Bridge/actions">
      <img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/your-username/lingo_Bridge/main.yml?branch=main&style=for-the-badge">
    </a>
    <a href="https://github.com/your-username/lingo_Bridge/blob/main/LICENSE">
      <img alt="License" src="https://img.shields.io/github/license/your-username/lingo_Bridge?style=for-the-badge">
    </a>
    <br>
    <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
    <img alt="Gemini API" src="https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white">
    <img alt="Chrome Extension" src="https://img.shields.io/badge/Chrome-MV3-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white">
  </p>

</div>

---

## 🎬 Demo

Have you ever found yourself lost in a sea of foreign text, juggling countless tabs just to understand a single article? Lingo Bridge ends that chaos. It integrates powerful AI tools directly into your browser, creating an uninterrupted and fluid reading experience.

<table>
  <tr>
    <td align="center"><strong>🌐 In-Place Translation</strong></td>
    <td align="center"><strong>🧠 AI Summarization</strong></td>
  </tr>
  <tr>
    <td><img src="https://via.placeholder.com/400x250.gif?text=Translation+Demo+GIF" alt="Translation Demo"></td>
    <td><img src="https://via.placeholder.com/400x250.gif?text=Summarization+Demo+GIF" alt="Summarization Demo"></td>
  </tr>
</table>

## ✨ Core Features

### 🌐 Contextual Translation
- **Seamless In-Place Translation**: Instantly translate selected text without leaving the page. The translated content perfectly preserves the original font styles, size, and color for a native feel.
- **Smart Skeleton UI**: While fetching translations, a theme-aware (light/dark) skeleton loader mimics the text's dimensions, ensuring a smooth, non-disruptive visual transition.
- **Multi-Language Support**: Effortlessly switch your target language (Hindi, Spanish, French, German, Japanese, and English) from the extension's popup.

### 🧠 AI-Powered Summarization
- **Gemini 1.5 Flash Integration**: Harness the speed and power of Google's latest AI to generate concise, high-quality summaries of dense articles or long paragraphs.
- **Real-Time Streaming**: Don't wait. Watch the summary appear word-by-word in a clean, interactive overlay, delivering insights as they're generated.
- **Effortless Access**: Simply select text, right-click, and choose "Summarise Selection" to get the gist of any content instantly.

## 🚀 Why Lingo Bridge Matters

Lingo Bridge isn't just another translation tool; it's a productivity and accessibility powerhouse.

*   **Uninterrupted Flow**: By eliminating the need to switch tabs or use external apps, it keeps you in your state of flow, whether you're researching, studying, or just browsing.
*   **Enhanced Comprehension**: Quickly grasp the core ideas of complex content, making information more accessible and saving you valuable time.
*   **Global Accessibility**: It makes the web a more inclusive place by breaking down language barriers for users around the world.

## 🛠️ Tech Stack & Architecture

### Core Technologies

| Category      | Technology                                                                                             | Purpose                                                              |
| :------------ | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **Platform**  | <img src="https://img.shields.io/badge/Chrome-MV3-4285F4?logo=google-chrome&logoColor=white" />          | Built on the modern, secure Manifest V3 standard for Chrome Extensions. |
| **Frontend**  | <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" /> & <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" /> | For a fast, reactive, and modern popup UI and development experience. |
| **Translation** | **Lingo.dev SDK**                                                                                      | Provides highly accurate, context-aware text translation.            |
| **AI**        | <img src="https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?logo=google&logoColor=white" /> | Powers the fast, real-time text summarization feature.               |

### System Architecture

Lingo Bridge operates on a decoupled architecture, leveraging the strengths of different Chrome Extension components for a robust and efficient user experience.

<details>
<summary>Click to view architecture diagram</summary>

```mermaid
graph TD
    subgraph "Browser Tab (Content)"
        A[User selects text] --> B{Content Script};
        B -->|Sends selection & context| C[Background Script];
        B -->|Shows skeleton loader| D[DOM];
        F[API Response] --> B;
        B -->|Injects translated/summarized text| D;
    end

    subgraph "Extension"
        C(Background Script / Service Worker);
        G[Context Menu] -->|'Translate' or 'Summarize'| C;
        H[Popup UI (React)] <-->|Language Settings| I[chrome.storage];
        C <-->|Get Settings| I;
        C -->|API Request| E{External APIs};
        E -->|Response| F(API Response);
    end

    subgraph "Cloud Services"
        E --> J[Lingo.dev API];
        E --> K[Google Gemini API];
    end

    style D fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
```

</details>

1.  **Content Script**: Injected into the active tab, it detects user text selections, creates the context-aware skeleton loader, and replaces the original text with the processed result from the background script.
2.  **Background Script (Service Worker)**: The central hub. It creates the context menus, listens for user actions, and securely handles all API requests to Lingo.dev and Google Gemini, passing the results back to the content script.
3.  **Popup UI**: A mini React application that allows the user to configure the target translation language. Settings are saved to `chrome.storage` to persist across sessions.

## 📂 Project Structure

The project follows a clean, modular structure to separate concerns and improve maintainability.

```sh
lingo_Bridge/
├── dist/                   # Compiled extension for Chrome
├── public/                 # Static assets (icons, manifest.json)
│   └── manifest.json
├── src/
│   ├── background/         # Service worker (background script)
│   │   └── index.ts
│   ├── content/            # Content script injected into pages
│   │   └── index.ts
│   ├── popup/              # React app for the popup UI
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── shared/             # Shared types, utilities
├── .env.example            # Environment variable template
├── package.json
└── vite.config.ts
```

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** or **yarn**
- **Google Gemini API Key**: Get one from Google AI Studio.
- **Lingo.dev API Key**: Get one from the Lingo.dev platform.

### Local Development

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/lingo_Bridge.git
    cd lingo_Bridge
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your secret API keys:
    ```env
    VITE_LINGO_API_KEY="your_lingo_api_key_here"
    VITE_GEMINI_API_KEY="your_gemini_api_key_here"
    ```

4.  **Build the Extension**
    ```bash
    npm run build
    ```
    This command compiles the source code and bundles it into the `dist` directory.

5.  **Load into Chrome**
    1.  Open Chrome and navigate to `chrome://extensions`.
    2.  Toggle on **"Developer mode"** in the top-right corner.
    3.  Click **"Load unpacked"**.
    4.  Select the `dist` folder from this project. The Lingo Bridge icon should appear in your toolbar!

## 📖 Usage Guide

1.  **Translate Text**: Select any text on a webpage, right-click, and choose "Translate Selection".
2.  **Summarize Text**: Select a paragraph or article, right-click, and choose "Summarise Selection".
3.  **Change Language**: Click the Lingo Bridge icon in your browser toolbar to open the popup and select a new target language for translation.

## 🗺️ Future Roadmap

- [ ] **Full-Page Translation**: Implement a one-click option to translate an entire webpage.
- [ ] **PDF & Local File Support**: Extend functionality to work with local PDF files opened in Chrome.
- [ ] **Voice-to-Text Input**: Allow users to speak text for translation or summarization.
- [ ] **Custom Prompts**: Enable users to define custom prompts for the Gemini AI summarizer.
- [ ] **More AI Models**: Integrate other models to give users a choice of summarization engines.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

This project is distributed under the MIT License. See `LICENSE` for more information.

