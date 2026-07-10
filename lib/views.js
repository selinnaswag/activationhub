import { readFileSync } from "node:fs"
import { join } from "node:path"
import manifest from "@/content/manifest.json"

export const VIEW_IDS = Object.keys(manifest)

// Views other than the homepage each get their own route segment.
export const ROUTE_VIEW_IDS = VIEW_IDS.filter((id) => id !== "homepage")

export function getView(id) {
  const entry = manifest[id]
  if (!entry) return null
  const html = readFileSync(join(process.cwd(), "content", `${id}.html`), "utf8")
  return { id, className: entry.className, html }
}
