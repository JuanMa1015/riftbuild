# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versiones según [SemVer](https://semver.org/lang/es/).
Mientras la versión sea `0.x`, un cambio de *minor* puede romper cosas.

## [Sin publicar]

### Añadido
- Versión única en `package.json`: el APK la lee (`versionName` y `versionCode`) y Ajustes la muestra.
- Script `npm run release` para subir versión, ordenar este archivo y preparar las notas de la release.

## [0.7.0] - 2026-10-19

### Añadido
- Análisis con IA automático al abrir la build: espera hasta 4 s y, si tarda o falla, muestra la versión local.
- Respuesta tardía de la IA: se ofrece con un botón "Aplicar" en lugar de cambiar la build bajo los ojos.
- Pausa de 5 min ante errores de clave, créditos o límite de uso.

## [0.6.0] - 2026-10-19

### Añadido
- Burbuja activada por defecto (recuerda si la apagas) y botón de burbuja rotulado.
- Historial de partidas (Gané / Perdí) con porcentaje por campeón y total en Ajustes.
- Propuesta automática de builds por pull request según las notas del parche (requiere secreto `OPENROUTER_API_KEY`).

### Corregido
- "Mejorar con IA" no hacía nada: el botón estaba conectado a una función con otro nombre.

## [0.5.0] - 2026-10-19

### Añadido
- Modelo gratuito Nemotron de OpenRouter, anclado a NVIDIA.
- Resumen semanal de las notas del parche oficial: abre un issue si tocan ítems de la app.

## [0.4.0] - 2026-10-19

### Añadido
- Filtro por carril bajo el buscador, para tu campeón y los rivales.
- IA barata: elige solo de la lista de ítems de la app y guarda las respuestas en caché.
- La burbuja se oculta mientras la app está abierta.

### Corregido
- Llamadas a Anthropic desde la app (faltaba la cabecera de acceso desde navegador).
- "Tu carril" ahora muestra el carril elegido; se quitó la barra de scroll de las pistas rápidas.

## [0.3.1] - 2026-10-19

### Añadido
- Quitar y cambiar el campeón elegido; ✕ visible en cada ficha del tablero.
- Burbuja con 6 ítems, botas, runa y hechizos con íconos; "Abrir" lanza la app en ventana flotante.

## [0.3.0] - 2026-10-19

### Añadido
- Rediseño completo ("pizarra táctica"): flujo en 3 pasos, búsqueda en vivo, build en pestañas.
- Vista dividida en modo ventana y variante compacta para ventanas bajas.
- Burbuja flotante compacta, con ✕ para cerrarla y que se pliega sola.

## [0.2.0] - 2026-10-19

### Añadido
- Español LATAM por defecto e inglés.
- Datos del juego actualizables sin APK nuevo (`public/data/game.json`) y actualización semanal.
- Íconos de campeones, ítems, runas y hechizos empaquetados (offline).

## [0.1.0] - 2026-10-19

### Añadido
- Primera versión: asesor de builds por toques, motor local, IA opcional, APK con Capacitor y burbuja flotante.

[Sin publicar]: https://github.com/JuanMa1015/riftbuild/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/JuanMa1015/riftbuild/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/JuanMa1015/riftbuild/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/JuanMa1015/riftbuild/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/JuanMa1015/riftbuild/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/JuanMa1015/riftbuild/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/JuanMa1015/riftbuild/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JuanMa1015/riftbuild/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/JuanMa1015/riftbuild/releases/tag/v0.1.0
