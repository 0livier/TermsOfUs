import type { ItemState, ItemStateOption, SelectedItemState } from '../domain/model.js'

export type { ItemStateOption }

export const SELECTED_STATES: SelectedItemState[] = ['present', 'important', 'discuss', 'no']

export const STATE_ICONS: Record<SelectedItemState, string> = {
  important: '★',
  present:   '✓',
  discuss:   '◆',
  no:        '✕',
}

export const itemStateOptions: ItemStateOption[] = [
  { value: 'present',   label: 'Present',    longLabel: 'Already present',   shortLabel: 'Present',   icon: '✓' },
  { value: 'important', label: 'Important',  longLabel: "I'd like that",  shortLabel: 'Important', icon: '★' },
  { value: 'discuss',   label: 'Discuss',    longLabel: 'To discuss',        shortLabel: 'Discuss',   icon: '◆' },
  { value: 'no',        label: 'No',         longLabel: 'Not for me',        shortLabel: 'No',        icon: '✕' },
]

export function getItemStateOption(state: ItemState): ItemStateOption | undefined {
  return itemStateOptions.find((option) => option.value === state)
}
