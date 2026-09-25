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

The app saves only in the browser on the device where it is used. Use **Backup & Restore** to download a recovery file or copy the complete data for the Winston workflow.

The active course roster remains authoritative. Participation levels are recorded by date, while earlier one-time levels remain visible as prior summaries. Removing a student through Manage Classes clears their attendance, participation, notes, and assignment entries for that class. Restoring an updated backup follows the same rule: students not on its course roster are not retained. Keep a downloaded backup if you may need to recover a departed student's records.

## Project structure

- `index.html` — accessible app shell
- `styles.css` — chalkboard / wood-frame interface
- `app.js` — application logic, persistence, migration, roster sorting, assignment tracking, and backup handling
- `assessments.js` — tests and quizzes with editable results

## Running marks (Grade 9–10)

Reports average classroom evidence and participation evidence separately, then use `(classroom × 65 + participation × 15) / 80` before the 20% final. When only one component has evidence, that component is shown provisionally. Blank days, unmarked work and N/A do not become zeroes. Dated participation uses the agreed level percentages; an undated prior level is used only when dated entries are absent. Attendance totals remain visible but do not automatically create a mark.

Choose **Pass / Incomplete (participation)** when adding or editing an assignment. Pass contributes Level 4 (85%) to participation only; Incomplete remains open with no numeric mark. Existing assignments keep their grading mode. Assignments explicitly flagged as participation evidence contribute to the 15% component rather than being counted twice. Completion results are stored separately so changing grading modes preserves earlier marks. Backup version 21 preserves completion results and remains able to restore older backups.
