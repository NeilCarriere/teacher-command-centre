# Neil's Teacher Command Centre

A private, local-first teacher dashboard designed for iPad and desktop use.

## What it does

- Tracks active courses and rosters without embedding student names in the public source.
- Records attendance (P / A / E / L), including past dates and a month-at-a-glance view.
- Tracks participation, student notes, assignments, reminders, missing work, and quick reports.
- Flags 5 / 10 / 15 / 20 cumulative A+E attendance thresholds.
- Includes Canadian-first Today in History and a current Canadian news card.
- Exports and restores the complete `teacher-command-centre-winston-export` backup format.

## Data and recovery

The app saves only in the browser on the device where it is used. Use **Backup & Restore** to download a recovery file or copy the complete data for the Winston workflow.

Version 17 keeps the active course roster authoritative. Participation levels are recorded by date, while earlier one-time levels remain visible as prior summaries. Removing a student through Manage Classes clears their attendance, participation, notes, and assignment entries for that class. Restoring an updated backup follows the same rule: students not on its course roster are not retained. Keep a downloaded backup if you may need to recover a departed student's records.

## Project structure

- `index.html` — accessible app shell
- `styles.css` — chalkboard / wood-frame interface
- `app.js` — application logic, persistence, migration, and backup handling
