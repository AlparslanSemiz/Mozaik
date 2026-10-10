# Changelog

All notable user-visible changes to Mozaik. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/).

A release is cut with `npm run yayinla -- X.Y.Z`, which closes the Unreleased
block under the new version and today's date. The in-app "What's new" panel
reads `src/platform/changelog.ts`. Each GitHub Release page is built from the
in-app lines, this file's section for the version and the install text in
`.github/surum-notu.md` (`scripts/surum-notu.mjs`).

Version 1.1.0 was the first published release. Earlier milestones (v0.6 to v1.0)
lived on branches and were never released, so they are not listed. Version
numbers 1.2.0 and 2.0.4 were never released either. Where the record of a
release is incomplete, the entry says so.

## [Unreleased]

### Changed

- Every list and summary table now shades every second row, the same way in every list, so a row is easier to follow across the screen. The text keeps its contrast in both themes. Boxes and drop-downs inside a list keep the page's own colour with a clearer edge, so they stand out on a shaded row, and the split button in Lessons now looks like the boxes beside it.

### Fixed

- With the program open in two browser tabs, closing the tab that had not been used no longer wipes out the work done in the other one. A tab that sees another tab change the open plan now stops saving and says so in a red strip, with a Reload button; a closing tab saves only an edit that is still waiting to be saved.
- When this computer's storage is full, a change that cannot be saved is now said in a red strip at the top, instead of "Sample data loaded." over a save that never happened. In the desktop program, the folder under Documents also gets a rescue copy for that session, which the next start does not overwrite.
- In Availability, the heading of the lesson after a lunch break that moves from day to day no longer sits lower than its neighbours. It has no single clock time to show, and without one its number dropped about 7px.
- Scrolling the timetable sideways no longer slides the hour headers over the top-left corner cell. Forty pixels were enough to cut "TEACHER" down to its first letters.
- The total in the Lessons strip is now translated. It read "99 ders · 433 saat" in every language.
- Chemistry's short form no longer reads "Who" in English ("Wer" in German, "Quién" in Spanish, "Qui" in French). Its Turkish short was also the word for "who" in the Availability strip, and the two shared one translation. Built-in subject and day shorts now come from a table of their own: Chemistry is "Chm", "Che", "Quí" and "Chi".
- Opening a plan file written by a newer version of the program now says so and asks for an update, instead of calling the file unreadable.
- When a card cannot swap with the card it is dragged onto, the line under the toolbar now says what stops the swap ("No swap, 431 · MÇ cannot take the old place: 430 is in room E on Wednesday at 4"). It used to name the other card, the very one the swap would have moved.
- After Ctrl+Z, the line under the toolbar no longer goes on saying that the timetable was laid out or that a suggestion was applied, next to a chip counting the lessons that do not fit again. The same goes for the "moved to place N" sentence above a school list after its move is undone.
- Check no longer says "No problems in sight" and "0 blocking" while lessons sit on hours that were closed after they were placed. Its verdict now says how many lessons are on a closed hour, and the blocking count in the strip counts them, as the status chip in the top bar already did.
- Stopping the search for ways to build a stuck week no longer reads as if the search had ended with nothing found. The panel says the search was stopped, keeps the ways found so far and marks those not yet made smaller, and a "Continue the search" button starts it again. A stopped search also no longer hands back a way's first, larger week when it had already found a smaller one.
- In the side panel of a class or a room, clicking into the Name box and leaving it no longer renames it. The box held the panel's heading ("320 sınıfı", "A dersliği"), and leaving it wrote that back as the name, one more word each time. It now holds the name itself, and leaving a box unchanged no longer adds an undo step.
- Open from file refuses a plan file whose list of teachers, classes, lessons or rooms is missing altogether, as in a file cut short or edited by hand. Such a file used to load as an empty plan and replace the open one. The question before loading now also counts what is in the file beside what is open now.
- Typing fewer lesson names than there are lessons no longer shortens the day. The number of lessons comes from its own box alone: a lesson without a name keeps its number, and names beyond the count are left out, with a line under the box saying so. It used to cut the day down to the names given and take the lessons after them off the timetable.
- Unticking a teaching day or lowering the number of lessons a day no longer takes placed lessons off the timetable without a word. A question comes first and counts what will go back to the tray, pinned hours included; Cancel leaves everything as it was. Ctrl+Z now also works right after clicking a checkbox, where it used to do nothing.
- Enter or Space on a focused card in the timetable now opens its menu, as the keyboard shortcuts screen says. It used to send the lesson back to the tray without a word. Delete still removes it.
- In the Lessons form, Enter on the split button now opens its list and Enter on a split picks it. It used to add the lesson, with the split it had before.
- Dragging a card along its row no longer stutters in the Fit density. On a full week, 23% of frames were dropped even on a fast machine, and nearly all of them on a slow one. Now none are, and the column widths are exactly what they were. The Linux build also stuttered in both densities, and it is smooth now too.
- In the Fit density, card text no longer ends in "…" where it can be shown: a class name is written with its first word ("411A" for "411A SAY", on the card and on the class row), and a line that still does not fit is drawn smaller, down to 9px, instead of being cut. Rows keep their height, the full name is still what the card says to a screen reader, and the Comfortable and Spacious densities are unchanged. On a 1920 screen a full week with long class names went from 204 of 211 cards cut to 2; at Windows 125% the sample school went from 315 of 374 to none.
- In the Fit density, a card in the first lesson of a day is now as wide as the cards beside it. The thick line between days was drawn inside that lesson's column and took 3px of its card, so on Windows a full week with long class names still showed five cards as "41…" at 1920. They now read "415D", "450C" and so on; the other columns are a quarter of a pixel narrower.

## [2.2.0] - 2026-09-26

### Added

- Two lessons can be kept off the same day: on a lesson's sheet, "Not on the same day" lists the lessons it may not share a day with and adds one from a list grouped by class. Dragging, automatic arrangement and the suggestions all keep the rule, a drop onto the related lesson's day says why it is refused, and a relation added after both lessons were placed shows in Check as a broken rule, with nothing moved.
- Dropping a block on several blocks that fill exactly the hours it lands on now offers to swap them: a teacher's 2-hour block in one class and their two single hours in another trade places in one step, the singles going to the block's old hours in the same order.

### Changed

- Each release page on GitHub now says what is new in that version, in Turkish and in English, above the download and install notes.
- The waiting-lessons tray now opens into the room the timetable is not using,
  and fades at its bottom edge when there are more cards below it. On a real
  school in the desktop window that is 38 cards in view instead of 19, with
  nothing taken from the grid.
- While a card is being dragged, every card in the target row shows the cell's own verdict as a coloured ring, so a filled cell no longer hides whether the card could go there.
- When a week cannot be laid out, a panel under the result line now lists the ways it could be, each as a sentence you could say to a teacher ("KY could also come on Saturday, periods 3–4"): hours on a day the teacher already comes, the fewest hours side by side, the fewest teachers asked, hours and limits together, limits only, a lesson given to another teacher of the same subject, and, as a last resort, block shapes or weekly hours. A class's own closed hours are never suggested. Each way comes with the week it was found with, checked against the rules, and one button puts the change and the week in at once, as a single undo step. The ways appear as they are found, the first within a few seconds, and a way still being improved says so. Under "Details", "Not possible" on any change looks again without it, and a ruled-out change can be taken back. If the week can in fact be built and automatic arrangement just missed it, the panel says so and places it. When no way exists with the placed lessons kept where they are, the search goes on laying them out again, pinned lessons excepted, and the panel says so.
- The suggestion panel now works like an answer book. "Questions" on a way lists what to ask each teacher ("KY: can you come on Saturday, periods 11–12?"), each with "Yes" and "Not possible". "Not possible" on a teacher's hours can mean only those hours, that whole day, at most a chosen number of hours that day, or no change at all for that teacher. A "Yes" is kept at no cost, and every way then says only what is needed on top of it. The answers are saved with the plan, so they are still there after the program is closed, and Ctrl+Z takes one back. The questions can be copied or printed on their own sheet.
- "Show on the grid" draws a way's week on the timetable before anything is applied: the teacher hours it opens are marked, the lessons that move are outlined, and the rest steps back. One button switches between the current and the suggested week, and the view scrolls to the first opened hour.
- Two new ways give a lesson to another teacher of the same subject so that fewer closed hours have to open: one hands over as few lessons as possible, the other opens as few hours as possible with at most three lessons handed over. A way that hands over more than three lessons is no longer shown.
- After "Not possible", the search starts again from the weeks it had already found and looks further around them, so the answer is as small as before the refusal allows: on a real school, refusing one teacher's Saturday now gives 5 hours instead of 8.
- About now shows how the last suggestion search ran on this computer (how many threads, time to the first suggestion and to the end), and every saved file of all plans carries the last twenty such measurements.
- Automatic arrangement no longer gives up on a lesson when it gets stuck. It keeps repairing the best timetable it found, moving the fewest lessons out of the way each time. On a real school where every class's open hours exactly match its lessons, it now lays out the whole week in about a second, where before it stopped with five lessons missing.
- When a week truly cannot be laid out, automatic arrangement now stops on its own once it is no longer getting anywhere, instead of always running for the full 15 seconds.


### Fixed

- The notice after a drop now reads in the past tense in every language, and in the new language right after the language is switched. French and the German and Spanish plurals used to keep the future tense or come out garbled.
- The consecutive-hours limit sentence ("at most N hours in a row") is now translated; it was Turkish in all five languages.
- The empty Timetable, Check and Print screens now point to the Lessons tab for entering lessons, not the School tab.
- Opening a very old (version 1 or 2) backup no longer lists every class as having its own daily limit or paints all classes the same colour.
- When the week is complete and some teachers, classes or rooms are only tight, Check now says there is no problem and names the tight rows, instead of "there are points to watch" above rows marked impossible that did not exist.
- Switching the language no longer leaves the status pill in the top bar in the old language until the next edit.
- When automatic arrangement gets stuck, the reason it gives now names what blocks the lesson in the hours its class still has free: a teacher, a room, a rule or the block's length. Before, a class whose open hours exactly matched its lessons always got the class's own closed hour as the reason.
- Dragging a card across a full week no longer stutters: the reason bar above the grid is rewritten at most ten times a second instead of once per cell.
- Scrolling the grid while holding a card now moves the highlighted row with it. Before, the undimmed strip stayed where it was on the screen while the rows scrolled away underneath.
- Availability and Print no longer crash when their list goes from empty to filled while the tab is open, for example after Ctrl+Z.
- Handing a lesson to another teacher from the entity panel now says how many blocks went back to the pool.
- The dark theme no longer flashes a light background on the first frame while the program is opening on a slow machine.

## [2.1.1] - 2026-09-01

### Added

- Program ribbon: a Colour menu that colours cards by teacher, class, room or subject.
- Dropping a card on another card swaps the two, when both moves are allowed.
- A dot on the About button in the Settings ribbon while there are unread release notes.

### Changed

- Fit density gives the space it saves on row headers and day separators to the lesson columns.
- When text size is below 100 percent, card text shrinks with it.

### Fixed

- The app window opens filling the screen, not in a small box.
- In Fit density, card text is no longer cut off: the class number reads "411", not "4…".

The three Added items come from the commit itself; the in-app notes for 2.1.1
gained them on 2026-09-26, before 2.2.0.

## [2.1.0] - 2026-09-01

### Added

- Class and teacher gap rules, planning analysis, and Advisor notes.
- A help screen for keyboard shortcuts (top bar, Ctrl+K, or the ? key).
- A What's new panel in Settings > About, with a dot on the Settings tab until it is seen.

### Changed

- Dragging timetable cards is about 63 percent faster on dense timetables.
- The Windows taskbar icon uses the detailed logo at 20 pixels and above.
- Hovering a 2 or 3 hour block highlights every column it covers.
- Dropping a block at the end of a day moves its start back so that it fits.
- Auto-arrange leaves fewer empty hours inside class days.

### Removed

- The unnecessary Subject label in Lessons > By class.

## [2.0.6] - 2026-08-31

No program changes compared with 2.0.5, only the version number. Record
incomplete: nothing records why 2.0.6 followed 2.0.5 fifteen minutes later, and
the fixes listed under 2.0.5 may have reached users only with 2.0.6.

## [2.0.5] - 2026-08-31

### Fixed

- Windows app: Check for updates failed with "Unexpected address" after the repository was renamed. It works again, and copies of 2.0.2 can update.
- An up-to-date copy says it is up to date instead of showing an address error.
- If a newer version exists but this copy cannot download it, the message names the version and points to the Releases page.
- The "latest version" website address shown by the program returned 404. It points to the right site now.

## [2.0.3] - 2026-08-31

Tagged, but the release build failed and nothing was published. Its only change,
pointing the updater at the renamed repository, was reworked in 2.0.5.

## [2.0.2] - 2026-08-31

### Added

- Right-click menu on cards in the lesson tray: edit the lesson, teacher or class, and temporary view.

### Changed

- The block split is chosen from one button that lists every combination of 3, 2 and 1 hour blocks. Options that break a hard daily limit are shown locked, with the reason.
- The longest block is 3 hours. Lessons saved with 4 hour blocks open as 3 + 1, keeping placements and pins.
- Unavailable hours in Program use the same large red cross as Availability.
- Load filters in the Rooms, Teachers and Classes lists use the same calculation as the Check tab.

### Fixed

- Fit density: no horizontal scrolling at 1280, 1366 and 1920 pixel widths or at larger text sizes.
- Availability: the Hours toggle did nothing in Fit density.
- A stray, inactive sort mark next to list search.

## [2.0.1] - 2026-08-30

### Added

- Right-click menu on placed lessons: send to the tray, edit the lesson, teacher or class, pin here, pin a row, column or day, and temporarily dim or hide a row or day.
- Pinning. A pinned lesson cannot be dragged, removed or covered, and Re-arrange and Clear timetable leave it in place. Each card has a pin button.
- Edit a lesson in place: class, teacher, subject, weekly hours, split and maximum per day. Blocks that no longer fit after a move go back to the tray.
- The side panel for a teacher, class or room can edit it.
- Named alternative timetables inside one plan: create, copy, rename, delete.
- Rename a subject everywhere it is used.
- A per-class limit for hours of the same lesson per day.
- Lesson tray: five sort orders, a subject filter, and cards grouped under headings.
- Blocks can be 2, 3 or 4 hours long.
- Text size can go down to 80 percent.
- Releases include SHA256SUMS.txt. MIT license added.

### Changed

- Subject abbreviations in grid row headers, the availability list and teacher dropdowns.
- Each list has its add form in a separate panel. In side summaries only the list scrolls, and problems are shown first.
- Program ribbon reordered: View first, alternatives and grid actions in menus.
- Check tab ribbon buttons switch the section shown.
- Taller rows in Availability. Shorter help texts on every screen.
- Settings: the Motion and Language panels moved left, and each section shows a summary at the right of the ribbon.
- Output: the two page pickers sit side by side with a single scroll area.
- The taskbar icon uses the simple drawing at 16, 20 and 24 pixels.
- Windows install scripts no longer use -ExecutionPolicy Bypass.
- The sort arrow shows the current direction.

### Fixed

- The Windows app 2.0.0 opened with no data because its data folder had changed. The old folder is used again.
- Ribbon buttons and the page below no longer shift sideways when switching options.

## [2.0.0] - 2026-08-29

### Added

- The full interface in Turkish, English, German, Spanish and French. The first language follows the device, with English as the fallback.

### Changed

- The program is called Mozaik. Saved data, backup file names and the Documents folder keep their old names.

### Known issues

- The Windows app opens with no data. Fixed in 2.0.1.

## [1.4.0] - 2026-08-28

### Added

- A Lessons tab with three modes: By class, By teacher, All. The form remembers the chosen class.
- Teachers can have a second subject.
- A language setting in Settings > Appearance. Only a few strings were translated in this release.
- Row numbers and a sort direction toggle in lists. Teacher and class filters in Lessons.
- A setting that stops the ribbon hiding itself while scrolling.

### Changed

- Tabs renamed: Setup is School, Print is Output. Subjects moved from Settings to School.
- New projects start with an empty subject list, and the built-in subjects are offered as suggestions.
- Settings has five sections: Bell and days, Rules, Appearance, Plans and backup, About.
- The Check tab is a single page, and its ribbon jumps to Problems, Teachers, Classes and Rooms.
- A 2 hour block is drawn as one wide card. Identical waiting blocks are stacked in the tray.
- Density applies to lists too. Subjects follow the order set in Settings.
- Paste from Excel moved to the panel header. Numbers removed from colour swatches.
- The taskbar icon uses the detailed drawing from 20 pixels. Updating refreshes the icon of an existing shortcut.

### Fixed

- The hover crosshair drifted left on rows containing 2 hour blocks.
- Large print text overflowed the page.
- Side columns made some pages much longer than needed.

## [1.3.0] - 2026-08-27

This release also carries the changes numbered 1.2.0, which was never published.

### Added

- The Windows app can update itself: Check, Download, Restart now. It goes online only when clicked.
- Lesson split: enter the weekly hours, then choose a split such as 1+1+1 or 2+1.
- Manual ordering of subjects.

### Changed

- The lesson tray shows one card per block.
- 3 hour blocks removed, blocks are 1 or 2 hours.
- The default theme is light and no longer follows the system setting.
- Sample data moved to Settings > Data, and Setup shows a one-time hint.
- The taskbar icon adds 20, 24 and 40 pixel sizes.
- Long dashes removed from on-screen text.

### Fixed

- Auto-arrange left hours in the tray when the weekly hours did not divide by the block size.
- The local server install did not work offline when opened at a deep link.

## [1.1.0] - 2026-08-27

The first published release: the HTML file, the Windows install zip and the
Windows exe. This entry summarises the work before it and is not exhaustive.

### Added

- A weekly grid (rows are teachers or classes) with drag and drop, a lesson tray, colour-coded drop targets with reasons, and undo.
- School lists with paste from Excel, availability for teachers, classes and rooms, bell times, day selection, and limit rules set to Off, Warn or Block.
- A Check tab that explains why lessons cannot be placed.
- Auto-arrange and Re-arrange.
- Printing one class or teacher per A4 landscape page, with 1, 2 or 4 timetables per sheet, text size and page selection.
- Several plans, drafts, export of all plans in one file, and a panel showing where data is stored.
- Saving to a chosen folder with a daily backup, keeping the last 10.
- A dark theme, 36 identity colours, text size, grid density and motion settings.
- A command palette (Ctrl+K), a side panel for a teacher, class or room, search, sort and filter in lists, manual row order, and teacher gender.
- An offline website, a Windows local-server install, and a Windows exe.
- The version shown in Settings. The website offers Reload or Later when a new version is ready, and Guncelle.cmd downloads the latest version.
