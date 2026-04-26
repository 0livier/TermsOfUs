import assert from 'node:assert/strict'
import test from 'node:test'

const englishLabels = {
  markAs: 'Mark {item} as {state}',
  clearFrom: 'Clear {item} from {state}',
}

const frenchLabels = {
  markAs: 'Indiquer « {state} » pour « {item} »',
  clearFrom: 'Retirer « {state} » pour « {item} »',
}

test('item row buttons announce the item and target state', async () => {
  const { getItemRowButtonAriaLabel } = await import('./ItemRow.js')

  assert.equal(
    getItemRowButtonAriaLabel('Cuddling', 'Already present', false, englishLabels),
    'Mark Cuddling as Already present',
  )
})

test('item row buttons announce clearing the current state', async () => {
  const { getItemRowButtonAriaLabel } = await import('./ItemRow.js')

  assert.equal(
    getItemRowButtonAriaLabel('Cuddling', 'Already present', true, englishLabels),
    'Clear Cuddling from Already present',
  )
})

test('item row buttons use the localized template', async () => {
  const { getItemRowButtonAriaLabel } = await import('./ItemRow.js')

  assert.equal(
    getItemRowButtonAriaLabel('Être rassuré·e', 'Je voudrais ça', false, frenchLabels),
    'Indiquer « Je voudrais ça » pour « Être rassuré·e »',
  )
})
