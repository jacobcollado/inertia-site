// The mark: inertia in one stroke, the textbook drawing of it. A body going
// round is let go at the top and carries straight on along the tangent,
// on toward the wordmark. It stands a step under the wordmark's cap height
// (20px beside its 24, as a round form reads larger than straight capitals)
// at the wordmark's stem weight: 24 units tall, a stroke of 2.76 units is
// 2.3px at 20px. In the wordmark's black, so it takes the same .inertia-logo
// treatment (it flips light in the dark theme).
export function InertiaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30.1 24"
      className={className}
      fill="none"
      stroke="#000"
      strokeWidth={2.76}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21.98 8.37A10.62 10.62 0 1 1 12 1.38H28.69" />
    </svg>
  );
}
