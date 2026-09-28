(() => {
  'use strict';

  const APP_KEY = 'teacher_command_centre_v15';
  const PRE_IMPORT_KEY = 'teacher_command_centre_v15_before_import';
  const ASSESSMENTS_KEY = 'teacher_command_centre_assessments_v1';

  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const byId = (id) => document.getElementById(id);

  function parseBackup(raw) {
    let value = String(raw || '').trim();
    const fence = '```';
    if (value.startsWith(fence)) {
      value = value.slice(3).trimStart();
      if (value.toLowerCase().startsWith('json')) value = value.slice(4).trimStart();
    }
    if (value.endsWith(fence)) value = value.slice(0, -3).trimEnd();
    if (!value) throw new Error('Paste the complete backup data first.');

    try {
      return JSON.parse(value);
    } catch (firstError) {
      const marker = '"format": "teacher-command-centre-winston-export"';
      const markerIndex = value.indexOf(marker);
      const start = markerIndex >= 0 ? value.lastIndexOf('{', markerIndex) : value.indexOf('{');
      const end = value.lastIndexOf('}');
      if (start >= 0 && end > start) return JSON.parse(value.slice(start, end + 1));
      throw firstError;
    }
  }

  function restore(parsed) {
    if (!isObject(parsed)) throw new Error('This is not valid dashboard backup data.');

    let next;
    if (parsed.format === 'teacher-command-centre-winston-export' || isObject(parsed.teacherApp)) {
      const app = isObject(parsed.teacherApp) ? parsed.teacherApp : {};
      if (!isObject(app.studentData) || !isObject(app.studentData.students)) {
        throw new Error('This backup does not contain student dashboard data.');
      }
      next = {
        appVersion: Number(parsed.version) || 21,
        currentClass: app.currentClass || app.studentData.currentClass || '',
        courses: app.courses || { courses: [] },
        studentData: app.studentData,
        assignmentTracker: isObject(parsed.assignmentTracker) ? parsed.assignmentTracker : { classes: {} },
        reminders: Array.isArray(parsed.reminders) ? parsed.reminders : []
      };
    } else if (isObject(parsed.students)) {
      next = {
        appVersion: 21,
        currentClass: parsed.currentClass || '',
        courses: { courses: [] },
        studentData: parsed,
        assignmentTracker: { classes: {} },
        reminders: []
      };
    } else {
      throw new Error('I could not find Teacher Command Centre data in that backup.');
    }

    const current = localStorage.getItem(APP_KEY);
    if (current) localStorage.setItem(PRE_IMPORT_KEY, current);
    localStorage.setItem(APP_KEY, JSON.stringify(next));
    if (isObject(parsed.assessments)) localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(parsed.assessments));

    const verification = JSON.parse(localStorage.getItem(APP_KEY) || 'null');
    const courseCount = verification?.courses?.courses?.length || 0;
    const studentCount = Object.values(verification?.studentData?.students || {})
      .reduce((total, course) => total + Object.keys(course || {}).length, 0);
    if (!verification || !studentCount) throw new Error('The browser did not retain the restored student data.');

    sessionStorage.setItem('teacher_command_centre_restore_notice', `Backup restored: ${courseCount} classes and ${studentCount} students.`);
    location.reload();
  }

  function showError(error) {
    const status = byId('backupStatus');
    if (status) status.textContent = 'Backup not restored: ' + (error?.message || 'The backup could not be read.');
    else window.alert('Backup not restored: ' + (error?.message || 'The backup could not be read.'));
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest?.('[data-action="restore-pasted"]');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      restore(parseBackup(byId('restorePayload')?.value || ''));
    } catch (error) {
      showError(error);
    }
  }, true);

  document.addEventListener('change', async (event) => {
    const input = event.target;
    if (input?.id !== 'restoreFile' || !input.files?.[0]) return;
    event.stopImmediatePropagation();
    try {
      restore(parseBackup(await input.files[0].text()));
    } catch (error) {
      showError(error);
    }
  }, true);

  window.addEventListener('DOMContentLoaded', () => {
    const notice = sessionStorage.getItem('teacher_command_centre_restore_notice');
    if (!notice) return;
    sessionStorage.removeItem('teacher_command_centre_restore_notice');
    setTimeout(() => {
      const status = byId('saveStatus');
      if (status) status.textContent = '✓ ' + notice;
    }, 50);
  });
})();
