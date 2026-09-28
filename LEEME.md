# SM Imperio — sitio landing (HTML + CSS + Alpine.js)

Sitio estático: no requiere build. Sube la carpeta completa al hosting (reemplaza los archivos del sitio legacy).

## Estructura
- `index.html` — landing con Hero, Nosotros, Certificaciones, Proyectos, Suministros y Contacto
- `css/styles.css` — tokens de diseño (claro/oscuro). Color primario `#006633` en `--primary`
- `js/main.js` — lógica Alpine (tema, galería/lightbox, pestañas, formulario). Datos de la galería en `GALLERY`
- `img/` — fotos optimizadas (`p/` y `p/t/` miniaturas), certificaciones (`cert/`), marca (`brand/`)

## Configuración rápida (en `index.html`, bloque `window.SM_CONFIG`)
- `whatsapp`: número con lada país sin `+` (hoy `525532611966`)
- `formEndpoint`: URL de webhook (n8n, Formspree…). Vacío = el formulario abre WhatsApp con el mensaje redactado

## Dependencias externas (CDN)
- Alpine.js 3.14.9 (jsDelivr) y Google Fonts (Barlow / Barlow Condensed)

## Por validar antes de publicar
1. Correo de contacto (`ventas@smimperio.com.mx`): hay 3 en las fuentes (ventas@, smi@ y un gmail)
2. Naturaleza de las certificaciones (¿de la empresa o del personal?, vigencia, enlace de verificación)
3. Vigencia del catálogo de Suministros (viene del sitio legacy: garantías, IP66, stock, medidas)
4. Misión y visión: solo aparecen en la carta 2024, no en la v2
5. Pies de foto de la galería: son descriptivos, no nombran obras
