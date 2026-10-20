import { ITEMS, BUILDS, OVERRIDES, TRAITS } from './game'
export { ITEMS, BUILDS }

// ── Threat/synergy analysis ────────────────────────────
// What a rival brings: traits from game.json (heal, shield, cc, hp) plus what the class already says (tank = hp, assassin = burst)
export function rivalTags(name, data) {
  const tags = new Set(TRAITS[name] || [])
  if (data?.t === 'tank') tags.add('hp')
  if (data?.t === 'assassin') tags.add('burst')
  return tags
}

// hints = quick chips ({ap,ad,heal,cc,tank}); a chip raises its count to the threshold that triggers the matching item
export function analyzeThreats(enemies, hints = {}, tr = s => s) {
  const who = { heal: [], shield: [], hp: [], cc: [], burst: [], ap: [], ad: [] }
  for (const e of enemies) {
    for (const tag of rivalTags(e.name, e.data)) who[tag].push(e.name)
    // supports rarely deal the damage you have to itemize against
    if (e.data?.t !== 'support' && e.data?.d === 'ap') who.ap.push(e.name)
    if (e.data?.t !== 'support' && e.data?.d === 'ad') who.ad.push(e.name)
  }
  const counts = {
    ap: Math.max(who.ap.length, hints.ap ? 3 : 0), ad: Math.max(who.ad.length, hints.ad ? 3 : 0),
    hp: Math.max(who.hp.length, hints.tank ? 2 : 0), heal: Math.max(who.heal.length, hints.heal ? 1 : 0),
    cc: Math.max(who.cc.length, hints.cc ? 3 : 0), shield: who.shield.length, burst: who.burst.length,
  }
  const threats = []
  if (counts.ap >= 2)    threats.push({l:tr("Mucho daño mágico (AP)"),  cls:"tag-b"})
  if (counts.ad >= 3)    threats.push({l:tr("Mucho daño físico (AD)"),  cls:"tag-r"})
  if (counts.hp >= 2)    threats.push({l:tr("Equipo muy tanky"),         cls:"tag-gold"})
  if (counts.heal >= 1)  threats.push({l:tr("Mucha curación enemiga"),   cls:"tag-p"})
  if (counts.shield >= 1) threats.push({l:tr("Escudos enemigos"),        cls:"tag-p"})
  if (counts.burst >= 2) threats.push({l:tr("Muchos asesinos"),          cls:"tag-r"})
  if (counts.cc >= 2)    threats.push({l:tr("CC masivo"),                cls:"tag-b"})
  if (!threats.length) threats.push({l:tr("Composición balanceada"), cls:"tag-g"})
  return { threats, who, counts, apCount: counts.ap, adCount: counts.ad, tankCount: counts.hp, healCount: counts.heal, assCount: counts.burst, ccCount: counts.cc }
}

export function analyzeSynergies(allies, tr = s => s) {
  const names = allies.map(a => a.name.toLowerCase())
  const syns  = []
  if (["malphite","amumu","vi","jarvan","leona","rell","alistar"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:tr("Fuerte engage aliado"), cls:"tag-g"})
  if (["soraka","yuumi","nami","sona","karma","milio"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:tr("Curación aliada"),      cls:"tag-g"})
  if (["lulu","janna","karma","braum","thresh"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:tr("Peel para carries"),    cls:"tag-b"})
  if (["yasuo","yone","malphite","orianna"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:tr("Combo de teamfight"),   cls:"tag-gold"})
  return syns
}

// A champion entry only says what differs from its class template: core items, a win-more item, boots, keystone.
export function withOverride(base, ov) {
  if (!ov) return base
  const sameKs = !ov.ks || ov.ks === base.ks
  // the keystone's explanation is borrowed from any template that already uses that keystone
  const ksn = sameKs ? base.ksn : Object.values(BUILDS).find(b => b.ks === ov.ks)?.ksn || base.ksn
  return {
    ...base,
    core: ov.core || base.core,
    sit: { ...base.sit, ...(ov.win ? { win: ov.win } : {}) },
    boots: { ...base.boots, ...(ov.boots ? { def: ov.boots } : {}) },
    ks: ov.ks || base.ks, ksn,
    fixed: ov.fixed,   // how many leading core items never change (the guides give a core of three)
  }
}

// How much each thing the rivals bring is worth to the item that answers it
const W = {
  heal:   n => (n >= 2 ? 6 : n === 1 ? 4 : 0),
  shield: n => (n >= 2 ? 5 : n === 1 ? 2.5 : 0),
  hp:     n => (n >= 3 ? 5 : n === 2 ? 3.5 : n === 1 ? 1 : 0),
  cc:     n => (n >= 3 ? 4 : n === 2 ? 2 : 0),
  burst:  n => (n >= 2 ? 4 : n === 1 ? 1.5 : 0),
  ap:     n => (n >= 3 ? 5 : n === 2 ? 2.5 : 0),
  ad:     n => (n >= 3 ? 5 : n === 2 ? 2.5 : 0),
}
const REASON = {
  heal:   '⚡ Contra {names}: las Heridas Graves recortan su curación.',
  shield: '⚡ Contra {names}: reduce los escudos que se ponen.',
  hp:     '⚡ Contra {names}: atraviesa la armadura de los tanques.',
  ap:     '⚡ Contra {names}: resistencia mágica frente a tanto daño mágico.',
  ad:     '⚡ Contra {names}: armadura frente a tanto daño físico.',
  cc:     '⚡ Contra {names}: te protege del control que traen.',
  burst:  '⚡ Contra {names}: ayuda a sobrevivir a su daño explosivo.',
}

// who can use an item: tanks and supports have their own, the rest by damage type
export function groupsOf(c, role) {
  if (/support/i.test(role)) return new Set(c?.t === 'tank' ? ['sup'] : [!c || c.t === 'support' ? 'sup' : c.d === 'ap' ? 'ap' : 'ad', 'sup'])
  return new Set([!c ? 'ad' : c.t === 'tank' ? 'tank' : c.t === 'support' ? 'sup' : c.d === 'ap' ? 'ap' : 'ad'])
}

// Up to three items that answer what the rival team brings, one per kind of problem (two healing items would not stack).
// Items the class template already curates for that problem get a small bonus, so each class keeps its flavour.
export function adaptiveItems(tpl, groups, counts, taken = [], max = 3) {
  const curated = new Set(Object.values(tpl.sit))
  const rows = []
  for (const [name, it] of Object.entries(ITEMS)) {
    if (it.t === 'Botas' || taken.includes(name) || !it.ans?.length || !it.fit?.some(g => groups.has(g))) continue
    let best = null, score = 0
    for (const tag of it.ans) { const w = W[tag](counts[tag] || 0); score += w; if (w > 0 && (!best || w > best.w)) best = { tag, w } }
    if (!best) continue
    rows.push({ name, score: score + (curated.has(name) ? 1 : 0), tag: best.tag })
  }
  rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  const out = [], used = new Set()
  const MIN = [2.5, 3, 4]   // the second and third swaps need a clearer reason than the first
  for (const r of rows) {
    if (r.score < MIN[out.length] || used.has(r.tag)) continue
    used.add(r.tag); out.push(r)
    if (out.length === max) break
  }
  return out
}

// how many leading items of this champion's build never change
export const fixedCount = name => OVERRIDES[name]?.fixed || 2

export function buildLocalBuild(cData, role, enemies, allies, hints = {}, tr = s => s) {
  const isSupp0 = role.toLowerCase().includes("support")
  const key = isSupp0 && cData?.t === "tank" ? "tank_support" : cData ? `${cData.t}_${cData.d}` : "fighter_ad"
  const base = BUILDS[key] || BUILDS.fighter_ad
  const tpl  = withOverride(base, OVERRIDES[cData?.n])
  const {threats,who,counts,apCount,adCount,ccCount} = analyzeThreats(enemies, hints, tr)
  const syns   = analyzeSynergies(allies, tr)
  const isJg    = role.toLowerCase().includes("jungla")
  const isSupp  = role.toLowerCase().includes("support")

  // The first core items (two by default, three for champions with a guide) are the champion's identity and always stay. What the rivals bring decides the rest:
  // up to three items that answer it go right after (urgent ones first), the remaining core items fill what is left.
  const nFixed = tpl.fixed || 2
  const fixed = tpl.core.slice(0, nFixed), rest = tpl.core.slice(nFixed)
  const picks = adaptiveItems(tpl, groupsOf(cData, role), counts, fixed, 5 - nFixed)
  const reasonOf = {}
  for (const p of picks) {
    const names = who[p.tag].slice(0, 3).join(", ") + (who[p.tag].length > 3 ? ` ${tr("y otros")}` : "")
    reasonOf[p.name] = tr(REASON[p.tag]).replace("{names}", names || tr("tus rivales"))
  }
  const urgent = picks.filter(p => p.score >= 4).map(p => p.name), later = picks.filter(p => p.score < 4).map(p => p.name)
  const items = [...new Set([...fixed, ...urgent, rest[0], ...later, ...rest.slice(1), tpl.sit.win, ...Object.values(tpl.sit)].filter(Boolean))].slice(0, 5)

  // magic-resist boots vs heavy AP, armor boots vs heavy AD (for AP champions); not every template has both, so fall back to the default
  const bootsName = (apCount>=3 && tpl.boots.ap) || (adCount>=3 && tpl.boots.ad) || tpl.boots.def

  const build = items.map((name, i) => {
    const d = ITEMS[name] || {}
    let why = tr(d.desc || "Ítem esencial para este arquetipo.")
    if (i===0) why = tr("Tu primer ítem de power spike. ") + why
    if (reasonOf[name]) why = reasonOf[name]
    return { nombre:tr(name), en:d.en||name.toLowerCase().replace(/ /g,"-"), tipo:d.t||"Híbrido", por_que:why, sit:!!reasonOf[name] }
  })

  let runas = [{slot:"Keystone", n:tpl.ks, p:tpl.ksn}, ...tpl.runas].map(r => ({...r, n:tr(r.n), p:tr(r.p)}))
  if (ccCount>=3)       runas[4] = {slot:"Slot 4", n:"Legend: Tenacity", p:tr("⚡ CC masivo. Legend: Tenacity reduce la duración de todos los CC que recibes.")}
  if (apCount>=3&&!isJg) runas[2] = {slot:"Slot 2", n:"Bone Plating",    p:tr("Contra tanto AP, Bone Plating reduce el burst inicial antes de activar tus defensivos.")}

  const spells = isJg&&tpl.spells.jg   ? tpl.spells.jg
               : isSupp&&tpl.spells.supp ? tpl.spells.supp
               : tpl.spells.def

  return {
    campeon:          cData?.n || tr("Desconocido"),
    carril:           role,
    amenazas:         threats,
    sinergias:        syns,
    build,
    botas: {
      nombre:       tr(bootsName),
      en:           ITEMS[bootsName]?.en || "plated-steelcaps",
      encantamiento: tpl.enc,
      por_que:      tr(apCount>=3 && bootsName===tpl.boots.ap ? "RM y tenacidad críticas contra tanto AP." : ITEMS[bootsName]?.desc||"")
    },
    runas,
    orden_habilidades: tpl.skills,
    skillNote:         tr(tpl.sn),
    hechizos:          spells,
    consejo:           tr(tpl.tip),
  }
}
