import { useRef } from 'react'
import type { ItemId, ItemState, ItemStateOption, SelectedItemState } from '../domain/model.js'
import { StateIcon } from './StateIcon.js'

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
              aria-label={opt.longLabel}
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
