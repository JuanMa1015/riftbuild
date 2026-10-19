# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Jugadores de Wild Rift (móvil), hispanohablantes de LATAM primero, inglés opcional. Hoy: el autor y amigos, instalando un APK directo (sin tienda). Usan el teléfono con una mano, con prisa, durante la selección de campeones y la pantalla de carga, y luego miran la build de reojo mientras juegan.

## Product Purpose
Dar la build adecuada (ítems, botas, runas, hechizos, consejo) para la partida concreta con el mínimo de toques. Éxito: de abrir la app a ver la build en pocos segundos, y poder releerla de un vistazo en partida desde una burbuja flotante.

## Positioning
Un asesor de builds pensado para el poco tiempo de Wild Rift: entrada por toques y búsqueda en vivo, resultado instantáneo y offline, burbuja sobre el juego. Una app de PC como Itero/Blitz no puede estar en el móvil donde se juega.

## Operating Context
Teléfono Android en vertical, una mano, luz variable; la app convive con el juego (se alterna o se ve por burbuja). También se usa en modo ventana/pantalla dividida y en pantallas anchas, por lo que debe ser responsive. Sin conexión es un caso normal.

## Capabilities and Constraints
- Elegir mi campeón (búsqueda en vivo) y hasta 5 enemigos (búsqueda en vivo); aliados opcionales; atajos de composición (AP, AD, curación, CC, tanques).
- La build se recalcula al instante con un motor local; IA opcional con API key propia.
- Burbuja flotante en Android (permiso "mostrar sobre otras apps").
- Español LATAM por defecto, inglés disponible; nombres oficiales de ítems por idioma.
- Datos (campeones, parche, ítems, builds, traducciones) en `public/data/game.json`, actualizables sin APK nuevo; íconos empaquetados.
- No detecta la partida (sin API pública ni lectura de pantalla): entrada manual.
- Stack existente: React 19, Tailwind 4, Zustand, Capacitor (Android).

## Brand Commitments
Nombre de trabajo: RiftBuild. Proyecto de fans, no afiliado a Riot Games: no usar logos de Riot ni sugerir afiliación. Marca visual aún no definida; el look anterior (oscuro, dorado y rojo, emojis) se reemplaza por completo.

## Evidence on Hand
Íconos oficiales de campeones, ítems, runas y hechizos (Riot Data Dragon) en `public/`. No hay capturas de usuarios, métricas ni testimonios: no inventarlos.

## Product Principles
1. La velocidad de captura manda: cada toque de más es un fallo.
2. El resultado se lee de un vistazo; el detalle está a un toque, nunca estorba.
3. Funciona offline y en una mano; el tamaño de los objetivos táctiles no se negocia.
4. Honestidad sobre los datos: lo estimado se marca como estimado.

## Accessibility & Inclusion
Objetivos táctiles amplios, contraste legible bajo luz variable, no depender solo del color, idioma conmutable ES-LATAM/EN.
