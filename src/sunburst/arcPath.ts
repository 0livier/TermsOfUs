/**
 * Returns an SVG path string for an annular sector (donut slice).
 * Angles in radians from the positive x-axis, increasing clockwise (SVG convention).
 */
export function arcPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  startAngle: number,
  endAngle: number,
): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  const p = (r: number, a: number): [number, number] => [
    cx + r * Math.cos(a),
    cy + r * Math.sin(a),
  ]

  const [x00, y00] = p(r0, startAngle)
  const [x01, y01] = p(r0, endAngle)
  const [x10, y10] = p(r1, startAngle)
  const [x11, y11] = p(r1, endAngle)

  return [
    `M ${x10} ${y10}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${x11} ${y11}`,
    `L ${x01} ${y01}`,
    `A ${r0} ${r0} 0 ${largeArc} 0 ${x00} ${y00}`,
    'Z',
  ].join(' ')
}
