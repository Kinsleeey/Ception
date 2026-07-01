import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This is the Vite config. Vite is the tool that runs your dev server
// (npm run dev) and builds the final site (npm run build).
// You normally don't need to touch this file.
export default defineConfig({
  plugins: [react()],
});
