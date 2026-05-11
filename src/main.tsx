import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import "./index.css";
import "./app.css";  // Add this line if you created app.css

createRoot(document.getElementById("root")!).render(<App />);
