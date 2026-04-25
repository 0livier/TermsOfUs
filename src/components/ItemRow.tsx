import { useRef, useState } from 'react'
import type { ItemId, ItemState, ItemStateOption, SelectedItemState } from '../domain/model.js'

interface ItemRowProps {
  id: ItemId
  label: string
  currentState: ItemState
  stateOptions: ItemStateOption[]
  onSelect: (itemId: ItemId, state: SelectedItemState) => void
  onClear: (itemId: ItemId) => void
}

export function ItemRow({
  id,
  label,
  currentState,
  stateOptions,
  onSelect,
  onClear,
}: ItemRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const isAnswered = currentState !== 'none'
  const showSelector = !isAnswered || editing

  const currentOption = stateOptions.find((o) => o.value === currentState)

  function handleStateSelect(state: SelectedItemState) {
    onSelect(id, state)
    setEditing(false)
    requestAnimationFrame(() => {
      const next = rowRef.current?.nextElementSibling
      if (next) {
        next.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  function handleBadgeClick() {
    setEditing((prev) => !prev)
  }

  function handleClear() {
    onClear(id)
    setEditing(false)
  }

  return (
    <div ref={rowRef} className={`item-row${isAnswered ? ' item-row--answered' : ''}`}>
      <div className="item-row-content">
        <span className="item-row-label">{label}</span>

        {isAnswered && !editing && currentOption ? (
          <button
            type="button"
            className={`item-badge is-${currentState}`}
            onClick={handleBadgeClick}
            aria-label={`${currentOption.longLabel}. Tap to change.`}
            aria-pressed={false}
          >
            <span aria-hidden="true">{currentOption.icon}</span>
            <span>{currentOption.label}</span>
          </button>
        ) : null}
      </div>

      {showSelector && (
        <div className="item-state-selector" role="group" aria-label={`Mark ${label}`}>
          {stateOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`state-btn is-${opt.value}${currentState === opt.value ? ' is-selected' : ''}`}
              aria-label={opt.longLabel}
              aria-pressed={currentState === opt.value}
              onClick={() => handleStateSelect(opt.value as SelectedItemState)}
            >
              <span aria-hidden="true">{opt.icon}</span>
              <span className="state-btn-label">{opt.label}</span>
            </button>
          ))}
          {isAnswered && (
            <button
              type="button"
              className="state-btn-clear"
              onClick={handleClear}
              aria-label="Clear answer"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}
