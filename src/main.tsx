import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (root) {
  try {
    createRoot(root).render(<App />);
  } catch (err) {
    console.error("Root render error:", err);
    root.innerHTML = `<div style="color:white;padding:2rem;font-family:sans-serif"><h1>Something went wrong</h1><pre>${String(err)}</pre></div>`;
  }
} else {
  console.error("Root element not found");
}
