import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (root) {
  try {
    createRoot(root).render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );
  } catch (err) {
    console.error("Root render error:", err);
    root.innerHTML = `<div style="color:white;padding:2rem;font-family:sans-serif"><h1>Something went wrong</h1><pre>${String(err)}</pre></div>`;
  }
} else {
  console.error("Root element not found");
}
