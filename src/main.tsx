import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PitlaneApp } from "./pitlane/app";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <PitlaneApp />
    </StrictMode>,
  );
}
