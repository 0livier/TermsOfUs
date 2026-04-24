import type { ItemId, ItemState } from '../domain/model.js'
import { getItemStateOption } from './item-states.js'
import { getSelectableItemAriaLabel } from './selectable-item-labels.js'

interface SelectableItemProps {
  id: ItemId
  label: string
  currentState: ItemState
  activeState: ItemState
  onSelect: (itemId: ItemId) => void
}

export function SelectableItem({
  id,
  label,
  currentState,
  activeState,
  onSelect,
}: SelectableItemProps) {
  const currentOption = getItemStateOption(currentState)

  return (
    <button
      type="button"
      className={`item-button is-${currentState}`}
      aria-label={getSelectableItemAriaLabel(label, currentState, activeState)}
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
