import type { ItemState, ItemStateOption } from '../domain/model.js'

export function getSelectableItemAriaLabel(
  label: string,
  currentState: ItemState,
  activeState: ItemState,
  stateOptions: ItemStateOption[],
): string {
  const currentOption = stateOptions.find((o) => o.value === currentState) ?? stateOptions[0]!
  const activeOption = stateOptions.find((o) => o.value === activeState) ?? stateOptions[0]!
  const action =
    activeState === 'none' || currentState === activeState
      ? 'clear state'
      : `mark as ${activeOption.label}`

  return `${label}, current state: ${currentOption.label}. Activate to ${action}.`
}
