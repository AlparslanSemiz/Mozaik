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

### Added

- A lesson you drop or swap by hand is pinned where you put it, so "Kalanı diz" and "Yeniden yap" leave it alone; the notice says so and "Geri al" undoes the move and the pin together. A drop onto a cell that refuses now says why, in a notice and on the bar, instead of nothing.
- Send a teacher their timetable as a PDF: on the teacher's page and in Print, "WhatsApp" saves the sheet as `Mozaik – Name – date.pdf` in Downloads and opens the chat with that teacher's number; the e-mail button saves the same file to attach. A class's page has "Save PDF". Teachers have a phone field (schema v19); the number only goes into the WhatsApp link you click.
- Every printed sheet has a line at the top with the plan, the date and "Page 2 of 5"; class sheets explain the teacher codes ("MÇ Mehmet Çelik"); no printed text is smaller than 7 pt; "Save as PDF" suggests a file name like `Mozaik – 510 – 2026-11-16`. The print date is now on by default.

- Substitutes (İkame): a teacher's page has "Bugün yok…" (not here today), and the Program strip has "Bugün kim yok?" (who is away today). The date's page lists the absent teacher's lessons that day, each with the teachers free at that hour, same subject first, then whoever has covered least this week, then those at school that day anyway; or "Boş geçsin" (the class is free). A class can be away too (a trip, an exam week), which frees its teachers. "Yazdır" prints the day's cover list. A substitute's page counts their covers. A single lesson can also be dropped or moved to a free hour of the same day for that date only ("Bir dersi değiştir…"). The strip says when this week has changes; "Programda göster" draws that week on the timetable with the changed hours marked, "Temel haftaya dön" goes back, and one button takes the week back to the usual one. The weekly timetable itself never changes. Plan files from this version (schema 18) ask an older copy of Mozaik to be updated rather than opening without these changes.
- Linux: a single `Mozaik-linux-x86_64.AppImage` for Ubuntu 22.04 and later, Debian 12 and Fedora, with the CP-SAT suggestion search built in. It updates itself from Settings → About like the Windows and Mac programs, checked against the same signature; kept in a folder it cannot write, it says to move it before downloading anything. A release whose Linux build fails still ships Windows, the Mac and the web.
- Automatic layout now makes the week better after it has placed every card: it moves and swaps whole cards, never breaking a rule and never touching a pinned or kept card, to give fewer free hours between a teacher's lessons, fewer days a teacher has to come in and fewer gaps in a class's day, and to keep "Warn" rules unbroken where it can. On the sample school a teacher waits 61 free hours a week instead of 271; on the father's course 118 instead of 151.
- "Yeniden yap" (Make it again) lays out the unpinned lessons as a different week under the same rules on every press; "Geri al" brings the week before back.
- When "Kalanı diz" (Place the rest) cannot fit a card into the week as it stands (after a lesson's split or teacher was changed, say), it lays the unpinned week out again close to the old one and names the lessons that moved: on the sample school 17 of 433 cells change, where a full rebuild changes 418.
- When the layout gets stuck because someone has more lessons than open hours, the bar says so first, with the numbers: "AY: 18 hours of lessons, 15 open; 3 more must be opened"; the same for a class and for a room two classes share, and for two lessons that may not share a day but need more days than the week has.
- "File ▾ → Go back to an earlier day" (Eski hâline dön): every day Mozaik keeps a copy of each plan as the last day you worked on it left it, by itself, for the last 7 days. The list shows each day by name and date ("Tuesday 12 November") with its teachers, lessons and placed hours; "Go back to yesterday" puts that day back. The plan as it was a moment before is kept as today's copy first, and "Undo" brings it back. When the browser's storage is full the copies make room for the plan, oldest first. Ctrl+K finds it by "dün" (yesterday) too.
- The site has its own address now, <https://mozaik.alparslansemiz.com/>; the program shows that one. The old address keeps working. A copy opened at the old address says so once the new one answers, and "Move plans" copies every plan there; the new address asks before it puts them in place, and nothing is deleted at the old one. If the new address cannot take them, all plans are saved to a plan file instead.
- The "Save" button's tooltip says when the last plan file was saved. In a browser that does not write to a chosen folder, one strip appears when changes have gone a week without a plan file; "Later" hides it for the session.

- "Getting started" on the School tab is now a checklist of five tasks: introduce the school (name, days, bell and the four lists), enter the lessons, mark the hours people cannot come, make the timetable, print. Each task ticks itself from the plan and has a button that takes you to its first missing part; the first one shows the week a new plan starts with (Tuesday to Sunday, 12 hours a day) so you can see whether it is right. The list folds to one line with the next task and, once everything is done or it is closed, to a single "show the list" link; "?" → Getting started brings it back too. It no longer disappears when the first teacher is added.
- Lessons warns while you enter them when a class or teacher gets more lesson hours than open hours ("9A: 54 lesson hours, 48 open hours. 6 hours do not fit the week."), and the class or teacher is marked red in the list on the right.
- The empty Program, Check, Printing, Availability and Lessons screens have a button that takes you to the missing step, and one for the school's name and bell while it is not set.
- Wherever Mozaik says it needs updating to open a file, a "See the update" button opens Settings → About.
- On a touch screen (iPad), holding a finger on a lesson card for half a second opens the same menu as a right click, so a lesson can be sent back to the tray without a mouse. A finger drawn across Availability now closes every hour it passes over, instead of only the first one, and no longer scrolls the page.

- Each teacher's week can be sent by e-mail from Çıktı: "Open in e-mail" opens a new message in your own mail program with the teacher's address and the week as plain text, and you press Send; Mozaik sends nothing itself. The address is typed on the teacher's page (plan file version 17; older backups open with no addresses) or pasted from Excel as a sixth column. If no mail program is chosen, one line says so.

- A Mac version: `Mozaik-mac-arm64.dmg` for Apple silicon and `Mozaik-mac-x86_64.dmg` for Intel Macs, macOS 11 or later. Drag Mozaik into Applications. It has its own window and a Turkish menu bar (copy, paste and undo work in every box), saves every plan into `~/Documents/Ders Programı` on its own, uses OR-Tools CP-SAT for suggestions like the Windows installer does, and updates itself from Ayarlar → Hakkında, checking our signature before it installs anything. It is not signed by an Apple developer account yet, so the first launch needs Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç once (README, "Mac"). If it runs from the disk image instead of Applications, it says to move it there before updating.
- The Program grid and the Müsaitlik sheet work with the keyboard alone. A lesson card can be placed or moved without a mouse: Enter (or T) on a card in the tray, or T and the new "Taşı" item in a placed card's menu, picks it up; the arrow keys move the target along the row with the same green, yellow and red answer a drag gives, Ctrl+→ jumps to the next hour it fits, Enter drops it and Esc puts it back. The grid is now one Tab stop instead of one per card and pin (414 on a full week): the arrow keys move from cell to cell, Home and End go to the row's ends, P pins the focused card, and a focused cell at the edge scrolls into view. In Müsaitlik every hour and every heading is a button: the arrow keys move, Space or Enter opens or closes the hour, or on a heading the whole day or hour. The shortcuts screen (?) lists all of it, plus Ctrl+Shift+Z, Backspace and the tray handle's keys.

- Linux: `scripts/linux-kur.sh` installs Mozaik as an application that opens the same single file in Google Chrome's app mode, with a Chrome profile of its own, and running it again updates it. The README says how to move your plans over from the site.

### Changed

- Teacher pages have a one-click "Save PDF" (also without an e-mail address or phone number). "Bugün yok…" now only opens the window; the absence is written when you press "Bugün gelmiyor olarak işaretle", and closing the window writes nothing.
- Print opens on teachers. Its side column now reads Print, Page layout (with "Renkli bas"), What is on the sheet, Send, Summary.
- Summary lists only the teachers and classes whose hours do not fit, or one sentence when all do; the subject list and the gender line are gone from it (the chips above the list say the same).
- A person's page is shorter: second subject, gender and colour are under "Diğer bilgiler"; "Başka öğretmene aktar…" is in each lesson row's "…" menu.
- "+ Yeni öğretmen" and "+ Yeni sınıf" are also at the top of their lists. "Bütün dersler tek listede" is the "Hepsi" row of the lessons list; Planlar ve yedek and Hakkında are buttons on the school-info strip (the release-note dot is on Hakkında), and the empty "Daha fazla" menus are gone from the people and school-info strips.
- Notices stay longer: 10 seconds, and 20 seconds when they have a "Geri al" button.

- The Program button is "Kalanı diz" (Place the rest) everywhere, also on an empty week; when nothing waits it shows "Hepsi yerleşti" (All placed) in its place, and the lesson tray is hidden until a lesson goes back to it. "Başka bir program yap" is gone: "Yeniden yap" does both. "Bu planın kopyası" moved from the Program strip's "More" to File ▾. A lesson's right-click menu starts with "Sabitle" (Pin).
- Wording pass, one name per thing: the screen counts hours only (the tray says "433 saat bekliyor", the result line "Program yapıldı: 433 saat yerleşti."); closed hours are "Kapalı saatler" and open ones "Açık saat" everywhere, "müsait" is gone; rule overruns are "aşım"; the toolbar is "Düğme satırı". Fewer sentences: no Ctrl+Z reminders in messages, no repeated "nothing wrong" lines, the e-mail list names only people with an address or number and says in one sentence how many have none, the Branşlar "Varsayılan" column shows only when a short form differs, the rules strip no longer repeats the table.
- Screen readers: the lunch-break column headers of the grid have a name, a card's spoken name starts with what is written on it, the scrolling tables in School details are reachable by keyboard, and the dot for a new release note is announced.
- Screen audit, symmetry: the page now stands the same distance from the left and the right edge, and the top bar and the tool strip line up with it; every right-hand panel column is the same width on every screen; the gap between the two columns is the gap between two panels; panel headings are one size and the "?" sits on the heading's line; every control in the top bar is the same height, and so are the buttons, boxes and menus in a list row; the bold tab no longer slides the strip sideways. A person's page puts its buttons (Print, Send, WhatsApp...) on a row of their own.
- Screen audit, for low vision: menu and dropdown highlights are solid and readable; a disabled main button is grey with readable text; search, chips, "?" and colour swatches have a visible focus ring and bigger targets; the pin on a card is faintly visible; the preview of a changed week keeps the cards readable; a cell that refuses a dropped card is striped as well as tinted; side-by-side cards have a thin gap; the rule counts on the Rules strip are no longer drawn as an alarm; in the dark theme menus, dialogs and pages are a step lighter than the panels and the panels have a visible edge.
- From a usability walkthrough as the father: when nothing is waiting but the week has problems, the main button is "Redo" instead of a greyed-out "Make the timetable", and the tray no longer says "All placed" beside "1 problem"; the status chip is amber while hours are unplaced. Redoing the week offers "Back to the previous timetable" in a passing notice and no longer brings a red "undo the last deletion" strip after a reload (that strip, now neutral, is kept for real deletions). Pasting teachers from Excel detects the columns (by a header row, or by the cells: known subjects, short upper-case codes) and previews a table with a choice per column, so a two-column "Name · Subject" paste no longer files the subject as the short name. The grid and the teacher pickers say the teacher's surname or full name rather than initials where it fits. Text size is four named steps (Normal, Large, Larger, Very large), also in the "?" menu and Ctrl+K; an older saved size still draws as it was. At 130 % and up on a 1366 screen the tabs move to a row of their own instead of "?" wrapping alone; tabs and menus are 14 px. The lesson form says "Filter by subject" and "Spread over the week" with an example; a person's page lists their lessons above the closed hours and adds a lesson in place; the bell times stand beside the days; "Delete everything" has a panel of its own, away from "Load the sample school"; the web version says it updates itself.
- Five tasks instead of seven places (the third step of the simplification): Program · Teachers · Classes · Print and send · School details, on Alt+1 to Alt+5. Teachers and Classes each hold their list and, behind the strip's "Lessons" button, the lesson form for one teacher or class; every lesson in one list is in their "More ▾", and a person's page has "Enter lessons". School details holds the bell and days, rooms, subjects, rules and appearance, with Plans and About in "More ▾"; Getting started sits at its top, and an empty plan opens there. The Availability tab is gone: the hours someone cannot come are on their page, which now also has "Open the whole week" and "Close the whole week"; a room's are on the room's page. The Check tab is gone too: the status chip opens the list of problems over whatever is on screen, with everything the tab had (lessons on a closed hour, broken rules, lessons that cannot be placed, tips, and the three load tables in "More ▾"); "Open in Availability" became "Open their page", and a card in the tray has "Why is it not placed?" at the top of its right-click menu. A second arrangement of the week is a second plan: Program → More → "Copy of this timetable" opens a copy and the plan picker appears with it; the separate "variant" menu is gone, and an older file with several variants still opens with each of them in the plan picker.
- The Program grid always fits the screen by itself: the whole week is in view at every window size, the way "Fit" drew it. The "Roomy / Comfortable / Fit" choice and the separate density for lists are gone; how big everything is drawn is School details → Appearance → Text size. The start time under each hour number is no longer drawn on the grid (it is in the heading's tooltip and on every printed sheet). A density saved by an older copy is simply ignored.
- The grid's right-click menu is shorter: "Pin several" (a whole row, column or day) and "Set aside for now" (fading or hiding rows and days for the session) are gone, and a right-click on a heading opens nothing. A lesson is still pinned with the pin on its card, and the whole week with More ▾ → "Pin the whole timetable".
- One page per person (the second step of the simplification). In School → Teachers and Classes the lists are plain text — full name, short name, subject, weekly hours and a short status such as "not in on Tue, Thu" — and clicking a name opens that teacher's or class's page on the right. Everything about the person is there, in the order the work is done: details (name, short name, subject, second subject, e-mail, gender, colour; a class's room and colour), the hours they cannot come as the Availability grid itself with clock times, their lessons with the weekly hours and "hand to another teacher", their limits (each says whether the school's number or their own applies; their own wins), and Print, Send and Delete. Print puts just that person's sheet on paper in two clicks from the list, without touching the choices in Çıktı; Send opens the e-mail with their week, or says where to type the address. Delete still asks nothing and offers Undo. The boxes, colour button and limit columns on every list row and the add form above the list are gone: "+ New teacher" and "+ New class" at the end of the list open an empty page. Availability's heading opens the person's page, the "own limits" lists in Settings → Rules open it too, and Çıktı's tick list and e-mail list show full names.
- A calmer screen (the first step of a simplification Alp approved on 2026-11-16). Every screen has one filled button, its main job ("Make the timetable", "Add", "Print"), and a "More ▾" menu at the right end of the tool strip that holds what is rarely used, in the same place on every screen: on Program the rebuild, the timetable variants, colour, pinning everything and clearing the grid. The top bar holds only the tabs, the status, the school's name, Undo, Save and "?"; "File ▾" has Save, Open, Copy for a new term, Plans and Redo, and "?" has search, keyboard shortcuts, Getting started and About. The theme is set in Settings → Appearance only, folding the tool strip moved there too, and the strip no longer hides itself while you scroll unless you turn that on. The plan picker appears once there is a second plan.
- Explanations moved behind a "?" beside each panel's heading, so a screen shows at most a sentence or two. Repeated counts, "How full the week is", "Free class hours left" and the solver wording are gone; the storage keys and search threads in About are under a closed "Technical details", and the release notes are folded. Check says "The timetable is complete" once every lesson is placed, instead of "it can be laid out".
- New names on screen, in all five languages: "Fill automatically (N cards)" is "Make the timetable", "Lay out from scratch" is "Make it again", "Advisor" is "Tips", the rule levels "Blocker / Warning" are "Strict / Preference", "N hours in the tray" is "N hours not placed", and a card is called a lesson.
- Ctrl+K finds jobs as well as places: typing "print", "save", "open", "copy", "backup", "school name", "theme", "text size" or "make the timetable" does it or opens the one place it is done.
- The selected tab is one neutral style; colour is kept for teachers, classes and states. A pressed choice is underlined instead of filled.
- The program file is about 160 kB smaller (1.32 MB to 1.15 MB): the English, German, Spanish and French texts no longer each carry their own copy of the Turkish sentences, and a language is only unpacked when it is chosen.
- Windows app: a copy that is not installed (the single Mozaik.exe) is now offered the installer of its own version in Settings → About ("Install Mozaik on this computer": the suggestion search's CP-SAT comes only with it), and once in a strip right after it has been updated. The installer runs with a progress bar instead of silently, and if it does not finish Mozaik opens again with a message that gives the code. The old Mozaik.exe is no longer deleted: it opens the installed program, so desktop icons and taskbar pins keep working.
- Windows app: the suggestion search runs at a lower priority while CP-SAT works, so the window stays usable on a two-core computer.

- Opening a plan file into an empty plan no longer asks first, because nothing can be lost; opening it over a plan that holds something still asks.
- After "Add" in Lessons the weekly hours go back to 4 and the split to single hours, so the last lesson's number is not reused by mistake.
- Adding a teacher without a subject now says "Önce bir branş seçin" (choose a subject first) instead of greying out the button without a word.
- Clearer messages: a file Mozaik did not save (an Excel file, say) is told which file to choose and where Excel lists are pasted; the two-windows warning and the "could not be read at startup" warning say what to press; an empty draft says it can be deleted and made again; update errors in the Windows app are plain sentences with the system's own words in brackets.
- Clearer words: Settings shows "= 72 hours a week", Availability explains its "open / lesson hours" numbers and its buttons are "Open the whole week" and "Close the whole week", the teacher table explains "In a row", "Per day ↑" and "Per day ↓" under it, "Fill automatically (27 cards)" says what the number counts, and the printing hint names the browser's own "More settings" and "Background graphics".
- At 1366 × 768 and at 125 % the teacher table no longer scrolls sideways (the summary moves under it), and the print preview shrinks to fit instead of being cut off on the left.
- Screen readers: a lesson card on the grid is named with its day and hour, its row, its class or teacher, its room and any conflict; a closed hour is read as "kapalı" or "müsait değil" instead of "×"; the grid has a name; removing a card with Delete says so and keeps focus on the same cell instead of dropping it to the top of the page; Müsaitlik's hours say whether they are open, and its "48/0" counters are read as words.
- Every idea on screen now has one name, and no word stands for two ideas. A "plan" is a whole saved school (a new first plan is called "Plan 1"); "program" is only the laid-out weekly timetable; a timetable variant inside a plan is a "seçenek" (variant), so the strip's menu says "Seçenek", "Bu seçeneğin kopyası" and "Boş seçenek", and a new one is "Seçenek 1"; the application itself is "Mozaik" ("Mozaik'i güncelleyin" instead of "Programı güncelleyin"). A period of the day is a "saat" ("3. saat", "Günlük saat sayısı"), the piece you move on the grid and in the tray is a "kart" ("2 kart bekliyor"), and "blok" is left for the 2- or 3-hour split of a lesson. A teacher has a "Kısa ad" (subjects keep their "kısaltma"), teachers are "müsait" or "müsait değil", the hard rule level is "Engel" and the soft one "Uyarı", Danışman lists "notlar", the single-plan file is a "plan dosyası", the sample button is "Örnek okulu yükle" everywhere, and each tool strip is named after its tab. The English, German, French and Spanish texts follow the same rule (German "Stundenplan" for the timetable, "Plan" for the plan; Spanish "copia de seguridad" for a backup). Saved data, file names and plans made before keep their names and open unchanged.
- The in-app note for 2.1.0 said Ctrl+K opens the keyboard help; it is the top-bar button or the "?" key (Ctrl+K opens search).
- Deleting a lesson, a teacher, a class, a room, an unused subject or a timetable variant (seçenek), "Programı boşalt" and "Baştan diz" (lay out from scratch) no longer ask first: the change happens and a notice says what went with it, with a "Geri al" (undo) button. Deleting a room names the classes that lost it and says, in plain words, that they can now be placed at the same hour; deleting a variant no longer mentions "0 pins". The notice stays for 10 seconds, and its clock stops while the mouse is over it or the keyboard focus is in it. Only the newest notice keeps its button; if something else changed in between, pressing it says so and points to Ctrl+Z instead of closing silently.
- "Her şeyi sil" (delete everything) asks once instead of twice, and can be undone from its notice or with Ctrl+Z. Loading the sample school over a plan no longer says it cannot be undone: it can, from its notice.
- Switching, adding, renaming or deleting a timetable variant no longer clears the undo history. Switching is not itself a step: Ctrl+Z takes back the last change and brings back the variant it was made in.
- After "Sil" in a list the keyboard focus moves to the next row's "Sil" (the previous one on the last row, the add box when the list is empty) instead of dropping to the top of the page. A screen reader hears how to undo ("Geri almak için Ctrl+Z") with each deletion notice, and what was undone after Ctrl+Z.
- Kontrol no longer marks a class "Sıkışık" (tight) just because its lessons fill its open hours, which a full course does on purpose; a class is flagged only when its lessons do not fit. Teachers and rooms keep the warning.
- When "Fill automatically" gets stuck, the panel shows only the first way the week can be built; the others fold under "Other ways (N)". While it searches, one line with the seconds and a progress bar replaces the row per way.
- Check → Advisor says a repeated note once, with the lessons or teachers it is about listed after it, instead of the same sentence for each.
- The weekly-hours and daily-limit boxes in the lists now have names for screen readers, and the counts on the filter chips are easier to read.
- Screen readers: every box in Setup's teacher, class and room rows and every number box in Settings → Rules now has a name; the program screen, the tray and the printed sheet have headings in order, and the empty Timetable, Check and Print screens have one too; the tool strip is a named region; boxes that scroll (the tray, the load tables, the side panel in About) can be reached and scrolled with the keyboard; and "Fill automatically" says when it starts and what it managed, instead of reading out its counter many times a second.
- The first Tab on every screen is "İçeriğe geç" (skip to content), which jumps past the top bar and the tool strip to the screen itself. The close button on a notice, the status chip and the names at the start of a grid row show the same focus ring as the other controls.
- The notes in Settings are now as large as the body text.
- A new icon: a calendar page with five coloured lessons on it, on the same indigo. The browser tab, the top bar and the smallest Windows icon sizes use a simpler version of it with three lessons, so they stay sharp.
- Every list now shades every second row, the same way in every list and a little more visibly in both themes, so a row is easier to follow across the screen: the setup lists and summary tables, the picking list beside Availability and Lessons, the lessons in a teacher's or class's panel, and the preview when pasting from Excel. Grey secondary text is darker in the light theme and lighter in the dark theme, so it reads at least as well on a shaded row as it did before. Boxes and drop-downs inside a list keep the page's own colour with a clearer edge, and the split button in Lessons now looks like the boxes beside it.
- Easier to read for weaker eyes. In the Program grid the lesson cards are larger (14 and 13 px instead of 12) and their second line is as dark as the first; the bell times under the hour numbers are larger and no longer run into each other; a closed hour is a quiet grey cross on the hatching instead of a large red one. The selected tab has a solid colour with white or dark text that is easy to read in both themes. Boxes, drop-downs and buttons have a clearly visible edge, the grey hint inside an empty box is darker, and the green, yellow and red badges and status lines use darker text on their own colour. Check boxes, the notice's close button, the row handles and the names at the start of each grid row are bigger targets. In a narrow window or at Windows' 150% and 200% scaling the tab names move under their icons and the strip's buttons keep a smaller word, instead of turning into icons only; if the top bar still does not fit, it takes a second row. With a Windows contrast theme the lesson cards keep their frame and the selected tab and pressed buttons are highlighted.
- The row under the mouse is outlined instead of changing colour, so its text never gets harder to read; the selected name in the picking list is written in the normal text colour on its highlight, and the open plan is marked on its row in Plans. The row handle, the colour box and the split button show the same keyboard focus ring as the other controls.
- Check → Problems now says what to do and lets you go there. A lesson left on an hour that was closed afterwards is one row however many hours it has, naming the lesson, its hours and who closed them, with "Show" (opens the Timetable and marks that card) and "Open in Availability" (opens that teacher's, class's or room's row). Rule breaches have "Show" too. Lessons with nowhere left to go are grouped by the reason that actually binds ("AY is available 20 hours and has 24 hours of lessons", "every open hour of class 410A is taken", or what keeps the class's free hours from this lesson), with each lesson as a button that marks its card in the tray.
- The status in the top bar keeps two words ("3 problems", "2 warnings", "45 hours in the tray") on a narrow screen instead of shrinking to a dot, so it no longer looks like a switch. Clicking it opens Check, as before.
- Deleting a teacher now says which classes lost which subject ("MB deleted. 4 classes lost English: 410, 411, 510, 511."), since nothing else shows it once the lessons are gone.

- Mozaik answers faster on a slow computer. Dropping a card or undoing now shows the move on the grid at once and updates the tray, the counts and the status chip a moment later, instead of freezing for a quarter of a second. Opening Print shows the first pages at once and adds the rest while you look (printing still gets every page). Durdur stops a run at once; the end of an automatic run shows the week before the search for suggestions starts. Typing in the teacher and lesson search boxes no longer waits for the list.

### Fixed

- In Safari, leaving the Program tab and coming back kept the timetable but jumped it back to the top-left corner; it now stays where you left it.
- In the .exe, downloading an update no longer gives up after five minutes in all, which a slow line could never beat for the 31 MB installer: it stops only when no data arrives for a minute, and Settings → About shows how far it is.
- "Yeni hâlini asıl dosya yap" now applies to that one save. A later deletion of most of the plan in the same session is again kept out of the folder's main file.
- Rescue and before-deletion files in the folder no longer pile up: the newest ten of each kind are kept.
- If the app opens empty while the folder (Belgelerim\Ders Programı in the .exe) holds a fuller plan file, a strip says so, with "Belgelerim'deki son kaydı aç" (open it) and "Boş başla" (start empty); nothing is written to the folder until one is pressed. Before this, a wiped app profile opened empty, the first teacher typed in went over the whole school in the folder's main file and today's backup, and on each following day one more real daily backup was pruned.
- A change that would leave the plan with under half the rooms, teachers, classes and lessons of the folder's last file no longer goes over it: it is written to that day's rescue file (`ders-programi-kurtarma-YYYY-MM-DD.json`) and a strip says so, with buttons to open the folder's copy or, after a question, keep the smaller plan. The daily backup with the most work in it is never pruned.
- Deletions that ask no question (class, room, subject, option, teacher, lesson, "Empty the timetable", "Lay out again"), "Delete everything", the sample school over a plan and "Open from file" now keep the plan as it was before them. After a reload, if the plan has not changed since, a strip offers it once: "Son silmeyi geri almak için: Geri getir". Before this their undo lived only in memory and a reload lost it. In a folder the copy is also written as that day's `ders-programi-silmeden-once-YYYY-MM-DD.json`.
- When a plan's saved text is not even JSON, the folder line now turns red and names the plan instead of the folder silently not being written.
- "Open all from file" names the plans it skips because they have no id or repeat an earlier one's, instead of dropping them without a word.
- The plan list is no longer rewritten at every start, and fields a newer copy of Mozaik put in it are kept.
- On the site, Mozaik asks the browser to keep its storage (`persist`) after the first real change, so it is not cleared when space runs low or, in Safari, after a week without a visit.
- A site update could store the previous version under the new version's name for up to ten minutes; the service worker now asks past the browser's cache.
- Saving a plan file could fail in some Safari versions, because the file's address was released in the same moment as the click.

- Check counted a lesson on closed hours once per hour, so one two-hour lesson read "2 lessons" in the heading and in the top bar.
- Closing a dialog (search, keyboard shortcuts, a question, a teacher's or class's panel, a lesson's window) with Esc or a button puts the keyboard back where it was, on the button or card that opened it, instead of at the top of the page. If that is gone, the keyboard lands in the screen's content.
- In the dark theme the Print preview is drawn on light paper again, as it prints; the lesson names on the coloured cells were hard to read.
- A notice that happened to be on screen ("Backup loaded.") no longer comes out on every printed page.
- If the list of plans read empty when the program opened, it used to be replaced by a single "1. plan", and every other plan, though still saved, could no longer be opened. The program now finds those plans and lists them again as "Recovered plan 1, 2, …".
- When two lessons that must not share a day are both pinned on the same day, "Fill automatically" no longer searches for a minute and then shows an empty list of ways: the panel says at once which two lessons are pinned and that one of them has to move, and Check says it too.
- The program now checks that a downloaded update is exactly the published file (its SHA-256 digest), not only that it is a whole Windows program of the right size. A published version without a digest is not downloaded; the program says where to get it by hand.
- When the plan open last time can no longer be read, the first plan that can be read opens instead of an empty one, every time the program starts; the unreadable plan is kept exactly as it was, and one line says which plan it was. In Settings → Plans and backup such a plan now reads "unreadable" instead of "no data", shows no counts, and deleting it says that its text goes too.
- "Open from file" no longer opens a plan in which two lessons, or a teacher, class or room and another one, share an id, or one has none; such a file is refused as unreadable. "Open all from file" leaves such a plan out and counts it with the broken ones.
- "Open all from file" given a file that was cut short now says the file cannot be read, instead of sending you to the top bar's "Open from file".
- "Open all from file" now says that a plan written by a newer version of the program needs the program updated, instead of calling it incomplete or broken.
- "Open all from file" no longer opens a plan whose teacher, class, lesson or room list is missing as an empty plan, and no longer deletes the plan on this computer to make room for it. Such a plan is left out, the question before replacing says how many are left out, and the plan on this computer that it would have replaced stays. A file in which no plan can be read changes nothing and asks nothing.
- "Open all from file" with the browser's storage full no longer deletes the plans on this computer when not one plan from the file could be saved, and no longer says that nothing changed. The plans here stay and the note says that storage may be full.
- "Open from file" in the top bar no longer does nothing, silently, with a file that has a broken row in it. It says the file cannot be read, and the open plan stays as it was.
- In the desktop program, closing the window within two seconds of a change no longer leaves the copy in Documents\Ders Programı one change behind. The window now waits until the change is written, and closes on its own after five seconds if the page does not answer.
- In the bell preview, the lunch rows no longer break the shading of the lesson rows around them, and in Subjects the subjects that are not on the list start a new group below a line instead of continuing the shading out of step.
- A teacher's or class's panel no longer loses the box of its transfer drop-down on a shaded row.
- A page that reads its storage as empty when it opens no longer saves that empty plan over the plan that is saved there. This was seen once, after a reload of the HTML file: the plan came up empty and would have been replaced 0.4 seconds later. Such a page now writes nothing over the saved plan and says so in a red strip, with a Reload button.
- With the program open in two browser tabs, closing the tab that had not been used no longer wipes out the work done in the other one. A tab that sees another tab change the open plan now stops saving and says so in a red strip, with a Reload button; a closing tab saves only an edit that is still waiting to be saved.
- When this computer's storage is full, a change that cannot be saved is now said in a red strip at the top, instead of "Sample data loaded." over a save that never happened. In the desktop program, the folder under Documents also gets a rescue copy for that session, which the next start does not overwrite.
- A saved plan this copy cannot read, because a newer version wrote it or because it was cut short, is no longer replaced by an empty plan when the program opens, when you switch to it, or when the plan before it is deleted. A red strip says why and that nothing was written over it; opening a file in its place or deleting the plan is what replaces it.
- In the desktop program, opening with empty or unreadable storage no longer overwrites the files in Documents\Ders Programı with an empty set of plans. The first write waits until a plan has really been read or you change something, an empty set of plans never goes over a file that holds work, and the daily backups that are deleted after ten days count only the ones that hold work.
- Reopening the program without changing anything no longer pushes the session backups along, so a few reloads after a bad session keep the good one. A backup this copy cannot read is now listed under Settings → Plans and backup instead of being left out.
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

### Security

- Windows app: the window now runs under a strict Content Security Policy (no remote scripts, styles, fonts or connections). Updates are only ever downloaded up to the size the release states, and the installer is run from a new folder of its own in the temporary folder. The fast suggestion search's library is loaded only by an installed copy, from its own folder.

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
- A help screen for keyboard shortcuts (top bar, or the ? key; Ctrl+K opens search, not the help).
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
