import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  localizeSchema,
  supportedLocales,
  type SupportedLocale,
} from './content/loader.js'
import {
  summarizeSelection,
  type ItemId,
  type SelectedItemState,
  type SelectionState,
} from './domain/model.js'
import { parseUrlState, replaceUrlState } from './routing/url-state.js'
import { applyActiveState } from './app/selection.js'

const stateOptions: Array<{
  value: SelectedItemState
  label: string
  shortLabel: string
}> = [
  { value: 'want', label: 'I want this', shortLabel: 'Want' },
  { value: 'have', label: 'We already have this', shortLabel: 'Have' },
  { value: 'avoid', label: 'I do not want this', shortLabel: 'Avoid' },
]

function getInitialUrlState() {
  const schema = localizeSchema('en').schema

  if (typeof window === 'undefined') {
    return {
      locale: 'en' as SupportedLocale,
      selection: {},
      isFallback: false,
    }
  }

  return parseUrlState(new URL(window.location.href), schema)
}

const initialUrlState = getInitialUrlState()

function App() {
  const [locale, setLocale] = useState<SupportedLocale>(initialUrlState.locale)
  const [selection, setSelection] = useState<SelectionState>(
    initialUrlState.selection,
  )
  const [activeState, setActiveState] = useState<SelectedItemState>('want')
  const [copyStatus, setCopyStatus] = useState('')
  const content = useMemo(() => localizeSchema(locale), [locale])
  const summary = useMemo(() => summarizeSelection(selection), [selection])

  useEffect(() => {
    replaceUrlState(new URL(window.location.href), {
      locale,
      schema: content.schema,
      selection,
    })
  }, [content.schema, locale, selection])

  function updateItem(itemId: ItemId) {
    setSelection((currentSelection) =>
      applyActiveState(currentSelection, itemId, activeState),
    )
    setCopyStatus('')
  }

  function resetSelection() {
    setSelection({})
    setCopyStatus('')
  }

  async function copyLink() {
    const path = replaceUrlState(new URL(window.location.href), {
      locale,
      schema: content.schema,
      selection,
    })
    const url = `${window.location.origin}${path}`

    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('Link copied')
    } catch {
      setCopyStatus('Copy unavailable')
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">TermsOfUs</p>
          <h1>Relationship expectations</h1>
        </div>

        <label className="language-select">
          <span>Language</span>
          <select
            value={locale}
            onChange={(event) => {
              setLocale(event.target.value as SupportedLocale)
              setCopyStatus('')
            }}
          >
            {supportedLocales.map((supportedLocale) => (
              <option key={supportedLocale} value={supportedLocale}>
                {supportedLocale.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="toolbar" aria-label="Selection tools">
        <div className="palette" aria-label="Active state">
          {stateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`palette-button is-${option.value}`}
              aria-pressed={activeState === option.value}
              onClick={() => setActiveState(option.value)}
            >
              <span className="state-mark" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="summary" aria-label="Selection summary">
          <span>
            <strong>{summary.want}</strong> want
          </span>
          <span>
            <strong>{summary.have}</strong> have
          </span>
          <span>
            <strong>{summary.avoid}</strong> avoid
          </span>
        </div>

        <div className="actions">
          <button type="button" onClick={resetSelection}>
            Reset
          </button>
          <button type="button" onClick={copyLink}>
            Copy link
          </button>
          {copyStatus ? <span role="status">{copyStatus}</span> : null}
        </div>
      </section>

      {initialUrlState.isFallback ? (
        <p className="notice" role="status">
          The shared link could not be restored, so the selection was reset.
        </p>
      ) : null}

      <section className="category-grid" aria-label="Relationship items">
        {content.categories.map((category) => (
          <section key={category.id} className="category-panel">
            <h2>{category.label}</h2>
            <div className="item-list">
              {category.items.map((item) => {
                const currentState = selection[item.id]

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`item-button ${
                      currentState ? `is-${currentState}` : ''
                    }`}
                    onClick={() => updateItem(item.id)}
                  >
                    <span>{item.label}</span>
                    <span className="item-state">
                      {currentState
                        ? stateOptions.find(
                            (option) => option.value === currentState,
                          )?.shortLabel
                        : 'None'}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}

export default App
