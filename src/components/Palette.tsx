import type { ItemState, ItemStateOption } from '../domain/model.js'

interface PaletteProps {
  activeState: ItemState
  stateOptions: ItemStateOption[]
  onChange: (state: ItemState) => void
}

export function Palette({ activeState, stateOptions, onChange }: PaletteProps) {
  return (
    <div className="palette" aria-label="Active state">
      {stateOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`palette-button is-${option.value}`}
          aria-label={`Set active state to ${option.longLabel}`}
          aria-pressed={activeState === option.value}
          onClick={() => onChange(option.value)}
        >
          <span aria-hidden="true">{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
