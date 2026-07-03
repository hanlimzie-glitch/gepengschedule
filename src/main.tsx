import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        const alreadyRegistered = registrations.some(
          (r) => r.active?.scriptURL?.endsWith("/sw.js") ||
                 r.installing?.scriptURL?.endsWith("/sw.js") ||
                 r.waiting?.scriptURL?.endsWith("/sw.js")
        );
        if (alreadyRegistered) {
          console.log("[SW] PropellerAds service worker already registered");
          return;
        }
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[SW] PropellerAds service worker registered:", reg.scope);
          })
          .catch((err) => {
            console.error("[SW] PropellerAds service worker registration failed:", err);
          });
      })
      .catch((err) => {
        console.error("[SW] Failed to inspect existing service workers:", err);
      });
  });
}
