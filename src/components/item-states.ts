import type { ItemState, ItemStateOption } from '../domain/model.js'

export type { ItemStateOption }

export const itemStateOptions: ItemStateOption[] = [
  { value: 'none',  label: 'Not yet answered',  shortLabel: '–' },
  { value: 'want',  label: 'This matters to me', shortLabel: 'Matters' },
  { value: 'have',  label: 'Already present',    shortLabel: 'Present' },
  { value: 'avoid', label: 'Not for me',         shortLabel: 'Limit' },
]

export function getItemStateOption(state: ItemState): ItemStateOption {
  return (
    itemStateOptions.find((option) => option.value === state) ??
    itemStateOptions[0]
  )
}
