import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./app.css";  // Add this line if you created app.css

createRoot(document.getElementById("root")!).render(<App />);
