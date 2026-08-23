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
