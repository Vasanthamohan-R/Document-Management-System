import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/@client/main.tsx"],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./resources/@client"),
        },
    },

    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
    optimizeDeps: {
        include: ["react-datepicker"],
    },
});
