// A small REST API with Express and Mongoose. Start: `npm start`. SPARC Cloud sets PORT (8080) for you.
const express = require("express");
const db = require("./db");
const models = require("./models");

const { Note } = models;
const app = express();
app.use(express.json({ limit: "100kb" }));

// Health check for SPARC Cloud (Health check tab: path /healthz). 200 = fine, 503 = the database is not answering.
app.get("/healthz", async (req, res) => {
  try {
    await db.healthy();
    res.type("text").send("ok");
  } catch (err) {
    console.error("Health check: database not answering:", err.codeName || err.name);
    res.status(503).type("text").send("database not answering");
  }
});

app.get("/", (req, res) => {
  res.json({ name: "node-mongo", routes: ["GET /api/notes", "POST /api/notes"] });
});

const asJson = (n) => ({ id: String(n._id), text: n.text, created_at: n.createdAt });

app.get("/api/notes", async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(notes.map(asJson));
  } catch (err) {
    next(err);
  }
});

app.post("/api/notes", async (req, res, next) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text || text.length > 500) return res.status(422).json({ error: "text must be 1-500 characters" });
  try {
    const note = await Note.create({ text });
    res.status(201).json(asJson(note));
  } catch (err) {
    next(err);
  }
});

// Add your own routes here, e.g.  app.get("/api/hello", (req, res) => res.json({ hello: "world" }));

// Errors: log a short line, answer without details (never leak internals or secrets to visitors).
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("Request failed:", err.codeName || err.name);
  res.status(500).json({ error: "internal error" });
});

const port = Number(process.env.PORT) || 8080;

// The database FIRST: if it can't be reached, the app does not start listening, so SPARC Cloud never sends it traffic.
db.connect(models.all)
  .then(() => {
    app.listen(port, "0.0.0.0", () => console.log(`Listening on 0.0.0.0:${port}`));
  })
  .catch((err) => {
    // Only the kind of error: a driver's message may repeat the address, which holds the password.
    console.error("DATABASE SETUP FAILED - the app will not start:", process.env.MONGODB_URI ? err.name : err.message);
    process.exit(1);
  });
