import React from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Hero />
  </React.StrictMode>
);
