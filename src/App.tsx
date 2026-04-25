import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
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
import {
  getLocaleFromUrl,
  parseUrlState,
  pushUrlState,
  replaceUrlState,
  type AppView,
} from './routing/url-state.js'
import { ItemRow } from './components/ItemRow.js'
import { ReviewView } from './components/ReviewView.js'
import { StateIcon } from './components/StateIcon.js'

function getInitialUrlState() {
  const schema = localizeSchema('en').schema

  if (typeof window === 'undefined') {
    return {
      locale: 'en' as SupportedLocale,
      selection: {},
      view: 'edit' as AppView,
      isFallback: false,
    }
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
  stateOptions: Array<{ value: string; longLabel: string }>
}

function StateLegend({ stateOptions }: StateLegendProps) {
  return (
    <div className="state-legend" aria-label="Legend">
      {stateOptions.map((opt) => (
        <div key={opt.value} className={`legend-item is-${opt.value}`}>
          <span className="legend-icon">
            <StateIcon state={opt.value} size={14} />
          </span>
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
  onToggle: (cardElement: HTMLDivElement) => void
  onItemSelect: (itemId: ItemId, state: SelectedItemState) => void
  onItemClear: (itemId: ItemId) => void
}

function CategoryCard({
  category,
  selection,
  stateOptions,
  isOpen,
  onToggle,
  onItemSelect,
  onItemClear,
}: CategoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const activeStates = stateOptions.flatMap((option) =>
    category.items.some((item) => selection[item.id] === option.value)
      ? [option.value as SelectedItemState]
      : [],
  )

  return (
    <div ref={cardRef} className={`category-card${isOpen ? ' category-card--open' : ''}`}>
      <button
        type="button"
        className="category-card-header"
        onClick={() => {
          if (cardRef.current) {
            onToggle(cardRef.current)
          }
        }}
        aria-expanded={isOpen}
      >
        <span className="category-card-title">{category.label}</span>
        <span className="category-card-status">
          {activeStates.length > 0 && (
            <span className="category-card-indicators" aria-hidden="true">
              {activeStates.map((state) => (
                <span key={state} className={`category-card-indicator is-${state}`}>
                  <StateIcon state={state} size={11} />
                </span>
              ))}
            </span>
          )}
          <svg
            className="category-card-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && category.items.map((item) => (
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
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string
  body: string
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDialog({ title, body, cancelLabel, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-card">
        <h2 id="dialog-title" className="dialog-title">{title}</h2>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Share dialog ────────────────────────────────────────────────────────────

interface ShareDialogProps {
  title: string
  body: string
  copyLabel: string
  onCancel: () => void
  onCopy: () => void
  copyButtonRef: RefObject<HTMLButtonElement | null>
}

function ShareDialog({
  title,
  body,
  copyLabel,
  onCancel,
  onCopy,
  copyButtonRef,
}: ShareDialogProps) {
  return (
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <div className="dialog-card share-dialog-card">
        <h2 id="share-dialog-title" className="dialog-title">{title}</h2>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">
          <button
            ref={copyButtonRef}
            type="button"
            className="btn-primary"
            onClick={onCopy}
          >
            {copyLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ListChecksIcon() {
  return (
    <svg
      className="header-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  )
}

// ─── Learn more ──────────────────────────────────────────────────────────────

interface LearnMorePageProps {
  content: ReturnType<typeof localizeSchema>
  onStart: () => void
  onBack: () => void
}

function LearnMorePage({ content, onStart, onBack }: LearnMorePageProps) {
  return (
    <main className="learn-more-page" aria-labelledby="learn-more-title">
      <section className="learn-more-hero">
        <h1 id="learn-more-title">{content.learnMore.title}</h1>
        <p>{content.learnMore.intro}</p>
      </section>

      <div className="learn-more-sections">
        {content.learnMore.sections.map((section) => (
          <section key={section.title} className="learn-more-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>

      <div className="learn-more-actions">
        <button type="button" className="btn-primary" onClick={onStart}>
          {content.learnMore.cta}
        </button>
        <button type="button" className="btn-secondary" onClick={onBack}>
          {content.learnMore.back}
        </button>
      </div>
    </main>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [locale, setLocale]           = useState<SupportedLocale>(initialUrlState.locale)
  const [selection, setSelection]     = useState<SelectionState>(initialUrlState.selection)
  const [menuOpen, setMenuOpen]             = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [toast, setToast]                   = useState('')
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [currentView, setCurrentView]       = useState<AppView>(initialUrlState.view)

  const content = useMemo(() => localizeSchema(locale), [locale])

  const categoriesRef = useRef<HTMLElement>(null)
  const menuRef       = useRef<HTMLDivElement>(null)
  const headerRef     = useRef<HTMLElement>(null)
  const shareCopyButtonRef = useRef<HTMLButtonElement>(null)
  const toastTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedStatePageHistory = useRef(false)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!showShareDialog) return

    shareCopyButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeShareDialog()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showShareDialog])

  useEffect(() => {
    if (
      initializedStatePageHistory.current ||
      initialUrlState.view === 'edit' ||
      typeof window === 'undefined'
    ) {
      return
    }

    initializedStatePageHistory.current = true

    const currentUrl = new URL(window.location.href)
    const currentState = {
      locale,
      schema: content.schema,
      selection,
      view: initialUrlState.view,
    }

    replaceUrlState(currentUrl, { ...currentState, view: 'edit' })
    pushUrlState(new URL(window.location.href), currentState)
  }, [content.schema, locale, selection])

  useEffect(() => {
    function handlePopState() {
      const nextUrlState = parseUrlState(new URL(window.location.href), content.schema)

      setLocale(nextUrlState.locale)
      setSelection(nextUrlState.selection)
      setCurrentView(nextUrlState.view)
      setMenuOpen(false)
      setShowShareDialog(false)
      setShowConfirm(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [content.schema])

  function showToast(message: string) {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2500)
  }

  function updateUrl(
    nextSelection: SelectionState,
    nextLocale = locale,
    nextView = currentView,
  ) {
    replaceUrlState(new URL(window.location.href), {
      locale: nextLocale,
      schema: content.schema,
      selection: nextSelection,
      view: nextView,
    })
  }

  function pushUrl(
    nextSelection: SelectionState,
    nextLocale = locale,
    nextView = currentView,
  ) {
    pushUrlState(new URL(window.location.href), {
      locale: nextLocale,
      schema: content.schema,
      selection: nextSelection,
      view: nextView,
    })
  }

  function handleItemSelect(itemId: ItemId, state: SelectedItemState) {
    const next = { ...selection, [itemId]: state }
    setSelection(next)
    updateUrl(next)
  }

  function handleItemClear(itemId: ItemId) {
    const next = { ...selection }
    delete next[itemId]
    setSelection(next)
    updateUrl(next)
  }

  function handleClearConfirmed() {
    setSelection({})
    updateUrl({})
    setShowConfirm(false)
  }

  function closeShareDialog() {
    setShowShareDialog(false)
  }

  function openShareDialog() {
    setMenuOpen(false)
    setShowShareDialog(true)
  }

  function handleStart() {
    setCurrentView('edit')
    setOpenCategoryId(content.categories[0]?.id ?? null)
    updateUrl(selection, locale, 'edit')
    requestAnimationFrame(() => {
      categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function handleReviewOpen() {
    setMenuOpen(false)
    setCurrentView('review')
    pushUrl(selection, locale, 'review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBackToEdit() {
    setCurrentView('edit')
    updateUrl(selection, locale, 'edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLearnMoreOpen() {
    setCurrentView('learn-more')
    pushUrl(selection, locale, 'learn-more')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleHome() {
    setCurrentView('edit')
    setMenuOpen(false)
    setShowShareDialog(false)
    setShowConfirm(false)
    updateUrl(selection, locale, 'edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function scrollCardBelowHeader(cardElement: HTMLElement) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0
        const cardTop = cardElement.getBoundingClientRect().top + window.scrollY

        window.scrollTo({
          top: Math.max(0, cardTop - headerHeight - 10),
          behavior: 'smooth',
        })
      })
    })
  }

  function handleCategoryToggle(categoryId: string, cardElement: HTMLDivElement) {
    setOpenCategoryId((prev) => prev === categoryId ? null : categoryId)
    scrollCardBelowHeader(cardElement)
  }

  function getShareUrl() {
    const path = replaceUrlState(new URL(window.location.href), {
      locale,
      schema: content.schema,
      selection,
      view: currentView,
    })

    return `${window.location.origin}${path}`
  }

  async function handleCopyLink() {
    const url = getShareUrl()

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
      showToast(content.uiActions.linkCopied)
    } catch {
      showToast(content.uiActions.copyUnavailable)
    }
  }

  async function handleShareCopy() {
    setShowShareDialog(false)
    await handleCopyLink()
  }

  return (
    <div className="app-shell">

      {/* ── Header ─────────────────────────────────────────── */}
      <header ref={headerRef} className="app-header">
        <button type="button" className="app-name" onClick={handleHome}>
          Terms of Us
        </button>
        <div className="app-header-controls">
          <button
            type="button"
            className="header-action-btn review-btn"
            onClick={handleReviewOpen}
            aria-label={content.review.accessibleLabel}
          >
            <ListChecksIcon />
            <span>{content.review.label}</span>
          </button>

          <div className="menu-container" ref={menuRef}>
            <button
              type="button"
              className="header-action-btn menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label={content.menu.open}
            >
              ☰
            </button>
            {menuOpen && (
              <div className="menu-dropdown" role="menu">
                <label className="language-select menu-language-select">
                  <span className="sr-only">{content.languageLabel}</span>
                  <select
                    value={locale}
                    onChange={(e) => {
                      const newLocale = e.target.value as SupportedLocale
                      setLocale(newLocale)
                      saveLocalePreference(newLocale)
                      updateUrl(selection, newLocale, currentView)
                      setMenuOpen(false)
                    }}
                    aria-label={content.languageLabel}
                  >
                    {supportedLocales.map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="menu-item menu-item--danger"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); setShowConfirm(true) }}
                >
                  {content.menu.clearAll}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}

      {/* ── Confirm dialog ─────────────────────────────────── */}
      {showConfirm && (
        <ConfirmDialog
          title={content.confirm.clearTitle}
          body={content.confirm.clearBody}
          cancelLabel={content.confirm.clearCancel}
          confirmLabel={content.confirm.clearConfirm}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleClearConfirmed}
        />
      )}

      {showShareDialog && (
        <ShareDialog
          title={content.share.title}
          body={content.share.body}
          copyLabel={content.share.copyLink}
          onCancel={closeShareDialog}
          onCopy={handleShareCopy}
          copyButtonRef={shareCopyButtonRef}
        />
      )}

      {/* ── Fallback notice ────────────────────────────────── */}
      {initialUrlState.isFallback ? (
        <p className="notice" role="status">{content.fallbackMessage}</p>
      ) : null}

      {currentView === 'learn-more' ? (
        <LearnMorePage
          content={content}
          onStart={handleStart}
          onBack={handleBackToEdit}
        />
      ) : currentView === 'review' ? (
        <ReviewView
          content={content}
          selection={selection}
          onBackToEdit={handleBackToEdit}
          onStartAnswering={handleStart}
          onShare={openShareDialog}
          shareLabel={content.share.label}
          shareAccessibleLabel={content.share.accessibleLabel}
        />
      ) : (
        <>

      {/* ── Intro card ─────────────────────────────────────── */}
      <section className="intro-card" aria-labelledby="intro-title">
        <h1 id="intro-title">{content.intro.title}</h1>
        <p className="intro-body">{content.intro.body}</p>
        <p className="intro-privacy">{content.intro.privacy}</p>

        <StateLegend stateOptions={content.stateOptions} />

        <div className="intro-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleLearnMoreOpen}
          >
            {content.intro.learnMore}
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
              onToggle={(cardElement) => handleCategoryToggle(category.id, cardElement)}
              onItemSelect={handleItemSelect}
              onItemClear={handleItemClear}
            />
          ))}
        </div>
      </section>
        </>
      )}

    </div>
  )
}

export default App
