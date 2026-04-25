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
  ui?: LocaleUiContent
}

export type ItemState = 'none' | 'important' | 'present' | 'discuss' | 'no'
export type SelectedItemState = Exclude<ItemState, 'none'>
export type SelectionState = Partial<Record<ItemId, SelectedItemState>>

export interface ItemStateOption {
  value: ItemState
  label: string
  longLabel: string
  shortLabel: string
  icon: string
}

export interface LocaleUiContent {
  headline?: string
  subheadline?: string
  states?: Partial<Record<SelectedItemState, {
    label?: string
    longLabel?: string
    shortLabel?: string
  }>>
  actions?: {
    reset?: string
    copyLink?: string
    linkCopied?: string
    copyUnavailable?: string
  }
  wheel?: {
    description?: string
    emptyHint?: string
  }
  menu?: {
    open?: string
    copyLink?: string
    clearAll?: string
  }
  confirm?: {
    clearTitle?: string
    clearBody?: string
    clearCancel?: string
    clearConfirm?: string
  }
  intro?: {
    title?: string
    body?: string
    privacy?: string
    startCategory?: string
    browseCategories?: string
    seeMap?: string
  }
  mapPreview?: {
    title?: string
    stopAnytime?: string
  }
  allItems?: {
    title?: string
    subtitle?: string
    searchPlaceholder?: string
    allCategories?: string
    showUnanswered?: string
  }
  header?: {
    languageLabel?: string
  }
  fallback?: {
    linkRestoreFailed?: string
  }
}

export interface SelectionSummary {
  important: number
  present: number
  discuss: number
  no: number
}

const SPARSE_URL_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SPARSE_URL_CHUNK_LENGTH = 2
const SPARSE_URL_RADIX = SPARSE_URL_ALPHABET.length

// V2: 3-bit state encoding. Prefix "s2" marks new-format payloads.
const V2_STATE_BITS = 3
const V2_PREFIX = 's2'
const SPARSE_URL_MAX_CODE =
  (SPARSE_URL_RADIX ** SPARSE_URL_CHUNK_LENGTH - 1) >> V2_STATE_BITS

const V2_STATE_TO_BITS: Record<ItemState, number> = {
  none:      0,
  important: 1,
  present:   2,
  discuss:   3,
  no:        4,
}

const V2_BITS_TO_STATE: Partial<Record<number, ItemState>> = {
  0: 'none',
  1: 'important',
  2: 'present',
  3: 'discuss',
  4: 'no',
}

// V1 legacy migration: old bit values (2-bit, no prefix)
// want=1 → important, avoid=2 → no, have=3 → present
const V1_BITS_TO_STATE: Partial<Record<number, SelectedItemState>> = {
  1: 'important',
  2: 'no',
  3: 'present',
}

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

export function encodeSparseSelection(
  schema: SchemaDefinition,
  selection: SelectionState,
): string {
  assertValidItemCodes(schema)

  const payload = [...getSchemaItems(schema)]
    .sort((left, right) => left.code - right.code)
    .flatMap((item) => {
      const state = selection[item.id]
      if (!state) return []
      return [encodeSparseChunk((item.code << V2_STATE_BITS) | V2_STATE_TO_BITS[state])]
    })
    .join('')

  return payload ? V2_PREFIX + payload : ''
}

export function decodeSparseSelection(
  schema: SchemaDefinition,
  payload: string,
): SelectionState | null {
  if (payload.startsWith(V2_PREFIX)) {
    return decodeV2SparsePayload(schema, payload.slice(V2_PREFIX.length))
  }
  return decodeV1SparsePayload(schema, payload)
}

function decodeV2SparsePayload(
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
    const stateBits = packed & ((1 << V2_STATE_BITS) - 1)
    const code = packed >> V2_STATE_BITS
    const state = V2_BITS_TO_STATE[stateBits]
    const itemId = itemIdsByCode.get(code)

    if (!itemId || !state || state === 'none' || decodedCodes.has(code)) {
      return null
    }

    decodedCodes.add(code)
    selection[itemId] = state as SelectedItemState
  }

  return selection
}

function decodeV1SparsePayload(
  schema: SchemaDefinition,
  payload: string,
): SelectionState | null {
  if (
    payload.length % SPARSE_URL_CHUNK_LENGTH !== 0 ||
    !isBase62(payload)
  ) {
    return null
  }

  const errors = validateItemCodes(schema)
  if (errors.length > 0) return null

  const itemIdsByCode = new Map(
    getSchemaItems(schema).map((item) => [item.code, item.id] as const),
  )
  const decodedCodes = new Set<ItemCode>()
  const selection: SelectionState = {}

  for (let index = 0; index < payload.length; index += SPARSE_URL_CHUNK_LENGTH) {
    const packed = decodeSparseChunk(
      payload.slice(index, index + SPARSE_URL_CHUNK_LENGTH),
    )
    const stateBits = packed & 0b11
    const code = packed >> 2
    const state = V1_BITS_TO_STATE[stateBits]
    const itemId = itemIdsByCode.get(code)

    if (!itemId || !state || decodedCodes.has(code)) {
      return null
    }

    decodedCodes.add(code)
    selection[itemId] = state
  }

  return selection
}

export function summarizeSelection(selection: SelectionState): SelectionSummary {
  const summary: SelectionSummary = {
    important: 0,
    present:   0,
    discuss:   0,
    no:        0,
  }

  for (const state of Object.values(selection)) {
    if (state) {
      summary[state] += 1
    }
  }

  return summary
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
