# GeoAventuras CR — v1.0 base de desarrollo

Esta versión implementa la arquitectura funcional aprobada y aplica el manual visual entregado por el equipo.

## Manual visual aplicado

- Logo principal de GeoAventuras CR.
- Paleta oficial:
  - `#57DCFE`
  - `#FDD9B3`
  - `#4B971A`
  - `#F24C17`
- Tipografía principal: **Fredoka One**.
- Tipografía secundaria: **Poppins**.

## Arquitectura funcional incluida

- Registro de nombre.
- Instrucciones.
- Recorrido obligatorio:
  1. San José
  2. Puntarenas
  3. Heredia
  4. Cartago
  5. Limón
  6. Alajuela
  7. Guanacaste
- 5 preguntas por provincia.
- 20 puntos por respuesta correcta.
- Mínimo 60 puntos para desbloquear la etapa AR.
- Repetición obligatoria si obtiene menos de 60.
- Conservación del mejor puntaje.
- Insignia obligatoria para desbloquear la provincia siguiente.
- Pasaporte digital.
- Niveles finales.
- Generación de pasaporte PDF.
- Nuevo jugador.
- Efectos de sonido básicos.

## Preguntas

Las preguntas incluidas son **temporales**.

Todo el banco está concentrado en:

`data/provincias.js`

Cuando se entregue el banco definitivo, ese archivo podrá sustituirse sin rehacer el motor del juego.

## Realidad aumentada

`ar-prototipo.html` valida por ahora:

- activación de cámara;
- apertura desde cada provincia;
- búsqueda visual;
- captura de insignia;
- comunicación de la captura al juego;
- dato curioso y narración.

**No debe confundirse con la AR final.**
El seguimiento espacial sin marcadores (SLAM/world tracking) sigue pendiente de la prueba técnica específica.

## Publicación

Consulta `MIGRACION_GITHUB.md`.
