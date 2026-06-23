import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react-vendor",
                test: /node_modules\/(react|react-dom|react-router|react-router-dom|@tanstack\/react-query)\//,
              },
              {
                name: "supabase-vendor",
                test: /node_modules\/(@supabase|@auth)\//,
              },
              {
                name: "ui-vendor",
                test: /node_modules\/(@radix-ui|lucide-react|class-variance-authority|cmdk|vaul|sonner|next-themes|react-day-picker|embla-carousel|embla-carousel-react|input-otp|react-hook-form|@hookform|zod|recharts|d3-|victory-vendor)\//,
              },
              {
                name: "vendor",
                test: /node_modules\//,
              },
            ],
          },
        },
      },
    },
  };
});
