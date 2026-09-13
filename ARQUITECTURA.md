# EEGG-SE — Arquitectura offline-first
HTML5 → CSS3 → JavaScript → IndexedDB → Service Worker/PWA → Python local (análisis) → adaptador IA → cola de sincronización → backend/API cuando exista conectividad.

Regla: el núcleo de captura, diagnóstico y medición no depende de Internet. Las funciones remotas solo se activan con conectividad. Las decisiones empresariales mantienen supervisión humana.

Seguridad: no guardar API keys en frontend; separar datos sensibles; validar entradas; auditar cambios; cifrar en backend cuando se implemente sincronización real.
