import type { ItemState } from '../domain/model.js'
import { getItemStateOption } from './item-states.js'

export function getSelectableItemAriaLabel(
  label: string,
  currentState: ItemState,
  activeState: ItemState,
): string {
  const currentOption = getItemStateOption(currentState)
  const activeOption = getItemStateOption(activeState)
  const action =
    activeState === 'none' || currentState === activeState
      ? 'clear state'
      : `mark as ${activeOption.label}`

  return `${label}, current state: ${currentOption.label}. Activate to ${action}.`
}
