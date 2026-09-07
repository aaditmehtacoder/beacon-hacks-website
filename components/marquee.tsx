const ITEMS = [
  "Build what lights the way",
  "Target: Jan 30 2027",
  "Belmont, CA",
  "Grades 9 to 12",
  "No experience needed",
  "Looking for sponsors",
];

/** Endless ticker. Two identical groups slide left; at -50% it loops seamlessly. */
export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-line bg-ink py-3.5"
    >
      <div className="flex w-max motion-safe:animate-drift">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center">
            {ITEMS.map((item, i) => (
              <span key={`${group}-${item}`} className="flex items-center">
                <span
                  className={`label px-6 ${i === 0 ? "text-beacon" : "text-paper/70"}`}
                >
                  {item}
                </span>
                <span className="text-beacon">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
