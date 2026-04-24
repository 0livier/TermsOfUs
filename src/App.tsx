import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  defaultLocale,
  getLocaleFromBrowser,
  getLocalePreference,
  localizeSchema,
  saveLocalePreference,
  supportedLocales,
  type SupportedLocale,
} from './content/loader.js'
import {
  type ItemId,
  type ItemState,
  type SelectionState,
} from './domain/model.js'
import { getLocaleFromUrl, parseUrlState, replaceUrlState } from './routing/url-state.js'
import { applyActiveState } from './app/selection.js'
import { Palette } from './components/Palette.js'
import { SelectableItem } from './components/SelectableItem.js'

function getInitialUrlState() {
  const schema = localizeSchema('en').schema

  if (typeof window === 'undefined') {
    return {
      locale: 'en' as SupportedLocale,
      selection: {},
      isFallback: false,
    }
  }

  const url = new URL(window.location.href)
  const urlState = parseUrlState(url, schema)
  const locale =
    getLocaleFromUrl(url) ??
    getLocalePreference() ??
    getLocaleFromBrowser() ??
    defaultLocale

  return { ...urlState, locale }
}

const initialUrlState = getInitialUrlState()

function App() {
  const [locale, setLocale] = useState<SupportedLocale>(initialUrlState.locale)
  const [selection, setSelection] = useState<SelectionState>(
    initialUrlState.selection,
  )
  const [activeState, setActiveState] = useState<ItemState>('want')
  const [copyStatus, setCopyStatus] = useState('')
  const content = useMemo(() => localizeSchema(locale), [locale])

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
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.cssText = 'position:fixed;opacity:0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
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
              const newLocale = event.target.value as SupportedLocale
              setLocale(newLocale)
              saveLocalePreference(newLocale)
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
        <Palette activeState={activeState} stateOptions={content.stateOptions} onChange={setActiveState} />

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
                const currentState = selection[item.id] ?? 'none'

                return (
                  <SelectableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    currentState={currentState}
                    activeState={activeState}
                    stateOptions={content.stateOptions}
                    onSelect={updateItem}
                  />
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
