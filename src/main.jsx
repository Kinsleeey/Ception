import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import MobileGuard from "./components/MobileGuard.jsx";
import "./styles.css";

// This is the starting point of the app.
// It finds the <div id="root"> in index.html and renders <App/> inside it.
// <BrowserRouter> turns on page routing so we can have different URLs
// like "/", "/login", and "/admin".
//
// <MobileGuard> wraps everything: on phone-sized screens it shows a
// "Desktop Required" message instead of the app, and swaps back to the app
// automatically when the screen is large enough.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MobileGuard>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MobileGuard>
  </React.StrictMode>
);
