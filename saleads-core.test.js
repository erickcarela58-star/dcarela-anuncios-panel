const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./saleads-core.js");

test("incluye las doce plantillas rectoras versionadas", () => {
  assert.equal(core.templates.length, 12);
  assert.deepEqual(core.templates.map((x) => x.id), Array.from({ length: 12 }, (_, i) => `T${String(i + 1).padStart(2, "0")}`));
  assert.ok(core.templates.every((x) => x.primary_metric && x.risk && x.evidence));
});

test("recomienda máximo tres plantillas por servicio y etapa", () => {
  const rows = core.recommendTemplates({ service: "maternity", stage: "warm" });
  assert.ok(rows.length > 0 && rows.length <= 3);
  assert.equal(rows[0].id, "T03");
});

test("calcula CAC y limita presupuesto por capacidad", () => {
  const result = core.calculateBudget({ price: 6000, variable_cost: 1500, desired_profit_after_ads: 2500, target_revenue_roas: 3, available_slots: 4, campaign_days: 7, cash_budget_cap: 12000, historical_cost_per_event: 300, qualified_to_booking_rate: 0.5, booking_to_completed_rate: 0.8, refund_or_no_show_rate: 0.1 });
  assert.equal(result.allowable_cac, 2000);
  assert.equal(result.capacity_budget_cap, 8000);
  assert.equal(result.recommended_total_cap, 8000);
  assert.equal(result.target_cost_per_qualified_lead, 720);
});

test("presupuesto sin datos conserva incertidumbre", () => {
  const result = core.calculateBudget({ cash_budget_cap: 3000, campaign_days: 7 });
  assert.equal(result.sufficient, false);
  assert.equal(result.sample_quality, "insufficient");
  assert.ok(result.warnings.length >= 2);
});

test("presupuesto totalmente vacío nunca produce infinito", () => {
  const result = core.calculateBudget({});
  assert.equal(result.recommended_total_cap, 0);
  assert.ok(Number.isFinite(result.recommended_daily_cap));
});

test("linter bloquea atributo personal, escasez falsa y menor sin release", () => {
  const result = core.lintPolicy({ copy: "¿Estás embarazada? Solo 2 cupos", contains_minor: true });
  assert.equal(result.blocked, true);
  assert.deepEqual(result.issues.map((x) => x.code), ["personal_attribute", "unverified_scarcity", "minor_release"]);
});

test("linter permite copy descriptivo y evidencia confirmada", () => {
  const result = core.lintPolicy({ copy: "Sesiones de maternidad con guía de poses. Solo 2 cupos verificados.", availability_verified: true });
  assert.equal(result.blocked, false);
});

test("placements exigen una familia compatible", () => {
  const result = core.validatePlacements(["instagram_feed", "instagram_stories"], ["feed_portrait"]);
  assert.equal(result.valid, false);
  assert.equal(result.missing[0].family, "fullscreen_vertical");
});

test("registro creativo conserva fuente, fecha y estado de verificación", () => {
  assert.ok(core.creativeSpecs.every((x) => x.source.startsWith("https://") && x.verified_at && x.verification_status));
});

test("el taller calcula recortes sin deformar y conserva el foco", () => {
  const crop = core.coverCrop(4000, 3000, 1080, 1920, 0.8, 0.5);
  assert.equal(Math.round(crop.width / crop.height * 1000), Math.round(1080 / 1920 * 1000));
  assert.ok(crop.x > 1500, "el foco horizontal debe mover el recorte hacia la derecha");
  assert.ok(crop.x + crop.width <= 4000.01);
  assert.ok(crop.y + crop.height <= 3000.01);
});

test("el taller genera tres formatos versionados y bloquea archivos inseguros", () => {
  const plan = core.planCreativeVariants({
    name: "Maternidad Agosto",
    source_width: 4000,
    source_height: 3000,
    size_bytes: 4_000_000,
    mime: "image/jpeg",
    focus_x: 0.5,
    focus_y: 0.45,
  });
  assert.equal(plan.blocked, false);
  assert.deepEqual(plan.variants.map((x) => x.id), ["feed_portrait", "fullscreen_vertical", "marketplace_square"]);
  assert.ok(plan.variants.every((x) => x.file_name.endsWith(".jpg") && x.safe_zone));
  const bad = core.planCreativeVariants({ source_width: 0, source_height: 0, size_bytes: 31 * 1024 * 1024, mime: "application/pdf" });
  assert.equal(bad.blocked, true);
  assert.deepEqual(bad.issues.filter((x) => x.severity === "block").map((x) => x.code), ["image_dimensions", "image_mime", "image_size"]);
});

test("audiencia CRM solo considera exportable el consentimiento explicito vigente", () => {
  const result = core.summarizeAudience([
    { phone: "8495550101", marketing_consent: true },
    { phone: "8495550102" },
    { phone: "8495550103", marketing_consent: true, marketing_opt_out: true },
  ]);
  assert.deepEqual(result, { total: 3, consented: 1, excluded: 1, expired: 0, unknown: 1, contactable: 1, exportable: 1 });
});

test("QA creativo bloquea personas o menores sin permisos", () => {
  const result = core.validateCreativeAsset({ name: "Sesion 01", family: "feed_portrait", people_visible: true, contains_minor: true });
  assert.equal(result.blocked, true);
  assert.deepEqual(result.issues.filter((x) => x.severity === "block").map((x) => x.code), ["model_release", "guardian_release"]);
});

test("calendario calcula cupos disponibles sin exceder capacidad", () => {
  assert.deepEqual(core.capacitySummary([
    { date: "2026-08-24", slots: 5, reserved: 2 },
    { date: "2026-08-25", slots: 3, reserved: 9 },
  ]), { days: 2, slots: 8, reserved: 5, available: 3 });
});

test("experimento conserva incertidumbre hasta tener señal mínima", () => {
  const early = core.evaluateExperiment({ minimum_events: 20, control_events: 5, challenger_events: 8, control_spend: 1000, challenger_spend: 1000 });
  assert.equal(early.decision, "insufficient_data");
  const enough = core.evaluateExperiment({ minimum_events: 20, control_events: 20, challenger_events: 25, control_spend: 2000, challenger_spend: 1500 });
  assert.equal(enough.decision, "challenger");
});

test("máquina de estados bloquea publicación sin backend Meta y aprobación", () => {
  assert.equal(core.canTransitionCampaign("saved", "qa_ready").ok, true);
  assert.equal(core.canTransitionCampaign("approved", "publish_paused_requested", { human_approval: true }).ok, false);
  assert.equal(core.canTransitionCampaign("qa_ready", "approved", { human_approval: true }).ok, true);
});

test("embudo suma etapas e ingreso confirmado", () => {
  const result = core.funnelMetrics([{ stage: "lead" }, { stage: "booking" }, { stage: "paid", value: 3500 }]);
  assert.equal(result.lead, 1);
  assert.equal(result.booking, 1);
  assert.equal(result.revenue, 3500);
});

test("asigna identificadores deterministas por sucursal", () => {
  const capacity = { date: "2026-09-01", service: "Maternidad Estudio", slots: 4, reserved: 1, updated_at: "2026-09-01T10:00:00.000Z" };
  assert.equal(core.operationDocId("capacity_entries", "biz_1", capacity), "biz-1__2026-09-01__maternidad-estudio");
  assert.equal(core.operationDocId("capacity_entries", "biz_1", { ...capacity, service: "maternidad  estudio" }), "biz-1__2026-09-01__maternidad-estudio");
  assert.notEqual(core.operationDocId("capacity_entries", "biz_2", capacity), core.operationDocId("capacity_entries", "biz_1", capacity));
  assert.equal(core.operationDocId("creative_assets", "biz_1", { id: "asset_17_ab" }), "biz-1__asset-17-ab");
  assert.throws(() => core.operationDocId("ventas", "biz_1", {}));
});

test("la migracion a Firestore es idempotente", () => {
  const local = [
    { id: "asset_1", created_at: "2026-08-01T00:00:00.000Z" },
    { id: "asset_2", created_at: "2026-08-02T00:00:00.000Z" },
  ];
  const first = core.planOperationMigration("creative_assets", local, [], "biz_1");
  assert.equal(first.collection, "saleads_assets");
  assert.equal(first.upload.length, 2);
  const second = core.planOperationMigration("creative_assets", local, first.upload, "biz_1");
  assert.equal(second.upload.length, 0);
  assert.equal(second.already_synced, 2);
});

test("la capacidad se corrige sin duplicar la jornada", () => {
  const cloud = [{ id: "capacity_1", date: "2026-09-01", service: "maternidad", slots: 4, reserved: 1, updated_at: "2026-09-01T10:00:00.000Z" }];
  const local = [{ id: "capacity_2", date: "2026-09-01", service: "Maternidad", slots: 4, reserved: 3, updated_at: "2026-09-01T18:00:00.000Z" }];
  const plan = core.planOperationMigration("capacity_entries", local, cloud, "biz_1");
  assert.equal(plan.upload.length, 1);
  const merged = core.mergeOperationRows("capacity_entries", local, cloud, "biz_1");
  assert.equal(merged.length, 1);
  assert.equal(merged[0].reserved, 3);
});

test("la mezcla conserva lo local pendiente y marca lo confirmado", () => {
  const local = [
    { id: "event_1", stage: "lead", created_at: "2026-08-01T00:00:00.000Z" },
    { id: "event_2", stage: "paid", created_at: "2026-08-03T00:00:00.000Z" },
  ];
  const cloud = [{ id: "event_1", stage: "lead", created_at: "2026-08-01T00:00:00.000Z" }];
  const merged = core.mergeOperationRows("attribution_events", local, cloud, "biz_1");
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, "event_2");
  assert.equal(merged[0].sync_state, "pending");
  assert.equal(merged.find((x) => x.id === "event_1").sync_state, "synced");
});

test("los estados de sincronizacion son explicitos y no borran datos", () => {
  assert.equal(core.describeSyncError({ code: "permission-denied" }).state, "permission");
  assert.equal(core.describeSyncError({ code: "resource-exhausted" }).state, "quota");
  assert.equal(core.describeSyncError({ code: "unavailable" }).state, "offline");
  assert.equal(core.describeSyncError({ code: "unauthenticated" }).state, "expired");
  assert.equal(core.describeSyncError(new Error("boom"), { online: false }).state, "offline");
  assert.equal(core.describeSyncError(new Error("boom")).state, "unknown");
  for (const state of Object.keys(core.syncStates)) assert.ok(core.syncStateLabel(state).label);
  const summary = core.summarizeSync("local_only", { rows: 5, pending: 2 });
  assert.equal(summary.tone, "warning");
  assert.match(summary.text, /2 pendiente/);
});

test("la bitacora es append-only y sin datos personales del cliente", () => {
  const entry = core.auditEntry({ action: "capacity_updated", entity: "saleads_capacity", detail: "x".repeat(400), created_at: "2026-08-23T12:00:00.000Z", actor_email: "duena@dcarela.do" });
  assert.equal(entry.source, "saleads_panel");
  assert.equal(entry.detail.length, 300);
  assert.equal(entry.created_at, "2026-08-23T12:00:00.000Z");
  assert.ok(entry.id.startsWith("audit_"));
  assert.equal(core.operationCollections.audit_entries.mode, "append_only");
});
