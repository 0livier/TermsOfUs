import type { ItemState } from '../domain/model.js'
import { itemStateOptions } from './item-states.js'

interface PaletteProps {
  activeState: ItemState
  onChange: (state: ItemState) => void
}

export function Palette({ activeState, onChange }: PaletteProps) {
  return (
    <div className="palette" aria-label="Active state">
      {itemStateOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`palette-button is-${option.value}`}
          aria-label={`Set active state to ${option.label}`}
          aria-pressed={activeState === option.value}
          onClick={() => onChange(option.value)}
        >
          <span className="state-mark" aria-hidden="true" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
