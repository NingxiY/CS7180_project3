// TODO: replace stubResponse() with a real fetch() call once POST /api/advice exists.

const form = document.getElementById("advice-form");
const submitBtn = document.getElementById("submit-btn");
const resultSection = document.getElementById("result");
const resultContent = document.getElementById("result-content");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const context = document.getElementById("context").value.trim();
  if (!context) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Thinking…";
  resultSection.hidden = true;

  // Simulate a short delay so the loading state is visible.
  setTimeout(() => {
    showResult(stubResponse(context));
    submitBtn.disabled = false;
    submitBtn.textContent = "Get Advice";
  }, 600);
});

function stubResponse(context) {
  return (
    "[PLACEHOLDER — backend not connected]\n\n" +
    "Your advice from the AI agents will appear here once the FastAPI " +
    "backend is running.\n\n" +
    "You submitted:\n" +
    context
  );
}

function showResult(text) {
  resultContent.textContent = text;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
