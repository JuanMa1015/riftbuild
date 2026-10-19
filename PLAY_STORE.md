# Publicar RiftBuild en Google Play

Lista de pendientes para cuando decidas subirla. Las reglas de Play cambian: antes de enviar, confirma cada punto en Play Console.

## 1. Paquete (AAB)

Play pide `.aab`, no `.apk`. Se genera con la misma llave de firma de siempre:

```powershell
npm run android
cd android; .\gradlew.bat bundleRelease; cd ..
# resultado: android\app\build\outputs\bundle\release\app-release.aab
```

- `targetSdk` es 36 y `minSdk` 24: cumple el requisito de Play.
- **Play App Signing:** al subir el primer AAB, tu llave actual pasa a ser la *llave de subida*. Google guarda la llave real de firma. Aun así, conserva copia de `~/.riftbuild/` (sin ella no puedes subir actualizaciones sin pedir un reset de llave de subida).
- Sube la versión 1 con `versionCode` ya existente; cada subida nueva necesita un `versionCode` mayor (el release script ya lo hace).

## 2. Cuenta

- Cuenta de desarrollador: pago único de 25 USD y verificación de identidad.
- Las cuentas personales nuevas suelen tener que pasar una **prueba cerrada** (varios testers durante ~14 días seguidos) antes de pedir producción. Confirma el número exacto en Play Console.

## 3. Ficha de la tienda

Texto (ES, adaptar a EN):

- **Nombre (30):** `RiftBuild`
- **Descripción corta (80):** `Tu build en segundos: elige rivales y obtén ítems, runas y consejos.`
- **Descripción larga:** qué hace (entrada rápida de campeón y rivales, build local instantánea, IA opcional con tu propia clave, burbuja flotante con temporizadores, datos que se actualizan solos) y qué **no** hace (no lee el juego ni la pantalla; no está afiliada a Riot Games).
- Evita poner "Wild Rift" en el nombre o el ícono: son marcas de Riot Games y es motivo común de rechazo. En la descripción, úsalo solo para decir para qué juego es, junto al aviso de que no está afiliada.

Gráficos:

- Ícono 512×512 (sale de `assets/icons/app-icon-1024.png`).
- Gráfico de funciones 1024×500 (se puede recortar de `docs/og.png`).
- 2 a 8 capturas de teléfono (A55: 1080×2340 sirve). Sugeridas: paso "Tú", paso "Rivales", build, burbuja sobre un juego, Ajustes.

## 4. Política de privacidad

URL pública ya lista: `https://juanma1015.github.io/riftbuild/privacy.html`.

## 5. Seguridad de los datos (formulario)

Respuestas según lo que hace hoy la app (revísalas si cambia):

| Pregunta | Respuesta |
|---|---|
| ¿Recopila o comparte datos? | Sí, solo opcionales (ver abajo) |
| Datos personales (nombre, correo, ubicación, contactos, fotos…) | No |
| Identificadores de dispositivo o publicidad | No |
| Actividad en la app / diagnósticos | **Solo si el usuario acepta** las estadísticas anónimas (GoatCounter, sin cookies): "interacciones con la app", sin vincular a la identidad |
| Contenido enviado a terceros | Solo si el usuario configura IA: campeón, línea y rivales/aliados van al proveedor que eligió, con su propia clave |
| Cifrado en tránsito | Sí (HTTPS) |
| ¿Se puede pedir borrar los datos? | No hay datos en servidores; se borran al desinstalar |

## 6. Declaraciones de permisos

- **Mostrar sobre otras apps (`SYSTEM_ALERT_WINDOW`):** es la función principal (la burbuja). Descríbela así en la ficha.
- **Servicio en primer plano de tipo `specialUse`:** Play exige declararlo con una explicación y, normalmente, un video corto que muestre la burbuja activa y su notificación. Texto sugerido: "Mantiene la ventana flotante con la build visible mientras el usuario juega. El usuario la activa y la cierra desde la propia burbuja o su notificación."
- `POST_NOTIFICATIONS`: la notificación de la burbuja.

## 7. Clasificación de contenido y público

- Cuestionario de clasificación: sin violencia propia, sin compras, sin anuncios.
- Público objetivo: 13+ (no es una app para niños).
- Sin anuncios y sin compras: márcalo así.

## 8. Antes de enviar

- [ ] AAB firmado y probado como APK en tu teléfono (misma versión)
- [ ] Capturas, ícono y gráfico de funciones subidos
- [ ] Formulario de seguridad de datos y clasificación completos
- [ ] Declaración del servicio en primer plano con video
- [ ] Prueba cerrada con testers (si tu cuenta la exige)
