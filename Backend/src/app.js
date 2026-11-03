const express = require("express");
const healthRoutes = require("./routes/health.routes");
const weatherRoutes = require("./routes/weather.routes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/weather", weatherRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
