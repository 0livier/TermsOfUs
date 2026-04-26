import { useRef } from 'react'
import type { ItemId, ItemState, ItemStateOption, SelectedItemState } from '../domain/model.js'
import type { UiItemRow } from '../content/loader.js'
import { StateIcon } from './StateIcon.js'

interface ItemRowProps {
  id: ItemId
  label: string
  currentState: ItemState
  stateOptions: ItemStateOption[]
  labels: UiItemRow
  onSelect: (itemId: ItemId, state: SelectedItemState) => void
  onClear: (itemId: ItemId) => void
}

function formatItemRowLabel(template: string, label: string, optionLabel: string): string {
  return template
    .replace('{item}', label)
    .replace('{state}', optionLabel)
}

export function getItemRowButtonAriaLabel(
  label: string,
  optionLabel: string,
  isActive: boolean,
  labels: UiItemRow,
): string {
  if (isActive) {
    return formatItemRowLabel(labels.clearFrom, label, optionLabel)
  }

  return formatItemRowLabel(labels.markAs, label, optionLabel)
}

export function ItemRow({
  id,
  label,
  currentState,
  stateOptions,
  labels,
  onSelect,
  onClear,
}: ItemRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  function handleStateSelect(state: SelectedItemState) {
    if (state === currentState) {
      onClear(id)
      return
    }
    onSelect(id, state)
    requestAnimationFrame(() => {
      const next = rowRef.current?.nextElementSibling
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <div ref={rowRef} className="item-row">
      <span className="item-row-label">{label}</span>
      <div className="item-row-answer" role="group" aria-label={label}>
        {stateOptions.map((opt) => {
          const isActive = currentState === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              className={`sel-btn${isActive ? ` active-${opt.value}` : ''}`}
              aria-label={getItemRowButtonAriaLabel(label, opt.longLabel, isActive, labels)}
              aria-pressed={isActive}
              onClick={() => handleStateSelect(opt.value as SelectedItemState)}
            >
              <StateIcon state={opt.value} size={18} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
