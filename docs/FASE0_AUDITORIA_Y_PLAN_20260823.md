# SaleAds — auditoría Fase 0 y plan Fase 1

Fecha: 2026-08-23

## Línea base

- Repositorio: `erickcarela58-star/dcarela-anuncios-panel`.
- Commit inicial: `3de654ddc7605a2c5e5bd2fb361c930bdb388902`.
- Stack: HTML/CSS/JavaScript sin build, Firebase Web SDK, GitHub Pages.
- URL canónica operativa: `https://crm.dcarelacompufoto.com/anuncios/`.
- URL reservada: `https://anuncios.dcarelacompufoto.com/`; el DNS no resolvía y GitHub Pages no tenía HTTPS forzado en la auditoría.
- Pruebas base: 5/5.
- Rollback: restaurar el commit inicial o usar `?saleads_ui=classic` para la interfaz anterior.

## Matriz de cumplimiento

| Área | Estado tras Fase 1 | Evidencia / límite |
|---|---|---|
| Auth y membresía | existente | `business_members`, sucursales autorizadas |
| Aislamiento por `business_id` | parcial | consultas y borradores filtrados; falta suite de emulador de reglas |
| Banco CRM y catálogo | existente | `clients`, `products` |
| Wizard recuperable | implementado | 8 pasos, autosave local por sucursal |
| Plantillas T01–T12 | implementado | versionadas, riesgo/evidencia/KPI |
| Presupuesto económico | implementado | margen, CAC, capacidad, piloto/aprendizaje/capacidad |
| QA creativo | parcial | tres familias y compatibilidad; falta procesar archivos reales |
| Derechos de imagen | parcial | guardas de release; falta biblioteca de activos y revocación |
| Linter de políticas | implementado inicial | reglas deterministas; requiere ampliación y pruebas de destino real |
| Meta OAuth y activos | ausente | requiere backend seguro |
| Insights | ausente | no se muestran métricas ficticias |
| CAPI/atribución | ausente | requiere eventos CRM/POS consentidos y deduplicados |
| Publicación PAUSED | ausente | no autorizada ni conectada |
| Activación/gasto | bloqueado por diseño | debe ser acción separada con autenticación reciente |
| IA estratégica | ausente | el motor publicado es determinista; no expone API keys |
| Subdominio propio | bloqueado externamente | falta DNS/HTTPS; no tocar correo ni nameservers |

## Riesgos controlados

- Las plantillas son hipótesis y no se etiquetan como ganadoras.
- La interfaz no usa un solo activo para recortar todos los placements.
- Las cifras esperadas se ocultan cuando falta costo histórico y se marca muestra insuficiente.
- Los bloqueos de copy, consentimiento, economía y assets impiden crear el borrador rector.
- La fuente pública de Meta exigió login/bloqueó la consulta; el registro conserva estado de revalidación obligatoria.

## Próximo bloque seguro

1. Diseñar backend Firebase Functions/Cloud Run con token de Firebase, membresía y roles validados en servidor.
2. Implementar OAuth Meta de lectura, conexión/desconexión y preflight de activos.
3. Agregar emulador de reglas Firestore, índices y pruebas cross-business.
4. Sincronizar Insights read-only y mostrar denominadores, fuente y fecha.
5. Solo después, diseñar `dry_run` y creación remota `PAUSED`; nunca activar gasto en pruebas.

## Evidencia de cierre de Fase 1

- Repositorio independiente: commit `918bdbc7e17d25b82352c14c285726660671e73b`; Pages `32624822728` en `success`.
- Espejo canónico dentro del CRM: commit `80bf989ee31b525d410659bad9e30b3434def336`; Pages `32624867876` en `success`.
- Producción: `https://crm.dcarelacompufoto.com/anuncios/` respondió HTTP 200 para HTML, JavaScript, CSS y Service Worker.
- Pruebas: 20/20. Navegador autenticado confirmó 868 clientes, 352 productos/servicios, cálculo económico y bloqueos del linter sin guardar ni publicar una campaña.
- Meta continúa desconectado y el gasto permanece bloqueado por diseño. Las especificaciones creativas conservan el estado `baseline_requires_authenticated_recheck` porque la guía oficial solicitó login durante la comprobación.
