export type SchemaVersion = number
export type LocaleCode = string
export type CategoryId = string
export type ItemId = string

export interface ItemDefinition {
  id: ItemId
}

export interface CategoryDefinition {
  id: CategoryId
  items: ItemDefinition[]
}

export interface SchemaDefinition {
  version: SchemaVersion
  categories: CategoryDefinition[]
}

export interface LocaleCategoryContent {
  label: string
}

export interface LocaleItemContent {
  label: string
}

export interface LocaleContent {
  locale: LocaleCode
  categories: Record<CategoryId, LocaleCategoryContent>
  items: Record<ItemId, LocaleItemContent>
}

export type ItemState = 'none' | 'want' | 'avoid' | 'have'
export type SelectedItemState = Exclude<ItemState, 'none'>
export type SelectionState = Partial<Record<ItemId, SelectedItemState>>

export interface SelectionSummary {
  want: number
  avoid: number
  have: number
}

const ITEM_STATE_TO_BITS: Record<ItemState, number> = {
  none: 0b00,
  want: 0b01,
  avoid: 0b10,
  have: 0b11,
}

const BITS_TO_ITEM_STATE: Record<number, ItemState> = {
  0b00: 'none',
  0b01: 'want',
  0b10: 'avoid',
  0b11: 'have',
}

export function getCanonicalItemOrder(schema: SchemaDefinition): ItemId[] {
  return schema.categories.flatMap((category) =>
    category.items.map((item) => item.id),
  )
}

export function encodeSelection(
  itemOrder: readonly ItemId[],
  selection: SelectionState,
): string {
  const byteLength = getEncodedByteLength(itemOrder.length)
  const bytes = new Uint8Array(byteLength)

  itemOrder.forEach((itemId, index) => {
    const state = selection[itemId] ?? 'none'
    const bitOffset = index * 2
    const byteIndex = Math.floor(bitOffset / 8)
    const shift = 6 - (bitOffset % 8)

    bytes[byteIndex] |= ITEM_STATE_TO_BITS[state] << shift
  })

  return bytesToBase64Url(bytes)
}

export function decodeSelection(
  itemOrder: readonly ItemId[],
  payload: string,
): SelectionState | null {
  if (!isBase64Url(payload)) {
    return null
  }

  const expectedByteLength = getEncodedByteLength(itemOrder.length)
  const bytes = base64UrlToBytes(payload)

  if (bytes === null || bytes.length !== expectedByteLength) {
    return null
  }

  const selection: SelectionState = {}

  itemOrder.forEach((itemId, index) => {
    const bitOffset = index * 2
    const byteIndex = Math.floor(bitOffset / 8)
    const shift = 6 - (bitOffset % 8)
    const bits = (bytes[byteIndex] >> shift) & 0b11
    const state = BITS_TO_ITEM_STATE[bits]

    if (state !== 'none') {
      selection[itemId] = state
    }
  })

  return selection
}

export function summarizeSelection(selection: SelectionState): SelectionSummary {
  const summary: SelectionSummary = {
    want: 0,
    avoid: 0,
    have: 0,
  }

  for (const state of Object.values(selection)) {
    if (state) {
      summary[state] += 1
    }
  }

  return summary
}

function getEncodedByteLength(itemCount: number): number {
  return Math.ceil((itemCount * 2) / 8)
}

function isBase64Url(payload: string): boolean {
  return /^[A-Za-z0-9_-]*$/.test(payload)
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlToBytes(payload: string): Uint8Array | null {
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  )

  try {
    return fromBase64(padded)
  } catch {
    return null
  }
}

function toBase64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    let binary = ''

    bytes.forEach((value) => {
      binary += String.fromCharCode(value)
    })

    return btoa(binary)
  }

  const buffer = (globalThis as {
    Buffer?: {
      from(data: Uint8Array): { toString(encoding: 'base64'): string }
    }
  }).Buffer

  if (!buffer) {
    throw new Error('No base64 encoder available')
  }

  return buffer.from(bytes).toString('base64')
}

function fromBase64(value: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(value)

    return Uint8Array.from(binary, (char) => char.charCodeAt(0))
  }

  const buffer = (globalThis as {
    Buffer?: {
      from(data: string, encoding: 'base64'): Uint8Array
    }
  }).Buffer

  if (!buffer) {
    throw new Error('No base64 decoder available')
  }

  return Uint8Array.from(buffer.from(value, 'base64'))
}
