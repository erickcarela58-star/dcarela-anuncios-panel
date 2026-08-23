# SaleAds — Centro de Anuncios D'Carela

SPA/PWA estática para planificar campañas de fotografía con datos reales del CRM y control humano. La URL canónica operativa sigue siendo `https://crm.dcarelacompufoto.com/anuncios/` mientras `anuncios.dcarelacompufoto.com` no tenga DNS y HTTPS válidos.

## Alcance publicado

- Firebase Authentication y membresía por `business_id`.
- Resumen comercial sin métricas inventadas.
- Wizard rector recuperable de ocho pasos.
- Biblioteca versionada T01–T12.
- Motor determinista de margen, CAC, capacidad y tres escenarios de presupuesto.
- Registro de familias 4:5, 9:16 y 1:1 con QA de compatibilidad.
- Linter de atributos personales, escasez/prueba social, releases, HTTPS y precio.
- Borradores compatibles con `crm_campaigns`, exportación TXT/JSON y constructor clásico.

SaleAds no contiene tokens de Meta o IA, no activa anuncios, no aumenta presupuestos y no envía el banco de clientes a proveedores publicitarios o generativos.

## Desarrollo y pruebas

```powershell
node --test ads-panel.test.js saleads-core.test.js
Get-Content app.js -Raw | node --input-type=module --check
```

El motor puro está en `saleads-core.js`. La interfaz Phase 1 es la predeterminada. Para rollback visual inmediato sin cambiar el despliegue, usar `?saleads_ui=classic`.

## Publicación

GitHub Pages publica `main`. Antes de push se deben ejecutar las pruebas, incrementar el caché de `sw.js` y comprobar la URL canónica en escritorio y 390×844. Copiar el mismo artefacto a la carpeta `/anuncios/` del repositorio `dcarela-crm-panel`; el CNAME reservado no sustituye ese despliegue.

## Límites conocidos

- Meta OAuth, Insights, CAPI, webhooks, publicación PAUSED y activación requieren backend seguro y no están implementados.
- Las dimensiones conservadoras de `creativeSpecs` tienen estado `baseline_requires_authenticated_recheck`: Meta bloqueó la verificación pública sin sesión; deben revalidarse antes de publicar un anuncio.
- No hay métricas de campaña ni atribución downstream verificadas; por eso el tablero muestra el estado vacío en lugar de datos ficticios.
