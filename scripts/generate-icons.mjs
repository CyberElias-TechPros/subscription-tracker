/**
 * Rasterize app/icon.svg into the PNG icons required by the manifest
 * and Apple platforms. Run after changing the logomark:
 *
 *   node scripts/generate-icons.mjs
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = path.resolve(process.cwd())
const svg = await readFile(path.join(root, "app", "icon.svg"))

const targets = [
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
  { file: "app/apple-icon.png", size: 180 },
]

for (const { file, size } of targets) {
  const out = path.join(root, file)
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out)
  console.log(`✓ ${file} (${size}×${size})`)
}
