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
