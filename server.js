import express from "express";
import fetch from "node-fetch";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import cors from "cors";

const app = express();
app.use(cors());

const FEED =
  "https://api.transport.nsw.gov.au/v1/gtfs/vehiclepos/nswtrains";

app.get("/vehicles", async (req, res) => {
  const response = await fetch(FEED);
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
});

app.listen(process.env.PORT || 3000);
