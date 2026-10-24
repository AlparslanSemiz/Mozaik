// The teacher's e-mail address (schema v17), and the `mailto:` it fills.
//
// Mozaik sends nothing. The address and the week go into a `mailto:` link,
// and the user's own mail program opens it as a new message, from the user's
// own account; the user presses Send. That is the whole path, and it is why
// there is no account, no server and no network code here (TODO B3.4).

/**
 * What `sanitize` and the file reader keep of a stored address: text, trimmed,
 * with no control character in it. A line break in an address would end the
 * `to` of a mail and start something else, so it never survives a load. The
 * rest is the user's own typing and is kept as typed: whether it LOOKS like an
 * address is `looksLikeEmail`'s question, asked where the button is.
 */
export function cleanEmail(x: unknown): string {
  if (typeof x !== 'string') return '';
  const printable = (c: string) => c.charCodeAt(0) > 0x1f && c.charCodeAt(0) !== 0x7f;
  return [...x].filter(printable).join('').trim();
}

/**
 * One address, the plain shape: something, an @, a domain with a dot. Not a
 * validator of RFC 5322; a guard against a list ("a@x.com, b@y.com"), a
 * space, or a half-typed address reaching the mail program.
 */
export function looksLikeEmail(s: string): boolean {
  return /^[^\s@,;<>()"]+@[^\s@,;<>()"]+\.[^\s@,;<>()".]+$/.test(s);
}

/**
 * The `mailto:` for one message (RFC 6068). The address keeps its @, the
 * subject and the body are percent-encoded, and every line break is CRLF,
 * which is what the RFC asks of a body and what Outlook reads.
 */
export function mailtoUrl(to: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${encodeURIComponent(to).replace(/%40/g, '@')}?subject=${enc(subject)}&body=${enc(body)}`;
}
