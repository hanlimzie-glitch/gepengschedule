import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Cleanup satu-arah: lepas service worker iklan (PropellerAds, /sw.js lama)
// yang mungkin masih tertanam di browser pengunjung dari versi sebelumnya.
// Aman dibiarkan permanen — tidak melakukan apa-apa bila tidak ada SW iklan.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((reg) => {
          const url =
            reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? "";
          if (url.endsWith("/sw.js")) void reg.unregister();
        });
      })
      .catch(() => {
        /* abaikan */
      });
  });
}
