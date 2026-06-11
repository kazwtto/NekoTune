import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'

const host = process.env.TAURI_DEV_HOST

function stripCrossorigin() {
  return {
    name: "strip-crossorigin",
    transformIndexHtml(html) {
      return html
        .replace(/ crossorigin/g, "")
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), stripCrossorigin()],
  clearScreen: false,
  base: "./",
  build: {
    cssCodeSplit: false,
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
})
