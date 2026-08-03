const provinces = [
  { id: "limon", name: "Limón", available: true },
  { id: "san-jose", name: "San José", available: false },
  { id: "alajuela", name: "Alajuela", available: false },
  { id: "cartago", name: "Cartago", available: false },
  { id: "heredia", name: "Heredia", available: false },
  { id: "guanacaste", name: "Guanacaste", available: false },
  { id: "puntarenas", name: "Puntarenas", available: false }
];

const questions = [
  {
    question: "¿Dónde se ubica la provincia de Limón?",
    options: [
      "En la zona noroeste de Costa Rica.",
      "En el Pacífico Norte.",
      "En la zona este y noreste de Costa Rica.",
      "En el Valle Central."
    ],
    correct: 2,
    explanation: "Limón se localiza en la zona este y noreste del país, a lo largo de la costa del Caribe."
  },
  {
    question: "¿Cuál es un dato histórico de la provincia de Limón?",
    options: [
      "En 1870 se inició la construcción de un ferrocarril para comunicar la provincia con el resto del país.",
      "La provincia fue fundada por Juan Vázquez de Coronado.",
      "En 1981 se construyó el puerto de Caldera.",
      "En Limón se fundó la Casa de Enseñanza de Santo Tomás."
    ],
    correct: 0,
    explanation: "La construcción del ferrocarril al Caribe fue fundamental para conectar Limón con el Valle Central."
  },
  {
    question: "¿Cuál es una característica de la provincia de Limón?",
    options: [
      "Es la provincia más pequeña del país.",
      "Limita al norte únicamente con Panamá.",
      "En ella se encuentra el puerto de Caldera.",
      "Comprende la zona costera del Caribe costarricense."
    ],
    correct: 3,
    explanation: "Limón concentra la costa caribeña de Costa Rica y posee importantes ecosistemas tropicales."
  },
  {
    question: "¿Cuál es la capital de la provincia de Limón?",
    options: ["Guápiles.", "Siquirres.", "Limón.", "Talamanca."],
    correct: 2,
    explanation: "La ciudad de Limón es la capital de la provincia del mismo nombre."
  },
  {
    question: "¿Cuál mar se encuentra frente a las costas de Limón?",
    options: ["Mar Caribe.", "Mar Mediterráneo.", "Mar Rojo.", "Mar del Norte."],
    correct: 0,
    explanation: "La costa de Limón está bañada por el mar Caribe."
  },
  {
    question: "¿Cuál actividad es importante para la economía de Limón?",
    options: [
      "La actividad portuaria.",
      "La fabricación de aviones.",
      "La extracción de nieve.",
      "La producción de trenes eléctricos."
    ],
    correct: 0,
    explanation: "Los puertos del Caribe movilizan una parte importante del comercio exterior de Costa Rica."
  }
];

const state = {
  player: localStorage.getItem("geoPlayer") || "",
  score: Number(localStorage.getItem("geoScore") || 0),
  completedLimon: localStorage.getItem("geoLimonCompleted") === "true",
  currentQuestion: 0,
  quizScore: 0,
  locked: false
};

const $ = (selector) => document.querySelector(selector);
const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle("active", screen.id === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateHeader() {
  $("#playerBadge").textContent = state.player || "Explorador";
  $("#scoreTop").textContent = state.score;
  $("#progressText").textContent = `${state.completedLimon ? 1 : 0} de 7`;
}

function renderProvinces() {
  const grid = $("#provinceGrid");
  grid.innerHTML = "";
  provinces.forEach(province => {
    const isLimon = province.id === "limon";
    const completed = isLimon && state.completedLimon;
    const card = document.createElement("button");
    card.className = `province-card ${province.available ? "available" : "locked"} ${completed ? "completed" : ""}`;
    card.disabled = !province.available;
    card.innerHTML = `
      <span>
        <strong>${province.name}</strong><br>
        <small>${completed ? "Misión finalizada" : province.available ? "Lista para explorar" : "Pendiente de desbloqueo"}</small>
      </span>
      <span class="status">${completed ? "Completada" : province.available ? "Disponible" : "🔒 Bloqueada"}</span>
    `;
    if (isLimon) card.addEventListener("click", () => showScreen("screen-limon"));
    grid.appendChild(card);
  });
}

function startGame() {
  const name = $("#playerName").value.trim();
  if (name.length < 2) {
    $("#playerName").focus();
    $("#playerName").setCustomValidity("Escribe un nombre para iniciar.");
    $("#playerName").reportValidity();
    return;
  }
  $("#playerName").setCustomValidity("");
  state.player = name;
  localStorage.setItem("geoPlayer", name);
  updateHeader();
  renderProvinces();
  showScreen("screen-map");
}

function startQuiz() {
  state.currentQuestion = 0;
  state.quizScore = 0;
  state.locked = false;
  $("#quizScore").textContent = "0";
  renderQuestion();
  showScreen("screen-quiz");
}

function renderQuestion() {
  const item = questions[state.currentQuestion];
  state.locked = false;
  $("#questionCounter").textContent = `Pregunta ${state.currentQuestion + 1} de ${questions.length}`;
  $("#questionText").textContent = item.question;
  $("#quizProgressBar").style.width = `${((state.currentQuestion) / questions.length) * 100}%`;
  $("#feedback").className = "feedback";
  $("#feedback").textContent = "";
  $("#nextQuestionBtn").classList.add("hidden");

  const answers = $("#answers");
  answers.innerHTML = "";
  item.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    btn.addEventListener("click", () => answerQuestion(index));
    answers.appendChild(btn);
  });
}

function answerQuestion(selectedIndex) {
  if (state.locked) return;
  state.locked = true;
  const item = questions[state.currentQuestion];
  const buttons = [...document.querySelectorAll(".answer-btn")];
  buttons.forEach(button => button.disabled = true);

  const isCorrect = selectedIndex === item.correct;
  buttons[item.correct].classList.add("correct");
  if (!isCorrect) buttons[selectedIndex].classList.add("incorrect");

  if (isCorrect) {
    state.quizScore += 10;
    $("#quizScore").textContent = state.quizScore;
  }

  const feedback = $("#feedback");
  feedback.className = `feedback show ${isCorrect ? "good" : "bad"}`;
  feedback.innerHTML = `<strong>${isCorrect ? "¡Correcto!" : "Respuesta incorrecta."}</strong> ${item.explanation}`;
  $("#nextQuestionBtn").classList.remove("hidden");
}

function nextQuestion() {
  if (state.currentQuestion < questions.length - 1) {
    state.currentQuestion += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  state.completedLimon = true;
  state.score = state.quizScore;
  localStorage.setItem("geoLimonCompleted", "true");
  localStorage.setItem("geoScore", String(state.score));
  $("#quizProgressBar").style.width = "100%";
  $("#finalScore").textContent = state.quizScore;

  let message = "";
  if (state.quizScore === 60) message = `${state.player}, lograste una misión perfecta. Dominaste todos los datos de Limón.`;
  else if (state.quizScore >= 40) message = `${state.player}, completaste la misión con un resultado muy bueno.`;
  else message = `${state.player}, completaste la misión. Revisa los datos aprendidos y continúa explorando.`;

  $("#resultMessage").textContent = message;
  updateHeader();
  renderProvinces();
  showScreen("screen-result");
}

function resetPrototype() {
  if (!confirm("¿Deseas borrar el nombre, el puntaje y el avance de este dispositivo?")) return;
  localStorage.removeItem("geoPlayer");
  localStorage.removeItem("geoScore");
  localStorage.removeItem("geoLimonCompleted");
  state.player = "";
  state.score = 0;
  state.completedLimon = false;
  $("#playerName").value = "";
  updateHeader();
  renderProvinces();
  showScreen("screen-welcome");
}

document.addEventListener("DOMContentLoaded", () => {
  $("#playerName").value = state.player;
  updateHeader();
  renderProvinces();

  $("#startBtn").addEventListener("click", startGame);
  $("#playerName").addEventListener("keydown", event => {
    if (event.key === "Enter") startGame();
  });
  $("#beginQuizBtn").addEventListener("click", startQuiz);
  $("#nextQuestionBtn").addEventListener("click", nextQuestion);
  $("#returnMapBtn").addEventListener("click", () => showScreen("screen-map"));
  $("#resetBtn").addEventListener("click", resetPrototype);

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => showScreen(button.dataset.go));
  });

  if (state.player) showScreen("screen-map");
});
