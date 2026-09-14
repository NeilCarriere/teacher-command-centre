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

Version 15 automatically migrates the earlier v14 local data and backup format. The active course roster remains authoritative: historical student records are retained but are never silently re-added to a current class.

## Project structure

- `index.html` — accessible app shell
- `styles.css` — chalkboard / wood-frame interface
- `app.js` — application logic, persistence, migration, and backup handling
