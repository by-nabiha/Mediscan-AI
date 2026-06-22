import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setAuthTokenGetter } from "./lib/api-client";
import App from "./App";
import "./index.css";

// Configure authorization token retrieval callback prior to application render
setAuthTokenGetter(() => localStorage.getItem("mediscan_token"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
