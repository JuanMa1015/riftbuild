// Single source for the privacy policy and the terms: shown in the app (Settings) and rendered to docs/*.html by scripts/build-legal.mjs.
// Plain ESM with no imports so the Node script can load it.
export const REPO = 'https://github.com/JuanMa1015/riftbuild'
export const CONTACT = `${REPO}/issues`
export const UPDATED = '2026-10-19'

export const LEGAL = {
  es: {
    updated: 'Última actualización',
    privacy: {
      title: 'Política de privacidad y cookies',
      sections: [
        ['Quiénes somos', 'RiftBuild es una app gratuita y no oficial (Android y web) que sugiere builds de Wild Rift. No tiene cuentas, ni servidor propio, ni base de datos de usuarios.'],
        ['Qué se guarda en tu teléfono', 'Tus ajustes, campeones favoritos y recientes, historial de partidas, temporizadores y datos del juego se guardan solo en el almacenamiento privado de la app. Tu clave de IA, si la pones, se guarda cifrada con el Android Keystore. Nada de esto se copia a la nube (el respaldo de Android está desactivado). Al desinstalar la app, todo se borra. En la versión web, lo mismo se guarda en el almacenamiento local de tu navegador (la clave de IA, sin cifrar); se borra al limpiar los datos del sitio.'],
        ['Cookies', 'La app no usa cookies ni rastreadores publicitarios. Solo usa el almacenamiento local del dispositivo para recordar tus ajustes, por eso no muestra un banner de cookies.'],
        ['Con quién se comparten datos', 'Solo si tú lo configuras. (1) Si activas la IA, el campeón, la línea y los rivales/aliados que elijas se envían al proveedor que escogiste (OpenRouter, Anthropic u OpenAI) junto con tu clave; se rigen por la política de ese proveedor y por los costos de tu cuenta. (2) La app descarga datos del juego desde GitHub (raw.githubusercontent.com); GitHub puede ver tu dirección IP como en cualquier descarga web. Nunca enviamos tu clave a ningún otro destino.'],
        ['Estadísticas anónimas (opcional)', 'Si aceptas, la app envía conteos anónimos de uso (por ejemplo "se abrió la app" o "se generó una build") a GoatCounter, un servicio sin cookies. No se envían campeones, builds, claves ni textos, y no se crea ningún perfil tuyo. Puedes activarlas o desactivarlas cuando quieras en Ajustes. Si no aceptas, no se envía nada.'],
        ['Permisos de Android', 'Mostrar sobre otras apps: para dibujar la burbuja flotante con tu build. Notificación: Android exige una notificación mientras la burbuja está activa. Internet: para los datos del juego y, si lo activas, la IA. Vibración: avisos de los temporizadores.'],
        ['Tus derechos', 'Como no guardamos datos tuyos en servidores, puedes borrar todo desinstalando la app. Para dudas sobre privacidad, escríbenos por el contacto de abajo.'],
        ['Menores', 'La app no recoge datos personales de nadie, incluidos menores.'],
        ['Cambios', 'Si esta política cambia, se actualizará aquí y en la app, con la fecha de arriba.'],
      ],
    },
    terms: {
      title: 'Términos y condiciones',
      sections: [
        ['Aceptación', 'Al usar RiftBuild aceptas estos términos. Si no estás de acuerdo, desinstala la app.'],
        ['Qué es', 'Una herramienta de ayuda que sugiere ítems, runas y consejos con reglas simples y, si lo configuras, con inteligencia artificial. Son recomendaciones, no garantías de ganar; las decisiones en la partida son tuyas.'],
        ['Sin afiliación', 'RiftBuild no está afiliada, respaldada ni patrocinada por Riot Games. League of Legends: Wild Rift y los nombres e imágenes de campeones, ítems, runas y hechizos son propiedad de Riot Games, Inc. y se usan a modo informativo.'],
        ['Uso del juego', 'La app no lee ni modifica el juego. Tú eres responsable de que su uso (por ejemplo la burbuja sobre otras apps) cumpla las reglas del juego y de tu dispositivo.'],
        ['Tu clave de IA', 'Si usas IA, la clave es tuya, el uso lo cobra tu proveedor y tú eres responsable de ese gasto. Te recomendamos una clave con límite de gasto.'],
        ['Sin garantía', 'La app se ofrece "tal cual", sin garantías de ningún tipo. Los datos del juego pueden estar desactualizados o contener errores.'],
        ['Límite de responsabilidad', 'En la medida que permita la ley, los autores no son responsables de pérdidas o daños derivados del uso de la app.'],
        ['Cambios y contacto', 'Podemos actualizar estos términos; el uso continuado implica aceptarlos. Contacto: abre un issue en el repositorio.'],
      ],
    },
  },
  en: {
    updated: 'Last updated',
    privacy: {
      title: 'Privacy policy and cookies',
      sections: [
        ['Who we are', 'RiftBuild is a free, unofficial app (Android and web) that suggests Wild Rift builds. It has no accounts, no server of its own and no user database.'],
        ['What is stored on your phone', "Your settings, favourite and recent champions, match history, timers and game data are stored only in the app's private storage. Your AI key, if you add one, is stored encrypted with the Android Keystore. None of it is copied to the cloud (Android backup is disabled). Uninstalling the app deletes everything. In the web version the same data is kept in your browser's local storage (the AI key unencrypted) and is erased when you clear the site data."],
        ['Cookies', "The app uses no cookies and no advertising trackers. It only uses the device's local storage to remember your settings, which is why there is no cookie banner."],
        ['Who data is shared with', 'Only if you set it up. (1) If you turn on AI, the champion, lane and enemies/allies you pick are sent to the provider you chose (OpenRouter, Anthropic or OpenAI) together with your key; their own policies and your account costs apply. (2) The app downloads game data from GitHub (raw.githubusercontent.com); GitHub can see your IP address as with any web download. We never send your key anywhere else.'],
        ['Anonymous statistics (optional)', 'If you accept, the app sends anonymous usage counts (for example "app opened" or "build generated") to GoatCounter, a cookie-free service. No champions, builds, keys or text are sent and no profile of you is created. You can turn this on or off any time in Settings. If you do not accept, nothing is sent.'],
        ['Android permissions', 'Display over other apps: to draw the floating bubble with your build. Notification: Android requires one while the bubble is active. Internet: for game data and, if you enable it, AI. Vibration: timer alerts.'],
        ['Your rights', 'Since we keep no data about you on servers, you can erase everything by uninstalling the app. For privacy questions, use the contact below.'],
        ['Children', 'The app does not collect personal data from anyone, including children.'],
        ['Changes', 'If this policy changes, it will be updated here and in the app, with the date above.'],
      ],
    },
    terms: {
      title: 'Terms and conditions',
      sections: [
        ['Acceptance', 'By using RiftBuild you accept these terms. If you disagree, uninstall the app.'],
        ['What it is', 'A helper tool that suggests items, runes and tips using simple rules and, if you set it up, artificial intelligence. These are recommendations, not a guarantee of winning; in-game decisions are yours.'],
        ['No affiliation', 'RiftBuild is not affiliated with, endorsed or sponsored by Riot Games. League of Legends: Wild Rift and the names and images of champions, items, runes and spells are property of Riot Games, Inc. and are used for informational purposes.'],
        ['Game use', "The app does not read or modify the game. You are responsible for making sure your use (for example the bubble over other apps) complies with the game's rules and your device's."],
        ['Your AI key', 'If you use AI, the key is yours, your provider bills the usage and you are responsible for that spending. We recommend a key with a spending limit.'],
        ['No warranty', 'The app is provided "as is", without warranties of any kind. Game data may be out of date or contain errors.'],
        ['Limitation of liability', 'To the extent permitted by law, the authors are not liable for losses or damages arising from use of the app.'],
        ['Changes and contact', 'We may update these terms; continued use means you accept them. Contact: open an issue in the repository.'],
      ],
    },
  },
}
