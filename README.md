# Neil's Teacher Command Centre

A private, local-first teacher dashboard designed for iPad and desktop use.

## What it does

- Tracks active courses and rosters without embedding student names in the public source.
- Records attendance (P / A / E / L), including past dates and a month-at-a-glance view.
- Tracks participation, student notes, assignments, tests, quizzes, reminders, missing work, and quick reports.
- Uses calendar pickers for assignment due dates and test / quiz dates.
- Lets you mark an assignment as **Marked & Handed Back** so it clears from the active Assignment Tracker while its student marks remain in Reports.
- Flags 5 / 10 / 15 / 20 cumulative A+E attendance thresholds.
- Exports and restores the complete dashboard backup, including tests and quizzes.

## Data and recovery

The app saves only in the browser on the device where it is used. Use **Save for Winston** to copy the complete backup, or **Paste Backup** to preview and restore it. Restore verifies both data buckets before reloading Home and keeps a complete local pre-import recovery copy.

The active course roster remains authoritative. Participation levels are recorded by date, while earlier one-time levels remain visible as prior summaries. Removing a student through Manage Classes clears their attendance, participation, notes, and assignment entries for that class. Restoring an updated backup follows the same rule: students not on its course roster are not retained. Keep a saved backup if you may need to recover a departed student's records.

## Project structure

- `index.html` — accessible app shell
- `styles.css` — chalkboard / wood-frame interface
- `app.js` — application logic, persistence, migration, roster sorting, assignment tracking, and backup handling
- `assessments.js` — tests and quizzes with editable results

## Running marks (Grade 9–10)

Reports average classroom evidence and participation evidence separately, then use `(classroom × 65 + participation × 15) / 80` before the 20% final. When only one component has evidence, that component is shown provisionally. Blank days, unmarked work and N/A do not become zeroes. Dated participation uses the agreed level percentages; an undated prior level is used only when dated entries are absent. Each recorded unexcused absence (A) contributes one 0% daily participation entry, replacing any level on that date in the calculation only. Excused days (E) are excluded. Recorded levels remain intact, so correcting attendance restores their use. Present/late days without participation marks do not invent evidence. A+E alert thresholds remain unchanged.

Choose **Pass / Incomplete (participation)** when adding or editing an assignment. Pass contributes Level 4 (85%) to participation only; Incomplete remains open with no numeric mark. Existing assignments keep their grading mode. Assignments explicitly flagged as participation evidence contribute to the 15% component rather than being counted twice. Completion results are stored separately so changing grading modes preserves earlier marks. Backup version 22 preserves completion results and remains able to restore older backups.

## October cleanup

Home omits the Attendance Alerts and Missing Work summary boxes; reporting and threshold notifications remain available. Empty test/quiz entries outside the current roster are removed, while unmatched entries with evidence are retained. Student/class renames now carry test/quiz records, and explicit student removal also removes their test/quiz entries. No student names or backups are embedded in the published source.
