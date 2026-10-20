# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versiones según [SemVer](https://semver.org/lang/es/).
Mientras la versión sea `0.x`, un cambio de *minor* puede romper cosas.

## [Sin publicar]

### Añadido
- Versión web en https://juanma1015.github.io/riftbuild/ (GitHub Pages), publicada automáticamente con cada cambio en `main`. En la web no hay burbuja ni temporizadores, y la clave de IA se guarda sin cifrar en el navegador (la app lo avisa en Ajustes).

## [0.8.7] - 2026-10-19

### Añadido
- Builds propias para 28 campeones muy jugados (tiradores, luchadores, asesinos y magos): ítems, botas y runa principal distintos a los de su clase. Es un primer lote: se revisa tras cada parche.
- "Tus números": tu porcentaje de victorias por campeón y contra cada clase de rival, en Ajustes, y una línea en la build ("Con Ahri contra asesinos: 7 de 10"). Solo aparece con 3 partidas o más.
- Las sugerencias de campeón tienen en cuenta tus resultados con él (con muy poco peso y solo desde 3 partidas).
- Aviso en Ajustes si las notificaciones de RiftBuild están desactivadas (sin ellas no hay forma de volver a abrir la burbuja).
- `PLAY_STORE.md`: lista de pasos para publicar en Google Play.

### Corregido
- La burbuja no volvía al cerrar la ventana de la app o al salir de ella: ahora se muestra y oculta según el ciclo de vida nativo de la app, no según JavaScript.
- Android 13+ ocultaba la notificación de la burbuja por falta del permiso de notificaciones: ahora se pide la primera vez y se explica en Ajustes si se negó.
- Si abres la app, una ✕ anterior de la burbuja ya no la deja oculta.
- Con texto grande del sistema, la cabecera y el selector de IA ya no se cortan.
- Las runas exclusivas de Wild Rift sin ícono muestran sus iniciales en lugar de un "?".
- El idioma de la página (`lang`) sigue al idioma de la app para los lectores de pantalla.

### Calidad
- La actualización automática de datos y el CI comprueban que `game.json` pasa la misma validación que la app antes de publicarlo; ahora también hay pruebas de las builds por campeón y de tus estadísticas.

## [0.8.6] - 2026-10-19

### Añadido
- Selector de idioma ES / EN siempre visible en la cabecera (y en la primera pantalla), con el idioma activo resaltado.
- Modo claro, oscuro o según el sistema (Ajustes → Apariencia).
- Si cierras la burbuja con la ✕ sin querer, la notificación sigue ahí: tócala y la burbuja vuelve. El botón "Cerrar" de la notificación la apaga del todo.

## [0.8.5] - 2026-10-19

### Añadido
- Política de privacidad y cookies, y términos y condiciones, en español e inglés: se leen sin internet desde Ajustes y también como páginas públicas (`docs/`, para GitHub Pages). Enlace de contacto a los issues del repositorio.
- Botón "Probar clave" en Ajustes: explica si la clave es incorrecta, no tiene saldo o no hay conexión.
- Estadísticas anónimas opcionales (GoatCounter, sin cookies), apagadas por defecto; piden consentimiento una vez y se pueden cambiar en Ajustes.

### Cambiado
- Íconos de campeones, ítems, runas y hechizos recomprimidos (de 4,5 MB a 1,8 MB) y carga diferida de imágenes; el APK pesa menos.

### Seguridad
- Respaldo en la nube desactivado (`allowBackup=false`): el almacenamiento de la app, que incluye tu clave de IA, ya no se copia a Google Drive.
- Política de contenido (CSP) en el APK: solo scripts propios y conexión solo a GitHub, OpenRouter, Anthropic y OpenAI.
- El `game.json` descargado o guardado se valida antes de aplicarlo; uno corrupto o malicioso se ignora (antes un caché dañado podía dejar la app en blanco en cada inicio).
- Pantalla de recuperación si algo falla al dibujar, sin mostrar detalles técnicos; permite reiniciar los datos guardados.
- Identificadores de partidas guardadas impredecibles (UUID) en lugar de la hora.
- Tu clave de IA ahora se guarda cifrada (AES-256-GCM con una llave del Android Keystore) y ya no está en el almacenamiento normal de la app; si venías de una versión anterior, se migra sola.
- Carpeta de archivos compartidos acotada a lo necesario; `npm audit` sin vulnerabilidades; las Actions de GitHub quedan fijadas por commit.
- React 19.3.1; Dependabot semanal para npm, Gradle y GitHub Actions.

### Calidad
- Pruebas automáticas (`npm test`) del motor de builds, las sugerencias, el validador de datos y el servicio de IA, y CI en GitHub (lint, textos, pruebas, build y auditoría).

## [0.8.4] - 2026-10-19

### Añadido
- Ícono propio de la app (cancha: círculo central, línea y ficha amarilla) en todos los tamaños de Android, con versión adaptable, redonda y monocroma para íconos con tema, y pantalla de inicio a juego. `npm run icons` lo regenera desde `assets/icons`.

### Cambiado
- El nombre bajo el ícono en el teléfono pasa de "Wild Rift Build" a "RiftBuild" (sin usar la marca del juego).
- El logo pequeño de la cabecera y el favicon usan el mismo símbolo que el ícono de la app.
- La burbuja muestra el retrato de tu campeón (o el ícono de la app si aún no eliges) en lugar del primer ítem; la cuenta atrás de un temporizador lo sigue reemplazando mientras corre.
- Ícono de la notificación de la burbuja: silueta propia (cancha) en vez del ícono de la app, que Android dibujaba como un cuadrado blanco.

## [0.8.3] - 2026-10-19

### Corregido
- El scroll en la ventana flotante no llegaba a lo de abajo (incluido el botón de pasos) porque la ventana era más alta que la pantalla. Además la app ahora toma la altura real de la ventana en vez de unidades de vista, que en ventanas flotantes de Android pueden medir la pantalla completa.
- La ventana flotante del botón "Abrir" se salía por abajo en horizontal (tamaño fijo de 340×520 dp). Ahora se calcula con la pantalla real: en horizontal es una columna a la derecha y en vertical queda centrada, siempre dentro de la pantalla.

### Cambiado
- Ventanas muy bajas (≤ 420 px, como el modo ventana en horizontal): pasos y engranaje en una sola fila, tablero compacto sin etiquetas, buscador más bajo; en ventanas cortas ya no se oculta el selector de pasos.

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
