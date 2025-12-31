import express from "express";
import fetch from "node-fetch";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import cors from "cors";

const app = express();
app.use(cors());

// Your TfNSW API token
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJvSUs3QTFFb1lVUmQ3eVBMcTNGem5yOVZJbVluWl96ZF9sNjYtdmJQNEEwIiwiaWF0IjoxNzY3MTU2Mzc1fQ.HLvqE5ZTTvvmjw1xzxEYdYdxbDLE81Iutderru4TDRs";

const FEED = "https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/nswtrains";

app.get("/vehicles", async (req, res) => {
  try {
    const response = await fetch(FEED, {
      headers: { "Authorization": `apikey ${API_KEY}` }
    });
    const buffer = await response.arrayBuffer();

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const trains = feed.entity
      .filter(e => e.vehicle?.position)
      .map(e => ({
        id: e.id,
        lat: e.vehicle.position.latitude,
        lon: e.vehicle.position.longitude,
        route: e.vehicle.trip?.routeId
      }));

    res.json(trains);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GTFS fetch failed" });
  }
});

// Optional: homepage route
app.get("/", (req, res) => {
  res.send("Sydney Trains backend is running! Go to /vehicles for live train data.");
});

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
