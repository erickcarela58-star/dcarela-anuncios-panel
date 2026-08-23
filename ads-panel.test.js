const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const js = fs.readFileSync(__dirname + "/app.js", "utf8");
const css = fs.readFileSync(__dirname + "/styles.css", "utf8");
const core = require("./saleads-core.js");
test("es una pagina independiente y enlaza herramientas oficiales", () => {
  assert.match(html, /Centro de Anuncios/);
  for (const host of [
    "panel.dcarelacompufoto.com",
    "crm.dcarelacompufoto.com",
    "fotos.dcarelacompufoto.com",
  ])
    assert.match(html, new RegExp(host.replaceAll(".", "\\.")));
});
test("autentica y valida membresia con Firebase", () => {
  assert.ok(js.includes("signInWithEmailAndPassword"));
  assert.ok(js.includes("business_members"));
  assert.match(js, /member\.active\s*!==\s*true/);
});
test("conecta banco de clientes, productos y borradores", () => {
  for (const name of ["clients", "products", "crm_campaigns"])
    assert.ok(js.includes(`collection(db, "${name}")`));
});
test("no publica ni borra campañas automáticamente", () => {
  assert.doesNotMatch(js, /deleteDoc|facebook\.com\/v\d+\.\d+\/.+campaigns/);
  assert.match(html, /nunca confirma pagos ni publica/i);
});
test("incluye scroll y diseño movil", () => {
  assert.match(css, /overflow:\s*auto/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
});
test("incluye wizard rector recuperable y ocho pasos", () => {
  assert.match(html, /id="wizardForm"/);
  assert.equal((html.match(/data-wizard-step="\d"/g) || []).length, 8);
  assert.ok(js.includes("dcarela_saleads_wizard_v3"));
  assert.ok(js.includes("saveWizard"));
  assert.ok(js.includes("restoreWizard"));
});
test("mantiene el constructor clásico como rollback funcional", () => {
  assert.match(html, /data-view="builder">Constructor clásico/);
  assert.ok(js.includes("generatePackage"));
  assert.ok(js.includes('get("saleads_ui") === "classic"'));
});
test("no presenta Meta como conexión o publicación activa", () => {
  assert.match(html, /Meta aún no conectada/);
  assert.match(html, /publicación bloqueada/);
  assert.ok(js.includes('remote_status: "not_connected"'));
});
test("usa motor determinista de plantillas, presupuesto, placements y políticas", () => {
  assert.match(html, /saleads-core\.js/);
  for (const fn of ["recommendTemplates", "calculateBudget", "lintPolicy", "validatePlacements"])
    assert.ok(js.includes(`saleAds.${fn}`));
});
test("no contiene secretos Meta ni proveedores generativos en frontend", () => {
  assert.doesNotMatch(html + js, /app_secret|access_token|OPENROUTER_API_KEY|GEMINI_API_KEY/);
});
test("no repite identificadores HTML", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  assert.equal(new Set(ids).size, ids.length);
});
test("incluye operaciones comerciales completas sin gasto automatico", () => {
  for (const view of ["viewCalendar", "viewExperiments", "viewAnalytics", "viewApprovals"])
    assert.match(html, new RegExp(`id="${view}"`));
  for (const form of ["creativeAssetForm", "capacityForm", "experimentForm", "attributionForm", "approvalForm"])
    assert.match(html, new RegExp(`id="${form}"`));
  for (const fn of ["renderCapacity", "renderExperiments", "renderAnalytics", "registerApproval"])
    assert.ok(js.includes(`function ${fn}`) || js.includes(`async function ${fn}`));
});
test("protege datos CRM y consentimiento de audiencias", () => {
  assert.ok(js.includes("summarizeAudience"));
  assert.ok(js.includes("consentState"));
  assert.match(js, /•••-•••-/);
  assert.doesNotMatch(html, /Exportar teléfonos|Subir lista a Meta/i);
});
test("aprobacion humana no equivale a publicar", () => {
  assert.match(html, /APROBAR BORRADOR/);
  assert.match(html, /no publica, no activa gasto/i);
  assert.ok(js.includes("canTransitionCampaign"));
  assert.ok(js.includes("meta_backend_connected: false"));
});

test("los modulos operativos se sincronizan por sucursal con estados visibles", () => {
  assert.equal((html.match(/data-sync-banner/g) || []).length, 5);
  assert.match(html, /id="auditTrail"/);
  for (const fn of ["mergeOperationRows", "planOperationMigration", "describeSyncError", "operationDocId"])
    assert.ok(js.includes(`saleAds.${fn}`));
  for (const state of ["permission", "quota", "offline", "expired"])
    assert.ok(core.syncStates[state], `falta el estado ${state}`);
  assert.ok(js.includes("navigator.onLine"));
  assert.ok(js.includes("cacheRows"), "debe conservar copia local de respaldo");
});

test("las reglas de SaleAds son append-only por sucursal y rol", () => {
  const rules = fs.readFileSync(__dirname + "/firestore.saleads.rules", "utf8");
  for (const name of ["saleads_assets", "saleads_experiments", "saleads_attribution", "saleads_audit"]) {
    const block = rules.split(`match /${name}/`)[1].split("match /")[0];
    assert.match(block, /allow update, delete: if false;/);
    assert.match(block, /allow create: if saleAdsCreate\(\);/);
    assert.match(block, /isActiveMember\(resource\.data\.business_id\)/);
  }
  const capacity = rules.split("match /saleads_capacity/")[1];
  assert.match(capacity, /allow update: if keepsBusiness\(\)/);
  assert.match(capacity, /allow delete: if false;/);
  assert.match(rules, /isAdmin\(request\.resource\.data\.business_id\)/);
  assert.match(rules, /created_by_uid == request\.auth\.uid/);
});

test("la sincronizacion no borra ni sobreescribe datos de otras colecciones", () => {
  assert.doesNotMatch(js, /deleteDoc|deleteField|writeBatch/);
  for (const kind of ["saleads_assets", "saleads_capacity", "saleads_experiments", "saleads_attribution", "saleads_audit"])
    assert.ok(core.operationCollections[Object.keys(core.operationCollections).find((k) => core.operationCollections[k].collection === kind)], kind);
});
