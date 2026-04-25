import { useState } from 'react'
import type { ItemId, ItemState, SelectionState } from '../domain/model.js'
import type { LocalizedContent } from '../content/loader.js'
import { arcPath } from './arcPath.js'
import {
  CATEGORY_COLOR,
  STATE_FILL,
  STATE_STROKE,
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
  content:      LocalizedContent
  selection:    SelectionState
  activeState:  ItemState
  onItemChange: (itemId: ItemId, newState: ItemState) => void
}

export function SunburstDesktop({
  content,
  selection,
  activeState,
  onItemChange,
}: Props) {
  const [hovered, setHovered] = useState<HoveredSegment | null>(null)

  const catCount = content.categories.length
  const catAngle = (2 * Math.PI) / catCount

  const hoveredCat  = hovered ? content.categories.find(c => c.id === hovered.catId)  ?? null : null
  const hoveredItem = hoveredCat && hovered ? hoveredCat.items.find(i => i.id === hovered.itemId) ?? null : null
  const hoveredState: ItemState = hovered ? (selection[hovered.itemId] ?? 'none') : 'none'

  function handleSegmentClick(itemId: ItemId) {
    const current = selection[itemId] ?? 'none'
    onItemChange(itemId, activeState === 'none' || current === activeState ? 'none' : activeState)
  }

  return (
    <div className="sunburst-desktop">
      {/* ── SVG ──────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 400 400"
        className="sunburst-desktop-svg"
        role="img"
        aria-label={content.wheel.description}
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
      </svg>

      {/* ── Right panel ──────────────────────────────────────────── */}
      {hoveredItem && hoveredCat ? (
        <div className="sunburst-desktop-panel">
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
      ) : Object.keys(selection).length === 0 ? (
        <div className="sunburst-desktop-panel sunburst-desktop-hint">
          <p className="sunburst-hint-description">{content.wheel.description}</p>
          <p className="sunburst-hint-empty">{content.wheel.emptyHint}</p>
        </div>
      ) : null}
    </div>
  )
}
