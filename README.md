# LinkedIn Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)

AI-powered Chrome extension that helps you write better LinkedIn comments, cold messages, and posts. Works like Grammarly — a floating widget appears right where you type on LinkedIn.

Bring your own API key. Your keys stay on your device.

<!-- TODO: Add a demo GIF or screenshot here -->
<!-- ![Demo](docs/demo.gif) -->

## Features

- **Smart Comments** — Reads the post context and generates thoughtful, engaging comments
- **Cold DM Crafting** — Creates personalized outreach messages based on recipient profile
- **Post Creation** — Writes compelling LinkedIn posts from your prompts
- **Streaming Responses** — See text generate in real-time
- **Tone Presets** — Professional, Casual, Witty, Friendly, Authoritative, or create your own
- **Custom Instructions** — Define your writing style once, apply it everywhere
- **Privacy First** — BYO API key, all data stored locally via `chrome.storage`

## Supported AI Providers

| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4 Turbo |
| **Anthropic** | Claude Sonnet 4, Claude Haiku 4.5 |
| **Groq** | Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B |
| **LinkedIn Copilot Pro** *(coming soon)* | Hosted model — no API key needed |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/kosbay/linkedin-copilot.git
cd linkedin-copilot

# Install dependencies
pnpm install

# Start dev server with hot reload
pnpm dev
```

### Load in Chrome

1. Run `pnpm dev` (development) or `pnpm build` (production)
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `dist/` folder

### Configure

1. Click the extension icon in Chrome toolbar
2. Open **Settings** (or right-click icon > Options)
3. Enter your API key for your preferred provider
4. *(Optional)* Add custom instructions and tone presets
5. Go to LinkedIn — the floating widget appears on any text input

## How It Works

```
LinkedIn Page
  └─ Content Script (Shadow DOM)
       ├─ Detects input type (comment / DM / post)
       ├─ Extracts context (post text, profile info)
       └─ Floating widget appears near the active input
                │
                │ chrome.runtime.Port (streaming)
                ▼
Service Worker
  └─ Calls AI provider API directly (no middleman server)
       ├─ OpenAI
       ├─ Anthropic
       └─ Groq
```

**Key design decisions:**

- **BYO API key** — calls go directly from the extension to the provider. Your keys are stored in `chrome.storage.local` and never leave your device.
- **Shadow DOM** — widget styles are fully isolated from LinkedIn's CSS.
- **MutationObserver** — automatically detects dynamically added text inputs during SPA navigation.
- **No AI SDKs** — raw `fetch()` with async generators for streaming. Zero dependency on provider SDKs.

## Project Structure

```
src/
├── background/          # Service worker + AI provider adapters
│   ├── providers/       # OpenAI, Anthropic, Groq, Proxy adapters
│   └── handlers/        # Streaming generation handler
├── content/             # Content script injected into LinkedIn
│   ├── widget/          # React UI components (floating button, panel)
│   └── hooks/           # Hooks for generation, context extraction, positioning
├── options/             # Settings page (API keys, instructions, tones)
├── popup/               # Quick-access popup
├── lib/                 # Storage wrapper, messaging utils, SSE parser
├── constants/           # Providers, LinkedIn selectors, prompts, tones
└── types/               # TypeScript type definitions
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite + [CRXJS](https://crxjs.dev/vite-plugin/) (Manifest V3) |
| UI | React 19 + TypeScript + Tailwind CSS |
| Icons | Lucide React |
| AI | Raw `fetch` — no SDK dependencies |
| Storage | `chrome.storage.sync` (settings) + `chrome.storage.local` (keys) |

## Scripts

```bash
pnpm dev        # Start Vite dev server with HMR
pnpm build      # Type-check + production build
pnpm typecheck  # Run TypeScript compiler (no emit)
```

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `pnpm typecheck` to ensure type safety
5. Commit and push
6. Open a Pull Request

Please open an issue first to discuss larger changes.

## License

[MIT](LICENSE)
