interface PulseIndicatorProps {
  active?: boolean;
}

export function PulseIndicator({ active = true }: PulseIndicatorProps) {
  return (
    <span
      className={`pulse-indicator ${active ? 'pulse-indicator--active' : ''}`}
      aria-label={active ? 'Live' : 'Inactive'}
    />
  );
}
