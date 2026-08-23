(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  const provinceId = params.get("provincia");
  const sessionId = params.get("sesion");
  const provinces = window.GEO_PROVINCIAS || [];
  const province = provinces.find(p => p.id === provinceId);

  const $ = s => document.querySelector(s);
  let stream = null;
  let revealTimer = null;

  function reportCapture(){
    const payload = {sessionId, provinceId, ts:Date.now()};
    try{
      localStorage.setItem("geoaventuras-ar-capture", JSON.stringify(payload));
      if("BroadcastChannel" in window){
        const channel = new BroadcastChannel("geoaventuras-ar");
        channel.postMessage(payload);
        channel.close();
      }
    }catch(_){}
  }

  function speak(){
    if(!province || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(province.datoCuriosoTemporal);
    u.lang = "es-CR";
    u.rate = .92;
    speechSynthesis.speak(u);
  }

  async function startCamera(){
    if(!navigator.mediaDevices?.getUserMedia){
      showError("Este navegador no permite acceso a la cámara mediante WebRTC.");
      return;
    }

    try{
      stream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"environment"}},
        audio:false
      });

      $("#camera").srcObject = stream;
      $("#permissionCard").classList.add("hidden");
      $("#huntUI").classList.remove("hidden");
      $("#huntText").textContent = "Mueve lentamente el celular y explora el entorno…";

      // Provisional simulation only. Replaced later by real SLAM/world tracking.
      revealTimer = setTimeout(() => {
        $("#badge").classList.remove("hidden");
        $("#captureBtn").classList.remove("hidden");
        $("#huntText").textContent = "✨ ¡Encontraste la insignia temporal!";
      }, 2800);

    }catch(err){
      showError("Revisa el permiso de cámara del navegador e inténtalo nuevamente.");
    }
  }

  function showError(text){
    $("#permissionCard").classList.add("hidden");
    $("#huntUI").classList.add("hidden");
    $("#errorText").textContent = text;
    $("#errorCard").classList.remove("hidden");
  }

  function capture(){
    reportCapture();
    $("#huntUI").classList.add("hidden");
    $("#successCard").classList.remove("hidden");
    $("#curiousFact").textContent = province.datoCuriosoTemporal;
    $("#successBadge").textContent = province.sigla;
    $("#successBadge").style.background = province.color;
    speak();
  }

  function close(){
    if(revealTimer) clearTimeout(revealTimer);
    if(stream) stream.getTracks().forEach(t => t.stop());
    window.close();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if(!province || !sessionId){
      showError("El enlace no contiene una provincia válida.");
      return;
    }

    $("#provinceName").textContent = province.nombre;
    $("#badge").textContent = province.sigla;
    $("#badge").style.background = province.color;

    $("#cameraBtn").addEventListener("click", startCamera);
    $("#captureBtn").addEventListener("click", capture);
    $("#listenBtn").addEventListener("click", speak);
    $("#closeBtn").addEventListener("click", close);
  });
})();
