const API_URL = "http://localhost:8000/api/v1/advice";
const USER_ID = "demo-user";

const form = document.getElementById("advice-form");
const submitBtn = document.getElementById("submit-btn");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");
const resultSection = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setLoading(true);
  hideError();
  resultSection.hidden = true;

  const payload = buildPayload();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Server returned ${response.status}: ${detail}`);
    }

    const data = await response.json();
    renderResult(data);
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    showError(err.message || "Request failed. Is the backend running?");
  } finally {
    setLoading(false);
  }
});

function buildPayload() {
  const birthDate = document.getElementById("birth-date").value;
  const lookingFor = document.getElementById("looking-for").value;
  const interestsRaw = document.getElementById("interests").value;
  const dealbreakersRaw = document.getElementById("dealbreakers").value;

  return {
    user_id: USER_ID,
    birth_date: birthDate,
    preferences: {
      looking_for: lookingFor,
      interests: splitCSV(interestsRaw),
      dealbreakers: splitCSV(dealbreakersRaw),
    },
  };
}

function splitCSV(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function renderResult(data) {
  document.getElementById("final-advice").textContent = data.final_advice;
  document.getElementById("rationale").textContent = data.rationale;
  renderOpinions(data.opinions || []);
  renderScores(data.scores || []);
  renderSources(data.agent_sources || {});
}

function renderOpinions(opinions) {
  const container = document.getElementById("opinions");
  container.innerHTML = "";
  opinions.forEach((op) => {
    const card = document.createElement("div");
    card.className = "opinion-card";
    card.innerHTML = `
      <div class="opinion-header">
        <span class="agent-name">${capitalize(op.agent_name)}</span>
        <span class="source-badge source-${op.source}">${op.source}</span>
      </div>
      <p class="opinion-advice">${op.advice}</p>
    `;
    container.appendChild(card);
  });
}

function renderScores(scores) {
  const container = document.getElementById("scores");
  container.innerHTML = "";
  scores.forEach((s) => {
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <span class="score-agent">${capitalize(s.agent_name)}</span>
      <span class="score-item">Relevance <strong>${fmt(s.relevance)}</strong></span>
      <span class="score-item">Safety <strong>${fmt(s.safety)}</strong></span>
      <span class="score-item">Coherence <strong>${fmt(s.coherence)}</strong></span>
    `;
    container.appendChild(row);
  });
}

function renderSources(sources) {
  const container = document.getElementById("agent-sources");
  container.innerHTML = "";
  Object.entries(sources).forEach(([agent, src]) => {
    const item = document.createElement("div");
    item.className = "source-row";
    item.innerHTML = `
      <span class="score-agent">${capitalize(agent)}</span>
      <span class="source-badge source-${src}">${src}</span>
    `;
    container.appendChild(item);
  });
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Thinking…" : "Get Advice";
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorSection.hidden = false;
}

function hideError() {
  errorSection.hidden = true;
  errorMessage.textContent = "";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function fmt(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}
