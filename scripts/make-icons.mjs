// Renders the Android launcher icons (legacy, round, adaptive foreground + monochrome), the splash screens and the web favicon
// from assets/icons/app-icon*.svg. Run after editing the SVGs:  npm run icons
import sharp from 'sharp'
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'node:fs'

const RES = 'android/app/src/main/res'
const FELT = '#0f2a1f'
const svg = f => readFileSync(`assets/icons/${f}.svg`)
const png = (input, size) => sharp(input, { density: 384 }).resize(size, size)

const LEGACY = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }   // 48 dp
const ADAPTIVE = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 } // 108 dp layers

const mask = (s, r) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${r}" fill="#fff"/></svg>`)

for (const d of Object.keys(LEGACY)) {
  const dir = `${RES}/mipmap-${d}`
  const s = LEGACY[d], a = ADAPTIVE[d]
  await png(svg('app-icon'), s).composite([{ input: mask(s, s * 0.22), blend: 'dest-in' }]).png().toFile(`${dir}/ic_launcher.png`)
  await png(svg('app-icon'), s).composite([{ input: mask(s, s / 2), blend: 'dest-in' }]).png().toFile(`${dir}/ic_launcher_round.png`)
  await png(svg('app-icon-foreground'), a).png().toFile(`${dir}/ic_launcher_foreground.png`)
  await png(svg('app-icon-monochrome'), a).png().toFile(`${dir}/ic_launcher_monochrome.png`)
}

// adaptive icon definitions: felt background, foreground, and the themed monochrome layer
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`
writeFileSync(`${RES}/mipmap-anydpi-v26/ic_launcher.xml`, adaptive)
writeFileSync(`${RES}/mipmap-anydpi-v26/ic_launcher_round.xml`, adaptive)
writeFileSync(`${RES}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${FELT}</color>\n</resources>\n`)

// splash: felt background with the symbol at ~28% of the short side, for every existing splash.png (keeps their sizes)
const symbol = svg('app-icon-foreground')
for (const dir of readdirSync(RES).filter(n => n.startsWith('drawable'))) {
  const file = `${RES}/${dir}/splash.png`
  if (!existsSync(file)) continue
  const { width, height } = await sharp(file).metadata()
  const s = Math.round(Math.min(width, height) * 0.28)
  const mark = await png(symbol, s).png().toBuffer()
  await sharp({ create: { width, height, channels: 4, background: FELT } })
    .composite([{ input: mark, left: Math.round((width - s) / 2), top: Math.round((height - s) / 2) }]).png().toFile(file + '.tmp')
  copyFileSync(file + '.tmp', file)
}
for (const dir of readdirSync(RES).filter(n => n.startsWith('drawable'))) { const t = `${RES}/${dir}/splash.png.tmp`; if (existsSync(t)) (await import('node:fs')).unlinkSync(t) }

// web favicon + a 1024 png for store listings
copyFileSync('assets/icons/app-icon.svg', 'public/favicon.svg')
await png(svg('app-icon'), 1024).png().toFile('assets/icons/app-icon-1024.png')
console.log('icons ok')
