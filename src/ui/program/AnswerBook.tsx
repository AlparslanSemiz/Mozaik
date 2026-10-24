// The answer book of a suggestion: a way's questions teacher by teacher, each
// with "Olur" and an "Olmaz" menu of strengths, and the sheet that lists
// them for the father to ask.

import type { Relaxation, State } from '../../leaf/model';
import { answerNo, answerYes, dropAnswer } from '../../pure/entities';
import {
  type Question,
  type Suggestion,
  questionsText,
  suggestionQuestions,
  suggestionSentence,
} from '../../pure/relax';
import { useT, useToast } from '../common';
import { createPortal } from 'react-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** A change the father already said yes to. */
function accepted(state: State, c: Relaxation): boolean {
  return state.answers.accepted.some((x) => same(x, c));
}

/** The question's "Olmaz" menu: four strengths for a teacher's hours, fewer for the rest. */
function Refuse({ q, onAnswer }: { q: Question; onAnswer: (next: (d: State) => State) => void }) {
  const t = useT();
  if (q.choices.length === 1) {
    const only = q.choices[0]!;
    return (
      <button
        className="btn"
        aria-label={t('Olmaz: {ne}', { ne: q.text })}
        onClick={() => onAnswer((d) => answerNo(d, only.refusal))}
      >
        {t('Olmaz')}
      </button>
    );
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="btn" aria-label={t('Olmaz: {ne}', { ne: q.text })}>
          {t('Olmaz')} ▾
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" sideOffset={5} collisionPadding={8}>
          {q.choices.map((choice) => (
            <DropdownMenu.Item
              key={choice.label}
              className="menu-item"
              onSelect={() => onAnswer((d) => answerNo(d, choice.refusal))}
            >
              {choice.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** A way's questions, teacher by teacher, each with "Olur" and "Olmaz". */
export function AnswerBook({
  found,
  state,
  unfinished,
  onAnswer,
  onPrint,
}: {
  found: Suggestion;
  state: State;
  /** The search was stopped before this way was over. */
  unfinished: boolean;
  onAnswer: (next: (d: State) => State) => void;
  onPrint: (s: Suggestion) => void;
}) {
  const t = useT();
  const notify = useToast();
  const questions = suggestionQuestions(state, found);
  const who = (q: Question) =>
    q.teacherId === null
      ? t('Siz')
      : (state.teachers.find((x) => x.id === q.teacherId)?.short ?? '?');

  async function copy() {
    const text = questionsText(state, found);
    try {
      await navigator.clipboard.writeText(text);
      notify(t('Sorular panoya kopyalandı.'));
    } catch {
      // No clipboard (an old WebView, a page without the permission): the
      // text in a box, selected, so Ctrl+C takes it.
      window.prompt(t('Kopyalamak için Ctrl+C’ye basın'), text);
    }
  }

  return (
    <div className="answer-book">
      <ul className="question-list">
        {questions.map((q) => {
          const yes = q.changes.every((c) => accepted(state, c));
          return (
            <li key={q.text + (q.teacherId ?? '')} className="question">
              <b className="question-who">{who(q)}</b>
              <span className="question-text">{q.text}</span>
              {yes ? (
                <button
                  className="chip"
                  aria-label={t('Geri al: {ne}', { ne: q.text })}
                  onClick={() => onAnswer((d) => q.changes.reduce(dropAnswer, d))}
                >
                  ✓ {t('Olur dedi')} ×
                </button>
              ) : (
                <span className="question-answers">
                  <button
                    className="btn"
                    aria-label={t('Olur: {ne}', { ne: q.text })}
                    onClick={() => onAnswer((d) => answerYes(d, q.changes))}
                  >
                    {t('Olur')}
                  </button>
                  <Refuse q={q} onAnswer={onAnswer} />
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="suggestion-row">
        <button className="btn" onClick={() => void copy()}>
          {t('Soruları kopyala')}
        </button>
        <button className="btn" onClick={() => onPrint(found)}>
          {t('Soruları yazdır')}
        </button>
        <span className="hint inline">
          {t('Bu değişiklikle haftanın tamamı yerleşiyor; program bulundu ve denetlendi.')}{' '}
          {found.proven
            ? t('Bundan küçük bir değişiklik yetmiyor.')
            : unfinished
              ? t('Arama durdurulduğu için daha küçük bir değişiklik de olabilir.')
              : t('Bulduğumuz en küçük değişiklik bu.')}
        </span>
      </div>
    </div>
  );
}

/**
 * The questions of one way, on paper only: drawn outside the app's root so
 * the print sheet has nothing else on it (`html.print-questions`, styles.css).
 */
export function QuestionSheet({ state, found }: { state: State; found: Suggestion }) {
  const t = useT();
  const questions = suggestionQuestions(state, found);
  const who = (q: Question) =>
    q.teacherId === null
      ? t('Sizin kararınız')
      : (state.teachers.find((x) => x.id === q.teacherId)?.short ?? '?');
  return createPortal(
    <section className="question-print" aria-hidden="true">
      <h1>{t('Öğretmenlere sorulacaklar')}</h1>
      <p>{suggestionSentence(state, found)}</p>
      <table>
        <tbody>
          {questions.map((q) => (
            <tr key={q.text + (q.teacherId ?? '')}>
              <th scope="row">{who(q)}</th>
              <td>{q.text}</td>
              <td className="question-print-box">{t('Olur')} ☐</td>
              <td className="question-print-box">{t('Olmaz')} ☐</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>,
    document.body,
  );
}
