import type { ItemState, ItemStateOption } from '../domain/model.js'

export type { ItemStateOption }

export const itemStateOptions: ItemStateOption[] = [
  { value: 'none', label: 'Not selected', shortLabel: 'None' },
  { value: 'want', label: 'I want this', shortLabel: 'Want' },
  { value: 'have', label: 'We already have this', shortLabel: 'Have' },
  { value: 'avoid', label: 'I do not want this', shortLabel: 'Avoid' },
]

export function getItemStateOption(state: ItemState): ItemStateOption {
  return (
    itemStateOptions.find((option) => option.value === state) ??
    itemStateOptions[0]
  )
}
