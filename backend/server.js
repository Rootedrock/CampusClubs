require("dotenv").config();

const express = require("express");
const cors = require("cors");

const clubsRouter = require("./src/routes/clubs");
const suggestionsRouter = require("./src/routes/suggestions");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/Postman) which send no origin header.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/clubs", clubsRouter);
app.use("/api/suggestions", suggestionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CampusClubs API listening on http://localhost:${PORT}`);
});
