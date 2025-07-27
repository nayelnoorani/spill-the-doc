const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { chunkText } = require("../utils/chunkText");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file;

    if (!file || path.extname(file.originalname).toLowerCase() !== ".pdf") {
      return res.status(400).json({ error: "Only PDF files are supported." });
    }

    const filePath = path.resolve(file.path);
    const dataBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.length < 100) {
      return res.status(400).json({ error: "PDF parsing failed or content is too short." });
    }

    // Parse query parameters from frontend
    const mode = req.query.mode || "fixed";
    const chunkSize = parseInt(req.query.chunkSize) || 300;
    const targetChunks = parseInt(req.query.targetChunks) || null;

    // Determine chunking options based on mode
    const chunkingOptions = {
      source: file.originalname,
    };

    console.log("Chunking options:", chunkingOptions);

    if (mode === "dynamic" && targetChunks) {
      chunkingOptions.targetChunks = targetChunks;
    } else {
      chunkingOptions.chunkSize = chunkSize;
      chunkingOptions.overlap = 50; // default
    }

    const chunks = chunkText(rawText, chunkingOptions);

    // Optional: save to disk for debugging
    const chunkOutPath = path.resolve("chunks", `${file.filename}_chunks.json`);
    fs.mkdirSync("chunks", { recursive: true });
    fs.writeFileSync(chunkOutPath, JSON.stringify(chunks, null, 2));

    res.json({
      message: "PDF parsed and chunked successfully.",
      chunkCount: chunks.length,
      filename: file.originalname,
    });
  } catch (err) {
    console.error("Upload error:", err);
    uploadStatus.innerHTML = `<div class="text-danger">❌ Upload error: ${err.message}</div>`;
  }
});

module.exports = router;
