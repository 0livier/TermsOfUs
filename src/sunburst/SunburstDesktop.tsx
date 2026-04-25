import { useState } from 'react'
import type { ItemId, ItemState, SelectionState } from '../domain/model.js'
import type { LocalizedContent } from '../content/loader.js'
import { arcPath } from './arcPath.js'
import {
  CATEGORY_COLOR,
  STATE_FILL,
  STATE_STROKE,
  cycleState,
  getCompletionPct,
} from './sunburstColors.js'
import './SunburstDesktop.css'

const CX = 200
const CY = 200
const R0_ID = 88   // identity ring inner
const R1_ID = 100  // identity ring outer  (12px)
const R0_IT = 100  // item ring inner
const R1_IT = 155  // item ring outer      (55px)
const GAP   = 0.008

interface HoveredSegment {
  catId:  string
  itemId: string
}

interface Props {
  content:         LocalizedContent
  selection:       SelectionState
  activeState:     ItemState
  interactionMode: 'palette' | 'cycle'
  onItemChange:    (itemId: ItemId, newState: ItemState) => void
}

export function SunburstDesktop({
  content,
  selection,
  activeState,
  interactionMode,
  onItemChange,
}: Props) {
  const [hovered, setHovered] = useState<HoveredSegment | null>(null)

  const catCount = content.categories.length
  const catAngle = (2 * Math.PI) / catCount
  const pct      = getCompletionPct(content, selection)
  const total    = content.categories.reduce((n, c) => n + c.items.length, 0)

  const hoveredCat  = hovered ? content.categories.find(c => c.id === hovered.catId)  ?? null : null
  const hoveredItem = hoveredCat ? hoveredCat.items.find(i => i.id === hovered.itemId) ?? null : null
  const hoveredState: ItemState = hovered ? (selection[hovered.itemId] ?? 'none') : 'none'

  const statRows = content.stateOptions.map(opt => ({
    opt,
    count: opt.value === 'none'
      ? total - Object.keys(selection).length
      : Object.values(selection).filter(s => s === opt.value).length,
  }))

  function handleSegmentClick(itemId: ItemId) {
    const current = selection[itemId] ?? 'none'
    if (interactionMode === 'cycle') {
      onItemChange(itemId, cycleState(current))
    } else {
      onItemChange(itemId, activeState === 'none' || current === activeState ? 'none' : activeState)
    }
  }

  return (
    <div className="sunburst-desktop">
      {/* ── SVG ──────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 400 400"
        className="sunburst-desktop-svg"
        onPointerLeave={() => setHovered(null)}
        role="img"
        aria-label="Relationship preference wheel"
      >
        {content.categories.map((cat, catIdx) => {
          const catStart = -Math.PI / 2 + catIdx * catAngle
          const itemCount = cat.items.length
          const itemAngle = catAngle / itemCount

          return (
            <g key={cat.id}>
              {/* Ring 0 — identity */}
              <path
                d={arcPath(CX, CY, R0_ID, R1_ID,
                  catStart + GAP / 2,
                  catStart + catAngle - GAP / 2,
                )}
                fill={CATEGORY_COLOR[cat.id] ?? '#888'}
              />

              {/* Ring 1 — item states */}
              {cat.items.map((item, itemIdx) => {
                const start     = catStart + itemIdx * itemAngle + GAP / 2
                const end       = catStart + (itemIdx + 1) * itemAngle - GAP / 2
                const state     = selection[item.id] ?? 'none'
                const isHovered = hovered?.itemId === item.id

                return (
                  <path
                    key={item.id}
                    d={arcPath(CX, CY, R0_IT, R1_IT, start, end)}
                    fill={STATE_FILL[state]}
                    stroke={isHovered ? STATE_STROKE[state] : 'none'}
                    strokeWidth={isHovered ? 1.5 : 0}
                    style={{ cursor: 'pointer' }}
                    onPointerEnter={() => setHovered({ catId: cat.id, itemId: item.id })}
                    onClick={() => handleSegmentClick(item.id)}
                    role="button"
                    aria-label={`${cat.label}: ${item.label}`}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSegmentClick(item.id)
                      }
                    }}
                  />
                )
              })}
            </g>
          )
        })}

        {/* Center */}
        <circle cx={CX} cy={CY} r={84} fill="white" />
        <text x={CX} y={CY - 12} textAnchor="middle" fontSize="26" fontWeight="700" fill="#111">
          {pct}%
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="12" fill="#777">
          complete
        </text>
      </svg>

      {/* ── Right panel ──────────────────────────────────────────── */}
      <div className="sunburst-desktop-panel">
        {hoveredItem && hoveredCat ? (
          <div className="sunburst-panel-detail">
            <p className="sunburst-panel-breadcrumb">
              <span
                className="sunburst-panel-dot"
                style={{ background: CATEGORY_COLOR[hoveredCat.id] ?? '#888' }}
                aria-hidden="true"
              />
              {hoveredCat.label}
            </p>
            <h3 className="sunburst-panel-item-name">{hoveredItem.label}</h3>

            <div className="sunburst-panel-states">
              {content.stateOptions.map(opt => {
                const isActive = hoveredState === opt.value
                return (
                  <button
                    key={opt.value}
                    className={`sunburst-panel-state-btn is-${opt.value}${isActive ? ' is-panel-active' : ''}`}
                    onClick={() => onItemChange(hoveredItem.id, opt.value)}
                  >
                    <span className="state-mark" aria-hidden="true" />
                    {opt.shortLabel}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="sunburst-panel-stats">
            <p className="sunburst-panel-stat-label">Progress</p>
            <p className="sunburst-panel-completion">{pct}%</p>
            <dl className="sunburst-panel-counts">
              {statRows.map(({ opt, count }) => (
                <div key={opt.value} className="sunburst-panel-count-row">
                  <dt>
                    <span
                      className="sunburst-panel-count-dot"
                      style={{
                        background: opt.value === 'none' ? 'var(--border)' : STATE_FILL[opt.value],
                        borderColor: STATE_STROKE[opt.value],
                      }}
                      aria-hidden="true"
                    />
                    {opt.shortLabel}
                  </dt>
                  <dd>{count}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}
