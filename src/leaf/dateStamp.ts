// The date inside a file name. Local date parts, not toISOString(): at 01:00 in
// Turkey the ISO date is still yesterday, and a backup filed under the wrong
// day is a backup nobody finds. A leaf, because the downloaded backups
// (library.ts) and the folder's daily copies (folder.ts) must print the date the
// same way and neither of them has any other reason to import the other.

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** `2026-08-26`, in local time. */
export function dayStamp(now: Date): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** `2026-08-26-1830`, in local time. */
export function minuteStamp(now: Date): string {
  return `${dayStamp(now)}-${pad2(now.getHours())}${pad2(now.getMinutes())}`;
}
