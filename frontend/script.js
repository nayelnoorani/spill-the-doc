document.addEventListener("DOMContentLoaded", () => {
  // Upload Handling
  const uploadInput = document.getElementById("pdfUpload");
  const fileNameDisplay = document.getElementById("fileName");
  const uploadForm = document.getElementById("uploadForm");
  const uploadStatus = document.getElementById("uploadStatus");
  const modeSelect = document.getElementById("chunkMode");
  const chunkValueInput = document.getElementById("chunkValue");
  const chunkLabel = document.getElementById("chunkLabel");

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    fileNameDisplay.textContent = file ? `Selected file: ${file.name}` : "";
  });

  modeSelect.addEventListener("change", () => {
    const mode = modeSelect.value;
    if (mode === "fixed") {
      chunkLabel.textContent = "Chunk Size (words)";
      chunkValueInput.placeholder = "e.g. 300";
      chunkValueInput.value = "";
    } else {
      chunkLabel.textContent = "Total Number of Chunks";
      chunkValueInput.placeholder = "e.g. 10";
      chunkValueInput.value = "";
    }
  });

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = uploadInput.files[0];
    if (!file) return;

    const mode = modeSelect.value;
    const chunkValue = chunkValueInput.value.trim();

    if (!chunkValue || isNaN(chunkValue) || chunkValue <= 0) {
      uploadStatus.innerHTML = `<div class="text-danger">❌ Invalid chunk value. Please enter a positive number.</div>`;
      return;
    }

    const queryParam =
      mode === "fixed"
        ? `?mode=fixed&chunkSize=${chunkValue}`
        : `?mode=dynamic&targetChunks=${chunkValue}`;

    const formData = new FormData();
    formData.append("pdf", file);

    uploadStatus.innerHTML = `<div class="text-info">Uploading <strong>${file.name}</strong>...</div>`;

    try {
      const response = await fetch(`http://localhost:3000/upload${queryParam}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        uploadStatus.innerHTML = `<div class="text-success">✅ Uploaded and chunked into ${result.chunkCount} chunks.</div>`;
        fileNameDisplay.textContent = `File: ${result.filename}`;
        
        // Hide form after success
        const uploadFields = document.getElementById("uploadFields");
        if (uploadFields) uploadFields.style.display = "none";
      } else {
        uploadStatus.innerHTML = `<div class="text-danger">❌ Upload failed: ${result.error}</div>`;
      }
    } catch (err) {
      uploadStatus.innerHTML = `<div class="text-danger">❌ Upload error: ${err.message}</div>`;
    }
  });

  // Chat Handling
  const chatBox = document.getElementById("chatBox");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  sendBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });

  async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    appendToChat("You", message);
    userInput.value = "";
    userInput.disabled = true;
    sendBtn.disabled = true;

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        appendToChat("Doc", data.reply);
      } else {
        appendToChat("System", `❌ Error: ${data.error}`);
      }
    } catch (err) {
      appendToChat("System", `❌ Network error: ${err.message}`);
    } finally {
      userInput.disabled = false;
      sendBtn.disabled = false;
      userInput.focus();
    }
  }

  function appendToChat(sender, text) {
    const messageEl = document.createElement("div");
    messageEl.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messageEl.className = "mb-2";
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
