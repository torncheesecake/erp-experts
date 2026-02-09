import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";

// Developer signature in console
console.log(
  "%c\n" +
    "╔═══════════════════════════════════════════════════════════╗\n" +
    "║                                                           ║\n" +
    "║   👋 Hey there, fellow developer!                         ║\n" +
    "║                                                           ║\n" +
    "║   This site was designed & built by Matthew Hillman       ║\n" +
    "║                                                           ║\n" +
    "║   Stack: React 18 • Vite 7 • Tailwind CSS 4               ║\n" +
    "║   Built: Jan-Feb 2026                                     ║\n" +
    "║                                                           ║\n" +
    "║   No templates. Handcrafted with care.                    ║\n" +
    "║                                                           ║\n" +
    "╚═══════════════════════════════════════════════════════════╝\n",
  "color: #e83a7a; font-family: monospace; font-size: 12px;",
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
