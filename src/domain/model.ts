export type SchemaVersion = number
export type LocaleCode = string
export type CategoryId = string
export type ItemId = string
export type ItemCode = number

export interface ItemDefinition {
  id: ItemId
  code: ItemCode
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

const SPARSE_URL_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SPARSE_URL_CHUNK_LENGTH = 2
const SPARSE_URL_RADIX = SPARSE_URL_ALPHABET.length
const SPARSE_URL_MAX_CODE =
  (SPARSE_URL_RADIX ** SPARSE_URL_CHUNK_LENGTH - 1) >> 2

export function getCanonicalItemOrder(schema: SchemaDefinition): ItemId[] {
  return schema.categories.flatMap((category) =>
    category.items.map((item) => item.id),
  )
}

export function validateItemCodes(schema: SchemaDefinition): string[] {
  const errors: string[] = []
  const usedCodes = new Map<ItemCode, ItemId>()

  for (const item of getSchemaItems(schema)) {
    if (!Number.isInteger(item.code) || item.code <= 0) {
      errors.push(`${item.id} must have a positive integer code`)
      continue
    }

    if (item.code > SPARSE_URL_MAX_CODE) {
      errors.push(
        `${item.id} code ${item.code} exceeds the sparse URL codec limit`,
      )
      continue
    }

    const existingItemId = usedCodes.get(item.code)

    if (existingItemId) {
      errors.push(
        `${item.id} reuses code ${item.code} from ${existingItemId}`,
      )
    } else {
      usedCodes.set(item.code, item.id)
    }
  }

  return errors
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

export function encodeSparseSelection(
  schema: SchemaDefinition,
  selection: SelectionState,
): string {
  assertValidItemCodes(schema)

  return [...getSchemaItems(schema)]
    .sort((left, right) => left.code - right.code)
    .flatMap((item) => {
      const state = selection[item.id]

      if (!state) {
        return []
      }

      return [encodeSparseChunk((item.code << 2) + ITEM_STATE_TO_BITS[state])]
    })
    .join('')
}

export function decodeSparseSelection(
  schema: SchemaDefinition,
  payload: string,
): SelectionState | null {
  const errors = validateItemCodes(schema)

  if (
    errors.length > 0 ||
    payload.length % SPARSE_URL_CHUNK_LENGTH !== 0 ||
    !isBase62(payload)
  ) {
    return null
  }

  const itemIdsByCode = new Map(
    getSchemaItems(schema).map((item) => [item.code, item.id] as const),
  )
  const decodedCodes = new Set<ItemCode>()
  const selection: SelectionState = {}

  for (let index = 0; index < payload.length; index += SPARSE_URL_CHUNK_LENGTH) {
    const packed = decodeSparseChunk(
      payload.slice(index, index + SPARSE_URL_CHUNK_LENGTH),
    )
    const state = BITS_TO_ITEM_STATE[packed & 0b11]
    const code = packed >> 2
    const itemId = itemIdsByCode.get(code)

    if (!itemId || state === 'none' || decodedCodes.has(code)) {
      return null
    }

    decodedCodes.add(code)
    selection[itemId] = state
  }

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

function getSchemaItems(schema: SchemaDefinition): ItemDefinition[] {
  return schema.categories.flatMap((category) => category.items)
}

function assertValidItemCodes(schema: SchemaDefinition): void {
  const errors = validateItemCodes(schema)

  if (errors.length > 0) {
    throw new Error(errors.join('; '))
  }
}

function encodeSparseChunk(value: number): string {
  const high = Math.floor(value / SPARSE_URL_RADIX)
  const low = value % SPARSE_URL_RADIX

  return `${SPARSE_URL_ALPHABET[high]}${SPARSE_URL_ALPHABET[low]}`
}

function decodeSparseChunk(chunk: string): number {
  const high = SPARSE_URL_ALPHABET.indexOf(chunk[0] ?? '')
  const low = SPARSE_URL_ALPHABET.indexOf(chunk[1] ?? '')

  return high * SPARSE_URL_RADIX + low
}

function isBase62(payload: string): boolean {
  return /^[A-Za-z0-9]*$/.test(payload)
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
