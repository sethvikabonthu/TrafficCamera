import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/cameras", async (req, res) => {
  try {
    const response = await axios.get(
      "https://data.calgary.ca/resource/k7p9-kppz.json?$limit=200"
    );

    const data = response.data;

    const cameras = data
      .map((cam) => {

      
        if (!cam.camera_location) return null;

        let imageUrl = null;

        
        if (typeof cam.camera_url === "string") {
          imageUrl = cam.camera_url;
        }
        else if (cam.camera_url && cam.camera_url.url) {
          imageUrl = cam.camera_url.url;
        }

        // still missing → skip
        if (!imageUrl) return null;

        return {
          id: cam.camera_url?.url || cam.camera_location,
          location: cam.camera_location,
          quadrant: cam.quadrant || "Unknown",
          imageUrl: imageUrl,
          latitude: cam.point?.coordinates?.[1] ?? null,
          longitude: cam.point?.coordinates?.[0] ?? null
        };
      })
      .filter(Boolean);

    console.log("Valid cameras:", cameras.length);

    res.json(cameras);

  } catch (error) {
    console.error("SERVER ERROR:", error.message);
    res.status(500).json({ error: "Failed to load cameras" });
  }
});



if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}


export default app;


