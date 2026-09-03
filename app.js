(() => {
  "use strict";

  const cfg = window.GEO_CONFIG;
  const provinces = window.GEO_PROVINCIAS || [];
  const byId = Object.fromEntries(provinces.map(p => [p.id, p]));
  const screens = [...document.querySelectorAll(".screen")];
  const $ = s => document.querySelector(s);

  let soundEnabled = true;
  let runtime = { provinceId:null, questionIndex:0, attemptScore:0, locked:false };
  let currentArProvinceId = null;
  let cameraStream = null;
  let cameraAuthorized = false;
  let badgeRevealTimer = null;

  function freshState(player=""){
    return {
      sessionId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      player,
      provinces: Object.fromEntries(provinces.map(p => [p.id, {
        bestScore:0,
        questionsPassed:false,
        badgeCaptured:false,
        attempts:0
      }]))
    };
  }

  let state = freshState();

  function showScreen(id){
    screens.forEach(s => s.classList.toggle("active", s.id === id));
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function isComplete(pid){
    const s = state.provinces[pid];
    return s.questionsPassed && s.badgeCaptured;
  }

  function isAvailable(index){
    return index === 0 || isComplete(provinces[index-1].id);
  }

  function totalScore(){
    return provinces.reduce((sum,p) => sum + Number(state.provinces[p.id].bestScore || 0), 0);
  }

  function completedCount(){
    return provinces.filter(p => isComplete(p.id)).length;
  }

  function levelFor(score){
    return cfg.niveles.find(n => score >= n.min && score <= n.max)?.nombre || "🧭 Explorador Aprendiz";
  }

  function beep(type="good"){
    if(!soundEnabled || !window.AudioContext) return;
    try{
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = type === "bad" ? 180 : type === "win" ? 760 : 480;
      gain.gain.setValueAtTime(.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .18);
      osc.start(); osc.stop(ctx.currentTime + .2);
    }catch(_){}
  }

  function createButton(label, kind, handler){
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn ${kind}`;
    b.textContent = label;
    b.addEventListener("click", handler);
    return b;
  }

  function updateMap(){
    $("#playerLabel").textContent = state.player || "Explorador";
    $("#totalScore").textContent = totalScore();

    const done = completedCount();
    $("#mapProgressText").textContent = `${done} de 7 provincias completadas`;
    $("#mapProgress").style.width = `${done / 7 * 100}%`;

    const list = $("#provinceList");
    list.innerHTML = "";

    provinces.forEach((p,index) => {
      const s = state.provinces[p.id];
      let cls = "locked", label = "🔒 Bloqueada";

      if(isComplete(p.id)){ cls = "completed"; label = "🏆 Completada"; }
      else if(s.questionsPassed){ cls = "ar-pending"; label = "📱 AR pendiente"; }
      else if(isAvailable(index)){ cls = "available"; label = "🔓 Disponible"; }

      const item = document.createElement("button");
      item.type = "button";
      item.className = `province-item ${cls}`;
      item.disabled = cls === "locked";
      item.innerHTML = `
        <span>
          <strong>${p.orden}. ${p.nombre}</strong><br>
          <small>Mejor puntaje: ${s.bestScore}/100</small>
        </span>
        <span class="state-pill">${label}</span>
      `;

      if(!item.disabled) item.addEventListener("click", () => openProvince(p.id));
      list.appendChild(item);
    });

    if(done === 7) showFinal();
  }

  function startGame(){
    const name = $("#playerName").value.trim();
    if(name.length < 2){
      $("#playerName").focus();
      $("#playerName").setCustomValidity("Escribe tu nombre para comenzar.");
      $("#playerName").reportValidity();
      return;
    }
    $("#playerName").setCustomValidity("");
    state = freshState(name);
    runtime = { provinceId:null, questionIndex:0, attemptScore:0, locked:false };
    showScreen("instructionsScreen");
  }

  function openProvince(pid){
    const p = byId[pid];
    const s = state.provinces[pid];

    runtime.provinceId = pid;
    $("#provinceOrder").textContent = `PROVINCIA ${p.orden} DE 7`;
    $("#provinceTitle").textContent = p.nombre;
    $("#provinceImage").src = p.imagen;
    $("#provinceImage").alt = `Imagen de referencia de ${p.nombre}`;
    $("#provinceBest").textContent = `${s.bestScore} pts`;
    $("#provinceIntro").textContent = p.introduccion || "";

    const status = $("#provinceStatus");
    const actions = $("#provinceActions");
    actions.innerHTML = "";

    if(isComplete(pid)){
      status.textContent = "🏆 Provincia completada. La insignia ya forma parte de tu pasaporte.";
      actions.appendChild(createButton("🎯 Repetir preguntas para mejorar puntaje","primary",() => startQuiz(pid)));
      actions.appendChild(createButton("🛂 Ver pasaporte","secondary",openPassport));
    }else if(s.questionsPassed){
      status.textContent = "🔓 Preguntas superadas. Falta capturar la insignia AR para desbloquear la siguiente provincia.";
      actions.appendChild(createButton("📱 BUSCAR INSIGNIA","primary",() => openAR(pid)));
      actions.appendChild(createButton("🎯 Mejorar puntaje","ghost",() => startQuiz(pid)));
    }else{
      status.textContent = "Completa 5 preguntas. Necesitas mínimo 3 correctas (60 puntos) para desbloquear la realidad aumentada.";
      actions.appendChild(createButton("🎯 COMENZAR RETO","primary",() => startQuiz(pid)));
    }

    showScreen("provinceScreen");
  }

  function startQuiz(pid){
    runtime = { provinceId:pid, questionIndex:0, attemptScore:0, locked:false };
    state.provinces[pid].attempts += 1;
    $("#quizScore").textContent = "0";
    showScreen("quizScreen");
    renderQuestion();
  }

  function renderQuestion(){
    const p = byId[runtime.provinceId];
    const q = p.preguntas[runtime.questionIndex];

    runtime.locked = false;
    $("#quizProvince").textContent = `${p.nombre} · RETO`;
    $("#quizCounter").textContent = `Pregunta ${runtime.questionIndex+1} de 5`;
    $("#quizReto").textContent = q.reto || "";
    $("#quizProgress").style.width = `${runtime.questionIndex / 5 * 100}%`;
    $("#questionText").textContent = q.pregunta;

    const answers = $("#answers");
    answers.innerHTML = "";

    q.opciones.forEach((opt,i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "answer";
      b.textContent = `${String.fromCharCode(65+i)}. ${opt}`;
      b.addEventListener("click", () => answer(i));
      answers.appendChild(b);
    });

    $("#feedback").className = "feedback";
    $("#feedback").textContent = "";
    $("#nextQuestionBtn").classList.add("hidden");
  }

  function answer(selected){
    if(runtime.locked) return;
    runtime.locked = true;

    const p = byId[runtime.provinceId];
    const q = p.preguntas[runtime.questionIndex];
    const buttons = [...document.querySelectorAll(".answer")];

    buttons.forEach(b => b.disabled = true);
    const correct = selected === q.correcta;

    buttons[q.correcta].classList.add("correct");
    if(!correct) buttons[selected].classList.add("incorrect");

    if(correct){
      runtime.attemptScore += cfg.puntosPorRespuesta;
      $("#quizScore").textContent = runtime.attemptScore;
      beep("good");
    }else{
      beep("bad");
    }

    const fb = $("#feedback");
    fb.className = `feedback show ${correct ? "good" : "bad"}`;
    fb.innerHTML = correct
      ? "<strong>¡Correcto!</strong> Sumaste 20 puntos."
      : `<strong>Respuesta incorrecta.</strong> La respuesta correcta es: ${q.opciones[q.correcta]}`;

    $("#nextQuestionBtn").classList.remove("hidden");
  }

  function nextQuestion(){
    if(runtime.questionIndex < 4){
      runtime.questionIndex += 1;
      renderQuestion();
      return;
    }
    finishAttempt();
  }

  function finishAttempt(){
    const pid = runtime.provinceId;
    const p = byId[pid];
    const s = state.provinces[pid];

    s.bestScore = Math.max(s.bestScore, runtime.attemptScore);
    if(runtime.attemptScore >= cfg.minimoAprobacion) s.questionsPassed = true;

    $("#resultScore").textContent = runtime.attemptScore;
    const actions = $("#resultActions");
    actions.innerHTML = "";

    if(runtime.attemptScore >= cfg.minimoAprobacion){
      $("#resultIcon").textContent = "🔓";
      $("#resultTitle").textContent = `¡${p.nombre} superado!`;
      $("#resultText").textContent = `Obtuviste ${runtime.attemptScore} puntos. La realidad aumentada quedó desbloqueada.`;
      actions.appendChild(createButton("📱 BUSCAR INSIGNIA","primary",() => openAR(pid)));
      actions.appendChild(createButton("🗺️ Volver al mapa","secondary",() => { updateMap(); showScreen("mapScreen"); }));
      beep("win");
    }else{
      $("#resultIcon").textContent = "🔄";
      $("#resultTitle").textContent = "Debes repetir la provincia";
      $("#resultText").textContent = `Obtuviste ${runtime.attemptScore} puntos. Necesitas mínimo 60. El mejor resultado se conserva automáticamente.`;
      actions.appendChild(createButton("🔄 REPETIR RETO","primary",() => startQuiz(pid)));
      actions.appendChild(createButton("🗺️ Volver al mapa","ghost",() => { updateMap(); showScreen("mapScreen"); }));
    }

    showScreen("provinceResultScreen");
  }

  async function ensureCamera(){
    if(cameraStream){
      cameraAuthorized = true;
      bindCameraStream();
      return true;
    }

    if(!navigator.mediaDevices?.getUserMedia){
      alert("Este navegador no permite acceso a la cámara.");
      return false;
    }

    try{
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"environment"}},
        audio:false
      });
      cameraAuthorized = true;
      bindCameraStream();
      return true;
    }catch(err){
      alert("No fue posible activar la cámara. Revisa el permiso del navegador.");
      return false;
    }
  }

  function bindCameraStream(){
    const video = $("#cameraFeed");
    if(video && cameraStream){
      video.srcObject = cameraStream;
      $("#cameraPermissionCard").classList.add("hidden");
      $("#cameraReadyCard").classList.remove("hidden");
    }
  }

  function openAR(pid){
    currentArProvinceId = pid;
    const p = byId[pid];
    $("#arProvinceTitle").textContent = p.nombre;
    $("#arIntroText").textContent = `Busca la insignia de ${p.nombre} y captúrala para completar la misión.`;
    $("#floatingBadge").textContent = p.sigla;
    $("#floatingBadge").style.background = p.color;
    $("#captureBadgeBtn").classList.add("hidden");
    $("#floatingBadge").classList.add("hidden");
    $("#arOverlayHint").textContent = "Mueve lentamente el celular y explora el espacio…";

    if(cameraAuthorized){
      $("#cameraPermissionCard").classList.add("hidden");
      $("#cameraReadyCard").classList.remove("hidden");
      bindCameraStream();
    }else{
      $("#cameraPermissionCard").classList.remove("hidden");
      $("#cameraReadyCard").classList.add("hidden");
    }

    showScreen("arScreen");
  }

  function showBadge(){
    const p = byId[currentArProvinceId];
    if(!p) return;
    if(badgeRevealTimer) clearTimeout(badgeRevealTimer);
    $("#floatingBadge").classList.add("hidden");
    $("#captureBadgeBtn").classList.add("hidden");
    $("#arOverlayHint").textContent = "Buscando…";
    badgeRevealTimer = setTimeout(() => {
      $("#floatingBadge").classList.remove("hidden");
      $("#captureBadgeBtn").classList.remove("hidden");
      $("#arOverlayHint").textContent = "✨ ¡Encontraste la insignia!";
    }, 1200);
  }

  function captureBadge(){
    const p = byId[currentArProvinceId];
    if(!p) return;
    state.provinces[currentArProvinceId].badgeCaptured = true;
    beep("win");

    $("#successBadgeVisual").textContent = p.sigla;
    $("#successBadgeVisual").style.background = p.color;
    $("#arSuccessTitle").textContent = `${p.nombre} completada`;
    $("#arCuriousFact").textContent = p.datoCuriosoTemporal || `Dato curioso pendiente de definir para ${p.nombre}.`;

    showScreen("arSuccessScreen");
  }

  function speakCuriousFact(){
    const p = byId[currentArProvinceId];
    if(!p || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(p.datoCuriosoTemporal || `Dato curioso pendiente de definir para ${p.nombre}.`);
    u.lang = "es-CR";
    u.rate = .95;
    speechSynthesis.speak(u);
  }

  function openPassport(){
    $("#passportPlayer").textContent = state.player;
    $("#passportScore").textContent = totalScore();
    $("#passportLevel").textContent = levelFor(totalScore());
    $("#passportBadgesCount").textContent = completedCount();

    const grid = $("#passportGrid");
    grid.innerHTML = "";

    provinces.forEach(p => {
      const complete = isComplete(p.id);
      const item = document.createElement("div");
      item.className = `passport-item ${complete ? "complete" : ""}`;
      item.innerHTML = complete
        ? `<div class="badge-token" style="background:${p.color}">${p.sigla}</div><strong>${p.nombre}</strong><br><small>Sello obtenido</small>`
        : `<div class="badge-token" style="background:#98A7AD">🔒</div><strong>${p.nombre}</strong><br><small>Pendiente</small>`;
      grid.appendChild(item);
    });

    $("#passportModal").classList.remove("hidden");
  }

  function closePassport(){
    $("#passportModal").classList.add("hidden");
  }

  function showFinal(){
    const score = totalScore();
    $("#finalName").textContent = state.player;
    $("#finalScore").textContent = score;
    $("#finalLevel").textContent = levelFor(score);

    const row = $("#finalBadges");
    row.innerHTML = "";
    provinces.forEach(p => {
      const b = document.createElement("div");
      b.className = "badge-token";
      b.style.background = p.color;
      b.textContent = p.sigla;
      b.title = p.nombre;
      row.appendChild(b);
    });

    showScreen("finalScreen");
  }

  function openCertificatePreview(){
    const score = totalScore();
    $("#certName").textContent = state.player;
    $("#certScore").textContent = `${score} / 700`;
    $("#certLevel").textContent = levelFor(score);
    showScreen("certificatePreviewScreen");
  }

  function downloadCertificate(){
    if(!window.jspdf?.jsPDF){
      alert("No fue posible cargar el generador de PDF. Revisa la conexión e inténtalo de nuevo.");
      return;
    }

    const {jsPDF} = window.jspdf;
    const doc = new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
    const score = totalScore();
    const level = levelFor(score).replace(/^[^A-Za-zÁÉÍÓÚÑ]+/,"");

    doc.setFillColor(247,252,253);
    doc.rect(0,0,297,210,"F");

    doc.setFillColor(75,151,26); doc.rect(0,0,297,10,"F");
    doc.setFillColor(242,76,23); doc.rect(0,200,297,10,"F");

    doc.setDrawColor(75,151,26);
    doc.setLineWidth(2);
    doc.roundedRect(10,10,277,190,6,6);

    doc.setTextColor(75,151,26);
    doc.setFont("helvetica","bold");
    doc.setFontSize(18);
    doc.text("GeoAventuras CR · EXPOTEC 2026",148.5,28,{align:"center"});

    doc.setTextColor(29,44,50);
    doc.setFontSize(28);
    doc.text("Certificado de Participación",148.5,48,{align:"center"});
    doc.setFont("helvetica","normal");
    doc.setFontSize(14);
    doc.text("Se reconoce a",148.5,62,{align:"center"});
    doc.setFont("helvetica","bold");
    doc.setFontSize(24);
    doc.text(state.player,148.5,79,{align:"center"});
    doc.setFont("helvetica","normal");
    doc.setFontSize(13);
    doc.text("por completar satisfactoriamente el recorrido educativo interactivo de las 7 provincias de Costa Rica.",148.5,95,{align:"center", maxWidth:240});

    doc.setFontSize(12);
    doc.text(`Puntaje obtenido: ${score} / 700 puntos`,25,124);
    doc.text(`Nivel alcanzado: ${level}`,25,138);
    doc.text("Insignias obtenidas: 7 de 7",25,152);
    doc.text("Proyecto: GeoAventuras CR",25,166);

    doc.setFont("helvetica","bold");
    doc.text("¡Sigue explorando, aprendiendo y descubriendo Costa Rica!",148.5,182,{align:"center"});

    doc.save(`Certificado-GeoAventuras-${state.player.replace(/\s+/g,"-")}.pdf`);
  }

  function newPlayer(){
    if(state.player && !confirm("¿Deseas finalizar esta partida e iniciar con un nuevo jugador?")) return;
    state = freshState();
    runtime = { provinceId:null, questionIndex:0, attemptScore:0, locked:false };
    currentArProvinceId = null;
    $("#playerName").value = "";
    closePassport();
    showScreen("welcomeScreen");
    setTimeout(() => $("#playerName").focus(), 200);
  }

  document.addEventListener("DOMContentLoaded", () => {
    state = freshState();
    showScreen("welcomeScreen");

    $("#startBtn").addEventListener("click", startGame);
    $("#playerName").addEventListener("keydown", e => { if(e.key === "Enter") startGame(); });
    $("#instructionsStartBtn").addEventListener("click", () => { updateMap(); showScreen("mapScreen"); });
    $("#instructionsBtn").addEventListener("click", () => showScreen("instructionsScreen"));
    $("#passportBtn").addEventListener("click", () => { if(state.player) openPassport(); });
    $("#newPlayerBtn").addEventListener("click", newPlayer);
    $("#finalNewPlayerBtn").addEventListener("click", newPlayer);
    $("#previewCertificateBtn").addEventListener("click", openCertificatePreview);
    $("#downloadCertificateBtn").addEventListener("click", downloadCertificate);
    $("#backFromCertificateBtn").addEventListener("click", showFinal);

    $("#soundBtn").addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      $("#soundBtn").innerHTML = `${soundEnabled ? "🔊" : "🔇"} <span>Sonido</span>`;
    });

    $("#brandBtn").addEventListener("click", () => {
      if(state.player){ updateMap(); showScreen("mapScreen"); }
      else showScreen("welcomeScreen");
    });

    $("#nextQuestionBtn").addEventListener("click", nextQuestion);
    document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => { updateMap(); showScreen(b.dataset.go); }));
    document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closePassport));
    document.addEventListener("keydown", e => { if(e.key === "Escape") closePassport(); });

    $("#activateCameraBtn").addEventListener("click", ensureCamera);
    $("#showBadgeBtn").addEventListener("click", showBadge);
    $("#captureBadgeBtn").addEventListener("click", captureBadge);
    $("#closeArBtn").addEventListener("click", () => openProvince(currentArProvinceId));
    $("#listenFactBtn").addEventListener("click", speakCuriousFact);
    $("#continueFromArBtn").addEventListener("click", () => {
      updateMap();
      if(completedCount() === 7) showFinal();
      else showScreen("mapScreen");
    });
  });
})();
