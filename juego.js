(() => {
  "use strict";

  const SESSION_KEY = "geoaventurasActiveV03";
  const catalog = window.GEO_CATALOGO || [];
  const provinces = window.GEO_PROVINCIAS || {};
  const currentProvinceId = "limon";

  const defaultState = {
    version: "0.3",
    player: "",
    totalScore: 0,
    completed: {},
    badges: {},
    provinceScores: {}
  };

  const runtime = {
    province: null,
    activities: [],
    currentIndex: 0,
    missionScore: 0,
    correctAnswers: 0,
    answered: false
  };

  const $ = selector => document.querySelector(selector);
  const screens = [...document.querySelectorAll(".screen")];

  function freshState(player = "") {
    return {
      version: "0.3",
      player,
      totalScore: 0,
      completed: {},
      badges: {},
      provinceScores: {}
    };
  }

  /*
   * La v0.3 utiliza sessionStorage únicamente durante la partida activa.
   * Al abrir o recargar el sitio siempre se muestra la bienvenida y se solicita
   * el nombre. Al presionar "Iniciar aventura" comienza una partida nueva.
   */
  let state = freshState();

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("No fue posible guardar la sesión activa.", error);
    }
  }

  function clearPreviousStorage() {
    // Limpia las versiones anteriores para que el navegador no vuelva a reconocer nombres.
    [
      "geoaventurasStateV02",
      "geoPlayer",
      "geoScore",
      "geoLimonCompleted"
    ].forEach(key => localStorage.removeItem(key));

    sessionStorage.removeItem(SESSION_KEY);
  }

  function showScreen(id) {
    screens.forEach(screen => screen.classList.toggle("active", screen.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function countCompleted() {
    return catalog.filter(item => state.completed[item.id]).length;
  }

  function updateHeader() {
    $("#playerBadge").textContent = state.player || "Explorador";
    $("#scoreTop").textContent = state.totalScore;

    const completed = countCompleted();
    $("#progressText").textContent = `${completed} de 7`;
    $("#nationalProgressBar").style.width = `${(completed / 7) * 100}%`;

    $("#passportSummaryText").textContent = state.completed.limon
      ? "Ya obtuviste el sello de Limón y la insignia Explorador del Caribe."
      : "Completa Limón para obtener tu primer sello.";
  }

  function renderProvinces() {
    const grid = $("#provinceGrid");
    grid.innerHTML = "";

    catalog.forEach(province => {
      const completed = Boolean(state.completed[province.id]);
      const available = province.status === "available";

      const card = document.createElement("button");
      card.type = "button";
      card.className = `province-card ${available ? "available" : "locked"} ${completed ? "completed" : ""}`;
      card.disabled = !available;

      const subtitle = completed
        ? `Misión finalizada · ${state.provinceScores[province.id] || 0} pts`
        : available
          ? "Lista para explorar"
          : "Se incorporará en una próxima versión";

      const status = completed
        ? "✓ Completada"
        : available
          ? "Disponible"
          : "🔒 Próximamente";

      card.innerHTML = `
        <span>
          <strong>${province.name}</strong><br>
          <small>${subtitle}</small>
        </span>
        <span class="status">${status}</span>
      `;

      if (available) card.addEventListener("click", () => openProvince(province.id));
      grid.appendChild(card);
    });
  }

  function renderPassport() {
    const grid = $("#passportGrid");
    grid.innerHTML = "";

    catalog.forEach(province => {
      const completed = Boolean(state.completed[province.id]);
      const badge = provinces[province.id]?.badge;
      const stamp = document.createElement("div");
      stamp.className = `passport-stamp ${completed ? "completed" : ""}`;

      stamp.innerHTML = completed
        ? `
          <div>
            <span class="stamp-icon">${badge?.icon || "✅"}</span>
            <strong>${province.name}</strong>
            <small>Sello obtenido</small>
          </div>
        `
        : `
          <div>
            <span class="stamp-icon">🔒</span>
            <strong>${province.name}</strong>
            <small>Pendiente</small>
          </div>
        `;

      grid.appendChild(stamp);
    });
  }

  function openPassport() {
    if (!state.player) return;
    renderPassport();
    $("#passportModal").classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closePassport() {
    $("#passportModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  function openProvince(id) {
    const province = provinces[id];
    if (!province) return;

    runtime.province = province;
    runtime.activities = province.activities;

    $("#provinceStage").textContent = `Provincia ${province.order}`;
    $("#provinceName").textContent = province.name;
    $("#provinceSummary").textContent = province.summary;
    $("#provinceHeroImage").src = province.heroImage;
    $("#provinceHeroImage").alt = `Ilustración representativa de ${province.name}`;
    $("#provinceCapital").textContent = province.capital;
    $("#provinceCoast").textContent = province.litoral;

    const gradedCount = province.activities.filter(item => item.type !== "info").length;
    $("#provinceQuestions").textContent = gradedCount;
    $("#provinceMaxScore").textContent = `${province.maxScore} pts`;
    $("#arBtn").href = province.arPage;

    const statusBox = $("#provinceStatusBox");
    if (state.completed[id]) {
      statusBox.className = "province-status-box completed";
      statusBox.textContent =
        `✓ Misión completada. Mejor puntaje registrado: ${state.provinceScores[id] || 0} de ${province.maxScore}.`;
      $("#beginQuizBtn").textContent = "Repetir misión";
    } else {
      statusBox.className = "province-status-box pending";
      statusBox.textContent =
        "Completa los seis desafíos para obtener el sello de Limón y la insignia Explorador del Caribe.";
      $("#beginQuizBtn").textContent = "Comenzar misión";
    }

    showScreen("screen-province");
  }

  function startGame() {
    const input = $("#playerName");
    const name = input.value.trim();

    if (name.length < 2) {
      input.focus();
      input.setCustomValidity("Escribe un nombre para iniciar.");
      input.reportValidity();
      return;
    }

    input.setCustomValidity("");

    // Every click starts a completely new participant session.
    state = freshState(name);
    saveSession();
    updateHeader();
    renderProvinces();
    showScreen("screen-map");
  }

  function startMission() {
    runtime.currentIndex = 0;
    runtime.missionScore = 0;
    runtime.correctAnswers = 0;
    runtime.answered = false;

    $("#quizScore").textContent = "0";
    showScreen("screen-activity");
    renderActivity();
  }

  function getGradedPosition() {
    const previous = runtime.activities
      .slice(0, runtime.currentIndex + 1)
      .filter(item => item.type !== "info").length;
    const total = runtime.activities.filter(item => item.type !== "info").length;
    return { previous, total };
  }

  function renderActivity() {
    const item = runtime.activities[runtime.currentIndex];
    runtime.answered = false;

    const progress = (runtime.currentIndex / runtime.activities.length) * 100;
    $("#quizProgressBar").style.width = `${progress}%`;
    $("#activityCategory").textContent =
      item.type === "info" ? "Contenido educativo" : `Desafío de ${runtime.province.name}`;

    $("#infoActivity").classList.add("hidden");
    $("#questionActivity").classList.add("hidden");
    $("#feedback").className = "feedback";
    $("#feedback").textContent = "";
    $("#nextActivityBtn").classList.add("hidden");

    if (item.type === "info") {
      $("#activityCounter").textContent = "Pausa educativa";
      $("#infoImage").src = item.image;
      $("#infoImage").alt = item.heading;
      $("#infoHeading").textContent = item.heading;
      $("#infoBody").textContent = item.body;
      $("#continueInfoBtn").textContent = item.buttonText || "Continuar";
      $("#infoActivity").classList.remove("hidden");
      return;
    }

    const position = getGradedPosition();
    $("#activityCounter").textContent = `Pregunta ${position.previous} de ${position.total}`;

    const typeLabels = {
      single: "Selección única",
      boolean: "Verdadero o falso",
      "image-single": "Desafío visual"
    };
    $("#questionTypeChip").textContent = typeLabels[item.type] || "Desafío";

    const image = $("#questionImage");
    if (item.image) {
      image.src = item.image;
      image.alt = item.imageAlt || "";
      image.classList.remove("hidden");
    } else {
      image.classList.add("hidden");
      image.removeAttribute("src");
    }

    $("#questionText").textContent = item.question;
    const answers = $("#answers");
    answers.innerHTML = "";

    item.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-btn";
      button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
      button.addEventListener("click", () => answerQuestion(index));
      answers.appendChild(button);
    });

    $("#questionActivity").classList.remove("hidden");
  }

  function answerQuestion(selectedIndex) {
    if (runtime.answered) return;
    runtime.answered = true;

    const item = runtime.activities[runtime.currentIndex];
    const buttons = [...document.querySelectorAll(".answer-btn")];
    buttons.forEach(button => button.disabled = true);

    const isCorrect = selectedIndex === item.correct;
    buttons[item.correct].classList.add("correct");
    if (!isCorrect) buttons[selectedIndex].classList.add("incorrect");

    if (isCorrect) {
      runtime.missionScore += item.points || 0;
      runtime.correctAnswers += 1;
      $("#quizScore").textContent = runtime.missionScore;
    }

    const feedback = $("#feedback");
    feedback.className = `feedback show ${isCorrect ? "good" : "bad"}`;
    feedback.innerHTML =
      `<strong>${isCorrect ? "¡Correcto!" : "Respuesta incorrecta."}</strong> ${item.explanation}`;

    $("#nextActivityBtn").classList.remove("hidden");
  }

  function nextActivity() {
    if (runtime.currentIndex < runtime.activities.length - 1) {
      runtime.currentIndex += 1;
      renderActivity();
    } else {
      finishMission();
    }
  }

  function finishMission() {
    $("#quizProgressBar").style.width = "100%";

    const id = runtime.province.id;
    const previousBest = Number(state.provinceScores[id] || 0);
    const newBest = Math.max(previousBest, runtime.missionScore);

    state.completed[id] = true;
    state.badges[id] = true;
    state.provinceScores[id] = newBest;
    state.totalScore = Object.values(state.provinceScores)
      .reduce((sum, value) => sum + Number(value || 0), 0);

    saveSession();

    $("#finalScore").textContent = runtime.missionScore;
    $("#correctAnswers").textContent = runtime.correctAnswers;
    $("#resultBadgeIcon").textContent = runtime.province.badge.icon;
    $("#resultBadgeName").textContent = runtime.province.badge.name;

    let message;
    if (runtime.missionScore === runtime.province.maxScore) {
      message = `${state.player}, lograste una misión perfecta y dominaste todos los desafíos de Limón.`;
    } else if (runtime.missionScore >= 40) {
      message = `${state.player}, completaste la misión con un resultado muy bueno.`;
    } else {
      message = `${state.player}, completaste la misión. La información aprendida te ayudará en el resto del recorrido.`;
    }

    $("#resultMessage").textContent = message;
    updateHeader();
    renderProvinces();
    showScreen("screen-result");
  }

  function startNewPlayer(requireConfirmation = true) {
    const hasActiveGame = Boolean(state.player);
    if (
      requireConfirmation &&
      hasActiveGame &&
      !confirm("¿Deseas finalizar esta partida e iniciar con un nuevo participante?")
    ) {
      return;
    }

    state = freshState();
    runtime.currentIndex = 0;
    runtime.missionScore = 0;
    runtime.correctAnswers = 0;
    runtime.answered = false;

    sessionStorage.removeItem(SESSION_KEY);
    $("#playerName").value = "";
    closePassport();
    updateHeader();
    renderProvinces();
    showScreen("screen-welcome");

    setTimeout(() => $("#playerName").focus(), 250);
  }

  document.addEventListener("DOMContentLoaded", () => {
    runtime.province = provinces[currentProvinceId];
    runtime.activities = runtime.province?.activities || [];

    // Required behavior for a shared device at the science fair.
    clearPreviousStorage();
    state = freshState();
    $("#playerName").value = "";

    updateHeader();
    renderProvinces();
    showScreen("screen-welcome");

    $("#startBtn").addEventListener("click", startGame);
    $("#playerName").addEventListener("keydown", event => {
      if (event.key === "Enter") startGame();
    });

    $("#homeLogoBtn").addEventListener("click", () => {
      showScreen(state.player ? "screen-map" : "screen-welcome");
    });

    $("#newPlayerBtn").addEventListener("click", () => startNewPlayer(true));
    $("#passportBtn").addEventListener("click", openPassport);

    document.querySelectorAll("[data-close-modal]").forEach(element => {
      element.addEventListener("click", closePassport);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closePassport();
    });

    $("#beginQuizBtn").addEventListener("click", startMission);
    $("#continueInfoBtn").addEventListener("click", nextActivity);
    $("#nextActivityBtn").addEventListener("click", nextActivity);
    $("#returnMapBtn").addEventListener("click", () => showScreen("screen-map"));
    $("#repeatMissionBtn").addEventListener("click", startMission);
    $("#resetBtn").addEventListener("click", () => startNewPlayer(true));

    document.querySelectorAll("[data-go]").forEach(button => {
      button.addEventListener("click", () => showScreen(button.dataset.go));
    });
  });
})();
