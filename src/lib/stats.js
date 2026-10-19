import { CHAMPIONS } from '../data/champions'

// Your own results, nothing else. A number only shows up once there are enough games behind it.
export const MIN_GAMES = 3

const klass = name => CHAMPIONS.find(c => c.n === name)?.t
const tally = list => ({ n: list.length, w: list.filter(e => e.win).length })
export const pct = ({ w, n }) => Math.round((100 * w) / n)

export const record = (entries, champ) => tally(entries.filter(e => e.champ === champ))

// games where at least one rival was of that class (champ optional: all your champions)
export const vsClass = (entries, champ, k) =>
  tally(entries.filter(e => (!champ || e.champ === champ) && (e.enemies || []).some(n => klass(n) === k)))

const ranked = rows => rows.filter(r => r.n >= MIN_GAMES).sort((a, b) => pct(b) - pct(a) || b.n - a.n)

export function champTable(entries) {
  const names = [...new Set(entries.map(e => e.champ))]
  return ranked(names.map(champ => ({ champ, ...record(entries, champ) })))
}

export function classTable(entries) {
  return ranked(['assassin', 'fighter', 'mage', 'marksman', 'support', 'tank'].map(k => ({ klass: k, ...vsClass(entries, null, k) })))
}

// A nudge for the suggestions: -1..1, zero until MIN_GAMES. Shrunk toward 0 so 3-0 does not outweigh the class rules.
export function historyBonus(entries, champ) {
  const { w, n } = record(entries, champ)
  if (n < MIN_GAMES) return { bonus: 0, w, n }
  return { bonus: Math.max(-1, Math.min(1, ((2 * w - n) / (n + 3)) * 1.5)), w, n }
}
