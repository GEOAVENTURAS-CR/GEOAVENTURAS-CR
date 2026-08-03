window.GEO_PROVINCIAS = window.GEO_PROVINCIAS || {};

window.GEO_PROVINCIAS.limon = {
  id: "limon",
  name: "Limón",
  order: 1,
  capital: "Limón",
  litoral: "Mar Caribe",
  maxScore: 60,
  badge: {
    name: "Explorador del Caribe",
    icon: "🌊",
    description: "Insignia obtenida al completar la misión de Limón."
  },
  heroImage: "assets/limon/limon-representativa.svg",
  summary:
    "Limón se ubica en la zona este y noreste de Costa Rica, junto al mar Caribe. Destaca por su riqueza natural, diversidad cultural y actividad portuaria.",
  arPage: "ar-limon.html",

  /*
   * El motor admite:
   * - info: tarjeta educativa sin puntaje.
   * - single: selección única.
   * - boolean: verdadero o falso.
   * - image-single: pregunta con imagen.
   *
   * Los contenidos se pueden ampliar posteriormente sin modificar juego.js.
   */
  activities: [
    {
      id: "limon-q1",
      type: "single",
      title: "Ubicación",
      question: "¿Dónde se ubica la provincia de Limón?",
      options: [
        "En la zona noroeste de Costa Rica.",
        "En el Pacífico Norte.",
        "En la zona este y noreste de Costa Rica.",
        "En el Valle Central."
      ],
      correct: 2,
      points: 10,
      explanation:
        "Limón se localiza en la zona este y noreste del país, a lo largo de la costa del Caribe."
    },
    {
      id: "limon-info-ferrocarril",
      type: "info",
      title: "Dato histórico",
      image: "assets/limon/tarjeta-ferrocarril.svg",
      heading: "El ferrocarril al Caribe",
      body:
        "La construcción del ferrocarril fue fundamental para comunicar Limón con el Valle Central y facilitar el transporte de personas y productos.",
      buttonText: "Continuar con el desafío"
    },
    {
      id: "limon-q2",
      type: "single",
      title: "Historia",
      question: "¿Cuál es un dato histórico de la provincia de Limón?",
      options: [
        "En 1870 se inició la construcción de un ferrocarril para comunicar la provincia con el resto del país.",
        "La provincia fue fundada por Juan Vázquez de Coronado.",
        "En 1981 se construyó el puerto de Caldera.",
        "En Limón se fundó la Casa de Enseñanza de Santo Tomás."
      ],
      correct: 0,
      points: 10,
      explanation:
        "La construcción del ferrocarril al Caribe fue fundamental para conectar Limón con el Valle Central."
    },
    {
      id: "limon-q3",
      type: "single",
      title: "Geografía",
      question: "¿Cuál es una característica de la provincia de Limón?",
      options: [
        "Es la provincia más pequeña del país.",
        "Limita al norte únicamente con Panamá.",
        "En ella se encuentra el puerto de Caldera.",
        "Comprende la zona costera del Caribe costarricense."
      ],
      correct: 3,
      points: 10,
      explanation:
        "Limón comprende la costa caribeña de Costa Rica y posee importantes ecosistemas tropicales."
    },
    {
      id: "limon-q4",
      type: "single",
      title: "Capital",
      question: "¿Cuál es la capital de la provincia de Limón?",
      options: ["Guápiles.", "Siquirres.", "Limón.", "Talamanca."],
      correct: 2,
      points: 10,
      explanation:
        "La ciudad de Limón es la capital de la provincia del mismo nombre."
    },
    {
      id: "limon-q5",
      type: "boolean",
      title: "Litoral",
      question: "La costa de Limón se encuentra frente al mar Caribe.",
      options: ["Verdadero", "Falso"],
      correct: 0,
      points: 10,
      explanation:
        "Es verdadero. La provincia de Limón se encuentra frente al mar Caribe."
    },
    {
      id: "limon-q6",
      type: "image-single",
      title: "Economía",
      image: "assets/limon/pregunta-puerto.svg",
      imageAlt: "Barco de carga, grúa y contenedores en un puerto",
      question: "¿Cuál actividad importante para la economía de Limón representa la imagen?",
      options: [
        "La actividad portuaria.",
        "La fabricación de aviones.",
        "La extracción de nieve.",
        "La producción de trenes eléctricos."
      ],
      correct: 0,
      points: 10,
      explanation:
        "La imagen representa la actividad portuaria, fundamental para el comercio exterior de Costa Rica."
    }
  ]
};
