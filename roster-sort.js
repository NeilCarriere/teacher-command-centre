(() => {
  'use strict';

  const STORAGE_KEY = 'teacher_command_centre_v15';
  const RELOAD_GUARD = 'teacher_command_centre_roster_sort_reload';
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

  function clean(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ');
  }

  function nameParts(value) {
    const name = clean(value);
    const parts = name.split(' ').filter(Boolean);
    const last = parts.length > 1 ? parts.pop() : (parts[0] || '');
    const first = parts.join(' ');
    return { full: name, last, first };
  }

  function compareStudents(a, b) {
    const left = nameParts(a);
    const right = nameParts(b);
    return collator.compare(left.last, right.last)
      || collator.compare(left.first, right.first)
      || collator.compare(left.full, right.full);
  }

  function sortList(students) {
    if (!Array.isArray(students)) return false;
    const before = students.join('\u0000');
    students.sort(compareStudents);
    return before !== students.join('\u0000');
  }

  function sortStoredRosters() {
    let state;
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_) {
      return false;
    }
    if (!state || !Array.isArray(state?.courses?.courses)) return false;

    let changed = false;
    state.courses.courses.forEach((course) => {
      if (sortList(course?.students)) changed = true;
    });

    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return changed;
  }

  function sortThenRefresh() {
    window.setTimeout(() => {
      if (!sortStoredRosters()) return;
      sessionStorage.setItem(RELOAD_GUARD, '1');
      window.location.reload();
    }, 0);
  }

  const sortedOnLoad = sortStoredRosters();
  if (sortedOnLoad && sessionStorage.getItem(RELOAD_GUARD) !== '1') {
    sessionStorage.setItem(RELOAD_GUARD, '1');
    window.location.reload();
    return;
  }
  sessionStorage.removeItem(RELOAD_GUARD);

  const studentForm = document.getElementById('studentForm');
  if (studentForm) studentForm.addEventListener('submit', sortThenRefresh);

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-action="rename-student"]');
    if (button) sortThenRefresh();
  });
})();
