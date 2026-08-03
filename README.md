# GeoAventuras CR — Prototipo v0.2

Versión escalable del juego educativo WebAR sobre las siete provincias de Costa Rica.

## Mejoras incorporadas

- Mapa inicial con forma más real de Costa Rica y estilo visual de aventura educativa.

- Arquitectura separada por contenido y programación.
- Archivo independiente para Limón: `datos/limon.js`.
- Catálogo general de provincias: `datos/catalogo.js`.
- Pasaporte digital con sellos provinciales.
- Insignia **Explorador del Caribe**.
- Migración automática del avance guardado en la versión 0.1.
- Tarjeta educativa con imagen entre preguntas.
- Pregunta visual con imagen.
- Diferentes tipos de actividades:
  - selección única;
  - verdadero o falso;
  - pregunta visual;
  - tarjeta informativa sin puntaje.
- Mejor puntaje guardado por provincia.
- Resumen de respuestas correctas.
- Diseño preparado para incorporar las otras seis provincias.
- Prueba WebAR conservada con marcador temporal.

## Contenido de Limón

La misión contiene:

- 6 preguntas evaluadas.
- 1 tarjeta informativa.
- Puntaje máximo: 60 puntos.
- Un solo intento por pregunta.
- Retroalimentación inmediata.
- Sello de Limón.
- Insignia Explorador del Caribe.

## Estructura

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
    ├── mapa-costa-rica.svg
    └── limon/
        ├── limon-representativa.svg
        ├── tarjeta-ferrocarril.svg
        └── pregunta-puerto.svg
```

## Cómo actualizar desde la v0.1

1. Descomprime `GeoAventuras-CR-v0.2.zip`.
2. En GitHub abre el repositorio `GEOAVENTURAS-CR`.
3. Selecciona `Add file` → `Upload files`.
4. Arrastra **todo el contenido interno** de la carpeta v0.2.
5. GitHub mostrará archivos nuevos y archivos modificados.
6. En el mensaje del cambio escribe:

   `Actualización GeoAventuras CR v0.2`

7. Presiona `Commit changes`.

No es necesario desactivar GitHub Pages. La página se actualizará automáticamente después del commit.

## Prueba operativa mínima

1. Abrir la pantalla de bienvenida.
2. Escribir el nombre.
3. Entrar al mapa.
4. Abrir el pasaporte.
5. Seleccionar Limón.
6. Probar la tarjeta informativa.
7. Completar las seis preguntas.
8. Verificar puntaje, sello e insignia.
9. Cerrar y abrir la página para validar que el progreso permanezca guardado.
10. Probar WebAR desde un celular.

## Cómo agregar preguntas a Limón

Las preguntas están dentro de:

`datos/limon.js`

Para agregar una actividad nueva se incorpora otro objeto dentro de `activities`.

El motor ya está preparado para:

- `single`
- `boolean`
- `image-single`
- `info`

Esta separación permite ampliar Limón aun cuando las demás provincias ya estén construidas.

## Estado del diploma

El certificado PDF se incorporará cuando el recorrido de siete provincias esté disponible, ya que el texto aprobado reconoce la finalización completa del juego.

## Nota técnica WebAR

La v0.2 mantiene el marcador de demostración de MindAR. El paso siguiente será diseñar y compilar una tarjeta marcadora oficial para Limón.
