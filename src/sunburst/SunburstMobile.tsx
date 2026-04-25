import { useState } from 'react'
import type { ItemId, ItemState, SelectionState } from '../domain/model.js'
import type { LocalizedContent } from '../content/loader.js'
import { Palette } from '../components/Palette.js'
import { arcPath } from './arcPath.js'
import {
  CATEGORY_COLOR,
  STATE_FILL,
  STATE_STROKE,
} from './sunburstColors.js'
import './SunburstMobile.css'

const CX = 200
const CY = 200
const R_STATE_INNER = 91
const R_STATE_OUTER = 165
const R_ID_OUTER    = 173
const GAP = 0.008

interface Props {
  content:             LocalizedContent
  selection:           SelectionState
  activeState:         ItemState
  onItemChange:        (itemId: ItemId, newState: ItemState) => void
  onActiveStateChange: (state: ItemState) => void
}

export function SunburstMobile({
  content,
  selection,
  activeState,
  onItemChange,
  onActiveStateChange,
}: Props) {
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null)

  const catCount  = content.categories.length
  const catAngle  = (2 * Math.PI) / catCount
  const activeCat = activeCatId
    ? content.categories.find(c => c.id === activeCatId) ?? null
    : null

  function catIdAtPointer(e: React.PointerEvent<SVGSVGElement>): string | null {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (400 / rect.width)
    const y = (e.clientY - rect.top)  * (400 / rect.height)
    const dx = x - CX
    const dy = y - CY
    const r  = Math.sqrt(dx * dx + dy * dy)
    if (r < R_STATE_INNER - 4 || r > R_ID_OUTER) return null
    let angle = Math.atan2(dy, dx) + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    const idx = Math.floor(angle / catAngle)
    return content.categories[idx]?.id ?? null
  }

  function handleItemTap(itemId: ItemId) {
    const current = selection[itemId] ?? 'none'
    onItemChange(itemId, activeState === 'none' || current === activeState ? 'none' : activeState)
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
            onPointerDown={e => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setHoveredCatId(catIdAtPointer(e))
            }}
            onPointerMove={e => {
              setHoveredCatId(catIdAtPointer(e))
            }}
            onPointerUp={e => {
              const catId = catIdAtPointer(e)
              if (catId) setActiveCatId(catId)
              setHoveredCatId(null)
            }}
            onPointerCancel={() => setHoveredCatId(null)}
            onPointerLeave={() => setHoveredCatId(null)}
          >
            {content.categories.map((cat, i) => {
              const catStart  = -Math.PI / 2 + i * catAngle
              const catEnd    = -Math.PI / 2 + (i + 1) * catAngle
              const itemCount = cat.items.length
              const itemAngle = catAngle / itemCount

              const isHovered = hoveredCatId === cat.id
              const isDimmed  = hoveredCatId !== null && !isHovered

              return (
                <g
                  key={cat.id}
                  className="sunburst-cat-segment"
                  opacity={isDimmed ? 0.45 : 1}
                  role="button"
                  aria-label={cat.label}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveCatId(cat.id)
                    }
                  }}
                >
                  {cat.items.map((item, j) => {
                    const start = catStart + j * itemAngle + GAP / 2
                    const end   = catStart + (j + 1) * itemAngle - GAP / 2
                    const state = selection[item.id] ?? 'none'
                    return (
                      <path
                        key={item.id}
                        d={arcPath(CX, CY, R_STATE_INNER, R_STATE_OUTER, start, end)}
                        fill={STATE_FILL[state]}
                        stroke={STATE_STROKE[state]}
                        strokeWidth={0.5}
                      />
                    )
                  })}
                  <path
                    d={arcPath(CX, CY, R_STATE_OUTER, R_ID_OUTER, catStart + GAP / 2, catEnd - GAP / 2)}
                    fill={CATEGORY_COLOR[cat.id] ?? '#888'}
                    stroke="none"
                  />
                </g>
              )
            })}

            <circle cx={CX} cy={CY} r={R_STATE_INNER - 4} fill="white" />
          </svg>
          <div className="sunburst-cat-hover-label" aria-live="polite">
            {hoveredCatId
              ? content.categories.find(c => c.id === hoveredCatId)?.label ?? ''
              : ''}
          </div>
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

              <div className="sunburst-mobile-palette">
                <Palette
                  activeState={activeState}
                  stateOptions={content.stateOptions}
                  onChange={onActiveStateChange}
                />
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
