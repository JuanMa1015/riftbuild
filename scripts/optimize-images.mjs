// Shrinks the bundled PNG icons (palette + max compression, same file names and size). Safe to run repeatedly.
//   node scripts/optimize-images.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import sharp from 'sharp'

export const shrink = buf => sharp(buf).png({ palette: true, quality: 85, compressionLevel: 9, effort: 10 }).toBuffer()

if (process.argv[1].endsWith('optimize-images.mjs')) {
  let before = 0, after = 0
  for (const dir of ['champs', 'items', 'runes', 'spells']) {
    for (const f of readdirSync(`public/${dir}`).filter(f => f.endsWith('.png'))) {
      const p = `public/${dir}/${f}`, src = readFileSync(p), out = await shrink(src)
      before += src.length; after += Math.min(src.length, out.length)
      if (out.length < src.length) writeFileSync(p, out)
    }
  }
  console.log(`icons: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`)
}
