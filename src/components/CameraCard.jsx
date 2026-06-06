import React, { useState } from "react";

function CameraCard({ camera, isFavorite, onToggleFavorite, onSelect }) {
  const [imgStatus, setImgStatus] = useState("loading"); // loading, loaded, error
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  // Function to get clean quadrant class/badge text
  const getQuadrantLabel = (quad) => {
    if (!quad || quad === "Unknown") return "Calgary";
    return quad.toUpperCase();
  };

  const handleReload = (e) => {
    e.stopPropagation();
    setImgStatus("loading");
    setCacheBuster(Date.now());
  };

  return (
    <div 
      className="glass-panel camera-card fade-in"
      onClick={() => imgStatus === "loaded" && onSelect(camera)}
    >
      <div className="camera-card-header">
        <div className="camera-info">
          <span className={`quadrant-badge badge-${camera.quadrant.toLowerCase()}`}>
            {getQuadrantLabel(camera.quadrant)}
          </span>
          <h3 title={camera.location}>{camera.location}</h3>
        </div>
        <button
          className={`fav-button ${isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(camera.id);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <div className="camera-image-container">
        {imgStatus === "loading" && (
          <div className="camera-skeleton skeleton">
            <div className="spinner"></div>
          </div>
        )}

        {imgStatus === "error" && (
          <div className="camera-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span>Camera Feed Offline</span>
            <button className="retry-btn" onClick={handleReload}>
              Retry Connection
            </button>
          </div>
        )}

        <img
          src={`${camera.imageUrl}?t=${cacheBuster}`}
          alt={`Traffic camera at ${camera.location}`}
          className={`camera-img ${imgStatus === "loaded" ? "visible" : "hidden"}`}
          onLoad={() => setImgStatus("loaded")}
          onError={() => setImgStatus("error")}
        />

        {imgStatus === "loaded" && (
          <div className="card-actions">
            <button className="card-action-btn reload-single" onClick={handleReload} title="Refresh Feed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
            <span className="expand-indicator">Click to Expand</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraCard;
