import { useEffect, useState } from 'react'
import type { ItemId, ItemState, SelectionState } from '../domain/model.js'
import type { LocalizedContent } from '../content/loader.js'
import { SunburstMobile } from './SunburstMobile.js'
import { SunburstDesktop } from './SunburstDesktop.js'

export interface SunburstProps {
  content:             LocalizedContent
  selection:           SelectionState
  activeState:         ItemState
  onItemChange:        (itemId: ItemId, newState: ItemState) => void
  onActiveStateChange: (state: ItemState) => void
}

function useIsMobile(): boolean {
  const query = '(max-width: 767px)'
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq      = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}

export function Sunburst(props: SunburstProps) {
  const isMobile = useIsMobile()
  return isMobile ? <SunburstMobile {...props} /> : <SunburstDesktop {...props} />
}
