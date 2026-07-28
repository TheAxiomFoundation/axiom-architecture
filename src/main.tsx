import React from "react";
import ReactDOM from "react-dom/client";
import posthog from "posthog-js";
import { App } from "./App";
import "@xyflow/react/dist/style.css";
import "./styles.css";

// Product analytics (PostHog) — browser only, once per page load.
if (typeof window !== "undefined" && !posthog.__loaded) {
  posthog.init("phc_mrEaBroaYTRUrdkfhJYBGMpafKXWEdUyw5VPQnheh37m", {
    api_host: "https://us.i.posthog.com",
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    respect_dnt: true,
    capture_pageview: "history_change",
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
