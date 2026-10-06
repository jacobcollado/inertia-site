"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AskUserAnswer, AskUserQuestion } from "@/components/ui/ask-user-questions";
import { SELECTION_FRAME_COLOR } from "@/components/figma-frame";

// The homepage enquiry, one question at a time, in the site's own language
// rather than a generic form card: Back and a quiet "2 of 3" count, the
// question set large, answers as soft 6px tiles with a number key, and the picked answer
// held in the blue Figma selection frame for a beat before it moves on.
//
// Takes the same question shape as the shared ask-user-questions component
// (single-select options, `allowOther`, and `freeText` with validation) and
// returns answers in the same shape, so the flow around it didn't change.
// Colours come from the page tokens, so it sits on the dark zone's ground.

const FG = "rgb(var(--fg))";
const BG = "rgb(var(--bg))";
const MUTED = "rgb(var(--muted))";
const EASE = [0.22, 1, 0.36, 1] as const;
// How long the picked answer stays framed before the next question.
const PICK_HOLD_MS = 380;

function SelectedFrame() {
  const h = -3;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[6px]" style={{ boxShadow: `inset 0 0 0 1px ${SELECTION_FRAME_COLOR}` }}>
      {[{ top: h, left: h }, { top: h, right: h }, { bottom: h, right: h }, { bottom: h, left: h }].map((p, i) => (
        <span key={i} className="absolute size-[6px]" style={{ ...p, background: BG, border: `1px solid ${SELECTION_FRAME_COLOR}` }} />
      ))}
    </span>
  );
}

const Arrow = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M3 8h10" />
    <path d="M9 4l4 4-4 4" />
  </svg>
);

export function InquirySteps({
  questions,
  onComplete,
}: {
  questions: AskUserQuestion[];
  onComplete: (answers: Record<string, AskUserAnswer>) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, AskUserAnswer>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const total = questions.length;
  const q = questions[index];
  const qid = q.id ?? `q-${index}`;
  const options = q.options ?? [];
  const last = index === total - 1;

  // On each new question, bring back anything typed before (after Back) and
  // put the caret in a free-text field once it has slid in.
  useEffect(() => {
    setText(answers[qid]?.otherText ?? "");
    setError(null);
    setPicked(null);
    if (!q.freeText) return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), reduced ? 0 : 300);
    return () => clearTimeout(t);
    // Only on question change; `answers` is read for the restore, not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const commit = (answer: AskUserAnswer) => {
    const next = { ...answers, [qid]: answer };
    setAnswers(next);
    if (last) {
      onComplete(next);
      return;
    }
    setDir(1);
    setIndex(index + 1);
  };

  const choose = (optionId: string) => {
    if (picked) return;
    setPicked(optionId);
    setTimeout(() => commit({ questionId: qid, selectedIds: [optionId] }), reduced ? 0 : PICK_HOLD_MS);
  };

  const submitText = () => {
    const value = text.trim();
    if (q.freeText) {
      const problem = q.freeTextValidate?.(value) ?? (value ? null : "Add an answer to continue.");
      if (problem) {
        setError(problem);
        return;
      }
    } else if (!value) {
      return;
    }
    commit({ questionId: qid, selectedIds: [], otherText: value });
  };

  const back = () => {
    if (index === 0) return;
    setDir(-1);
    setIndex(index - 1);
  };

  // Number keys pick an answer while focus is inside the flow (not while
  // typing), so it works from the keyboard without hijacking the page.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (q.freeText || tag === "INPUT" || tag === "TEXTAREA") return;
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) {
      e.preventDefault();
      choose(options[n - 1].id ?? `o-${n - 1}`);
    }
  };

  const titleId = `inquiry-${qid}-title`;
  const fieldClass =
    "w-full bg-transparent outline-none resize-none text-[16px] sm:text-[17px] leading-snug tracking-tight placeholder:text-[rgb(var(--muted))]";

  return (
    <div onKeyDown={onKeyDown} className="w-full">
      <div className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="flex items-center gap-1.5 text-[14px] tracking-tight transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-0"
          style={{ color: MUTED }}
        >
          <Arrow className="size-3.5 rotate-180" />
          Back
        </button>
        <span className="text-[13px] tabular-nums tracking-tight" style={{ color: MUTED }}>
          {index + 1} of {total}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={qid}
          custom={dir}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 18 * dir, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -18 * dir, filter: "blur(6px)" }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <h3 id={titleId} className="text-[22px] sm:text-[28px] tracking-[-0.025em] leading-[1.2] text-balance" style={{ color: FG, fontWeight: 450 }}>
            {q.title}
          </h3>

          {q.freeText ? (
            <div className="mt-6 sm:mt-7">
              <div
                className="rounded-[6px] px-4 py-3.5 transition-shadow duration-200 focus-within:shadow-[inset_0_0_0_1px_rgb(var(--fg)/0.35)]"
                style={{ background: "rgb(var(--surface))" }}
                onClick={() => inputRef.current?.focus()}
              >
                {q.freeTextMultiline === false ? (
                  <input
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitText();
                      }
                    }}
                    placeholder={q.freeTextPlaceholder}
                    aria-labelledby={titleId}
                    aria-invalid={error !== null}
                    className={fieldClass}
                    style={{ color: FG }}
                  />
                ) : (
                  <textarea
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    rows={3}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        submitText();
                      }
                    }}
                    placeholder={q.freeTextPlaceholder}
                    aria-labelledby={titleId}
                    aria-invalid={error !== null}
                    className={fieldClass}
                    style={{ color: FG }}
                  />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p role="alert" className="min-w-0 text-[13px] tracking-tight" style={{ color: "#e5484d" }}>
                  {error}
                </p>
                <button
                  type="button"
                  onClick={submitText}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] px-5 text-[15px] tracking-tight transition-opacity duration-200 hover:opacity-90"
                  style={{ background: FG, color: BG, fontWeight: 450 }}
                >
                  {last ? "Send" : "Continue"}
                  <Arrow />
                </button>
              </div>
            </div>
          ) : (
            <div role="radiogroup" aria-labelledby={titleId} className="mt-6 flex flex-col gap-2 sm:mt-7">
              {options.map((o, i) => {
                const oid = o.id ?? `o-${i}`;
                const selected = picked ? picked === oid : answers[qid]?.selectedIds[0] === oid;
                return (
                  <button
                    key={oid}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(oid)}
                    className="relative flex w-full items-center gap-3.5 rounded-[6px] px-4 py-3.5 text-left transition-colors duration-200 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-elevated))]"
                    style={selected ? { background: "rgb(var(--surface-elevated))" } : undefined}
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-[4px] text-[12px] tabular-nums transition-colors duration-200"
                      style={{ background: selected ? FG : "rgb(var(--fg) / 0.08)", color: selected ? BG : MUTED }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15.5px] sm:text-[17px] tracking-tight leading-snug" style={{ color: FG }}>
                      {o.title}
                    </span>
                    {selected && <SelectedFrame />}
                  </button>
                );
              })}

              {q.allowOther && (
                <div className="flex items-center gap-3.5 rounded-[6px] py-2 pl-4 pr-2 bg-[rgb(var(--surface))]">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-[4px] text-[12px] tabular-nums"
                    style={{ background: "rgb(var(--fg) / 0.08)", color: MUTED }}
                  >
                    {options.length + 1}
                  </span>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitText();
                      }
                    }}
                    placeholder={q.otherPlaceholder ?? "Something else..."}
                    aria-label={q.otherPlaceholder ?? "Something else"}
                    className={`${fieldClass} min-w-0 py-1.5`}
                    style={{ color: FG }}
                  />
                  <button
                    type="button"
                    onClick={submitText}
                    disabled={!text.trim()}
                    aria-label="Submit your answer"
                    className="flex size-9 shrink-0 items-center justify-center rounded-[6px] transition-colors duration-200"
                    style={text.trim() ? { background: FG, color: BG } : { background: "rgb(var(--fg) / 0.08)", color: MUTED }}
                  >
                    <Arrow />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
