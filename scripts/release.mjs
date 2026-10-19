// Prepares a release: bumps package.json, closes the [Sin publicar] section of CHANGELOG.md,
// writes release-notes.md and prints the exact commands to build, tag and publish.
//   npm run release -- patch|minor|major|1.2.3
import { readFileSync, writeFileSync } from 'node:fs'

const arg = process.argv[2]
if (!arg) { console.error('uso: npm run release -- patch|minor|major|x.y.z'); process.exit(1) }

const pkgUrl = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(pkgUrl, 'utf8'))
const [maj, min, pat] = pkg.version.split(/[.-]/).slice(0, 3).map(Number)
const next = /^\d+\.\d+\.\d+/.test(arg) ? arg
  : arg === 'major' ? `${maj + 1}.0.0` : arg === 'minor' ? `${maj}.${min + 1}.0` : arg === 'patch' ? `${maj}.${min}.${pat + 1}` : null
if (!next) { console.error('versión no válida:', arg); process.exit(1) }

const logUrl = new URL('../CHANGELOG.md', import.meta.url)
let log = readFileSync(logUrl, 'utf8')
const head = '## [Sin publicar]'
const start = log.indexOf(head)
const end = log.indexOf('\n## [', start + head.length)
const body = log.slice(start + head.length, end).trim()
if (!body) { console.error('CHANGELOG.md no tiene nada en [Sin publicar]: describe los cambios primero.'); process.exit(1) }

const date = new Date().toISOString().slice(0, 10)
log = log.slice(0, start) + `${head}\n\n## [${next}] - ${date}\n\n${body}\n` + log.slice(end)
// compare links at the bottom: [Sin publicar] moves forward, the new version links to the previous tag
const prev = pkg.version
const repo = log.match(/\[Sin publicar\]: (.*)\/compare\//)[1]
log = log.replace(/\[Sin publicar\]: .*\n/, `[Sin publicar]: ${repo}/compare/v${next}...HEAD\n[${next}]: ${repo}/compare/v${prev}...v${next}\n`)
writeFileSync(logUrl, log)

pkg.version = next
writeFileSync(pkgUrl, JSON.stringify(pkg, null, 2) + '\n')
writeFileSync(new URL('../release-notes.md', import.meta.url), body + '\n')

const apk = `riftbuild-${next}.apk`   // signed with the release key in ~/.riftbuild
console.log(`Versión ${prev} -> ${next}  (versionCode ${(+next.split('.')[0]) * 10000 + (+next.split('.')[1]) * 100 + (+next.split('.')[2].replace(/\D.*/, ''))})

Siguientes pasos (PowerShell, en la carpeta del proyecto):
  npm run android
  cd android; .\\gradlew.bat assembleDebug; cd ..
  copy android\\app\\build\\outputs\\apk\\debug\\app-debug.apk ${apk}
  git add -A
  git commit -m "chore(release): v${next}"
  git tag v${next}
  git push --follow-tags
  gh release create v${next} ${apk} --title "RiftBuild ${next}" --notes-file release-notes.md${next.startsWith('0.') ? ' --prerelease' : ''}`)
