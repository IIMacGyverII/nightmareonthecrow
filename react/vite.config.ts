import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

// Multi-page build: every `NN-slug.html` in this folder is an entry.
// Set ONLY=NN-slug to build a single concept (used while concepts are
// being built in parallel so one broken entry doesn't block another).
const root = __dirname;
const only = process.env.ONLY;
const entries = readdirSync(root)
  .filter((f) => /^\d{2}-[a-z0-9-]+\.html$/.test(f))
  .filter((f) => !only || f === `${only}.html`);
const input = Object.fromEntries(entries.map((f) => [f.replace(/\.html$/, ""), resolve(root, f)]));

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: { alias: { "@": resolve(root, "src") } },
  build: {
    outDir: only ? `dist-only/${only}` : "dist",
    emptyOutDir: true,
    rollupOptions: { input },
  },
});
