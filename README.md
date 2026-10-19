# RiftBuild

**Builds de Wild Rift en dos toques.** Elige tu campeón, toca a los rivales y la app te da ítems, botas, runas, hechizos y un consejo táctico adaptados a esa partida. En Android, una burbuja flotante te deja consultarla sin salir del juego.

> Proyecto de fans, no afiliado a Riot Games. *League of Legends: Wild Rift* y todos sus nombres e imágenes son marca de Riot Games, Inc.

[Español](#español-latam) · [English](#english)

---

## Español (LATAM)

### Qué hace

- **Entrada rápida.** Tu campeón (con accesos directos a los últimos que jugaste), cinco toques para los rivales y listo. El resultado se recalcula en cada toque, sin botón ni espera.
- **Atajos de composición.** ¿No alcanzaste a ver todos los rivales? Marca "AP", "AD", "Curación", "CC" o "Tanques" y la build se ajusta.
- **Burbuja flotante (Android).** Muestra los 5 ítems, las botas, la runa y los hechizos encima del juego. Se arrastra y se actualiza sola.
- **Offline.** El motor de builds y todas las imágenes viajan dentro de la app.
- **IA opcional.** Con tu propia API key (Anthropic, OpenRouter u OpenAI) puedes pedir un análisis más fino. La key se guarda solo en tu dispositivo.
- **Español LATAM por defecto, inglés disponible.** Cambia el idioma en *Configuración de IA*. Los nombres de ítems son los oficiales de cada idioma.
- **Datos que se actualizan solos.** Plantel, parche e íconos se refrescan cada semana (ver [Actualización de datos](#actualización-de-datos)).

### Instalar en Android

1. Descarga el APK desde [Releases](../../releases).
2. Ábrelo en el teléfono y permite instalar desde este origen.
3. Para la burbuja: toca **"Activar burbuja sobre el juego"** y concede *Mostrar sobre otras apps*.

> El APK publicado es de **depuración** (sin firma de tienda). Sirve para uso personal.

### Desarrollo

Requisitos: Node 22+. Para el APK: JDK 21 y Android SDK.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # genera dist/
npm run lint
npm run check:i18n   # verifica que no falte ninguna traducción
```

### Generar el APK

```bash
npm run android      # build web + sincroniza con Android
cd android
./gradlew assembleDebug
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

### Actualización de datos

Todo el contenido del juego vive en un solo archivo: [`public/data/game.json`](public/data/game.json) (campeones, ítems, plantillas de build y traducciones).

| Qué | De dónde | Cómo |
|---|---|---|
| Plantel de campeones | Sitio oficial de Wild Rift | Automático |
| Parche vigente | Notas de parche oficiales | Automático |
| Íconos (campeones, ítems, runas, hechizos) | Riot Data Dragon | Automático |
| **Plantillas de build y descripciones** | Criterio propio | **Manual** |

- Un workflow de GitHub Actions ([`update-data.yml`](.github/workflows/update-data.yml)) corre cada martes y hace commit si algo cambió. También puedes lanzarlo a mano con `npm run update:data`.
- La app descarga `game.json` del repositorio al abrirse y lo guarda en caché. **Los cambios llegan sin publicar un APK nuevo.**
- Los campeones nuevos entran con rol y tipo de daño **estimados** (marcados con `"auto": true`). Revísalos.
- Ninguna fuente pública dice qué ítems son buenos en cada parche. Si un parche cambia el meta, edita `builds` en `game.json`.
- Si haces un fork, define `VITE_DATA_BASE` con la URL base de tus datos (por defecto apunta a este repo).

### Idiomas

El contenido del juego está escrito en español y `game.json` guarda, en `en`, la traducción al inglés de cada texto. Para añadir un idioma:

1. Agrega su tabla de interfaz en [`src/i18n/index.js`](src/i18n/index.js).
2. Agrega su traducción del contenido en `game.json`.
3. Ejecuta `npm run check:i18n`.

### Estructura

```
public/
  data/game.json      Fuente única: campeones, ítems, builds, traducciones
  champs items runes spells/   Íconos empaquetados
src/
  data/               Carga de datos y motor de builds local
  i18n/               Interfaz y traducciones
  lib/                Servicio de IA y actualizador de datos
  components/         Selector rápido, resultado, panel de IA
android/              Proyecto Capacitor + burbuja flotante (Java)
scripts/              update-data.mjs, check-i18n.mjs
```

### Límites conocidos

- **No detecta tu partida.** Wild Rift no tiene API pública y Riot restringe leer el juego o la pantalla, así que la app es de entrada manual.
- El motor local usa reglas simples (conteo de AP/AD, curación, CC, tanques). No sustituye tu criterio.
- Algunas runas exclusivas de Wild Rift no tienen ícono en Data Dragon y se muestran con un "?".
- La burbuja solo muestra texto y no se probó en todos los fabricantes de Android.

---

## English

**RiftBuild** gives you a Wild Rift build in two taps: pick your champion, tap the enemies, and get items, boots, runes, spells and a tactical tip tailored to that match. On Android, a floating bubble shows it over the game.

- Instant, offline local engine; optional AI with your own API key.
- Spanish (LATAM) by default, English via *AI settings → Language*.
- Roster, patch label and icons refresh weekly from official sources; the app pulls fresh data on launch, no new APK needed. Build templates are hand-curated.
- Dev: `npm install && npm run dev`. APK: `npm run android && cd android && ./gradlew assembleDebug`.

Not affiliated with Riot Games.
