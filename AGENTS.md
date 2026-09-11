# Codex repository instructions

## Where the project guidance lives

The project's guidance is written in Turkish and split by topic under `docs/`.
`CLAUDE.md` is the entry point. It describes the project in a few sentences,
names the two files to read first in a new session, lists every document with
one line on what it covers, and ends with the end-of-session routine.

- Before analyzing, reviewing, planning, or changing this repository, start at
  `CLAUDE.md` and follow its links to the documents the task touches. There is
  no need to read every document from start to end.
- Follow the rules in those documents as repository instructions. A rule there
  states today's position together with its reason. `docs/DECISIONS.md` records
  how and why positions changed, and `docs/TRAPS.md` lists known pitfalls under
  permanent numbers that code comments cite as "pitfall N".
- Follow the end-of-session routine at the bottom of `CLAUDE.md`.
- Keep shared project rules in `CLAUDE.md` and `docs/`, and do not duplicate
  them here. This file exists only as Codex's stable entry point.
- When durable project guidance changes, update the matching document under
  `docs/`, and `CLAUDE.md` if a document is added, renamed or removed, so that
  Claude and Codex keep using the same source of truth.

Explicit user, system, and developer instructions take precedence over this
repository guidance.
