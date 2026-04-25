import type { ItemState, SelectionState } from '../domain/model.js'
import type { LocalizedItem } from '../content/loader.js'

export const STATE_FILL: Record<ItemState, string> = {
  none:  '#D3D1C7',
  want:  '#fff2a8',
  have:  '#c7f1cf',
  avoid: '#ffd2df',
}

export const STATE_STROKE: Record<ItemState, string> = {
  none:  '#b5b3a9',
  want:  '#927516',
  have:  '#2e7a43',
  avoid: '#a23b5a',
}

// One identity color per category — order mirrors schema.v1.json
export const CATEGORY_COLOR: Record<string, string> = {
  'communication':          '#3B82F6',
  'emotional-support':      '#F97316',
  'emotional-intimacy':     '#A855F7',
  'physical-intimacy':      '#EF4444',
  'sexuality':              '#9F1239',
  'domesticity':            '#B45309',
  'time-together':          '#10B981',
  'relationship-structure': '#1E3A8A',
  'exclusivity':            '#6B7280',
  'romance':                '#EC4899',
  'power-dynamics':         '#7C2D12',
  'community':              '#16A34A',
  'family-care':            '#F59E0B',
  'practical-support':      '#06B6D4',
  'finances':               '#CA8A04',
  'projects':               '#0F766E',
  'labels':                 '#7C3AED',
  'public-affection':       '#DB2777',
  'creativity':             '#84CC16',
}

export function getDominantState(
  items: LocalizedItem[],
  selection: SelectionState,
): ItemState {
  const counts = { want: 0, have: 0, avoid: 0 }
  for (const item of items) {
    const s = selection[item.id]
    if (s) counts[s]++
  }
  const max = Math.max(counts.have, counts.want, counts.avoid)
  if (max === 0) return 'none'
  if (counts.have === max) return 'have'
  if (counts.want === max) return 'want'
  return 'avoid'
}

export function cycleState(current: ItemState): ItemState {
  const order: ItemState[] = ['none', 'want', 'have', 'avoid']
  return order[(order.indexOf(current) + 1) % order.length]
}
