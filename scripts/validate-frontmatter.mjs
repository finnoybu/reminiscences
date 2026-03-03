import fs from "node:fs";
import path from "node:path";
import process from "node:process";
let matter, Ajv;
try { matter = (await import("gray-matter")).default; Ajv = (await import("ajv")).default; }
catch { console.error("Missing deps. Install: npm i -D gray-matter ajv"); process.exit(1); }
const schemaPath = path.resolve("schemas/frontmatter.schema.json");
if (!fs.existsSync(schemaPath)) { console.error("Schema not found:", schemaPath); process.exit(1); }
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);
const dir = path.resolve("content/en");
if (!fs.existsSync(dir)) { console.log("No content/en directory yet. Skipping."); process.exit(0); }
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".md"));
let ok = true;
const ids = new Set(); const slugs = new Set();
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), "utf8");
  const { data } = matter(raw);
  const valid = validate(data);
  if (!valid) { ok = false; console.error("Invalid frontmatter:", f, validate.errors); continue; }
  if (ids.has(data.id)) { ok = false; console.error("Duplicate id:", data.id, "in", f); }
  ids.add(data.id);
  if (slugs.has(data.slug)) { ok = false; console.error("Duplicate slug:", data.slug, "in", f); }
  slugs.add(data.slug);
}
process.exit(ok ? 0 : 1);
