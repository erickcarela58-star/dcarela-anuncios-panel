# Estado real de la página de anuncios D' Carela

Fecha de verificación: 2026-08-23  
Producto: SaleAds / Centro de Anuncios  
Estado general: **publicado y utilizable para planificación comercial; todavía
no es una plataforma de publicación automática en Meta**.

Este documento separa lo que funciona hoy, lo que está implementado pero solo
persiste localmente y lo que aún requiere backend, permisos o infraestructura.

## 1. Acceso público comprobado

### URL que funciona ahora

`https://crm.dcarelacompufoto.com/anuncios/`

Verificación actual:

- HTTPS respondió HTTP 200.
- Documento servido: 38,907 bytes.
- Título: `D'Carela · Centro de Anuncios`.
- El JavaScript productivo respondió HTTP 200 y contiene los contratos de
  capacidad, experimentos, atribución y aprobación humana.

### Subdominio independiente

`https://anuncios.dcarelacompufoto.com/`

Estado comprobado después del aviso del propietario: **todavía no resuelve**.
El resolver público 1.1.1.1 devuelve NXDOMAIN y HTTPS informa host desconocido.
El repositorio ya contiene `CNAME` con ese dominio, pero aún falta que HostGator
publique o propague el registro:

```text
Tipo: CNAME
Nombre: anuncios
Destino: erickcarela58-star.github.io
```

No cambiar nameservers ni eliminar registros MX/TXT/correo. Hasta que DNS y el
certificado HTTPS estén verificados, la URL operativa sigue siendo la ruta del
CRM indicada arriba.

## 2. Código y despliegues vigentes

### Aplicación independiente

- Ruta local:
  `C:\tmp\DCARELA_POS_1_0_30_SUPERBLOQUE_20260805-045441\POS_DEV\scratchpad\github-dcarela-anuncios-panel`
- Repositorio: `erickcarela58-star/dcarela-anuncios-panel`
- Rama: `main`
- Commit funcional verificado: `745f468d765cf0df4cae7bb3a6e9245868ca2b33`
- GitHub Pages run funcional: `32638786153`
- Conclusión: `success`

### Copia operativa publicada bajo el CRM

- Ruta local:
  `C:\tmp\DCARELA_POS_1_0_30_SUPERBLOQUE_20260805-045441\POS_DEV\scratchpad\github-dcarela-crm-panel\anuncios`
- Repositorio: `erickcarela58-star/dcarela-crm-panel`
- Commit funcional verificado: `d7019dbd46c0d859700f42215b8114e84e534a93`
- GitHub Pages run funcional: `32638816743`
- Conclusión: `success`

Las dos copias deben mantenerse idénticas. La aplicación independiente es la
fuente; `/anuncios/` en CRM es el canal público funcional mientras el CNAME
separado no resuelva.

## 3. Lo que funciona realmente

### Identidad y datos comerciales

- Inicio de sesión con Firebase Authentication.
- Validación de membresía activa en `business_members/{uid}`.
- Selector de sucursal/`business_id`.
- Lectura del banco `clients` y catálogo `products`.
- Lectura y guardado de borradores compatibles con `crm_campaigns`.
- QA autenticado previo: 2 sucursales, 868 clientes y 352 productos/servicios.
- Los contactos se muestran enmascarados; no se envía el banco de clientes a
  Meta ni a proveedores de IA.

### Constructor de campañas

- Wizard recuperable de ocho pasos.
- Plantillas rectoras T01–T12 para servicios fotográficos.
- Producto/servicio, objetivo, embudo, oferta, público, geografía y edad.
- Formatos y placements 4:5, 9:16 y 1:1.
- Presupuesto calculado desde margen, CAC permitido y capacidad declarada.
- Tres escenarios de inversión con advertencias de incertidumbre.
- Copys, titular, brief, CTA, WhatsApp, web/UTM y propuesta A/B.
- Revisión con linter de atributos personales, escasez falsa, prueba social,
  menores/releases, precio, destino HTTPS y placements.
- Exportación TXT/JSON y constructor clásico conservado como rollback.

### Panel comercial v4

- Resumen honesto: no fabrica métricas Meta ni ROAS.
- Biblioteca de creativos con metadatos, formato, derechos, vigencia y QA de
  personas/menores.
- Audiencias CRM con conteos de consentimiento, exclusión, expiración y datos
  de contacto enmascarados.
- Calendario de capacidad: cupos, reservados y disponibles por servicio/fecha.
- Experimentos control/variante con evento mínimo; devuelve
  `insufficient_data` cuando no existe señal suficiente.
- Medición manual verificable: lead, calificado, reserva, sesión completada,
  venta pagada e ingreso confirmado.
- Lista de campañas con filtros de estado.
- Cola de QA y aprobación auditada. Aprobar exige la frase exacta
  `APROBAR BORRADOR`.
- Máquina de estados que bloquea publicación remota si no existe backend Meta.

## 4. Dónde se guardan hoy los datos

| Información | Estado de persistencia actual |
| --- | --- |
| Clientes y productos | Firestore, filtrados por sucursal y membresía |
| Borradores/campañas | `crm_campaigns` en Firestore |
| Aprobación de campaña | Se registra sobre la campaña con UID/correo del actor autorizado |
| Estado recuperable del wizard | Almacenamiento local por sucursal |
| Metadatos de creativos v4 | Almacenamiento local por sucursal; el archivo binario no sale del equipo |
| Capacidad/calendario v4 | Almacenamiento local por sucursal |
| Experimentos v4 | Almacenamiento local por sucursal |
| Eventos de atribución v4 | Almacenamiento local por sucursal y marcados `manual_verified` |
| Métricas/gasto Meta | No existen todavía; no se inventan |

Esto significa que el panel ya es funcional para preparar y controlar trabajo,
pero los módulos v4 todavía no están disponibles automáticamente en otros
dispositivos. El siguiente bloque debe migrarlos de forma incremental a
Firestore con reglas y auditoría, sin borrar la compatibilidad local.

## 5. Lo que todavía NO está implementado

- OAuth de Meta Business.
- Selección real de Business Manager, cuenta publicitaria, página, Instagram,
  pixel/dataset o método de pago.
- Creación remota de campaña/ad set/anuncio en estado PAUSED.
- Activación, pausa o cambio de presupuesto desde SaleAds.
- Meta Insights, webhooks y Conversions API.
- Carga binaria de creativos a Cloud Storage/Meta.
- Exportación automática de audiencias personalizadas.
- Calendario enlazado automáticamente con reservas/capacidad del POS.
- Atribución automática desde tickets, WhatsApp y CRM; hoy es manual y
  verificable.
- ROAS, CPC, CPM, CTR o costo por sesión reales.
- Generación con IA remota. El motor actual es determinista y no consume API.
- Sincronización multidispositivo de creativos, capacidad, experimentos y
  atribución v4.

Ningún botón actual puede gastar dinero ni publicar anuncios. Abrir Ads Manager
solo lleva al operador al proveedor para revisión manual.

## 6. Pruebas y evidencia

Comando ejecutado:

```powershell
node --test ads-panel.test.js saleads-core.test.js
```

Resultado actual: **29/29 aprobadas, 0 fallidas**.

Cobertura contractual:

- aplicación separada y enlaces oficiales;
- Firebase Auth, membresía y datos CRM;
- wizard de ocho pasos y constructor clásico;
- ausencia de secretos/tokens Meta en frontend;
- presupuesto/CAC/capacidad y tratamiento de incertidumbre;
- linter de políticas y placements;
- consentimiento CRM;
- derechos de creativos;
- capacidad sin sobreventa matemática;
- experimento sin falso ganador;
- embudo e ingreso confirmado;
- aprobación humana distinta de publicación;
- bloqueo de Meta y gasto automático.

## 7. Próximas fases recomendadas

### P0 — datos v4 compartidos y confiables

1. Diseñar colecciones append-only para activos, capacidad, experimentos,
   atribución y auditoría.
2. Publicar reglas Firestore por `business_id`, membresía y rol.
3. Migrar almacenamiento local a Firestore de forma idempotente y conservar
   fallback offline.
4. Estados explícitos de carga, permiso, cuota, sin red y sesión vencida.
5. Resolver el CNAME `anuncios` y validar certificado/HTTPS.

### P1 — conexión real con ventas

1. Vincular capacidad con reservas reales del POS/CRM.
2. Vincular eventos de atribución con folio/ticket sin copiar ni modificar la
   fuente contable.
3. Subir creativos a almacenamiento privado con derechos y vencimientos.
4. Reportes por campaña, producto, sucursal y periodo usando datos propios.

### P2 — Meta seguro, primero solo lectura

1. Backend OAuth; nunca tokens en navegador.
2. Selección verificable de activos Meta.
3. Insights de solo lectura y conciliación contra atribución propia.
4. Preflight y modo simulación.
5. Solo después: creación idempotente en PAUSED con recibos remotos.

### P3 — publicación controlada

Activación únicamente con presupuesto/tope, aprobación owner/admin, doble
confirmación, auditoría, pausa de emergencia y cuenta Meta de prueba. Ninguna
automatización puede aumentar gasto o reactivar campañas por sí sola.

## 8. Criterio para declarar SaleAds completo

No se debe llamar “completo” hasta que:

1. los módulos v4 sincronicen entre dos dispositivos autorizados;
2. las reglas Firestore pasen pruebas de aislamiento por sucursal y rol;
3. el calendario y la atribución lean reservas/tickets reales sin alterar el POS;
4. Meta OAuth e Insights funcionen mediante backend seguro;
5. una campaña de prueba se cree PAUSED, con IDs y auditoría, sin gasto;
6. activación/pausa y topes se prueben en cuenta controlada;
7. escritorio y móvil pasen navegación autenticada, offline y sesión vencida;
8. `anuncios.dcarelacompufoto.com` resuelva y tenga HTTPS válido.

## 9. Documentos relacionados

- `docs/HANDOFF_PANEL_ANUNCIOS_DCARELA_20260823.md`
- `docs/HANDOFF_CIERRE_DCARELA_20260823_V55.md`
- `EXECUTION_STATE_DCARELA.json`
- `scratchpad/github-dcarela-anuncios-panel/README.md`
- `scratchpad/github-dcarela-anuncios-panel/CONTINUIDAD.md`

Las credenciales no se reproducen en esta documentación.
