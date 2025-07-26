// backend/app.js

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

/**
 * Upload PDF endpoint
 */
app.post("/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  console.log(`Received file: ${req.file.originalname}`);
  return res.json({ message: "File uploaded successfully." });
});

/**
 * Chat endpoint
 */
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  console.log(`User message: ${message}`);

  // Placeholder response — replace with RAG/LLM logic later
  const fakeReply = `You said: "${message}". I'm not actually smart yet.`;

  return res.json({ reply: fakeReply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
