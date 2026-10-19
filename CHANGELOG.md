# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versiones según [SemVer](https://semver.org/lang/es/).
Mientras la versión sea `0.x`, un cambio de *minor* puede romper cosas.

## [Sin publicar]

## [0.8.2] - 2026-10-19

### Añadido
- Aviso en vivo sobre tu pick: conforme agregas rivales, si otro campeón es claramente mejor aparece una flecha con el motivo y el botón "Cambiar a …"; si tu pick se sostiene, un check discreto. "Bloqueado" apaga el aviso (en ranked un pick bloqueado ya no se puede cambiar).
- Filtro de carril automático al buscar rivales: sigue al hueco que estás llenando (Barón, Jungla, Mid…), también si tocas un hueco concreto. Escribir un nombre ignora el carril; tocar un carril lo deja en manual y "Auto" lo devuelve.

## [0.8.1] - 2026-10-19

### Añadido
- Sugeridos de campeón también en el paso Rivales: aparecen desde el primer rival o aliado y se actualizan con cada pick, justo debajo del tablero. Con selector de carril, y en partidas sin información muestran tu pool.
- Los sugeridos mezclan clases (no cinco luchadores seguidos) y dan un pequeño bonus a lo que jugaste hace poco.
- Línea "Según tu campeón y N rivales · amenazas" que dice en qué se basó la build.
- Ajustes confirma cuando hay una clave guardada: la IA se consulta sola y las respuestas se guardan en el teléfono.
- Indicador del motor en la pestaña Build: "Motor local · añade tu clave de IA" (abre Ajustes), "Analizando con IA…", "La IA está tardando", "Build mejorada con IA · modelo" o el motivo del error.

### Corregido
- Elegir un sugerido ya no cambia tu carril al "usual" del campeón.
- "Según 1 rivales": ahora concuerda en singular y plural.
- La build recomendaba 6 ítems más las botas (7 en total). Ahora son 5 ítems y las botas, que ocupan el sexto espacio; también en la IA y en la burbuja.
- Con muchos rivales de AP, algunas plantillas no mostraban las botas (salían vacías); ahora se elige un par válido siempre.
- Los nombres largos de ítems ya no se cortan con "…".

## [0.8.0] - 2026-10-19

### Añadido
- Sugeridos de campeón contra los rivales y aliados ya puestos (reglas de clase y tipo de daño, no estadísticas); se puede llenar primero a los rivales.
- Mi pool: ★ en tu campeón para guardarlo por carril; sale primero al buscar y puntúa más en las sugerencias.
- Temporizadores de Barón, Dragón y Dragón Anciano en la burbuja (toca para iniciar, mantén pulsado para cancelar, vibra al terminar); duraciones editables en Ajustes.
- Notas post-partida: etiquetas de "qué pesó más" y una nota corta, visibles en el historial.
- Introducción de primer uso: qué hace la app y por qué la burbuja pide permiso.
- 8 ítems de Wild Rift (Youmuu, Relicario de los Solari, Warmog, Daga de Statikk, Yun Tal, Abrazo del Serafín, Rey Arruinado, Al Filo de la Cordura) y plantilla de soporte tanque.
- APK de release firmado con clave propia (la clave vive fuera del repo, en `~/.riftbuild`).
- Versión única en `package.json`: el APK la lee (`versionName` y `versionCode`) y Ajustes la muestra.
- Script `npm run release` para subir versión, ordenar este archivo y preparar las notas de la release.

### Cambiado
- 22 ítems pasan a su nombre oficial en español LATAM (por ejemplo Cuchilla Oscura, Cota de Espinas, Filo del Infinito).
- Modelo gratuito por defecto de OpenRouter: Nemotron 3 Super sin razonamiento (responde en ~10 s con JSON válido).

### Corregido
- Con Nemotron Ultra la IA pensaba 30-70 s y se quedaba sin tokens antes de devolver el JSON.

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
