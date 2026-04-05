const API_URL = "/api/advice"; // proxied to FastAPI backend once running

const form = document.getElementById("advice-form");
const submitBtn = document.getElementById("submit-btn");
const resultSection = document.getElementById("result");
const resultContent = document.getElementById("result-content");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const context = document.getElementById("context").value.trim();
  if (!context) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Thinking…";
  resultSection.hidden = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    showResult(data.final_advice ?? JSON.stringify(data, null, 2));
  } catch (err) {
    // Backend not running yet — show a placeholder so the UI is testable
    if (err.message.startsWith("Server error") || err instanceof TypeError) {
      showResult(
        "[Backend not connected]\n\nOnce the FastAPI server is running, your advice will appear here.\n\nSubmitted context:\n" + context
      );
    } else {
      showResult("Something went wrong: " + err.message);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Get Advice";
  }
});

function showResult(text) {
  resultContent.textContent = text;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
