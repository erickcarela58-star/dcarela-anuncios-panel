# Continuidad — SaleAds

## Bitácora

### 2026-08-23 — Fase 0 y esqueleto funcional de Fase 1

- Punto de partida: `3de654ddc7605a2c5e5bd2fb361c930bdb388902`, rama `main`, worktree limpio.
- Auditoría: SPA estática con Firebase Auth, banco de clientes/productos, `crm_campaigns`, exportación y apertura manual de Ads Manager. Sin Meta OAuth/Insights/CAPI/publicación.
- Implementado: navegación comercial, resumen honesto, wizard de ocho pasos con autosave por sucursal, T01–T12, economía/CAC/capacidad, tres escenarios, registro de placements, linter, revisión bloqueante y borrador compatible.
- Compatibilidad: constructor anterior conservado y rollback con `?saleads_ui=classic`; `crm_campaigns` se amplía sin migración destructiva.
- Seguridad: ningún secreto nuevo; no se activa gasto; no se exportan teléfonos; Meta permanece `not_connected`.
- Publicación separada: commit `918bdbc7e17d25b82352c14c285726660671e73b`; GitHub Pages run `32624822728`, conclusión `success`.
- Publicación canónica en CRM: commit `80bf989ee31b525d410659bad9e30b3434def336`; GitHub Pages run `32624867876`, conclusión `success`.
- URL canónica validada: `https://crm.dcarelacompufoto.com/anuncios/`; HTML, núcleo, estilos y Service Worker respondieron HTTP 200.
- QA: 20/20 pruebas Node. Navegador autenticado cargó 868 clientes y 352 productos/servicios, calculó CAC/capacidad/tres escenarios y bloqueó copy con atributo personal y escasez no comprobada. No se guardó ni publicó una campaña y no se activó gasto.
- Límite externo: `anuncios.dcarelacompufoto.com` continúa sin DNS. La ruta canónica del CRM permanece operativa y no se tocaron MX/TXT/nameservers.
- Siguiente fase: Meta OAuth/read-only y preflight mediante backend seguro; no empezar publicación remota hasta tener reglas, roles y recibos idempotentes.

### 2026-08-23 — Panel operativo ampliado v4

- Se amplió SaleAds más allá del esqueleto Fase 1: biblioteca de creativos y derechos, audiencias CRM consentidas, calendario/capacidad, experimentos, atribución propia, campañas filtrables y aprobaciones auditadas.
- Privacidad: teléfonos enmascarados; consentimiento ausente se trata como no utilizable; opt-out y consentimiento vencido se excluyen.
- Seguridad: la máquina de estados impide solicitar publicación si `meta_backend_connected=false`; ninguna función crea anuncios, activa gasto, borra campañas o almacena tokens Meta.
- Persistencia: los módulos operativos nuevos usan almacenamiento local por sucursal; campañas y aprobaciones continúan usando `crm_campaigns` con permisos owner/admin.
- Pruebas: núcleo ampliado con consentimiento, QA de derechos, capacidad, señal de experimentos, embudo y máquina de estados; navegación visual autenticada validada con datos reales del CRM.
- Pendiente externo real: OAuth/Insights/CAPI y creación remota PAUSED requieren backend Meta seguro, credenciales y revisión/aprobación correspondientes.

### 2026-08-23 — Estado real documentado después de actualización

- Producción canónica `https://crm.dcarelacompufoto.com/anuncios/` volvió a
  responder HTTP 200; 29/29 pruebas continúan aprobadas.
- `anuncios.dcarelacompufoto.com` todavía devuelve NXDOMAIN en 1.1.1.1. No se
  declaró propagación ni HTTPS mientras el resolver siga sin el CNAME.
- Se separó expresamente la persistencia: clientes/productos/campañas usan
  Firestore; activos, capacidad, experimentos y atribución v4 permanecen en
  almacenamiento local por sucursal hasta implementar colecciones y reglas.
- OAuth, Insights, CAPI, publicación PAUSED y gasto Meta siguen sin existir y
  bloqueados por diseño.
- Documento rector: `ESTADO_REAL_PAGINA_ANUNCIOS_DCARELA_20260823.md`.

### 2026-08-23 — P0: colecciones compartidas, reglas y estados de sincronización

- Punto de partida: `256aec7` en `main`, worktree limpio, 29/29 pruebas.
- Motor (`saleads-core.js`): se agregó la capa pura de sincronización con
  `operationCollections`, `operationDocId`, `mergeOperationRows`,
  `planOperationMigration`, `syncStates`, `describeSyncError`, `summarizeSync`
  y `auditEntry`. Ninguna función borra ni edita registros existentes.
- Colecciones: `saleads_assets`, `saleads_capacity`, `saleads_experiments`,
  `saleads_attribution` y `saleads_audit`. Todas append-only salvo la capacidad,
  que usa identificador determinista `sucursal__fecha__servicio` para corregir
  una jornada sin duplicarla.
- Panel (`app.js`): la copia local pasó de ser el almacén a ser respaldo. Al
  entrar se pinta lo local, se leen las colecciones por `business_id`, se
  mezcla, se suben solo los registros ausentes en la nube y se marcan como
  `synced`. Repetir la operación no duplica nada.
- Estados visibles en las cinco vistas operativas: cargando, sincronizado,
  solo en este dispositivo, permiso insuficiente, cuota agotada, sin conexión y
  sesión vencida, con botón de reintento y escucha de `online`/`offline`.
- Auditoría: cada alta de activo, capacidad, experimento, evento de atribución
  y cada aprobación escribe una entrada append-only en `saleads_audit`, visible
  en la vista de Aprobaciones con su estado de sincronización.
- Reglas: se agregaron los cinco bloques a `firestore.rules` del repositorio
  `dcarela-panel` (lectura para miembro activo de la sucursal, creación solo
  owner/admin con `created_by_uid` propio, sin update ni delete salvo la
  corrección de capacidad). Copia auditable en `firestore.saleads.rules`.
- Pruebas: `node --test ads-panel.test.js saleads-core.test.js` → 38/38
  aprobadas, 0 fallidas.
- Verificación visual local (http://localhost:5610): cinco banderas de estado
  presentes, bitácora renderizada, sin scroll horizontal en 1280 y en 390×844.
  No se pudo capturar imagen porque el panel del navegador no estaba visible.
- Límite externo 1: las reglas **no están publicadas**. Hasta publicarlas la
  escritura devuelve `permission-denied` y el panel opera con la copia local
  marcando pendientes. No hay Firebase CLI autenticada en esta máquina.
- Límite externo 2: `anuncios.dcarelacompufoto.com` sigue en NXDOMAIN (1.1.1.1).
- No se ejecutó QA autenticado contra Firestore real en esta sesión; queda
  pendiente junto con la publicación de las reglas.
- Siguiente paso: publicar reglas, QA autenticado en dos dispositivos y recién
  entonces avanzar a P1 (capacidad y atribución enlazadas al POS).
