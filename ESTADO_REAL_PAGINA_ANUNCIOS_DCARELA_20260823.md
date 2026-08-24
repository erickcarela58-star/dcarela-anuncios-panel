# Estado real de la página de anuncios D' Carela

Fecha de verificación: 2026-08-24
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
- Documento v7 servido: 47,389 bytes.
- Título: `D'Carela · Centro de Anuncios`.
- El JavaScript productivo respondió HTTP 200 y contiene los contratos de
  capacidad, experimentos, atribución, IA estratégica y aprobación humana.

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
- Commit funcional verificado: `c2ed8d27f6586028afd3e5cd06d8a67bdf7047ec`
- GitHub Pages run funcional: `32701464360`
- Conclusión: `success`

### Copia operativa publicada bajo el CRM

- Ruta local:
  `C:\tmp\DCARELA_POS_1_0_30_SUPERBLOQUE_20260805-045441\POS_DEV\scratchpad\github-dcarela-crm-panel\anuncios`
- Repositorio: `erickcarela58-star/dcarela-crm-panel`
- Commit funcional verificado: `1c26d16dab748fbcad620632b580c9f3f3863e29`
- GitHub Pages run funcional: `32701568857`
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

### Taller creativo local v6

- Acepta únicamente JPG, PNG y WebP de hasta 30 MB.
- Lee las dimensiones reales, permite mover el foco horizontal y vertical y
  calcula recortes `cover` sin estirar ni deformar la fotografía.
- Genera composiciones 1080×1350 (4:5), 1080×1920 (9:16) y 1080×1080 (1:1)
  con zona segura visible en la previsualización.
- La guía de zona segura no forma parte del JPG descargado.
- Compone marca D' Carela, titular y CTA editables y descarga cada JPG por
  separado junto a un manifiesto JSON de producción/QA.
- El binario fuente se conserva solamente en memoria del navegador, se revoca
  al cambiar de archivo o cerrar la página y no se sube a Firebase ni a Meta.
- Todos los resultados siguen requiriendo revisión humana; generar una pieza
  no aprueba, publica ni activa gasto.

### IA estratégica y laboratorio v7

- La vista `IA y laboratorio` está publicada y funciona con la sesión Firebase
  y las dos sucursales reales.
- Puede cargar una campaña y derivar únicamente su servicio, economía, eventos
  atribuidos y capacidad. Gasto y frecuencia permanecen en cero hasta que el
  operador los introduce y confirma como verificados.
- La salida estricta incluye acción permitida, resumen, justificación,
  evidencia con fuente/ventana, confianza, efecto esperado, riesgos, caducidad,
  `schema_version` y `requires_human_approval=true`.
- Acciones posibles: `keep`, `pause_proposal`, `new_creative`,
  `budget_change_proposal` e `insufficient_data`. Ninguna ejecuta el cambio.
- Si faltan gasto o sesiones verificadas devuelve `insufficient_data` y deja el
  efecto esperado vacío; no convierte ausencia de datos en una promesa.
- La memoria conserva hasta 25 resultados por sucursal en el dispositivo y no
  contiene clientes, teléfonos, correos, chats ni fotografías.
- El laboratorio A/B exige una sola variable, dos brazos, costo histórico y
  eventos mínimos; calcula viabilidad y presupuesto, sin elegir un ganador.
- QA autenticado en producción confirmó ambas sucursales, 868 clientes, la
  recomendación segura de datos insuficientes y una muestra A/B viable de dos
  brazos. No se guardó campaña, no se publicó anuncio y no se activó gasto.
- IA generativa remota continúa sin conectar: requiere backend seguro; ninguna
  clave ni llamada a OpenAI/Gemini/OpenRouter existe en el navegador.

## 4. Dónde se guardan hoy los datos

| Información | Estado de persistencia actual |
| --- | --- |
| Clientes y productos | Firestore, filtrados por sucursal y membresía |
| Borradores/campañas | `crm_campaigns` en Firestore |
| Aprobación de campaña | Se registra sobre la campaña con UID/correo del actor autorizado |
| Estado recuperable del wizard | Almacenamiento local por sucursal |
| Metadatos de creativos v4 | `saleads_assets` (append-only) + copia local; el archivo binario no sale del equipo |
| Capacidad/calendario v4 | `saleads_capacity`, id determinista fecha+servicio, + copia local |
| Experimentos v4 | `saleads_experiments` (append-only) + copia local |
| Eventos de atribución v4 | `saleads_attribution` (append-only) + copia local, marcados `manual_verified` |
| Auditoría de acciones v4 | `saleads_audit` (append-only) + copia local |
| Memoria de recomendaciones IA v7 | Local por sucursal, máximo 25, contexto agregado sin PII |
| Métricas/gasto Meta | No existen todavía; no se inventan |

Las cinco colecciones `saleads_*` ya están implementadas en el panel con mezcla
idempotente, copia local de respaldo y estados explícitos de carga, permiso,
cuota, sin conexión y sesión vencida. **Todavía no están activas en producción**:
las reglas correspondientes están escritas y versionadas, pero no publicadas en
el proyecto Firebase. Mientras eso no ocurra, la lectura llega vacía o la
escritura devuelve `permission-denied` y el panel sigue operando con la copia
local, marcando cada registro como pendiente. Ninguna ruta borra datos.

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
- Generación con IA remota. El cerebro estratégico local v7 sí funciona, pero
  no consume una API externa ni expone secretos; falta el backend `/api/ai/*`.
- Sincronización multidispositivo de creativos, capacidad, experimentos y
  atribución v4 **verificada en producción**: el código y las reglas existen,
  falta publicar las reglas y repetir el QA autenticado en dos dispositivos.

Ningún botón actual puede gastar dinero ni publicar anuncios. Abrir Ads Manager
solo lleva al operador al proveedor para revisión manual.

## 6. Pruebas y evidencia

Comando ejecutado:

```powershell
node --test ads-panel.test.js saleads-core.test.js
```

Resultado actual: **53/53 aprobadas, 0 fallidas**. Además, la regresión del
ecosistema pasó **297/297** pruebas .NET y **46/46** flujos integrales del POS
sobre una copia temporal de la base real.

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
- bloqueo de Meta y gasto automático;
- identificadores deterministas por sucursal;
- migración local→Firestore idempotente (dos corridas no duplican);
- capacidad corregida sin duplicar la jornada;
- mezcla que conserva lo local pendiente y marca lo confirmado;
- estados explícitos de permiso, cuota, sin conexión y sesión vencida;
- reglas `saleads_*` append-only por `business_id`, membresía y rol.
- recorte multiformato sin deformación, validación de archivo y taller local
  sin carga binaria a la nube.
- contexto IA sin PII, salida estricta, evidencia, confianza, caducidad,
  aprobación humana y bloqueo de acciones no permitidas;
- escenarios de datos insuficientes, capacidad agotada, fatiga creativa y
  propuesta de presupuesto sin ejecución;
- laboratorio A/B de dos brazos con cálculo de viabilidad y muestra mínima.

## 7. Próximas fases recomendadas

### P0 — datos v4 compartidos y confiables

1. ~~Diseñar colecciones append-only para activos, capacidad, experimentos,
   atribución y auditoría.~~ Hecho: `saleads_assets`, `saleads_capacity`,
   `saleads_experiments`, `saleads_attribution` y `saleads_audit`.
2. Reglas Firestore por `business_id`, membresía y rol: **escritas y probadas
   por contrato, pendientes de publicar** en el proyecto Firebase. El fragmento
   rector está en `firestore.saleads.rules` y aplicado en el `firestore.rules`
   del repositorio `dcarela-panel`. Esta máquina no tiene Firebase CLI
   autenticada, así que la publicación exige la consola o una sesión CLI.
3. ~~Migrar almacenamiento local a Firestore de forma idempotente y conservar
   fallback offline.~~ Hecho: plan de migración por identificador determinista,
   mezcla sin duplicados y copia local que nunca se borra.
4. ~~Estados explícitos de carga, permiso, cuota, sin red y sesión vencida.~~
   Hecho: bandera de estado en las cinco vistas operativas, con reintento
   manual y reacción a `online`/`offline`.
5. Resolver el CNAME `anuncios` y validar certificado/HTTPS. Sigue pendiente en
   HostGator; verificado hoy: NXDOMAIN en 1.1.1.1.
6. Pendiente inmediato: publicar las reglas y repetir el QA autenticado
   escribiendo un activo, una jornada, un experimento y un evento desde dos
   dispositivos distintos.

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
