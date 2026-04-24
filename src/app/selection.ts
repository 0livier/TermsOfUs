import type {
  ItemId,
  SelectedItemState,
  SelectionState,
} from '../domain/model.js'

export function applyActiveState(
  selection: SelectionState,
  itemId: ItemId,
  activeState: SelectedItemState,
): SelectionState {
  const nextSelection = { ...selection }

  if (nextSelection[itemId] === activeState) {
    delete nextSelection[itemId]
  } else {
    nextSelection[itemId] = activeState
  }

  return nextSelection
}
