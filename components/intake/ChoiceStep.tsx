import type { Question } from "@/lib/intake";

/**
 * A single intake question rendered as an accessible radio group. Uses real
 * <input type="radio"> elements (visually hidden) inside a <fieldset>, so arrow
 * keys, labels and screen readers work with zero custom key handling.
 */
export function ChoiceStep({
  question,
  value,
  onSelect,
}: {
  question: Question;
  value: string | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-display-md text-fg">{question.title}</legend>
      {question.help && (
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-mute">{question.help}</p>
      )}

      <div className="mt-8 grid gap-3">
        {question.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`group relative flex cursor-pointer items-center gap-4 rounded-card border px-5 py-4 transition-all ${
                selected
                  ? "border-transparent bg-surface-2 ring-accent"
                  : "border-line bg-surface/50 hover:border-fg-mute/40 hover:bg-surface"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={selected}
                onChange={() => onSelect(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                  selected ? "border-accent" : "border-fg-mute/50 group-hover:border-fg-mute"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full bg-accent transition-transform ${
                    selected ? "scale-100" : "scale-0"
                  }`}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-medium text-fg">{opt.label}</span>
                {opt.hint && <span className="mt-0.5 block text-sm text-fg-mute">{opt.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
