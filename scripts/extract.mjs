import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const src = readFileSync(join(root, "index.html"), "utf8")

// --- 1. Extract <style> CSS ---
const styleMatch = src.match(/<style>([\s\S]*?)<\/style>/)
const css = styleMatch ? styleMatch[1].trim() : ""

// --- 2. Extract body inner (between <body ...> and the trailing <script>) ---
const bodyStart = src.indexOf(">", src.indexOf("<body")) + 1
const scriptStart = src.indexOf("<script>", bodyStart) // the trailing behavior script
const body = src.slice(bodyStart, scriptStart)

// --- 3. Split into top-level view containers ---
// Each view starts with a line like:  <div id="view-XXX" ...>
const marker = /\n\s*<div id="view-([a-z]+)"([^>]*)>/g
const opens = []
let m
while ((m = marker.exec(body)) !== null) {
  opens.push({ id: m[1], attrs: m[2], start: m.index, contentStart: m.index + m[0].length })
}

function extractClassName(attrs) {
  const c = attrs.match(/class="([^"]*)"/)
  if (!c) return ""
  // Drop the view-toggle visibility classes; routing controls visibility now.
  return c[1]
    .split(/\s+/)
    .filter((cls) => cls !== "hidden" && cls !== "block")
    .join(" ")
    .trim()
}

function transformHandlers(html) {
  return (
    html
      // Navigation between views -> route links
      .replace(/onclick="navigateToView\('([a-z]+)'\)"/g, 'data-nav="$1"')
      // Open a homepage panel + scroll to navigator
      .replace(/onclick="scrollToMenu\('([a-z]+)'\)"/g, 'data-scroll-menu="$1"')
      // Collapsible panels
      .replace(/onclick="toggleDropdownPane\('([^']+)'\)"/g, 'data-toggle-pane="$1"')
      // In-page smooth scroll to a section id
      .replace(
        /onclick="document\.getElementById\('([^']+)'\)\.scrollIntoView\([^)]*\)"/g,
        'data-scroll-to="$1"',
      )
  )
}

const manifest = {}
const outDir = join(root, "content")
mkdirSync(outDir, { recursive: true })

for (let i = 0; i < opens.length; i++) {
  const cur = opens[i]
  const next = opens[i + 1]
  const rawEnd = next ? next.start : body.length
  // content between the opening tag and the last </div> before next view
  let inner = body.slice(cur.contentStart, rawEnd)
  // strip the final closing </div> that belongs to the view wrapper
  const lastClose = inner.lastIndexOf("</div>")
  inner = inner.slice(0, lastClose)
  inner = transformHandlers(inner).trim()

  const className = extractClassName(cur.attrs)
  manifest[cur.id] = { className }
  writeFileSync(join(outDir, `${cur.id}.html`), inner, "utf8")
}

writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8")
writeFileSync(join(outDir, "styles.css"), css, "utf8")

console.log(
  "Extracted views:",
  opens.map((o) => o.id).join(", "),
)
console.log("CSS length:", css.length)
