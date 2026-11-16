// The teacher's phone number (schema v19), and the WhatsApp link it fills.
//
// Mozaik sends nothing. The number goes into a `https://wa.me/` link that
// opens only when the user clicks it, and WhatsApp itself asks before
// anything is sent. It is never sent anywhere else.

/**
 * What `sanitize` and the file reader keep of a stored number: only what a
 * number is written with (digits, spaces, `+`, `-`, `.`, brackets), trimmed,
 * at most 32 characters. Anything else is a typing slip, not a number.
 */
export function cleanPhone(x: unknown): string {
  if (typeof x !== 'string') return '';
  return x
    .replace(/[^\d +().-]/g, '')
    .trim()
    .slice(0, 32);
}

/**
 * The number as wa.me wants it, international and digits only, or null when
 * the box does not hold one. Loose on purpose: "0532 123 45 67",
 * "532 123 45 67", "905321234567", "+90 532…" and "0090 532…" are the same
 * Turkish mobile. Any other country is typed with its `+` or `00`; without
 * one, a number that is not Turkish's length is refused rather than read as
 * another country's ("212 555 12 34" is Istanbul without its 0, not Morocco:
 * a wrong guess opens a stranger's chat).
 */
export function whatsappNumber(phone: string): string | null {
  let n = phone.replace(/\D/g, '');
  if (phone.trim().startsWith('+')) {
    // Already international.
  } else if (n.startsWith('00')) n = n.slice(2);
  else if (n.length === 11 && n.startsWith('0')) n = `90${n.slice(1)}`;
  else if (n.length === 10) n = `90${n}`;
  else if (!(n.length === 12 && n.startsWith('90'))) return null;
  return /^[1-9]\d{7,14}$/.test(n) ? n : null;
}

/** The link the WhatsApp button opens: the chat with that number, the text typed in. */
export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
