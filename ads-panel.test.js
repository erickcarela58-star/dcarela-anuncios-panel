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
test("incluye taller creativo local con tres formatos y descargas", () => {
  for (const id of ["studioFile", "studioHeadline", "studioFocusX", "studioFocusY", "studioGenerate", "studioPreview", "studioManifest"])
    assert.match(html, new RegExp(`id="${id}"`));
  for (const fn of ["planCreativeVariants", "drawStudioCanvas", "downloadStudioVariant", "downloadStudioManifest"])
    assert.ok(js.includes(fn), `falta ${fn}`);
  assert.match(html, /la foto no sale del dispositivo/i);
  assert.match(js, /source_file_uploaded:\s*false/);
  assert.doesNotMatch(js, /uploadBytes|storage\.googleapis/);
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

test("incluye IA estratégica local conectada a campaña, capacidad y atribución", () => {
  assert.match(html, /id="viewAiLab"/);
  for (const id of ["aiRecommendationForm", "aiCampaign", "aiAvailableSlots", "aiSpend", "aiRecommendationResult", "aiRecommendationHistory"])
    assert.match(html, new RegExp(`id="${id}"`));
  for (const fn of ["planStrategicRecommendation", "buildAiContext", "renderAiRecommendation", "fillAiFromCampaign"])
    assert.ok(js.includes(fn), `falta ${fn}`);
  assert.ok(js.includes("attributionEvents.filter"));
  assert.ok(js.includes("capacitySummary"));
});

test("el cerebro no recibe PII ni ejecuta gasto o publicación", () => {
  const context = core.buildAiContext({
    service: "retratos",
    clients: [{ name: "No debe salir", phone: "8090000000" }],
    customer_email: "privado@example.com",
    spend: 100,
  });
  const serialized = JSON.stringify(context);
  assert.doesNotMatch(serialized, /No debe salir|8090000000|privado@example\.com/);
  assert.equal(context.privacy, "aggregates_only_no_pii");
  assert.deepEqual(context.allowed_actions, ["recommend", "draft"]);
  for (const forbidden of ["activate", "publish", "increase_budget", "send_customer_data"])
    assert.ok(context.forbidden_actions.includes(forbidden));
  assert.doesNotMatch(js, /generativelanguage\.googleapis|openrouter\.ai|api\.openai\.com/);
});

test("toda recomendación muestra evidencia, caducidad y aprobación humana", () => {
  const result = core.planStrategicRecommendation({
    service: "retratos",
    price: 5000,
    variable_cost: 1000,
    desired_profit_after_ads: 2000,
    target_revenue_roas: 3,
    available_slots: 4,
    budget_total: 2500,
    spend: 800,
    qualified_leads: 20,
    bookings: 12,
    completed_sessions: 10,
    evidence_verified: true,
    window_days: 7,
  });
  assert.equal(result.validation.valid, true);
  assert.equal(result.recommendation.requires_human_approval, true);
  assert.ok(result.recommendation.evidence.length >= 2);
  assert.ok(Date.parse(result.recommendation.expires_at));
  assert.match(html, /aprobación humana obligatoria/i);
  assert.match(js, /no se ejecutó ninguna acción/i);
});

test("el laboratorio experimental diseña dos brazos con una sola variable", () => {
  for (const id of ["aiExperimentForm", "aiExperimentVariable", "aiExperimentMinimum", "aiExperimentCost", "aiExperimentDaily", "aiExperimentDays", "aiExperimentResult"])
    assert.match(html, new RegExp(`id="${id}"`));
  const plan = core.planExperiment({ variable: "creative", minimum_events: 20, expected_cost_per_event: 200, daily_budget: 1200, days: 7 });
  assert.equal(plan.arms, 2);
  assert.equal(plan.variable, "creative");
  assert.equal(plan.required_budget, 8000);
  assert.equal(plan.status, "ready_to_draft");
});

test("la memoria de IA es local, limitada y separada por sucursal", () => {
  assert.ok(js.includes('const AI_MEMORY_KEY = "dcarela_saleads_ai_memory_v1"'));
  assert.match(js, /aiMemoryStore\(\)\[selectedBusiness\(\)\]/);
  assert.match(js, /\.slice\(0, 25\)/);
  assert.doesNotMatch(js, /collection\(db, "saleads_ai/);
});

test("el estudio IA v8 tiene jerarquia visual, preparación y estados accesibles", () => {
  for (const id of ["aiReadiness", "aiReadinessBar", "aiReadinessLabel", "aiReadinessHint", "aiNextStep", "aiGenerateBrief", "aiBriefPanel"])
    assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /aria-live="polite"/);
  assert.match(css, /\.ai-dashboard-grid/);
  assert.match(css, /\.ai-result-panel\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /@media\s*\(max-width:\s*440px\)/);
  assert.ok(js.includes("renderAiReadiness"));
});

test("la recomendación produce trabajo útil sin publicar ni cambiar gasto", () => {
  for (const fn of ["recommendationNextStep", "prepareAiNextStep", "prefillWizardFromAi", "draftCreativeBrief", "generateAiBrief"])
    assert.ok(js.includes(fn) || core[fn], `falta ${fn}`);
  for (const id of ["aiOffer", "aiOfferVerified", "aiGoal", "aiTone", "aiDestination", "aiOpenStudio", "aiCopyBrief", "aiExportBrief"])
    assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /Borradores solamente/);
  assert.doesNotMatch(js, /publish_enabled\s*=\s*true|spend_enabled\s*=\s*true/);
});

test("el laboratorio v8 usa costo observado y memoria exportable", () => {
  for (const id of ["aiExperimentMetric", "aiExperimentUseObserved", "aiExportHistory"])
    assert.match(html, new RegExp(`id="${id}"`));
  assert.match(js, /spend \/ count/);
  assert.match(js, /business_id:\s*selectedBusiness\(\)/);
  assert.match(css, /\.ai-experiment-meter/);
});
