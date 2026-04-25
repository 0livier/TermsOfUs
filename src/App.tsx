import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  defaultLocale,
  getLocaleFromBrowser,
  getLocalePreference,
  localizeSchema,
  saveLocalePreference,
  supportedLocales,
  type LocalizedCategory,
  type SupportedLocale,
} from './content/loader.js'
import {
  type ItemId,
  type ItemStateOption,
  type SelectedItemState,
  type SelectionState,
} from './domain/model.js'
import { getLocaleFromUrl, parseUrlState, replaceUrlState } from './routing/url-state.js'
import { ItemRow } from './components/ItemRow.js'
import { CATEGORY_COLOR } from './sunburst/sunburstColors.js'

function getInitialUrlState() {
  const schema = localizeSchema('en').schema

  if (typeof window === 'undefined') {
    return { locale: 'en' as SupportedLocale, selection: {}, isFallback: false }
  }

  const url      = new URL(window.location.href)
  const urlState = parseUrlState(url, schema)
  const locale   =
    getLocaleFromUrl(url) ??
    getLocalePreference() ??
    getLocaleFromBrowser() ??
    defaultLocale

  return { ...urlState, locale }
}

const initialUrlState = getInitialUrlState()

// ─── State legend ─────────────────────────────────────────────────────────────

interface StateLegendProps {
  stateOptions: Array<{ value: string; icon: string; longLabel: string }>
}

function StateLegend({ stateOptions }: StateLegendProps) {
  return (
    <div className="state-legend" aria-label="Legend">
      {stateOptions.map((opt) => (
        <div key={opt.value} className={`legend-item is-${opt.value}`}>
          <span className="legend-icon" aria-hidden="true">{opt.icon}</span>
          <span className="legend-label">{opt.longLabel}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Category card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: LocalizedCategory
  selection: SelectionState
  stateOptions: ItemStateOption[]
  isOpen: boolean
  onToggle: () => void
  onItemSelect: (itemId: ItemId, state: SelectedItemState) => void
  onItemClear: (itemId: ItemId) => void
  color: string
}

function CategoryCard({
  category,
  selection,
  stateOptions,
  isOpen,
  onToggle,
  onItemSelect,
  onItemClear,
  color,
}: CategoryCardProps) {
  const answeredCount = category.items.filter((item) => selection[item.id]).length

  return (
    <div className={`category-card${isOpen ? ' category-card--open' : ''}`}>
      <button
        type="button"
        className="category-card-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span
          className="category-card-dot"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="category-card-title">{category.label}</span>
        <span className="category-card-meta">
          {answeredCount > 0 && (
            <span className="category-card-count" aria-label={`${answeredCount} answered`}>
              {answeredCount}
            </span>
          )}
          <span className="category-card-chevron" aria-hidden="true">
            {isOpen ? '▲' : '▼'}
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="category-card-items">
          {category.items.map((item) => (
            <ItemRow
              key={item.id}
              id={item.id}
              label={item.label}
              currentState={selection[item.id] ?? 'none'}
              stateOptions={stateOptions}
              onSelect={onItemSelect}
              onClear={onItemClear}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [locale, setLocale]         = useState<SupportedLocale>(initialUrlState.locale)
  const [selection, setSelection]   = useState<SelectionState>(initialUrlState.selection)
  const [copyStatus, setCopyStatus] = useState('')
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)

  const content = useMemo(() => localizeSchema(locale), [locale])

  const categoriesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    replaceUrlState(new URL(window.location.href), {
      locale,
      schema: content.schema,
      selection,
    })
  }, [content.schema, locale, selection])

  function handleItemSelect(itemId: ItemId, state: SelectedItemState) {
    setSelection((prev) => ({ ...prev, [itemId]: state }))
    setCopyStatus('')
  }

  function handleItemClear(itemId: ItemId) {
    setSelection((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
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
      setCopyStatus(content.uiActions.linkCopied)
    } catch {
      setCopyStatus(content.uiActions.copyUnavailable)
    }
  }

  return (
    <div className="app-shell">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="app-header">
        <span className="app-name">Terms of Us</span>
        <div className="app-header-controls">
          <label className="language-select">
            <span className="sr-only">{content.languageLabel}</span>
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value as SupportedLocale
                setLocale(newLocale)
                saveLocalePreference(newLocale)
                setCopyStatus('')
              }}
              aria-label={content.languageLabel}
            >
              {supportedLocales.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </label>
          <button type="button" className="header-action-btn" onClick={resetSelection}>
            {content.uiActions.reset}
          </button>
          <button type="button" className="header-action-btn" onClick={copyLink}>
            {content.uiActions.copyLink}
          </button>
          {copyStatus ? <span role="status" className="copy-status">{copyStatus}</span> : null}
        </div>
      </header>

      {/* ── Fallback notice ────────────────────────────────── */}
      {initialUrlState.isFallback ? (
        <p className="notice" role="status">{content.fallbackMessage}</p>
      ) : null}

      {/* ── Intro card ─────────────────────────────────────── */}
      <section className="intro-card" aria-labelledby="intro-title">
        <h1 id="intro-title">{content.intro.title}</h1>
        <p className="intro-body">{content.intro.body}</p>
        <p className="intro-privacy">{content.intro.privacy}</p>

        <StateLegend stateOptions={content.stateOptions} />

        <div className="intro-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setOpenCategoryId(content.categories[0]?.id ?? null)
              categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            {content.intro.startCategory}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {content.intro.browseCategories}
          </button>
        </div>
      </section>

      {/* ── Category cards ─────────────────────────────────── */}
      <section ref={categoriesRef} className="categories-section" aria-label="Categories">
        <div className="category-cards-grid">
          {content.categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              selection={selection}
              stateOptions={content.stateOptions}
              isOpen={openCategoryId === category.id}
              onToggle={() =>
                setOpenCategoryId((prev) => prev === category.id ? null : category.id)
              }
              onItemSelect={handleItemSelect}
              onItemClear={handleItemClear}
              color={CATEGORY_COLOR[category.id] ?? '#888'}
            />
          ))}
        </div>
      </section>

    </div>
  )
}

export default App
