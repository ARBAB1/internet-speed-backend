const express = require("express");
const cors = require("cors");
const speedTest = require("speedtest-net");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");

const app = express();
app.use(cors());
app.use(requestIp.mw()); // middleware

// Speed Test API
app.get("/api/speedtest", async (req, res) => {
  try {
    const result = await speedTest({
      acceptLicense: true,
      acceptGdpr: true,
      verbosity: 1,
      progress: () => {},
    });

    res.json({
      download: ((result.download.bandwidth * 8) / 1e6).toFixed(2), // Mbps
      upload: ((result.upload.bandwidth * 8) / 1e6).toFixed(2), // Mbps
      ping: result.ping.latency,
      server: result.server.name,
      isp: result.isp,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Speed test failed:", err.message || err);
    res.status(500).json({ error: "Speed test failed. Try again later." });
  }
});

// IP and Location API
app.get("/api/ip", (req, res) => {
  const ip =
    req.clientIp ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress;

  const geo = geoip.lookup(ip) || {};

  res.json({
    ip,
    city: geo.city || "Unknown",
    country: geo.country || "Unknown",
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Speedtest API running on http://localhost:${PORT}`);
});
