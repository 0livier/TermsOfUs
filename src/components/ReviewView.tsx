import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LocalizedContent } from '../content/loader.js'
import type { SelectedItemState, SelectionState } from '../domain/model.js'
import { StateIcon } from './StateIcon.js'

type ReviewGrouping = 'answer' | 'category'

interface ReviewViewProps {
  content: LocalizedContent
  selection: SelectionState
  onBackToEdit: () => void
  onStartAnswering: () => void
  onShare: () => void
  shareLabel: string
  shareAccessibleLabel: string
}

interface AnsweredItem {
  id: string
  label: string
  categoryLabel: string
  state: SelectedItemState
}

const STATE_ORDER: SelectedItemState[] = ['present', 'important', 'discuss', 'no']

export function ReviewView({
  content,
  selection,
  onBackToEdit,
  onStartAnswering,
  onShare,
  shareLabel,
  shareAccessibleLabel,
}: ReviewViewProps) {
  const [grouping, setGrouping] = useState<ReviewGrouping>('answer')
  const titleRef = useRef<HTMLHeadingElement>(null)

  const answeredItems = useMemo(
    () => getAnsweredItems(content, selection),
    [content, selection],
  )
  const answeredCount = answeredItems.length

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  function setReviewGrouping(nextGrouping: ReviewGrouping) {
    setGrouping(nextGrouping)
    requestAnimationFrame(() => {
      titleRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  if (answeredCount === 0) {
    return (
      <main className="review-page review-page-empty" aria-labelledby="review-empty-title">
        <section className="review-empty-card">
          <h1 id="review-empty-title" tabIndex={-1} ref={titleRef}>
            {content.review.emptyTitle}
          </h1>
          <p>{content.review.emptyBody}</p>
          <button type="button" className="btn-primary" onClick={onStartAnswering}>
            {content.review.emptyCta}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="review-page" aria-labelledby="review-title">
      <section className="review-header">
        <h1 id="review-title" tabIndex={-1} ref={titleRef}>
          {content.review.title}
        </h1>
        <p className="review-count">
          {content.review.countLabel.replace('{count}', String(answeredCount))}
        </p>

        <div className="review-toolbar">
          <div className="review-grouping">
            <span className="review-grouping-label">{content.review.organizeBy}</span>
            <div className="segmented-control" role="group" aria-label={content.review.organizeBy}>
              <button
                type="button"
                className={grouping === 'answer' ? 'is-selected' : ''}
                aria-pressed={grouping === 'answer'}
                onClick={() => setReviewGrouping('answer')}
              >
                {content.review.byAnswer}
              </button>
              <button
                type="button"
                className={grouping === 'category' ? 'is-selected' : ''}
                aria-pressed={grouping === 'category'}
                onClick={() => setReviewGrouping('category')}
              >
                {content.review.byCategory}
              </button>
            </div>
          </div>

          <div className="review-toolbar-actions">
            <button
              type="button"
              className="btn-primary review-share-btn"
              onClick={onShare}
              aria-label={shareAccessibleLabel}
            >
              {shareLabel}
            </button>

            <button type="button" className="btn-secondary review-back-btn" onClick={onBackToEdit}>
              {content.review.backToEdit}
            </button>
          </div>
        </div>
      </section>

      {grouping === 'answer' ? (
        <ReviewByAnswer content={content} answeredItems={answeredItems} />
      ) : (
        <ReviewByCategory content={content} selection={selection} />
      )}
    </main>
  )
}

function ReviewByAnswer({
  content,
  answeredItems,
}: {
  content: LocalizedContent
  answeredItems: AnsweredItem[]
}) {
  return (
    <div className="review-groups">
      {STATE_ORDER.map((state) => {
        const items = answeredItems.filter((item) => item.state === state)
        if (items.length === 0) return null

        return (
          <section key={state} className={`review-group is-${state}`}>
            <StateHeading level={2} state={state}>
              {getStateLabel(content, state)} · {items.length}
            </StateHeading>
            <ul className="review-item-list">
              {items.map((item) => (
                <li key={item.id} className="review-item">
                  <span className="review-item-meta">{item.categoryLabel}</span>
                  <span className="review-item-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function ReviewByCategory({
  content,
  selection,
}: {
  content: LocalizedContent
  selection: SelectionState
}) {
  return (
    <div className="review-groups">
      {content.categories.map((category) => {
        const answeredItems = category.items.flatMap((item) => {
          const state = selection[item.id]
          if (!state) return []
          return [{ id: item.id, label: item.label, categoryLabel: category.label, state }]
        })

        if (answeredItems.length === 0) return null

        return (
          <section key={category.id} className="review-group">
            <h2>{category.label} · {answeredItems.length}</h2>
            <div className="review-state-subgroups">
              {STATE_ORDER.map((state) => {
                const items = answeredItems.filter((item) => item.state === state)
                if (items.length === 0) return null

                return (
                  <div key={state} className="review-state-subgroup">
                    <StateHeading level={3} state={state}>
                      {getStateLabel(content, state)}
                    </StateHeading>
                    <ul className="review-item-list">
                      {items.map((item) => (
                        <li key={item.id} className="review-item">
                          <span className="review-item-meta">{item.categoryLabel}</span>
                          <span className="review-item-label">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function StateHeading({
  level,
  state,
  children,
}: {
  level: 2 | 3
  state: SelectedItemState
  children: ReactNode
}) {
  const Heading = level === 2 ? 'h2' : 'h3'

  return (
    <Heading className={`review-state-heading is-${state}`}>
      <span className="review-state-icon" aria-hidden="true">
        <StateIcon state={state} size={14} />
      </span>
      <span>{children}</span>
    </Heading>
  )
}

function getAnsweredItems(
  content: LocalizedContent,
  selection: SelectionState,
): AnsweredItem[] {
  return content.categories.flatMap((category) =>
    category.items.flatMap((item) => {
      const state = selection[item.id]
      if (!state) return []

      return [{
        id: item.id,
        label: item.label,
        categoryLabel: category.label,
        state,
      }]
    }),
  )
}

function getStateLabel(content: LocalizedContent, state: SelectedItemState): string {
  return content.stateOptions.find((option) => option.value === state)?.longLabel ?? state
}
