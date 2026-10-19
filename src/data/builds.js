import { ITEMS, BUILDS } from './game'
export { ITEMS, BUILDS }

// ── Threat/synergy analysis ────────────────────────────
const HEAL_N = ["Soraka","Yuumi","Nami","Sona","Seraphine","Aatrox","Vladimir","Sylas","Warwick","Olaf","Darius","Gwen","Nilah","Samira"]
const CC_N   = ["Leona","Malphite","Amumu","Alistar","Blitzcrank","Thresh","Nautilus","Lux","Sett","Vi","Jarvan IV","Rell","Lissandra","Annie","Morgana","Ashe","Varus"]

// hints = quick chips ({ap,ad,heal,cc,tank}); a chip raises its count to the threshold that triggers the matching item
export function analyzeThreats(enemies, hints = {}, tr = s => s) {
  const champs = enemies.map(e => e.data).filter(Boolean)
  const names  = enemies.map(e => e.name)
  const apCount   = Math.max(champs.filter(c => c.d==="ap").length,      hints.ap   ? 3 : 0)
  const adCount   = Math.max(champs.filter(c => c.d==="ad").length,      hints.ad   ? 3 : 0)
  const tankCount = Math.max(champs.filter(c => c.t==="tank").length,    hints.tank ? 2 : 0)
  const healCount = Math.max(names.filter(n => HEAL_N.some(h => n.includes(h))).length, hints.heal ? 1 : 0)
  const assCount  = champs.filter(c => c.t==="assassin").length
  const ccCount   = Math.max(names.filter(n => CC_N.some(h => n.includes(h))).length,   hints.cc   ? 3 : 0)
  const threats = []
  if (apCount>=2)   threats.push({l:tr("Mucho daño mágico (AP)"),  cls:"tag-b"})
  if (adCount>=3)   threats.push({l:tr("Mucho daño físico (AD)"),  cls:"tag-r"})
  if (tankCount>=2) threats.push({l:tr("Equipo muy tanky"),         cls:"tag-gold"})
  if (healCount>=1) threats.push({l:tr("Mucha curación enemiga"),   cls:"tag-p"})
  if (assCount>=2)  threats.push({l:tr("Muchos asesinos"),          cls:"tag-r"})
  if (ccCount>=2)   threats.push({l:tr("CC masivo"),                cls:"tag-b"})
  if (!threats.length) threats.push({l:tr("Composición balanceada"), cls:"tag-g"})
  return {threats, apCount, adCount, tankCount, healCount, assCount, ccCount}
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

export function buildLocalBuild(cData, role, enemies, allies, hints = {}, tr = s => s) {
  const isSupp0 = role.toLowerCase().includes("support")
  const key = isSupp0 && cData?.t === "tank" ? "tank_support" : cData ? `${cData.t}_${cData.d}` : "fighter_ad"
  const tpl  = BUILDS[key] || BUILDS.fighter_ad
  const {threats,apCount,adCount,tankCount,healCount,assCount,ccCount} = analyzeThreats(enemies, hints, tr)
  const syns   = analyzeSynergies(allies, tr)
  const isJg    = role.toLowerCase().includes("jungla")
  const isSupp  = role.toLowerCase().includes("support")

  let items = [...tpl.core.slice(0,4)]
  const i5 = apCount>=3&&tpl.sit.ap         ? tpl.sit.ap
           : healCount>=1&&tpl.sit.heal      ? tpl.sit.heal
           : tankCount>=2&&tpl.sit.tank      ? tpl.sit.tank
           : adCount>=3&&tpl.sit.adatk       ? tpl.sit.adatk
           : ccCount>=3&&tpl.sit.cc          ? tpl.sit.cc
           : tpl.sit.win || tpl.core[0]

  const i6 = apCount>=2&&cData?.d==="ad"&&!items.includes("Fauces de Malmortius")     ? "Fauces de Malmortius"
           : apCount>=2&&cData?.d!=="ad"&&!items.includes("Velo de la Banshee")           ? "Velo de la Banshee"
           : healCount>=1&&!items.includes("Sierraespada Quimpunk")              ? "Sierraespada Quimpunk"
           : ccCount>=3&&cData?.d==="ad"&&!items.includes("Cimitarra Mercurial")       ? "Cimitarra Mercurial"
           : tpl.core[3] || tpl.core[0]

  // 6 inventory slots, boots take one: 4 core items + the one that answers this game = 5 items, boots are returned separately
  const extra = [i5, i6, tpl.sit.win, ...Object.values(tpl.sit)].find(x => x && !items.includes(x))
  if (extra) items.push(extra)
  items = [...new Set(items)].slice(0,5)

  // magic-resist boots vs heavy AP, armor boots vs heavy AD (for AP champions); not every template has both, so fall back to the default
  const bootsName = (apCount>=3 && tpl.boots.ap) || (adCount>=3 && tpl.boots.ad) || tpl.boots.def

  const build = items.map((name, i) => {
    const d = ITEMS[name] || {}
    let why = tr(d.desc || "Ítem esencial para este arquetipo.")
    if (i===0)                                     why = tr("Tu primer ítem de power spike. ") + why
    if (name==="Sierraespada Quimpunk")       why = tr("⚡ El rival tiene mucha curación. Heridas Graves la reduce un 40%.")
    if (name==="Fauces de Malmortius")              why = tr("⚡ Hay mucho AP enemigo. El escudo mágico puede absorberte el burst decisivo.")
    if (name==="Cota de Espinas")                           why = tr("⚡ El rival ataca mucho físicamente. Cada golpe recibido les devuelve daño.")
    if (name==="Cimitarra Mercurial")               why = tr("⚡ Hay CC decisivo enemigo. Activa este ítem para liberarte instantáneamente.")
    if (name==="Twinguard de Amaranth")             why = tr("⚡ Hay mucho CC. Ganas resistencias mientras más tiempo estés en combate.")
    if (name==="Velo de la Banshee")                   why = tr("⚡ Hay mucho AP. El velo bloquea automáticamente el primer hechizo enemigo.")
    return { nombre:tr(name), en:d.en||name.toLowerCase().replace(/ /g,"-"), tipo:d.t||"Híbrido", por_que:why }
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
