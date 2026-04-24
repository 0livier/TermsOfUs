import type {
  ItemId,
  ItemState,
  SelectionState,
} from '../domain/model.js'

export function applyActiveState(
  selection: SelectionState,
  itemId: ItemId,
  activeState: ItemState,
): SelectionState {
  const nextSelection = { ...selection }

  if (activeState === 'none' || nextSelection[itemId] === activeState) {
    delete nextSelection[itemId]
  } else {
    nextSelection[itemId] = activeState
  }

  return nextSelection
}
