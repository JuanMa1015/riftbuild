# Coach compartido

El Coach usa la composición elegida manualmente en Plan. El motor de compras, las runas y el ban funcionan aunque el servicio no responda. El orden inicial es Groq, Gemini y OpenRouter. Comprueba la cuota de cada cuenta antes de abrir el acceso público.

1. Revoca las claves expuestas y crea nuevas en cada proveedor.
2. Desde la raíz, despliega el Worker con `npx wrangler deploy --config coach/wrangler.toml`.
3. Carga `GROQ_API_KEY`, `GEMINI_API_KEY` y `OPENROUTER_API_KEY` como secretos del Worker en Cloudflare. Desde terminal, puedes ejecutar `npx wrangler secret put GROQ_API_KEY --config coach/wrangler.toml` y repetirlo para las otras dos. Wrangler solicita cada valor de forma interactiva.
4. Crea la variable de repositorio `VITE_COACH_URL` en GitHub Actions con la URL HTTPS pública del Worker terminada en `/coach`. Para builds manuales, define esa misma variable de entorno antes de compilar. Vuelve a ejecutar el despliegue web y el workflow del APK.
5. En una instalación limpia, elige un campeón y añade un rival. El Coach aparece en **Ítems** y consulta tras una pausa de cuatro segundos, hasta tres veces por draft. Puedes consultar manualmente desde la misma tarjeta o desactivar las consultas automáticas en Ajustes. Una instalación con preferencias guardadas conserva su proveedor. Selecciona **RiftBuild** en Ajustes para usar el Coach compartido.

El límite inicial es de 12 consultas sin caché por IP por día, 8 globales por minuto y 200 globales por día, en UTC. La caché conserva una respuesta durante una hora por composición, idioma y versión del catálogo. Actualiza el Worker junto al catálogo para que reconozca nuevos campeones. La lista de orígenes permite GitHub Pages y el WebView Android. El límite global protege la cuota incluso si un cliente ajeno al navegador falsifica el origen.
