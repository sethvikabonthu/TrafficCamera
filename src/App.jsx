import React from "react";
import CameraList from "./components/CameraList.jsx";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      {/* Header Area */}
      <header className="app-header glass-panel">
        <div className="header-brand">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Calgary Traffic Watch</h1>
            <p>Live camera streams & traffic tracking from City of Calgary Open Data</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <CameraList />
      </main>

      {/* Footer Area */}
      <footer className="app-footer">
        <p>
          Calgary Traffic Watch &copy; {new Date().getFullYear()}. Data provided by the{" "}
          <a
            href="https://data.calgary.ca/"
            target="_blank"
            rel="noopener noreferrer"
          >
            City of Calgary Open Data Portal
          </a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
