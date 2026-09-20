import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@/components/ThemeProvider";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
