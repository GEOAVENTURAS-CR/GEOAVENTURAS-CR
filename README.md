# GeoAventuras CR — Prototipo v0.1

Juego educativo WebAR sobre las siete provincias de Costa Rica.

## Alcance incluido

- Pantalla de bienvenida.
- Registro del nombre del participante.
- Mapa esquemático de Costa Rica.
- Limón como primera provincia disponible.
- Contenido educativo de Limón.
- Seis preguntas de opción única.
- Un único intento por pregunta.
- Puntaje máximo de 60 puntos.
- Guardado local del nombre, puntaje y progreso.
- Pantalla de resultado.
- Prueba WebAR con MindAR y A-Frame.
- Diseño adaptable a celular, tableta y computadora.

## Archivos principales

- `index.html`: juego principal.
- `estilos.css`: diseño visual.
- `juego.js`: lógica, preguntas, puntaje y guardado.
- `ar-limon.html`: experiencia WebAR de prueba.
- `marcador-prueba.html`: imagen temporal que debe enfocarse.
- `assets/`: logo e ilustraciones.
- `.nojekyll`: evita procesamiento innecesario de GitHub Pages.

## Importante sobre la realidad aumentada

La versión 0.1 usa el marcador oficial de demostración de MindAR. Esto permite validar permisos de cámara, compatibilidad y estabilidad antes de compilar el logo oficial.

En la siguiente fase:

1. Se compila el logo oficial con el **Image Targets Compiler** de MindAR.
2. Se descarga el archivo `targets.mind`.
3. Se cambia la ruta `imageTargetSrc` en `ar-limon.html`.
4. El logo oficial pasa a ser el marcador de realidad aumentada.

## Publicación en GitHub Pages

1. Descomprime el ZIP.
2. Sube **el contenido interno**, no la carpeta contenedora.
3. Confirma que `index.html` quede en la raíz del repositorio.
4. En GitHub abre `Settings`.
5. En el menú izquierdo abre `Pages`.
6. En `Build and deployment`, selecciona `Deploy from a branch`.
7. Selecciona la rama `main` y la carpeta `/ (root)`.
8. Presiona `Save`.

La dirección esperada será:

`https://geoaventuras-cr.github.io/GEOAVENTURAS-CR/`

La publicación puede tardar varios minutos después de guardar.

## Fuentes técnicas

- MindAR 1.2.5.
- A-Frame 1.6.0.
- GitHub Pages.

## Estado del certificado

El certificado PDF se incorporará cuando estén habilitadas las siete provincias, porque el texto aprobado reconoce la finalización del recorrido nacional completo.
