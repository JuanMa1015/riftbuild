import { describe, it, expect, vi, beforeEach } from 'vitest'
import game from '../public/data/game.json'
import { isValidGame } from '../src/data/validate'
import { ITEMS } from '../src/data/builds'
import { CHAMPIONS } from '../src/data/game'
import { ROLE_OPTIONS } from '../src/data/champions'
import { localBuild, generateBuild } from '../src/lib/aiService'
import { recommend, evaluatePick, SWITCH_DELTA } from '../src/lib/recommend'
import { useMatchStore } from '../src/store'
import { record, vsClass, champTable, historyBonus, MIN_GAMES } from '../src/lib/stats'

const clone = () => structuredClone(game)
const E = names => names.map((name, i) => ({ lane: 'top', name }))

describe('validator', () => {
  it('accepts the bundled game.json', () => expect(isValidGame(game)).toBe(true))
  it('rejects non-objects', () => { for (const v of [null, 'x', 5, [], {}]) expect(isValidGame(v)).toBe(false) })
  it.each([
    ['too few champions', g => { g.champions = g.champions.slice(0, 10) }],
    ['bad champion class', g => { g.champions[0].t = 'wizard' }],
    ['item slug with a path', g => { g.items[Object.keys(g.items)[0]].en = '../evil' }],
    ['core with 3 items', g => { Object.values(g.builds)[0].core.pop() }],
    ['build naming an unknown item', g => { Object.values(g.builds)[0].core[0] = 'No existe' }],
    ['timer out of range', g => { g.timers = [{ id: 'x', es: 'a', en: 'b', secs: 5 }] }],
    ['missing version', g => { delete g.version }],
    ['override for an unknown champion', g => { g.overrides = { Nadie: { core: Object.keys(g.items).slice(0, 4) } } }],
    ['override with an unknown item', g => { g.overrides = { Jinx: { core: ['a', 'b', 'c', 'd'] } } }],
    ['override repeating an item', g => { const i = Object.keys(g.items)[0]; g.overrides = { Jinx: { core: [i, i, i, i] } } }],
  ])('rejects %s', (_, mutate) => { const g = clone(); mutate(g); expect(isValidGame(g)).toBe(false) })
})

describe('engine', () => {
  it('always returns 5 distinct non-boot items plus boots, for every champion x role x enemy mix', () => {
    const foes = [CHAMPIONS[3], CHAMPIONS[40], CHAMPIONS[80], CHAMPIONS[100], CHAMPIONS[120]].map(c => ({ name: c.n }))
    for (const c of CHAMPIONS) for (const role of ROLE_OPTIONS.map(r => r.value)) for (const hints of [{}, { ap: true, heal: true }, { ad: true, tank: true, cc: true }]) {
      const r = localBuild({ myChamp: c.n, myRole: role, allies: [], enemies: foes, hints })
      expect(r.build).toHaveLength(5)
      expect(new Set(r.build.map(b => b.nombre)).size).toBe(5)
      expect(r.botas?.nombre).toBeTruthy()
    }
  })
  it('works with no enemies at all', () => {
    const r = localBuild({ myChamp: CHAMPIONS[0].n, myRole: 'Mid', allies: [], enemies: [], hints: {} })
    expect(r.build).toHaveLength(5)
  })
})

describe('per-champion overrides', () => {
  const ask = (c, role) => localBuild({ myChamp: c, myRole: role, allies: [], enemies: [], hints: {} })
  it('every override in game.json produces a valid build', () => {
    for (const n of Object.keys(game.overrides)) {
      const c = CHAMPIONS.find(x => x.n === n)
      const r = ask(n, ROLE_OPTIONS.find(x => x.value.startsWith(c.r[0] === 'ADC' ? 'ADC' : c.r[0]))?.value || 'Mid')
      expect(r.build).toHaveLength(5)
      expect(new Set(r.build.map(b => b.nombre)).size).toBe(5)
    }
  })
  it('two champions of the same class no longer get the same core', () => {
    const jinx = ask('Jinx', 'ADC / Duo').build.map(b => b.nombre), ashe = ask('Ashe', 'ADC / Duo').build.map(b => b.nombre)
    const sivir = ask('Sivir', 'ADC / Duo').build.map(b => b.nombre)   // no override: class template
    expect(jinx).not.toEqual(sivir)
    expect(jinx).not.toEqual(ashe)
  })
  it('the keystone follows the override and keeps a description', () => {
    const r = ask('Yasuo', 'Mid')
    expect(r.runas[0].n).toBeTruthy()
    expect(r.runas[0].p).toBeTruthy()
  })
})

describe('recommender', () => {
  const names = CHAMPIONS.slice(0, 5).map(c => c.n)
  it('suggests nothing when nothing is known', () => expect(recommend({ enemies: [], allies: [] })).toEqual([]))
  it('limits one class to 2 in the first pass and never suggests a taken champion', () => {
    const out = recommend({ enemies: names, allies: [], limit: 5 })
    for (const x of out) expect(names).not.toContain(x.c.n)
    const counts = {}; out.slice(0, 4).forEach(x => { counts[x.c.t] = (counts[x.c.t] || 0) + 1 })
    expect(Math.max(0, ...Object.values(counts))).toBeLessThanOrEqual(4)
    expect(out.length).toBeLessThanOrEqual(5)
  })
  it('evaluatePick: unknown draft is not judged', () => expect(evaluatePick({ name: names[0], enemies: [], allies: [] }).known).toBe(false))
  it('evaluatePick: switchNow only when the gap reaches SWITCH_DELTA', () => {
    const e = evaluatePick({ name: names[0], enemies: names.slice(1), allies: [] })
    expect(e.known).toBe(true)
    expect(e.switchNow).toBe(e.delta >= SWITCH_DELTA)
  })
})

describe('AI service', () => {
  const args = { myChamp: CHAMPIONS[0].n, myRole: 'Solo / Baron', allies: [], enemies: E([CHAMPIONS[5].n]), hints: {}, lang: 'es', provider: 'openrouter', key: 'sk-test', model: '' }
  const gear = Object.keys(ITEMS).filter(k => ITEMS[k].t !== 'Botas').slice(0, 6)
  const boots = Object.keys(ITEMS).find(k => ITEMS[k].t === 'Botas')
  const reply = content => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) })
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })

  it('maps a valid answer through our item list, dropping unknown and duplicate names', async () => {
    const ans = { items: [...gear.slice(0, 4).map(n => ({ n, w: 'x' })), { n: gear[0], w: 'dup' }, { n: 'Inventado', w: 'y' }], boots, tip: 'hola' }
    vi.stubGlobal('fetch', vi.fn(async () => reply(JSON.stringify(ans))))
    const r = await generateBuild(args)
    expect(r.build).toHaveLength(4)
    expect(r.consejo).toBe('hola')
  })
  it('keeps only short string coach notes', async () => {
    const ans = { items: gear.slice(0, 5).map(n => ({ n })), boots, coach: { pick: ' Mantén a Garen ', threat: 5, lane: 'x'.repeat(500), watch: '' , extra: 'no' } }
    vi.stubGlobal('fetch', vi.fn(async () => reply(JSON.stringify(ans))))
    const r = await generateBuild(args)
    expect(r.coach.pick).toBe('Mantén a Garen')
    expect(r.coach.threat).toBeUndefined(); expect(r.coach.watch).toBeUndefined(); expect(r.coach.extra).toBeUndefined()
    expect(r.coach.lane).toHaveLength(220)
  })
  it('passes the abort signal to the request', async () => {
    const f = vi.fn(async (_u, init) => { expect(init.signal).toBe(ac.signal); return reply(JSON.stringify({ items: gear.slice(0, 5).map(n => ({ n })), boots })) })
    const ac = new AbortController()
    vi.stubGlobal('fetch', f)
    await generateBuild({ ...args, signal: ac.signal })
    expect(f).toHaveBeenCalledTimes(1)
  })
  it('throws when the model returns too few valid items', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => reply(JSON.stringify({ items: [{ n: 'Inventado' }], boots }))))
    await expect(generateBuild(args)).rejects.toThrow()
  })
  it('throws when the answer has no JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => reply('lo siento')))
    await expect(generateBuild(args)).rejects.toThrow()
  })
  it('the second identical request comes from the cache', async () => {
    const f = vi.fn(async () => reply(JSON.stringify({ items: gear.slice(0, 5).map(n => ({ n })), boots })))
    vi.stubGlobal('fetch', f)
    await generateBuild(args); await generateBuild(args)
    expect(f).toHaveBeenCalledTimes(1)
  })
  it('never calls the network without a key', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    await generateBuild({ ...args, key: '' })
    expect(f).not.toHaveBeenCalled()
  })
})

describe('your own stats', () => {
  const assassin = CHAMPIONS.find(c => c.t === 'assassin').n
  const game = (champ, win, enemies = []) => ({ champ, win, enemies })
  const log = [game('Ahri', true, [assassin]), game('Ahri', true, [assassin]), game('Ahri', false, [assassin]), game('Ahri', true), game('Zed', false)]
  it('counts a champion and a class matchup', () => {
    expect(record(log, 'Ahri')).toEqual({ n: 4, w: 3 })
    expect(vsClass(log, 'Ahri', 'assassin')).toEqual({ n: 3, w: 2 })
  })
  it('hides numbers below the minimum number of games', () => {
    expect(MIN_GAMES).toBe(3)
    expect(champTable(log).map(r => r.champ)).toEqual(['Ahri'])   // Zed has 1 game
    expect(historyBonus(log, 'Zed').bonus).toBe(0)
  })
  it('the bonus stays within -1..1 and rewards a winning record', () => {
    const b = historyBonus(Array.from({ length: 50 }, () => game('Ahri', true)), 'Ahri').bonus
    expect(b).toBeGreaterThan(0.5); expect(b).toBeLessThanOrEqual(1)
    expect(historyBonus(Array.from({ length: 50 }, () => game('Ahri', false)), 'Ahri').bonus).toBeGreaterThanOrEqual(-1)
  })
  it('suggestions use it: a winning champion outranks an equal one', () => {
    const foes = [CHAMPIONS[5].n]
    const base = recommend({ enemies: foes, allies: [], limit: 50 })
    const target = base.find(x => x.score > 0)
    const hist = Array.from({ length: 6 }, () => game(target.c.n, true))
    const withHist = recommend({ enemies: foes, allies: [], limit: 50, history: hist }).find(x => x.c.n === target.c.n)
    expect(withHist.score).toBeGreaterThan(target.score)
  })
})

describe('new match', () => {
  it('clears champion, teams, hints and result, back to step 0', () => {
    const s = useMatchStore.getState()
    s.setMyChamp(CHAMPIONS[0]); s.setEnemy('top', 'Garen'); s.setAlly('mid', 'Ahri'); s.toggleHint('ap'); s.setStep(2); s.setLocked(true)
    s.setResult({ build: [] })
    useMatchStore.getState().newMatch()
    const n = useMatchStore.getState()
    expect(n.myChamp).toBeNull(); expect(n.result).toBeNull()
    expect(n.enemies.top).toBe(''); expect(n.allies.mid).toBe('')
    expect(n.hints.ap).toBe(false); expect(n.locked).toBe(false); expect(n.step).toBe(0)
  })
})
