const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const js = fs.readFileSync(__dirname + "/app.js", "utf8");
const css = fs.readFileSync(__dirname + "/styles.css", "utf8");
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
