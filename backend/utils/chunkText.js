// backend/utils/chunkText.js

function chunkText(text, options = {}) {
  const {
    chunkSize = 300,        // number of words per chunk (used in fixed mode)
    overlap = 50,           // overlap between chunks
    source = "unknown.pdf",
    targetChunks = null     // total chunks (used in dynamic mode)
  } = options;

  const words = text.trim().split(/\s+/);
  const totalWords = words.length;
  const chunks = [];

  // ----- Mode: Fixed number of chunks (dynamic sizing) -----
  if (targetChunks && targetChunks > 1) {
    const dynamicChunkSize = Math.ceil(totalWords / targetChunks);

    for (let i = 0, chunkId = 0; i < totalWords; i += dynamicChunkSize, chunkId++) {
      const chunkWords = words.slice(i, i + dynamicChunkSize);
      chunks.push({
        id: `chunk_${chunkId}`,
        text: chunkWords.join(" "),
        metadata: {
          chunk_index: chunkId,
          source,
          word_start: i,
          word_end: i + chunkWords.length - 1,
          mode: "dynamic",
          targetChunks,
        },
      });
    }

    return chunks;
  }

  // ----- Mode: Fixed chunk size -----
  let i = 0;
  let chunkId = 0;

  while (i < totalWords) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push({
      id: `chunk_${chunkId}`,
      text: chunkWords.join(" "),
      metadata: {
        chunk_index: chunkId,
        source,
        word_start: i,
        word_end: i + chunkWords.length - 1,
        mode: "fixed",
        chunkSize,
        overlap,
      },
    });

    chunkId += 1;
    i += chunkSize - overlap;
  }

  return chunks;
}

module.exports = { chunkText };
