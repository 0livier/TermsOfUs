import type { LocalizedContent } from '../content/loader.js'
import type { SelectedItemState, SelectionState } from '../domain/model.js'

const STATE_ORDER: SelectedItemState[] = ['present', 'important', 'discuss', 'no']

export function buildReviewSummary(
  content: LocalizedContent,
  selection: SelectionState,
): string {
  const lines = [content.review.copySummaryIntro, '', content.review.title]

  for (const category of content.categories) {
    const categoryLines: string[] = []

    for (const state of STATE_ORDER) {
      const items = category.items.filter((item) => selection[item.id] === state)
      if (items.length === 0) continue

      categoryLines.push(`- ${getStateLabel(content, state)}: ${items.map((item) => item.label).join(', ')}`)
    }

    if (categoryLines.length === 0) continue

    lines.push('', category.label, ...categoryLines)
  }

  return lines.join('\n')
}

function getStateLabel(content: LocalizedContent, state: SelectedItemState): string {
  return content.stateOptions.find((option) => option.value === state)?.longLabel ?? state
}
