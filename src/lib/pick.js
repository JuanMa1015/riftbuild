import { useMatchStore, useRecentStore } from '../store'
import { ROLE_MAP } from '../data/champions'

// Choosing my champion, from anywhere (search grid, suggestions, pool).
// keepRole: a suggestion was made for the lane the user chose, so picking it must not move them to the champion's usual lane.
export function chooseChampion(c, { keepRole = false } = {}) {
  const m = useMatchStore.getState()
  m.setMyChamp(c, keepRole ? undefined : ROLE_MAP[c.r[0]])
  useRecentStore.getState().pushMine(c.n)
}
