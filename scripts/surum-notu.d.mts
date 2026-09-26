// Types for scripts/surum-notu.mjs, which stays plain .mjs so the release
// workflow can run it with `node` alone (the same reason as surum.d.mts).

export function changelogSection(changelogMd: string, version: string): string | null;
export function inAppLines(changelogTs: string, version: string): string[];
export function releaseNotes(
  version: string,
  files: { changelogMd: string; changelogTs: string; install: string },
): string;
