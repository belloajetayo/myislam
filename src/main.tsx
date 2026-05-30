import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear stale Supabase session tokens if the project URL has changed.
// Old tokens are scoped to the old project and cause silent "Failed to fetch" errors.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PROJECT_REF = SUPABASE_URL?.split(".")?.[0]?.split("//")?.[1] ?? "";
const STORED_REF_KEY = "sb_project_ref";
const storedRef = localStorage.getItem(STORED_REF_KEY);
if (storedRef && storedRef !== PROJECT_REF) {
  // Project changed — purge all sb-* keys to avoid stale session errors
  Object.keys(localStorage)
    .filter((k) => k.startsWith("sb-"))
    .forEach((k) => localStorage.removeItem(k));
}
localStorage.setItem(STORED_REF_KEY, PROJECT_REF);

createRoot(document.getElementById("root")!).render(<App />);

