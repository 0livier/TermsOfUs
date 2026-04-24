import type { ItemId, ItemState, ItemStateOption } from '../domain/model.js'
import { getSelectableItemAriaLabel } from './selectable-item-labels.js'

interface SelectableItemProps {
  id: ItemId
  label: string
  currentState: ItemState
  activeState: ItemState
  stateOptions: ItemStateOption[]
  onSelect: (itemId: ItemId) => void
}

export function SelectableItem({
  id,
  label,
  currentState,
  activeState,
  stateOptions,
  onSelect,
}: SelectableItemProps) {
  const currentOption = stateOptions.find((o) => o.value === currentState) ?? stateOptions[0]!

  return (
    <button
      type="button"
      className={`item-button is-${currentState}`}
      aria-label={getSelectableItemAriaLabel(label, currentState, activeState, stateOptions)}
      onClick={() => onSelect(id)}
    >
      <span>{label}</span>
      <span className="item-state">
        <span className="state-mark" aria-hidden="true" />
        <span>{currentOption.shortLabel}</span>
      </span>
    </button>
  )
}
