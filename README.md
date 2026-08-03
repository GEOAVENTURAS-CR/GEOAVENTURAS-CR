# GeoAventuras CR — Prototipo v0.3

Versión optimizada para uso compartido durante la feria científica.

## Cambios principales de la v0.3

### Nuevo mapa inicial

- Mapa escolar a color con una forma claramente reconocible de Costa Rica.
- Las siete provincias aparecen delimitadas y rotuladas.
- Diseño visual inspirado en la referencia aprobada por el equipo.
- Fondo marino y presentación tipo aventura educativa.
- Indicador animado de **Limón disponible**.
- Leyenda de provincias disponibles y próximas.

### Nueva administración de participantes

- El juego siempre abre en la pantalla de bienvenida.
- Siempre solicita el nombre del participante.
- Cada vez que se presiona **Iniciar aventura**, comienza una partida totalmente nueva.
- No se reutilizan nombres, puntajes ni avances de jugadores anteriores.
- Se agregó el botón **Nuevo jugador** para cambiar rápidamente de participante.
- La realidad aumentada se abre en otra pestaña para no interrumpir la partida actual.

## Funciones conservadas

- Pasaporte digital.
- Sello de Limón.
- Insignia Explorador del Caribe.
- Seis preguntas evaluadas.
- Tarjeta educativa entre preguntas.
- Pregunta visual.
- Pregunta de verdadero o falso.
- Puntaje y respuestas correctas.
- Experiencia WebAR temporal.
- Diseño adaptable a computadora, tableta y celular.

## Estructura principal

```text
GEOAVENTURAS-CR/
├── index.html
├── estilos.css
├── juego.js
├── ar-limon.html
├── marcador-prueba.html
├── datos/
│   ├── catalogo.js
│   └── limon.js
└── assets/
    ├── logo-geoaventuras.jpg
    ├── mapa-costa-rica-color.png
    └── limon/
        ├── limon-representativa.svg
        ├── tarjeta-ferrocarril.svg
        └── pregunta-puerto.svg
```

## Actualización en GitHub

1. Descomprime `GeoAventuras-CR-v0.3.zip`.
2. En GitHub abre el repositorio.
3. Selecciona `Add file` → `Upload files`.
4. Arrastra todo el contenido interno.
5. Escribe como mensaje:

   `Actualización GeoAventuras CR v0.3`

6. Presiona `Commit changes`.
7. Espera a que GitHub Pages termine de publicar.
8. Recarga con `Ctrl + F5`.

No es necesario modificar nuevamente la configuración de GitHub Pages.

## Prueba operativa recomendada

1. Abrir el juego y confirmar que solicita el nombre.
2. Iniciar una partida.
3. Verificar el mapa escolar a color.
4. Completar Limón.
5. Presionar **Nuevo jugador**.
6. Confirmar que solicita otro nombre y que el puntaje inicia en cero.
7. Cerrar y volver a abrir el sitio.
8. Confirmar que nuevamente solicita el nombre.
