# Continuidad — SaleAds

## Bitácora

### 2026-08-23 — Fase 0 y esqueleto funcional de Fase 1

- Punto de partida: `3de654ddc7605a2c5e5bd2fb361c930bdb388902`, rama `main`, worktree limpio.
- Auditoría: SPA estática con Firebase Auth, banco de clientes/productos, `crm_campaigns`, exportación y apertura manual de Ads Manager. Sin Meta OAuth/Insights/CAPI/publicación.
- Implementado: navegación comercial, resumen honesto, wizard de ocho pasos con autosave por sucursal, T01–T12, economía/CAC/capacidad, tres escenarios, registro de placements, linter, revisión bloqueante y borrador compatible.
- Compatibilidad: constructor anterior conservado y rollback con `?saleads_ui=classic`; `crm_campaigns` se amplía sin migración destructiva.
- Seguridad: ningún secreto nuevo; no se activa gasto; no se exportan teléfonos; Meta permanece `not_connected`.
- Verificación pendiente de documentar en esta misma entrada al cerrar el despliegue: commit, Pages run, pruebas y navegador.
- Siguiente fase: Meta OAuth/read-only y preflight mediante backend seguro; no empezar publicación remota hasta tener reglas, roles y recibos idempotentes.
