import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// GitHub Pages is currently serving this branch's root. Publish the exported
// application there, keeping Next's editable source and generated output apart.
const root = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(root, 'out')
const allowed = new Set([
  '_next', '_not-found', '404', '404.html', 'index.html', 'index.txt',
  '__next.__PAGE__.txt', '__next._full.txt', '__next._tree.txt',
  'icon.svg', 'robots.txt',
])

if (!(await stat(path.join(output, 'index.html'))).isFile()) {
  throw new Error('Build the static export before preparing Pages.')
}

const entries = await readdir(output, { withFileTypes: true })
// Empty public directories can be copied by Next; they have no publishable files.
async function containsFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || await containsFiles(path.join(directory, entry.name))) return true
  }
  return false
}
const publish = []
for (const entry of entries) {
  if (entry.isDirectory() && !(await containsFiles(path.join(output, entry.name)))) continue
  if (!allowed.has(entry.name)) throw new Error(`Review unexpected export entry: ${entry.name}`)
  publish.push(entry.name)
}

// Only known generated paths are refreshed. Application source is never removed.
for (const name of allowed) await rm(path.join(root, name), { recursive: true, force: true })
await mkdir(root, { recursive: true })
for (const name of publish) await cp(path.join(output, name), path.join(root, name), { recursive: true })
await writeFile(path.join(root, '.nojekyll'), '')
console.log(`Prepared index.html and ${publish.length - 1} asset entries at the branch root.`)
