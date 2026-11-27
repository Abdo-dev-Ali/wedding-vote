"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

type Key = "a" | "b" | "c" | "d";
const KEYS: Key[] = ["a", "b", "c", "d"];

export type QuizQuestion = {
  id: string;
  text: string;
  options: Partial<Record<Key, string>>;
  my_choice: Key | null;
  counts: Record<Key, number> | null;
};

function Bars({ question }: { question: QuizQuestion }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const keys = KEYS.filter((k) => question.options[k]);
  const counts = question.counts;
  const total = counts ? keys.reduce((sum, k) => sum + (counts[k] ?? 0), 0) : 0;

  return (
    <ul className="flex flex-col gap-3">
      {keys.map((k) => {
        const count = counts?.[k] ?? 0;
        const percent = total > 0 ? (count / total) * 100 : 0;
        const mine = question.my_choice === k;
        return (
          <li key={k} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-lg text-ink ${mine ? "font-bold" : ""}`}>
                {question.options[k]} {mine && "✓"}
              </span>
              <span dir="ltr" className="text-lg font-bold tabular-nums text-ink">
                {Math.round(percent)}%
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-paper-deep"
              aria-hidden="true"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                  mine ? "bg-dark-gold" : "bg-gold"
                }`}
                style={{ width: mounted ? `${percent}%` : "0%" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Quiz({
  weddingId,
  initial,
}: {
  weddingId: string;
  initial: QuizQuestion[];
}) {
  const { quiz } = siteConfig;
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(() => {
    const i = initial.findIndex((q) => q.my_choice === null);
    return i === -1 ? initial.length : i;
  });

  async function reload() {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_quiz", { p_wedding: weddingId });
    if (data?.ok) setQuestions(data.questions ?? []);
  }

  async function answer(q: QuizQuestion, key: Key) {
    setError("");
    setBusy(true);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("answer_question", {
      p_wedding: weddingId,
      p_question_id: q.id,
      p_choice: key,
    });
    setBusy(false);

    if (rpcError || !data) {
      setError(quiz.error);
      return;
    }
    if (data.ok) {
      setQuestions((prev) =>
        prev.map((x) => (x.id === q.id ? { ...x, my_choice: key, counts: data.counts } : x))
      );
      return;
    }
    if (data.reason === "already_answered") {
      await reload();
      return;
    }
    setError(quiz.error);
  }

  if (questions.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-12 w-full max-w-[420px] rounded-xl border border-ink-soft px-4 text-lg text-ink transition active:scale-[0.98]"
      >
        {quiz.start}
      </button>
    );
  }

  const finished = current >= questions.length;
  const q = finished ? null : questions[current];

  return (
    <section className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border border-gold bg-white px-4 py-4 text-right">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-amiri)] text-2xl text-ink">
          {quiz.title}
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-base text-dark-gold underline"
        >
          {quiz.hide}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-base font-medium text-ink">
          {error}
        </p>
      )}

      {finished ? (
        <>
          <p className="text-lg text-ink">{quiz.done}</p>
          {questions.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 border-t border-paper-deep pt-4">
              <p className="text-lg font-medium text-ink">{item.text}</p>
              <Bars question={item} />
            </div>
          ))}
        </>
      ) : (
        q && (
          <>
            <p className="text-sm text-ink-soft">
              {quiz.progress
                .replace("{current}", String(current + 1))
                .replace("{total}", String(questions.length))}
            </p>
            <p className="text-xl font-medium leading-relaxed text-ink">{q.text}</p>

            {q.my_choice === null ? (
              <div className="flex flex-col gap-3">
                {KEYS.filter((k) => q.options[k]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={busy}
                    onClick={() => answer(q, k)}
                    className="min-h-14 rounded-xl border-2 border-gold bg-white px-4 text-lg text-ink transition active:scale-[0.98] disabled:opacity-60"
                  >
                    {q.options[k]}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <Bars key={q.id} question={q} />
                <button
                  type="button"
                  onClick={() => setCurrent(current + 1)}
                  className="min-h-12 rounded-xl bg-ink-soft px-4 text-lg text-white transition active:scale-[0.98]"
                >
                  {current === questions.length - 1 ? quiz.finish : quiz.next}
                </button>
              </>
            )}
          </>
        )
      )}
    </section>
  );
}