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
