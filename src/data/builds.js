export const ITEMS = {
  "Eclipse":                    {en:"eclipse",                   t:"Ofensivo",  desc:"Escudo activo tras habilidades. Core para bruisers AD que entran y salen."},
  "Tachón Negro":               {en:"black-cleaver",             t:"Ofensivo",  desc:"Reduce armadura del rival con cada golpe. Escala con campeones que atacan seguido."},
  "Danza de la Muerte":         {en:"deaths-dance",              t:"Híbrido",   desc:"Convierte parte del daño en sangrado. Matas a alguien y te curas."},
  "Tachón de Sterak":           {en:"steraks-gage",              t:"Defensivo", desc:"Escudo enorme cuando estás a punto de morir. Esencial contra asesinos y burst."},
  "Fauces de Malmortius":       {en:"maw-of-malmortius",         t:"Defensivo", desc:"Escudo mágico + RM + AD. Imprescindible contra mucho AP."},
  "Espada de Cadena Quimiopunk":{en:"chempunk-chainsword",       t:"Ofensivo",  desc:"Aplica Heridas Graves (reduce curación 40%). Contra rivales con mucha sustain."},
  "Espinos":                    {en:"thornmail",                 t:"Defensivo", desc:"Devuelve daño al atacante y aplica Heridas Graves. Contra carries AD."},
  "Twinguard de Amaranth":      {en:"amaranths-twinguard",       t:"Defensivo", desc:"Gana resistencias al estar en combate. Contra equipos mixtos con mucho CC."},
  "Lanza Shojin":               {en:"spear-of-shojin",           t:"Ofensivo",  desc:"Reduce cooldowns al atacar. Ideal cuando vas ganando y necesitas spam de habilidades."},
  "Cimitarra Mercurial":        {en:"mercurial-scimitar",        t:"Defensivo", desc:"Limpia cualquier CC activo instantáneamente. Contra supresión o CC decisivo."},
  "Guantelete de la Trinidad":  {en:"trinity-force",             t:"Híbrido",   desc:"Stats balanceadas + empowered attack tras cada habilidad. Core bruiser Q-AA-Q."},
  "Cielos Hendidos":            {en:"sundered-sky",              t:"Ofensivo",  desc:"Cura al golpear con habilidades en campeones. Sustain para fighters."},
  "Filo Infinito":              {en:"infinity-edge",             t:"Ofensivo",  desc:"El ítem de crítico más poderoso. Amplifica enormemente los golpes críticos."},
  "Huracán de Runaan":          {en:"runaans-hurricane",         t:"Ofensivo",  desc:"Proyectiles a 2 enemigos cercanos. Limpias oleadas y dañas varios en teamfights."},
  "Cañón de Tiro Rápido":       {en:"rapid-firecannon",          t:"Ofensivo",  desc:"Carga un ataque de largo alcance. Para ADCs que atacan desde la mayor distancia."},
  "El Recolector":              {en:"the-collector",             t:"Ofensivo",  desc:"Ejecuta al rival con menos del 5% de vida. Para asesinos AD y carries."},
  "Tormento de Liandry":        {en:"liandrys-torment",          t:"Ofensivo",  desc:"Quema basada en la vida máxima del rival. Core contra campeones con mucha HP."},
  "Capricho de Rabadon":        {en:"rabadons-deathcap",         t:"Ofensivo",  desc:"Aumenta TODO tu AP en 40%. El ítem de AP más eficiente del juego."},
  "Abismo de Zhonya":           {en:"zhonyas-hourglass",         t:"Defensivo", desc:"Invulnerabilidad de 2.5 segundos. Para magos que hacen engage o vs asesinos AD."},
  "Velo de Banshee":            {en:"banshees-veil",             t:"Defensivo", desc:"Bloquea el primer hechizo enemigo. Contra magos de rango o CC clave del rival."},
  "Vacío de Void":              {en:"void-staff",                t:"Ofensivo",  desc:"40% de penetración mágica. Obligatorio cuando los rivales construyen RM."},
  "Llama Sombría":              {en:"shadowflame",               t:"Ofensivo",  desc:"Penetración mágica fija alta. Devastador contra rivales con poca RM."},
  "Mandato Imperial":           {en:"imperial-mandate",          t:"Híbrido",   desc:"Tus habilidades marcan al rival para que tus aliados hagan más daño."},
  "Égida Redimida":             {en:"redemption",                t:"Defensivo", desc:"Sana a aliados cercanos desde lejos. Cambia teamfights críticas."},
  "Cítara de Ardent Censer":    {en:"ardent-censer",             t:"Híbrido",   desc:"Da velocidad de ataque y daño extra a aliados que proteges."},
  "Cristal de Zeke":            {en:"zekes-convergence",         t:"Híbrido",   desc:"Al usar CC, tú y un aliado se potencian. Excelente con carry AD fuerte."},
  "Bendición de Mikael":        {en:"mikaels-blessing",          t:"Defensivo", desc:"Limpia el CC de un aliado. Contra CC masivo que bloquea a tu carry."},
  "Grebas Encadenadas":         {en:"plated-steelcaps",          t:"Botas",     desc:"Reducen el daño de ataques básicos un 12%. Las mejores botas contra carries AD."},
  "Botas de Mercurio":          {en:"mercury-treads",            t:"Botas",     desc:"RM + reducción de CC. Obligatorias contra mucho AP+CC."},
  "Botas del Hechicero":        {en:"sorcerers-shoes",           t:"Botas",     desc:"Penetración mágica. Las mejores botas de daño para magos."},
  "Botas de Lucidez Jónica":    {en:"ionian-boots-of-lucidity",  t:"Botas",     desc:"Reducen cooldowns. Para supports y campeones con habilidades de alto CD."},
  "Botas de Celeridad":         {en:"boots-of-swiftness",        t:"Botas",     desc:"La mayor velocidad de movimiento. Para campeones que necesitan roam constante."},
}

export const BUILDS = {
  fighter_ad:{
    core:["Eclipse","Tachón Negro","Danza de la Muerte","Tachón de Sterak"],
    sit:{ap:"Fauces de Malmortius",heal:"Espada de Cadena Quimiopunk",adatk:"Espinos",cc:"Twinguard de Amaranth",win:"Lanza Shojin"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Stoneplate",
    ks:"Conquistador",ksn:"Acumulas AD y Omnivamp al pelear seguido. Perfecto para fighters que buscan peleas largas.",
    runas:[{slot:"Slot 1",n:"Demolish",p:"Daño extra a torres cuando tienes ventaja."},{slot:"Slot 2",n:"Second Wind",p:"Regeneras vida tras recibir daño. Vital contra poke."},{slot:"Slot 3",n:"Overgrowth",p:"HP permanente por cs. Escala con Sterak's y Danza."},{slot:"Slot 4",n:"Legend: Tenacity",p:"Reduce la duración de los CC que recibes."}],
    skills:"R > Q > E > W",sn:"Prioriza la ult por el lifesteal. Q es tu herramienta de daño principal.",
    spells:{def:["Flash","Ignite"],jg:["Flash","Smite"]},
    tip:"Entra con ult a un carry, usa el combo Q-dash-Q para aplicar tus pasivos, y activa el escudo de Eclipse cuando el rival intente pelear de vuelta.",
  },
  fighter_ap:{
    core:["Tormento de Liandry","Capricho de Rabadon","Abismo de Zhonya","Velo de Banshee"],
    sit:{ad:"Abismo de Zhonya",heal:"Espada de Cadena Quimiopunk",cc:"Twinguard de Amaranth",win:"Tormento de Liandry"},
    boots:{def:"Botas del Hechicero",ad:"Grebas Encadenadas"},enc:"Arcane Comet",
    ks:"Conquistador",ksn:"Apila con habilidades en combate prolongado y te da Omnivamp.",
    runas:[{slot:"Slot 1",n:"Demolish",p:"Presión extra en torres."},{slot:"Slot 2",n:"Second Wind",p:"Regeneración contra el poke enemigo."},{slot:"Slot 3",n:"Overgrowth",p:"HP extra que mejora tu durabilidad."},{slot:"Slot 4",n:"Perseverance",p:"Regeneras más vida cuando llevas poca."}],
    skills:"R > Q > E > W",sn:"Prioriza la habilidad de mayor daño del campeón, luego el CC.",
    spells:{def:["Flash","Ignite"],jg:["Flash","Smite"]},
    tip:"Combina tus habilidades de AP para maximizar el daño. Usa Zhonya cuando el rival intente matarte.",
  },
  fighter_mixed:{
    core:["Guantelete de la Trinidad","Tachón Negro","Danza de la Muerte","Tachón de Sterak"],
    sit:{ap:"Fauces de Malmortius",heal:"Espada de Cadena Quimiopunk",adatk:"Espinos",win:"Cielos Hendidos"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Stoneplate",
    ks:"Conquistador",ksn:"Maximiza el daño en combates prolongados con daño mixto.",
    runas:[{slot:"Slot 1",n:"Demolish",p:"Presión de torres constante."},{slot:"Slot 2",n:"Second Wind",p:"Regen contra poke enemigo."},{slot:"Slot 3",n:"Overgrowth",p:"HP permanente por cs."},{slot:"Slot 4",n:"Legend: Tenacity",p:"Reduce el CC que recibes."}],
    skills:"R > Q > E > W",sn:"Alterna habilidades y ataques básicos para activar el pasivo de Trinity.",
    spells:{def:["Flash","Ignite"],jg:["Flash","Smite"]},
    tip:"El empowered attack de Trinity es tu pico de daño. Siempre usa una habilidad antes de atacar para activarlo.",
  },
  assassin_ad:{
    core:["El Recolector","Filo Infinito","Cimitarra Mercurial","Guantelete de la Trinidad"],
    sit:{ap:"Fauces de Malmortius",heal:"Espada de Cadena Quimiopunk",tank:"El Recolector",win:"El Recolector"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Quicksilver",
    ks:"Electrocutar",ksn:"Burst instantáneo al golpear 3 veces rápido. Maximiza el one-shot de asesinos AD.",
    runas:[{slot:"Slot 1",n:"Brutal",p:"AD y penetración de armadura. Más daño desde el minuto 1."},{slot:"Slot 2",n:"Second Wind",p:"Sobrevives el poke enemigo y llegas a mid-game."},{slot:"Slot 3",n:"Bone Plating",p:"Reduce el primer burst. Margen para escapar después del combo."},{slot:"Slot 4",n:"Hunter - Genius",p:"Haste acumulado por kills. Más habilidades disponibles."}],
    skills:"R > Q > E > W",sn:"Ult siempre primero. Luego ejecuta el combo completo sin pausas.",
    spells:{def:["Flash","Ignite"]},
    tip:"Espera el momento exacto: que el rival use sus habilidades defensivas. Entra, combo completo, sal con Flash.",
  },
  assassin_ap:{
    core:["Llama Sombría","Capricho de Rabadon","Abismo de Zhonya","Velo de Banshee"],
    sit:{ad:"Abismo de Zhonya",ap:"Velo de Banshee",heal:"Espada de Cadena Quimiopunk",win:"Vacío de Void"},
    boots:{def:"Botas del Hechicero",ad:"Grebas Encadenadas"},enc:"Sorcerer's",
    ks:"Electrocutar",ksn:"Burst instantáneo con 3 habilidades. El keystone más fuerte para asesinos AP.",
    runas:[{slot:"Slot 1",n:"Brutal",p:"AP y penetración mágica early."},{slot:"Slot 2",n:"Second Wind",p:"Sobrevives el intercambio de daño en lane."},{slot:"Slot 3",n:"Bone Plating",p:"Absorbe el burst inicial del rival para terminar tu combo."},{slot:"Slot 4",n:"Hunter - Genius",p:"Haste por kills. Más combos disponibles."}],
    skills:"R > Q > E > W",sn:"Combo: ejecuta habilidades sin pausas para aplicar Electrocutar antes de que el rival reaccione.",
    spells:{def:["Flash","Ignite"]},
    tip:"El one-shot es tu único objetivo. Espera que el rival use su habilidad defensiva clave, luego entra y ejecuta el combo completo.",
  },
  marksman_ad:{
    core:["Filo Infinito","Huracán de Runaan","Cañón de Tiro Rápido","El Recolector"],
    sit:{ap:"Cimitarra Mercurial",heal:"Espada de Cadena Quimiopunk",tank:"Huracán de Runaan",win:"Filo Infinito"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Gluttonous",
    ks:"Presa de la Flota",ksn:"Velocidad de movimiento al atacar. Te ayuda a kitar y mantenerte lejos de los que te persiguen.",
    runas:[{slot:"Slot 1",n:"Brutal",p:"AD y penetración de armadura. Más daño en la fase de línea."},{slot:"Slot 2",n:"Second Wind",p:"Regeneras vida contra el poke del support enemigo."},{slot:"Slot 3",n:"Bone Plating",p:"Reduces el daño del primer engage enemigo."},{slot:"Slot 4",n:"Hunter - Genius",p:"Haste para usar Flash o Exhaust más seguido."}],
    skills:"R > Q > E > W",sn:"Prioriza tu habilidad de daño principal. En la mayoría, Q > E > W.",
    spells:{def:["Flash","Exhaust"]},
    tip:"Nunca entres adelante. Siempre detrás de tu equipo. Kita hacia atrás mientras atacas. Prioriza al carry más peligroso enemigo.",
  },
  marksman_mixed:{
    core:["Filo Infinito","Huracán de Runaan","El Recolector","Cañón de Tiro Rápido"],
    sit:{ap:"Cimitarra Mercurial",heal:"Espada de Cadena Quimiopunk",tank:"Huracán de Runaan",win:"Filo Infinito"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Gluttonous",
    ks:"Presa de la Flota",ksn:"Velocidad al atacar para kitar. Los ADCs mixtos necesitan más movilidad.",
    runas:[{slot:"Slot 1",n:"Brutal",p:"Daño extra early."},{slot:"Slot 2",n:"Second Wind",p:"Regen vs poke."},{slot:"Slot 3",n:"Bone Plating",p:"Absorbe el primer engage."},{slot:"Slot 4",n:"Hunter - Genius",p:"Haste acumulado por kills."}],
    skills:"R > Q > E > W",sn:"Combina el daño físico y mágico activando tus pasivos con el orden correcto.",
    spells:{def:["Flash","Exhaust"]},
    tip:"Juega como un ADC estándar pero aprovecha la versatilidad del daño mixto.",
  },
  mage_ap:{
    core:["Tormento de Liandry","Capricho de Rabadon","Llama Sombría","Abismo de Zhonya"],
    sit:{ad:"Abismo de Zhonya",ap:"Velo de Banshee",heal:"Espada de Cadena Quimiopunk",tank:"Tormento de Liandry",win:"Vacío de Void"},
    boots:{def:"Botas del Hechicero",ad:"Grebas Encadenadas"},enc:"Sorcerer's",
    ks:"Electrocutar",ksn:"Burst al hacer 3 habilidades seguidas. El keystone más fuerte para magos de poke y combo.",
    runas:[{slot:"Slot 1",n:"Brutal",p:"AP y penetración mágica. Más daño de poke desde level 1."},{slot:"Slot 2",n:"Second Wind",p:"Regen contra el poke de lane."},{slot:"Slot 3",n:"Bone Plating",p:"Reduce el daño del primer engage enemigo."},{slot:"Slot 4",n:"Hunter - Genius",p:"Haste por kills. Más frecuencia de combos."}],
    skills:"R > Q > E > W",sn:"Prioriza tu habilidad de mayor daño. Aprende el rango exacto de cada una.",
    spells:{def:["Flash","Ignite"],supp:["Flash","Exhaust"]},
    tip:"Los magos ganan desde distancia. Aprende el rango de tus habilidades y dañalos sin que te alcancen. En teamfights, siempre detrás de tu frontline.",
  },
  tank_ad:{
    core:["Tachón Negro","Tachón de Sterak","Twinguard de Amaranth","Espinos"],
    sit:{ap:"Fauces de Malmortius",heal:"Espinos",adatk:"Espinos",win:"Guantelete de la Trinidad"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Stoneplate",
    ks:"Agarre de los No Muertos",ksn:"Daño y HP permanente al golpear campeones cada 4s. Perfecto para tanks que buscan peleas frecuentes.",
    runas:[{slot:"Slot 1",n:"Demolish",p:"Destruyes torres con tu HP extra acumulado."},{slot:"Slot 2",n:"Second Wind",p:"Regeneras mucha más vida que los carries."},{slot:"Slot 3",n:"Overgrowth",p:"HP permanente por cs. Te vuelves más tanky con el tiempo."},{slot:"Slot 4",n:"Legend: Tenacity",p:"Reduce el CC. Los tanks son siempre el foco del CC enemigo."}],
    skills:"R > Q > E > W",sn:"Prioriza el CC y el engage. Eres el iniciador, no quien hace el daño.",
    spells:{def:["Flash","Ignite"],jg:["Flash","Smite"],supp:["Flash","Exhaust"]},
    tip:"Tu trabajo es absorber daño e iniciar peleas. Entra primero, usa todo tu CC, y deja que tus carries limpien.",
  },
  tank_ap:{
    core:["Tormento de Liandry","Abismo de Zhonya","Twinguard de Amaranth","Espinos"],
    sit:{ad:"Espinos",ap:"Velo de Banshee",heal:"Espinos",win:"Capricho de Rabadon"},
    boots:{def:"Grebas Encadenadas",ap:"Botas de Mercurio"},enc:"Stoneplate",
    ks:"Agarre de los No Muertos",ksn:"HP y daño permanente al golpear. Los tanks AP aprovechan el daño extra para hacer follow-up.",
    runas:[{slot:"Slot 1",n:"Demolish",p:"Presión en estructuras con tu bulk."},{slot:"Slot 2",n:"Second Wind",p:"Regen enorme comparado con carries."},{slot:"Slot 3",n:"Overgrowth",p:"HP que potencia Liandry y tu tankiness."},{slot:"Slot 4",n:"Legend: Tenacity",p:"Reduces el CC que recibes."}],
    skills:"R > Q > E > W",sn:"Prioriza el CC o el engage según el campeón.",
    spells:{def:["Flash","Ignite"],supp:["Flash","Exhaust"]},
    tip:"Combina tu tankiness con el burning de Liandry. Entra, aguanta el daño, y el DoT de Liandry desgasta al rival.",
  },
  support_ap:{
    core:["Mandato Imperial","Égida Redimida","Cítara de Ardent Censer","Bendición de Mikael"],
    sit:{ap:"Velo de Banshee",heal:"Espada de Cadena Quimiopunk",ad:"Abismo de Zhonya",win:"Capricho de Rabadon"},
    boots:{def:"Botas de Lucidez Jónica",ap:"Botas de Mercurio"},enc:"Locket",
    ks:"Guardián",ksn:"Escudo a aliados al recibir daño. El keystone más fuerte para supports protectores.",
    runas:[{slot:"Slot 1",n:"Weak Point",p:"Tus habilidades marcan al rival para que tus aliados hagan más daño."},{slot:"Slot 2",n:"Second Wind",p:"Regen vital contra el poke rival en lane."},{slot:"Slot 3",n:"Bone Plating",p:"Reduces el daño inicial de los engages enemigos."},{slot:"Slot 4",n:"Pack Hunter",p:"Velocidad extra con aliados. Clave para roams y llegar a tiempo."}],
    skills:"R > E > Q > W",sn:"Prioriza tu habilidad de protección o CC. La ult siempre tiene prioridad.",
    spells:{def:["Flash","Exhaust"]},
    tip:"Tu ADC es tu prioridad. Usa CC y protección para mantenerlo vivo. Tu segunda responsabilidad es la visión.",
  },
}

// ── Threat/synergy analysis ────────────────────────────
const HEAL_N = ["Soraka","Yuumi","Nami","Sona","Seraphine","Aatrox","Vladimir","Sylas","Warwick","Olaf","Darius","Gwen","Nilah","Samira"]
const CC_N   = ["Leona","Malphite","Amumu","Alistar","Blitzcrank","Thresh","Nautilus","Lux","Sett","Vi","Jarvan IV","Rell","Lissandra","Annie","Morgana","Ashe","Varus"]

// hints = quick chips ({ap,ad,heal,cc,tank}); a chip raises its count to the threshold that triggers the matching item
export function analyzeThreats(enemies, hints = {}) {
  const champs = enemies.map(e => e.data).filter(Boolean)
  const names  = enemies.map(e => e.name)
  const apCount   = Math.max(champs.filter(c => c.d==="ap").length,      hints.ap   ? 3 : 0)
  const adCount   = Math.max(champs.filter(c => c.d==="ad").length,      hints.ad   ? 3 : 0)
  const tankCount = Math.max(champs.filter(c => c.t==="tank").length,    hints.tank ? 2 : 0)
  const healCount = Math.max(names.filter(n => HEAL_N.some(h => n.includes(h))).length, hints.heal ? 1 : 0)
  const assCount  = champs.filter(c => c.t==="assassin").length
  const ccCount   = Math.max(names.filter(n => CC_N.some(h => n.includes(h))).length,   hints.cc   ? 3 : 0)
  const threats = []
  if (apCount>=2)   threats.push({l:"Mucho daño mágico (AP)",  cls:"tag-b"})
  if (adCount>=3)   threats.push({l:"Mucho daño físico (AD)",  cls:"tag-r"})
  if (tankCount>=2) threats.push({l:"Equipo muy tanky",         cls:"tag-gold"})
  if (healCount>=1) threats.push({l:"Mucha curación enemiga",   cls:"tag-p"})
  if (assCount>=2)  threats.push({l:"Muchos asesinos",          cls:"tag-r"})
  if (ccCount>=2)   threats.push({l:"CC masivo",                cls:"tag-b"})
  if (!threats.length) threats.push({l:"Composición balanceada", cls:"tag-g"})
  return {threats, apCount, adCount, tankCount, healCount, assCount, ccCount}
}

export function analyzeSynergies(allies) {
  const names = allies.map(a => a.name.toLowerCase())
  const syns  = []
  if (["malphite","amumu","vi","jarvan","leona","rell","alistar"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:"Fuerte engage aliado", cls:"tag-g"})
  if (["soraka","yuumi","nami","sona","karma","milio"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:"Curación aliada",      cls:"tag-g"})
  if (["lulu","janna","karma","braum","thresh"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:"Peel para carries",    cls:"tag-b"})
  if (["yasuo","yone","malphite","orianna"].some(h=>names.some(n=>n.includes(h))))
    syns.push({l:"Combo de teamfight",   cls:"tag-gold"})
  return syns
}

export function buildLocalBuild(cData, role, enemies, allies, hints = {}) {
  const key = cData ? `${cData.t}_${cData.d}` : "fighter_ad"
  const tpl  = BUILDS[key] || BUILDS.fighter_ad
  const {threats,apCount,adCount,tankCount,healCount,assCount,ccCount} = analyzeThreats(enemies, hints)
  const syns   = analyzeSynergies(allies)
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
           : apCount>=2&&cData?.d!=="ad"&&!items.includes("Velo de Banshee")           ? "Velo de Banshee"
           : healCount>=1&&!items.includes("Espada de Cadena Quimiopunk")              ? "Espada de Cadena Quimiopunk"
           : ccCount>=3&&cData?.d==="ad"&&!items.includes("Cimitarra Mercurial")       ? "Cimitarra Mercurial"
           : tpl.core[3] || tpl.core[0]

  if (i5) items.push(i5)
  if (i6 && !items.includes(i6)) items.push(i6)
  items = [...new Set(items)].slice(0,6)

  const bootsName = apCount>=3 ? tpl.boots.ap : tpl.boots.def

  const build = items.map((name, i) => {
    const d = ITEMS[name] || {}
    let why = d.desc || "Ítem esencial para este arquetipo."
    if (i===0)                                     why = "Tu primer ítem de power spike. " + why
    if (name==="Espada de Cadena Quimiopunk")       why = "⚡ El rival tiene mucha curación. Heridas Graves la reduce un 40%."
    if (name==="Fauces de Malmortius")              why = "⚡ Hay mucho AP enemigo. El escudo mágico puede absorberte el burst decisivo."
    if (name==="Espinos")                           why = "⚡ El rival ataca mucho físicamente. Cada golpe recibido les devuelve daño."
    if (name==="Cimitarra Mercurial")               why = "⚡ Hay CC decisivo enemigo. Activa este ítem para liberarte instantáneamente."
    if (name==="Twinguard de Amaranth")             why = "⚡ Hay mucho CC. Ganas resistencias mientras más tiempo estés en combate."
    if (name==="Velo de Banshee")                   why = "⚡ Hay mucho AP. El velo bloquea automáticamente el primer hechizo enemigo."
    return { nombre:name, en:d.en||name.toLowerCase().replace(/ /g,"-"), tipo:d.t||"Híbrido", por_que:why }
  })

  let runas = [{slot:"Keystone", n:tpl.ks, p:tpl.ksn}, ...tpl.runas]
  if (ccCount>=3)       runas[4] = {slot:"Slot 4", n:"Legend: Tenacity", p:"⚡ CC masivo. Legend: Tenacity reduce la duración de todos los CC que recibes."}
  if (apCount>=3&&!isJg) runas[2] = {slot:"Slot 2", n:"Bone Plating",    p:"Contra tanto AP, Bone Plating reduce el burst inicial antes de activar tus defensivos."}

  const spells = isJg&&tpl.spells.jg   ? tpl.spells.jg
               : isSupp&&tpl.spells.supp ? tpl.spells.supp
               : tpl.spells.def

  return {
    campeon:          cData?.n || "Desconocido",
    carril:           role,
    amenazas:         threats,
    sinergias:        syns,
    build,
    botas: {
      nombre:       bootsName,
      en:           ITEMS[bootsName]?.en || "plated-steelcaps",
      encantamiento: tpl.enc,
      por_que:      apCount>=3 ? "RM y tenacidad críticas contra tanto AP." : ITEMS[bootsName]?.desc||""
    },
    runas,
    orden_habilidades: tpl.skills,
    skillNote:         tpl.sn,
    hechizos:          spells,
    consejo:           tpl.tip,
  }
}
