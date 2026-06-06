import React, { useEffect, useState } from "react";
import { getCameras } from "../services/cameraService";

function CameraList() {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getCameras();
      setCameras(data);
    }
    loadData();
  }, []);

  return (
    <div>
      {cameras.map((camera) => (
        <div key={camera.id} style={{ marginBottom: "40px" }}>
          <h2>{camera.location}</h2>

          <img
            src={camera.imageUrl}
            alt={camera.location}
            style={{
              width: "550px",
              maxWidth: "95%",
              borderRadius: "12px",
              marginTop: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/600x400?text=Camera+Offline";
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default CameraList;
