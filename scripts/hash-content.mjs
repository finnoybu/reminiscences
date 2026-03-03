import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
function sha256(buf){ return crypto.createHash("sha256").update(buf).digest("hex"); }
function walk(dir){ const out=[]; for(const ent of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,ent.name); if(ent.isDirectory()) out.push(...walk(p)); else out.push(p);} return out; }
const verify = process.argv.includes("--verify");
const contentRoot = path.resolve("content/en");
const reportPath = path.resolve("reports/content_hashes.sha256");
if(!fs.existsSync(contentRoot)){ console.log("No content/en directory yet. Skipping."); process.exit(0); }
const files = walk(contentRoot).filter(f=>f.toLowerCase().endsWith(".md")).sort();
const lines = files.map(f=>{ const rel=path.relative(process.cwd(),f).replaceAll("\\","/"); const h=sha256(fs.readFileSync(f)); return `${h}  ${rel}`; });
if(!verify){ fs.mkdirSync(path.dirname(reportPath),{recursive:true}); fs.writeFileSync(reportPath, lines.join("\n")+"\n","utf8"); console.log("Wrote", reportPath); process.exit(0); }
if(!fs.existsSync(reportPath)){ console.error("Missing hash report:", reportPath); process.exit(1); }
const expected=new Map();
for(const line of fs.readFileSync(reportPath,"utf8").split(/\r?\n/)){ if(!line.trim()) continue; const [h,rel]=line.split(/\s{2,}/); expected.set(rel.trim(), h.trim()); }
let ok=true;
for(const line of lines){ const [h,rel]=line.split(/\s{2,}/); const exp=expected.get(rel.trim()); if(!exp || exp!==h.trim()){ ok=false; console.error("Hash mismatch or missing:", rel.trim()); } }
if(!ok){ console.error("Hash verification failed. Update reports/CONTENT_CHANGELOG.md and regenerate hashes intentionally."); process.exit(1); }
console.log("Hash verification OK.");
