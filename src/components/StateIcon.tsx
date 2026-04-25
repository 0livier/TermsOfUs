interface StateIconProps {
  state: string
  icon: string
}

export function StateIcon({ state, icon }: StateIconProps) {
  if (state === 'discuss') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden="true"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <path d="M7 1C3.686 1 1 3.239 1 6c0 1.497.69 2.843 1.8 3.797L2.5 13l3-1.5C5.979 11.832 6.485 12 7 12c3.314 0 6-2.239 6-5S10.314 1 7 1z" />
      </svg>
    )
  }
  return <span aria-hidden="true">{icon}</span>
}
