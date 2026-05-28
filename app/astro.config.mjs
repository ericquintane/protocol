import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://ericquintane.github.io",
  base: "/protocol",
  integrations: [react()],
  vite: {
    server: {
      fs: {
        allow: [".."]
      }
    }
  }
});
