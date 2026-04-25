import { useState } from 'react'
import type { ItemId, ItemState, SelectionState } from '../domain/model.js'
import type { LocalizedContent } from '../content/loader.js'
import { arcPath } from './arcPath.js'
import {
  CATEGORY_COLOR,
  STATE_FILL,
  STATE_STROKE,
  cycleState,
  getDominantState,
} from './sunburstColors.js'
import './SunburstMobile.css'

const CX = 200
const CY = 200
const R_STATE_INNER = 91
const R_STATE_OUTER = 165
const R_ID_OUTER    = 173
const GAP = 0.008

interface Props {
  content: LocalizedContent
  selection: SelectionState
  activeState: ItemState
  interactionMode: 'palette' | 'cycle'
  onItemChange: (itemId: ItemId, newState: ItemState) => void
}

export function SunburstMobile({
  content,
  selection,
  activeState,
  interactionMode,
  onItemChange,
}: Props) {
  const [activeCatId, setActiveCatId] = useState<string | null>(null)

  const catCount  = content.categories.length
  const catAngle  = (2 * Math.PI) / catCount
  const activeCat = activeCatId
    ? content.categories.find(c => c.id === activeCatId) ?? null
    : null

  function handleItemTap(itemId: ItemId) {
    const current = selection[itemId] ?? 'none'
    if (interactionMode === 'cycle') {
      onItemChange(itemId, cycleState(current))
    } else {
      onItemChange(itemId, activeState === 'none' || current === activeState ? 'none' : activeState)
    }
  }

  return (
    <div className="sunburst-mobile">
      <div className={`sunburst-mobile-slides${activeCat ? ' on-b' : ''}`}>

        {/* ── SCREEN A: category wheel ─────────────────────────────── */}
        <div className="sunburst-slide" aria-hidden={activeCat !== null}>
          <svg
            viewBox="0 0 400 400"
            className="sunburst-mobile-svg"
            role="img"
            aria-label="Category wheel"
          >
            {content.categories.map((cat, i) => {
              const start    = -Math.PI / 2 + i * catAngle + GAP / 2
              const end      = -Math.PI / 2 + (i + 1) * catAngle - GAP / 2
              const dominant = getDominantState(cat.items, selection)

              return (
                <g
                  key={cat.id}
                  className="sunburst-cat-segment"
                  onClick={() => setActiveCatId(cat.id)}
                  role="button"
                  aria-label={`${cat.label}: ${dominant}`}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveCatId(cat.id)
                    }
                  }}
                >
                  <path
                    d={arcPath(CX, CY, R_STATE_INNER, R_STATE_OUTER, start, end)}
                    fill={STATE_FILL[dominant]}
                    stroke={STATE_STROKE[dominant]}
                    strokeWidth={0.5}
                  />
                  <path
                    d={arcPath(CX, CY, R_STATE_OUTER, R_ID_OUTER, start, end)}
                    fill={CATEGORY_COLOR[cat.id] ?? '#888'}
                    stroke="none"
                  />
                </g>
              )
            })}

            <circle cx={CX} cy={CY} r={R_STATE_INNER - 4} fill="white" />
          </svg>
        </div>

        {/* ── SCREEN B: item list ───────────────────────────────────── */}
        <div className="sunburst-slide" aria-hidden={activeCat === null}>
          {activeCat && (
            <>
              <div className="sunburst-mobile-header">
                <button
                  className="sunburst-back-btn"
                  onClick={() => setActiveCatId(null)}
                  aria-label="Back to category wheel"
                >
                  ‹ Back
                </button>
                <span
                  className="sunburst-cat-dot"
                  style={{ background: CATEGORY_COLOR[activeCat.id] ?? '#888' }}
                  aria-hidden="true"
                />
                <span className="sunburst-cat-name">{activeCat.label}</span>
              </div>

              <div className="sunburst-item-list">
                {activeCat.items.map(item => {
                  const state = selection[item.id] ?? 'none'
                  const opt   = content.stateOptions.find(o => o.value === state)!

                  return (
                    <button
                      key={item.id}
                      className="sunburst-item-row"
                      style={{
                        '--row-bg':     STATE_FILL[state],
                        '--row-border': STATE_STROKE[state],
                      } as React.CSSProperties}
                      onClick={() => handleItemTap(item.id)}
                    >
                      <span className="sunburst-item-label">{item.label}</span>
                      <span
                        className="sunburst-item-badge"
                        style={{
                          borderColor: STATE_STROKE[state],
                          color:       STATE_STROKE[state],
                        }}
                      >
                        <span className="state-mark" aria-hidden="true" />
                        {opt.shortLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
