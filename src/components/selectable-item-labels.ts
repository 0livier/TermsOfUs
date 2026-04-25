import type { ItemState, ItemStateOption } from '../domain/model.js'

export function getSelectableItemAriaLabel(
  label: string,
  currentState: ItemState,
  activeState: ItemState,
  stateOptions: ItemStateOption[],
): string {
  const currentOption = stateOptions.find((o) => o.value === currentState)
  const activeOption  = stateOptions.find((o) => o.value === activeState)
  const currentLabel  = currentOption?.longLabel ?? 'Unanswered'
  const action =
    activeState === 'none' || currentState === activeState
      ? 'clear state'
      : `mark as ${activeOption?.longLabel ?? activeState}`

  return `${label}, current state: ${currentLabel}. Activate to ${action}.`
}
