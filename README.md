# Agencia de IA EEGG

IA que se aplica y se mide 🇨🇺
Creada por **Lic. Edelce Gómez Gómez** · Camagüey, Cuba

Aplicación web **offline-first** para diagnosticar procesos empresariales, aplicar IA mínima, medir antes/después y decidir qué automatizar o escalar con evidencia.

## Sitio publicado

| Página | Archivo | Qué es |
|---|---|---|
| App principal | `index.html` | Herramienta EEGG: pronóstico, divisas, diagnóstico y evidencia (IndexedDB). Requiere PIN de autor. |
| Landing | `landing.html` | Página de venta con diagnóstico gratuito. KPIs reales desde IndexedDB. |
| Carrusel | `carrusel_pixel.html` | Generador de carrusel 1080×1080 para Facebook/Instagram (exporta PNG). |
| Correo + guiones | `marketing/` | Plantilla para Gmail, guion de WhatsApp e Instagram. |

## Uso

- **Verla publicada (GitHub Pages):** sube esta carpeta tal cual a un repositorio público y activa GitHub Pages (Settings → Pages → main → `/root`). Enlace ejemplo: `https://TU_USUARIO.github.io/eegg-ia/`
- **Local (para ejecutar Prophet con Python):**
  ```bat
  npm start        :: o: node server.js
  :: abre http://localhost:3000
  ```
  Con el servidor, `POST /api/forecast` usa Prophet real; sin él, la app cae al modelo JS tipo-Prophet. Todo funciona también abriendo `index.html` directamente el doble clic (offline).
- **PIN para abrir la app:** configurado por el autor (5 intentos fallidos = 5 min de espera). El PIN no viaja en texto plano: en el código solo está su hash SHA-256.

## Arquitectura

Offline-first: HTML5 + CSS3 + JavaScript + IndexedDB en un solo archivo; sin CDN ni librerías externas. Cambios de divisas solo con conectividad (`open.er-api.com`, sin clave). Detalles: `ARQUITECTURA.md`.

## Backend (opcional)

- `server.js` — Node puro, sin dependencias. Endpoints: `GET /api/estado`, `POST /api/forecast`, estáticos.
- `forecast.py` — Motor Prophet (stdin → stdout). Instalar: `pip install -r requirements.txt`.

## Creador

**Lic. Edelce Gómez Gómez** — Fundador · Agencia de IA EEGG · Camagüey, Cuba
WhatsApp: +53 53009714 · Instagram: @AGENCIAIA_EEGG