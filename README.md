# NekoTune 🎵

NekoTune is a professional, sleek, and lightweight desktop YouTube Music wrapper built with **Tauri v2** and **React**. It provides a seamless music listening experience with a modern UI, global media controls, and minimal system resource consumption.

## 🚀 Features

- **Modern & Fast UI:** Built with React and Tailwind CSS v4 for a highly responsive and beautiful user experience.
- **YouTube Music Integration:** Access your entire YouTube Music library, playlists, and discover new tracks.
- **Lightweight Performance:** Powered by Rust and Tauri, ensuring low memory and CPU usage compared to traditional browser-based players.
- **Portable Version:** Run the application without installation.
- **Global Shortcuts:** Control playback (Play/Pause, Next, Previous) using system-wide media keys.
- **Lyrics Support:** Integrated lyrics view for a more immersive listening experience.
- **Multi-language:** Built-in support for multiple languages including English and Portuguese.
- **Customizable:** Change themes and manage audio settings to suit your preference.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 18](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest)
- **Audio Engine:** [Howler.js](https://howlerjs.com/)
- **Bundler:** [Vite](https://vitejs.dev/)

### Backend (Desktop Layer)
- **Framework:** [Tauri v2](https://tauri.app/)
- **Language:** [Rust](https://www.rust-lang.org/)
- **API/Streaming Logic:** [yt-dlp](https://github.com/yt-dlp/yt-dlp) & custom InnerTube implementation.

## 📦 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NekoTune.git
   cd NekoTune
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run tauri dev
   ```

### Building the Project
To generate a production-ready build:

```bash
npm run tauri build
```

The artifacts (installer and portable executable) will be located in `src-tauri/target/release/bundle/`.

Alternatively, you can use the provided PowerShell script on Windows:
```powershell
npm run build:app:release
```

## 🤖 CI/CD
This repository is configured with **GitHub Actions** to automatically build the project on every push to the `main` branch. The "Portable" executable and installers are automatically generated and attached to the build artifacts.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
