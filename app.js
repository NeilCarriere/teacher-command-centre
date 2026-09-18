(() => {
  'use strict';

  const APP_VERSION = 18;
  const STORAGE_KEY = 'teacher_command_centre_v15';
  const PRE_IMPORT_KEY = 'teacher_command_centre_v15_before_import';
  const LEGACY_KEYS = {
    state: [
      'neil_teacher_dashboard_v2',
      'neil_teacher_restore_pending_v1',
      'neil_teacher_dashboard_v1'
    ],
    courses: 'neil_teacher_classes_v1',
    assignments: 'neil_teacher_assignments_v1',
    reminders: 'neil_teacher_reminders_v1',
    nonSchoolDays: 'neil_teacher_non_school_days_v1'
  };
  const ATTENDANCE_CODES = ['P', 'A', 'E', 'L'];
  const ATTENDANCE_LABELS = { P: 'Present', A: 'Absent', E: 'Excused', L: 'Late' };
  const THRESHOLDS = [5, 10, 15, 20];
  const BOARD_NON_SCHOOL_DATES = new Set([
    '2026-09-01', '2026-09-07', '2026-10-12', '2026-10-26', '2026-11-27',
    '2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24', '2026-12-25',
    '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01',
    '2027-01-29', '2027-02-15', '2027-03-15', '2027-03-16', '2027-03-17',
    '2027-03-18', '2027-03-19', '2027-03-26', '2027-03-29', '2027-04-23',
    '2027-05-24', '2027-05-28', '2027-06-28'
  ]);
  const COURSE_ACCENTS = ['#63d68b', '#63b3ed', '#c58cff', '#f6d365', '#ff9f5a'];
  const VIEWS = {
    dashboard: {
      eyebrow: 'TEACHER COMMAND CENTRE',
      title: 'Good day, Neil.',
      subtitle: 'Everything important, without the pile of patches.'
    },
    attendance: {
      eyebrow: 'REVIEW · CORRECT · FOLLOW UP',
      title: 'Attendance History',
      subtitle: 'Choose the day you need—not only today.'
    },
    assignments: {
      eyebrow: 'TRACK · REVIEW · FOLLOW UP',
      title: 'Assignment Tracker',
      subtitle: 'One clean source of truth for classroom work.'
    },
    notes: {
      eyebrow: 'OBSERVATIONS THAT STAY USEFUL',
      title: 'Student Notes',
      subtitle: 'Useful evidence, without hunting through scraps of paper.'
    },
    reports: {
      eyebrow: 'QUICK FACTUAL SNAPSHOT',
      title: 'Reports',
      subtitle: 'Attendance, participation, notes, and assignment follow-through in one place.'
    },
    manage: {
      eyebrow: 'THE ACTIVE ROSTER DRIVES THE APP',
      title: 'Manage Classes',
      subtitle: 'Keep current classes tidy. Removing a student clears their records for that class.'
    },
    backup: {
      eyebrow: 'LOCAL-FIRST · PORTABLE · RECOVERABLE',
      title: 'Backup & Restore',
      subtitle: 'Your proven workaround is now built directly into the clean version.'
    }
  };
  const WORDS = [
    ['Resilience', 'The ability to recover quickly from difficulties.'],
    ['Curiosity', 'A strong desire to know, learn, or understand.'],
    ['Empathy', 'The ability to understand and share another person’s feelings.'],
    ['Perseverance', 'Continuing toward a goal despite difficulty or delay.'],
    ['Integrity', 'Being honest and guided by strong moral principles.'],
    ['Perspective', 'A particular way of viewing or understanding something.'],
    ['Adaptability', 'The ability to adjust effectively to new conditions.'],
    ['Collaboration', 'Working together to create or achieve something.'],
    ['Initiative', 'The ability to begin or act without being prompted.'],
    ['Reflection', 'Careful thought about an experience, idea, or decision.'],
    ['Momentum', 'Forward progress that becomes easier to continue.'],
    ['Kindness', 'The quality of being friendly, generous, and considerate.']
  ];
  const TEACHING_QUOTES = [
    'A classroom changes when a student realizes someone believes they can succeed.',
    'Good teaching turns curiosity into momentum.',
    'Every student brings a story to the room. Great teaching makes space for it.',
    'Teaching is the daily work of turning possibility into progress.',
    'The best classrooms are built on curiosity, patience, and the courage to try again.',
    'A small moment of encouragement can become a very large part of a student’s story.',
    'The work matters because the people in the room matter.',
    'Some days the win is a breakthrough. Some days the win is simply getting them to try.',
    'When students feel safe enough to be wrong, they become brave enough to learn.',
    'The lesson matters, but the relationship often determines whether the lesson gets through.'
  ];
  const DAILY_THOUGHTS = [
    'Small steps still move you forward.',
    'The next useful step is usually smaller than the problem makes it look.',
    'A little order creates a surprising amount of breathing room.',
    'Done with care beats perfect in theory.',
    'Keep what works. Change what does not. Continue.',
    'The unfinished list is not evidence that nothing was accomplished.',
    'Good systems make room for imperfect humans.',
    'Make today useful, not impossible.',
    'Start where you are, with what is actually available.',
    'A small adjustment today can save a great deal of frustration tomorrow.'
  ];
  const CANADIAN_HISTORY = {
    '2-15': {
      year: '1965',
      title: 'Canada’s maple-leaf flag is first raised',
      text: 'Canada’s current national flag was officially raised for the first time on Parliament Hill. The design helped create a distinct national symbol used across the country and around the world.',
      trivia: 'The red-and-white design was selected after a long national debate about symbols and identity.'
    },
    '4-9': {
      year: '1917',
      title: 'Canadian Corps captures Vimy Ridge',
      text: 'All four divisions of the Canadian Corps fought together in the First World War assault on Vimy Ridge. The battle became an important, though complicated, symbol in Canadian collective memory.',
      trivia: 'The Canadian National Vimy Memorial in France honours Canadians who served in the First World War.'
    },
    '6-21': {
      year: '1996',
      title: 'National Indigenous Peoples Day is first celebrated',
      text: 'Canada first marked a national day recognizing First Nations, Inuit, and Métis peoples on the summer solstice. It is a time to learn about Indigenous histories, cultures, contributions, and contemporary life.',
      trivia: 'The day was originally called National Aboriginal Day and was renamed in 2017.'
    },
    '7-1': {
      year: '1867',
      title: 'Canadian Confederation',
      text: 'The British North America Act came into force, creating the Dominion of Canada from Ontario, Quebec, Nova Scotia, and New Brunswick. Canada has changed considerably since that first Confederation.',
      trivia: 'The anniversary was known as Dominion Day until it was renamed Canada Day in 1982.'
    },
    '9-10': {
      year: '1939',
      title: 'Canada declares war on Germany',
      text: 'Canada formally declared war on Germany one week after Britain and France entered the Second World War. The decision followed debate in Canada’s own Parliament, reflecting Canada’s growing independence in foreign affairs.',
      trivia: 'More than one million Canadians and Newfoundlanders served during the Second World War.'
    },
    '9-11': {
      year: '2001',
      title: 'Operation Yellow Ribbon welcomes diverted flights',
      text: 'After airspace in the United States closed following the September 11 attacks, Canada received hundreds of diverted international flights. Communities, especially in Atlantic Canada, welcomed thousands of stranded travellers.',
      trivia: 'Gander, Newfoundland became internationally known for its extraordinary community response.'
    },
    '9-30': {
      year: '2021',
      title: 'Canada observes its first National Day for Truth and Reconciliation',
      text: 'The federal statutory holiday honours Survivors of residential schools, the children who never returned home, their families, and communities. It is an important day for reflection, learning, and action.',
      trivia: 'Orange Shirt Day, observed on the same date, grew from Phyllis Webstad’s story of attending residential school.'
    },
    '11-11': {
      year: '1918',
      title: 'Armistice ends major fighting in the First World War',
      text: 'The armistice between the Allies and Germany took effect at 11 a.m., ending major fighting on the Western Front. In Canada, November 11 is observed as Remembrance Day.',
      trivia: 'The phrase “the eleventh hour of the eleventh day of the eleventh month” refers to the armistice taking effect.'
    }
  };

  let state;
  let migratedLegacyData = false;
  let pendingImport = null;
  let historyItem = null;
  const ui = {
    view: 'dashboard',
    selectedDate: todayISO(),
    selectedMonth: monthISO(),
    attendanceCourse: '',
    assignmentCourse: '',
    selectedAssignmentId: '',
    notesCourse: '',
    notesStudent: '',
    reportCourse: '',
    reportStudent: '',
    manageCourse: ''
  };

  const byId = (id) => document.getElementById(id);
  const asArray = (value) => Array.isArray(value) ? value : [];
  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

  function text(value) {
    return String(value ?? '').trim();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function safeParse(raw, fallback = null) {
    if (!raw || typeof raw !== 'string') return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  function readLocal(key, fallback = null) {
    try { return safeParse(localStorage.getItem(key), fallback); } catch (_) { return fallback; }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Teacher Command Centre could not save local data.', error);
      return false;
    }
  }

  function todayISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function monthISO(date = todayISO()) {
    return /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : todayISO().slice(0, 7);
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(text(value));
  }

  function formatDate(value, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) {
    if (!validDate(value)) return 'No date selected';
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat(undefined, options).format(new Date(year, month - 1, day, 12));
  }

  function formatShortDate(value) {
    return formatDate(value, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function uniqueStrings(values) {
    const seen = new Set();
    return asArray(values).map(text).filter((value) => {
      const key = value.toLocaleLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function makeId(prefix) {
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function freshStudentRecord() {
    return { attendance: [], participation: null, participationHistory: [], notes: [], missing: [] };
  }

  function normalizeAttendance(items) {
    const byDate = new Map();
    asArray(items).forEach((entry) => {
      const date = text(entry?.date);
      const status = text(entry?.status).toUpperCase();
      if (validDate(date) && ATTENDANCE_CODES.includes(status)) byDate.set(date, { date, status });
    });
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  function normalizeParticipationHistory(items) {
    const byDate = new Map();
    asArray(items).forEach((entry) => {
      const date = text(entry?.date);
      const level = Number(entry?.level);
      if (validDate(date) && [1, 2, 3, 4].includes(level)) byDate.set(date, { date, level });
    });
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  function normalizeStudentRecord(record) {
    const source = isObject(record) ? record : {};
    const participation = Number(source.participation);
    return {
      ...source,
      attendance: normalizeAttendance(source.attendance),
      participation: [1, 2, 3, 4].includes(participation) ? participation : null,
      participationHistory: normalizeParticipationHistory(source.participationHistory),
      notes: asArray(source.notes).filter(isObject).map((note) => ({
        ...note,
        id: text(note.id) || makeId('note'),
        text: text(note.text),
        date: validDate(note.date) ? note.date : todayISO(),
        category: text(note.category) || 'Observation'
      })).filter((note) => note.text),
      missing: asArray(source.missing).filter(isObject).map((item) => ({
        ...item,
        id: text(item.id) || makeId('legacy-missing'),
        name: text(item.name) || 'Unnamed work',
        status: text(item.status) || 'Missing',
        date: validDate(item.date) ? item.date : todayISO(),
        active: item.active !== false
      }))
    };
  }

  function normalizeSubmission(submission) {
    const source = isObject(submission) ? submission : {};
    const mark = source.mark ?? source.achievement ?? '';
    return {
      ...source,
      submitted: Boolean(source.submitted),
      mark: String(mark ?? ''),
      achievement: String(source.achievement ?? mark ?? ''),
      note: text(source.note),
      notRequired: Boolean(source.notRequired),
      notRequiredReason: text(source.notRequiredReason)
    };
  }

  function normalizeCourse(course) {
    const source = isObject(course) ? course : {};
    return {
      name: text(source.name),
      archived: Boolean(source.archived),
      students: uniqueStrings(source.students)
    };
  }

  function normalizeCourses(source, studentMap) {
    let supplied = [];
    if (Array.isArray(source?.courses)) supplied = source.courses;
    else if (Array.isArray(source)) supplied = source;
    if (!supplied.length && isObject(studentMap)) {
      supplied = Object.keys(studentMap).map((name) => ({ name, archived: false, students: Object.keys(studentMap[name] || {}) }));
    }
    const names = new Set();
    return supplied.map(normalizeCourse).filter((course) => {
      const key = course.name.toLocaleLowerCase();
      if (!course.name || names.has(key)) return false;
      names.add(key);
      return true;
    });
  }

  function normalizeAssignment(item, activeStudents) {
    const source = isObject(item) ? item : {};
    const roster = uniqueStrings(activeStudents);
    const rosterNames = new Set(roster);
    const studentData = {};
    if (isObject(source.students)) {
      Object.entries(source.students).forEach(([name, submission]) => {
        const safeName = text(name);
        if (safeName && rosterNames.has(safeName)) studentData[safeName] = normalizeSubmission(submission);
      });
    }
    roster.forEach((name) => {
      if (!studentData[name]) studentData[name] = normalizeSubmission({});
    });
    return {
      ...source,
      id: text(source.id) || makeId('assignment'),
      name: text(source.name) || 'Untitled assignment',
      assigned: validDate(source.assigned) ? source.assigned : todayISO(),
      due: validDate(source.due) ? source.due : '',
      maxMark: Number.isFinite(Number(source.maxMark)) ? Math.max(1, Number(source.maxMark)) : 4,
      grading: text(source.grading) || 'levels',
      archived: Boolean(source.archived),
      participationEvidence: Boolean(source.participationEvidence),
      formativeClasswork: Boolean(source.formativeClasswork),
      students: studentData
    };
  }

  function normalizeTracker(source, courses) {
    const tracker = { classes: {} };
    const rawClasses = isObject(source?.classes) ? source.classes : {};
    Object.entries(rawClasses).forEach(([courseName, value]) => {
      const assignments = asArray(value?.assignments);
      const course = courses.find((item) => item.name === courseName);
      tracker.classes[courseName] = {
        assignments: assignments.map((assignment) => normalizeAssignment(assignment, course?.students || []))
      };
    });
    courses.forEach((course) => {
      if (!tracker.classes[course.name]) tracker.classes[course.name] = { assignments: [] };
      tracker.classes[course.name].assignments = tracker.classes[course.name].assignments
        .map((assignment) => normalizeAssignment(assignment, course.students));
    });
    return tracker;
  }

  function emptyState() {
    return {
      appVersion: APP_VERSION,
      currentClass: '',
      courses: { courses: [] },
      studentData: { currentClass: '', students: {}, assignments: [], lastSavedAt: null },
      assignmentTracker: { classes: {} },
      reminders: []
    };
  }

  function normalizeState(input) {
    const source = isObject(input) ? input : {};
    const appSource = isObject(source.teacherApp) ? source.teacherApp : source;
    const next = emptyState();
    const dataSource = isObject(appSource.studentData) ? appSource.studentData : (isObject(source.studentData) ? source.studentData : {});
    const rawStudents = isObject(dataSource.students) ? dataSource.students : {};
    const courses = normalizeCourses(appSource.courses || source.courses, rawStudents);

    const rosterByCourse = new Map(courses.map((course) => [course.name, new Set(course.students)]));
    Object.entries(rawStudents).forEach(([courseName, studentRecords]) => {
      const roster = rosterByCourse.get(courseName);
      if (!isObject(studentRecords) || !roster) return;
      next.studentData.students[courseName] = {};
      Object.entries(studentRecords).forEach(([studentName, record]) => {
        const safeName = text(studentName);
        if (safeName && roster.has(safeName)) next.studentData.students[courseName][safeName] = normalizeStudentRecord(record);
      });
    });

    courses.forEach((course) => {
      if (!next.studentData.students[course.name]) next.studentData.students[course.name] = {};
      course.students.forEach((student) => {
        if (!next.studentData.students[course.name][student]) {
          next.studentData.students[course.name][student] = freshStudentRecord();
        }
      });
    });

    next.courses = { courses };
    next.assignmentTracker = normalizeTracker(source.assignmentTracker || appSource.assignmentTracker || source.assignments, courses);
    next.reminders = asArray(source.reminders || appSource.reminders).filter(isObject).map((reminder) => ({
      ...reminder,
      id: text(reminder.id) || makeId('reminder'),
      text: text(reminder.text),
      done: Boolean(reminder.done),
      createdAt: text(reminder.createdAt) || new Date().toISOString()
    })).filter((reminder) => reminder.text);

    const active = courses.filter((course) => !course.archived);
    const requestedClass = text(appSource.currentClass || dataSource.currentClass || source.currentClass);
    next.currentClass = active.some((course) => course.name === requestedClass)
      ? requestedClass
      : (active[0]?.name || '');
    next.studentData.currentClass = next.currentClass;
    next.studentData.assignments = asArray(dataSource.assignments);
    next.studentData.lastSavedAt = text(dataSource.lastSavedAt) || null;
    return next;
  }

  function readLegacyComposite() {
    let legacyState = null;
    for (const key of LEGACY_KEYS.state) {
      const candidate = readLocal(key, null);
      if (isObject(candidate) && isObject(candidate.students)) {
        legacyState = candidate;
        break;
      }
    }
    const courses = readLocal(LEGACY_KEYS.courses, null);
    const assignments = readLocal(LEGACY_KEYS.assignments, null);
    const reminders = readLocal(LEGACY_KEYS.reminders, null);
    if (!legacyState && !courses && !assignments && !reminders) return null;
    return {
      currentClass: legacyState?.currentClass || '',
      courses,
      studentData: legacyState || { students: {} },
      assignmentTracker: assignments || { classes: {} },
      reminders: Array.isArray(reminders) ? reminders : []
    };
  }

  function loadState() {
    const saved = readLocal(STORAGE_KEY, null);
    if (isObject(saved)) return normalizeState(saved);
    const legacy = readLegacyComposite();
    if (legacy) {
      migratedLegacyData = true;
      return normalizeState(legacy);
    }
    return emptyState();
  }

  function activeCourses() {
    return asArray(state?.courses?.courses).filter((course) => !course.archived);
  }

  function findCourse(name) {
    return asArray(state?.courses?.courses).find((course) => course.name === name) || null;
  }

  function activeStudents(courseName) {
    return findCourse(courseName)?.students || [];
  }

  function ensureRecord(courseName, studentName) {
    if (!state.studentData.students[courseName]) state.studentData.students[courseName] = {};
    if (!state.studentData.students[courseName][studentName]) {
      state.studentData.students[courseName][studentName] = freshStudentRecord();
    }
    return state.studentData.students[courseName][studentName];
  }

  function assignmentsFor(courseName) {
    if (!state.assignmentTracker.classes[courseName]) state.assignmentTracker.classes[courseName] = { assignments: [] };
    return state.assignmentTracker.classes[courseName].assignments;
  }

  function findAssignment(courseName, assignmentId) {
    return assignmentsFor(courseName).find((assignment) => assignment.id === assignmentId) || null;
  }

  function ensureSelections() {
    const courses = activeCourses();
    const available = courses.map((course) => course.name);
    if (!available.includes(state.currentClass)) state.currentClass = available[0] || '';
    state.studentData.currentClass = state.currentClass;
    ['attendanceCourse', 'assignmentCourse', 'notesCourse', 'reportCourse', 'manageCourse'].forEach((key) => {
      if (!available.includes(ui[key])) ui[key] = state.currentClass;
    });
    if (!activeStudents(ui.notesCourse).includes(ui.notesStudent)) ui.notesStudent = activeStudents(ui.notesCourse)[0] || '';
    const reportRoster = activeStudents(ui.reportCourse);
    if (!reportRoster.includes(ui.reportStudent)) ui.reportStudent = reportRoster[0] || '';
    const selectedExists = findAssignment(ui.assignmentCourse, ui.selectedAssignmentId);
    if (!selectedExists) {
      ui.selectedAssignmentId = assignmentsFor(ui.assignmentCourse).find((assignment) => !assignment.archived)?.id || assignmentsFor(ui.assignmentCourse)[0]?.id || '';
    }
  }

  function save(message = 'Saved locally') {
    ensureSelections();
    state.appVersion = APP_VERSION;
    state.currentClass = state.currentClass || '';
    state.studentData.currentClass = state.currentClass;
    state.studentData.lastSavedAt = new Date().toISOString();
    const ok = writeLocal(STORAGE_KEY, state);
    const status = byId('saveStatus');
    if (status) status.textContent = ok ? `✓ ${message}` : '⚠ Local save failed';
    return ok;
  }

  function exportPayload() {
    return {
      format: 'teacher-command-centre-winston-export',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      teacherApp: {
        currentClass: state.currentClass,
        courses: state.courses,
        studentData: state.studentData
      },
      assignmentTracker: state.assignmentTracker,
      reminders: state.reminders,
      assessments: window.teacherCommandCentreAssessments?.exportData?.()
    };
  }

  function exportText() {
    return JSON.stringify(exportPayload(), null, 2);
  }

  function countAbsences(record) {
    return asArray(record?.attendance).filter((entry) => entry.status === 'A' || entry.status === 'E').length;
  }

  function attendanceStatus(courseName, studentName, date) {
    return asArray(ensureRecord(courseName, studentName).attendance).find((entry) => entry.date === date)?.status || '';
  }

  function customNonSchoolDates() {
    return new Set(asArray(readLocal(LEGACY_KEYS.nonSchoolDays, [])).filter(validDate));
  }

  function isWeekend(date) {
    if (!validDate(date)) return false;
    const [year, month, day] = date.split('-').map(Number);
    const weekday = new Date(year, month - 1, day, 12).getDay();
    return weekday === 0 || weekday === 6;
  }

  function isSchoolDay(date) {
    return validDate(date) && !isWeekend(date) && !BOARD_NON_SCHOOL_DATES.has(date) && !customNonSchoolDates().has(date);
  }

  function schoolDayMessage(date) {
    if (!validDate(date)) return '';
    if (isWeekend(date)) return `${formatShortDate(date)} is a weekend, so attendance entry is blocked.`;
    if (BOARD_NON_SCHOOL_DATES.has(date) || customNonSchoolDates().has(date)) return `${formatShortDate(date)} is marked as a non-school day, so attendance entry is blocked.`;
    return '';
  }

  function setAttendance(courseName, studentName, date, status) {
    if (!findCourse(courseName) || !activeStudents(courseName).includes(studentName) || !validDate(date)) return null;
    if (status && !ATTENDANCE_CODES.includes(status)) return null;
    const record = ensureRecord(courseName, studentName);
    const before = countAbsences(record);
    const index = record.attendance.findIndex((entry) => entry.date === date);
    if (!status) {
      if (index >= 0) record.attendance.splice(index, 1);
    } else if (index >= 0) {
      record.attendance[index].status = status;
    } else {
      record.attendance.push({ date, status });
    }
    record.attendance = normalizeAttendance(record.attendance);
    const after = countAbsences(record);
    const threshold = THRESHOLDS.find((level) => before < level && after >= level) || null;
    save('Attendance saved');
    return threshold;
  }

  function participationLevel(record, date) {
    return asArray(record?.participationHistory).find((entry) => entry.date === date)?.level || null;
  }

  function participationSummary(record) {
    const history = asArray(record?.participationHistory);
    if (history.length) {
      const average = history.reduce((total, entry) => total + entry.level, 0) / history.length;
      return `${average.toFixed(1)} avg · ${history.length} day${history.length === 1 ? '' : 's'}`;
    }
    return record?.participation ? `L${record.participation} prior` : '—';
  }

  function setParticipation(courseName, studentName, date, level) {
    if (!findCourse(courseName) || !activeStudents(courseName).includes(studentName) || !validDate(date) || ![1, 2, 3, 4].includes(level)) return;
    const record = ensureRecord(courseName, studentName);
    record.participationHistory = normalizeParticipationHistory(record.participationHistory);
    const index = record.participationHistory.findIndex((entry) => entry.date === date);
    if (index >= 0 && record.participationHistory[index].level === level) {
      record.participationHistory.splice(index, 1);
      save('Daily participation cleared');
    } else if (index >= 0) {
      record.participationHistory[index].level = level;
      save('Daily participation saved');
    } else {
      record.participationHistory.push({ date, level });
      record.participationHistory = normalizeParticipationHistory(record.participationHistory);
      save('Daily participation saved');
    }
  }

  function assignmentStats(courseName, assignment) {
    const students = activeStudents(courseName);
    let submitted = 0;
    let notRequired = 0;
    let missing = 0;
    students.forEach((student) => {
      const status = normalizeSubmission(assignment.students?.[student]);
      if (status.notRequired) notRequired += 1;
      else if (status.submitted) submitted += 1;
      else missing += 1;
    });
    return { submitted, notRequired, missing, total: students.length };
  }

  function allMissingItems(courseName = '') {
    const items = [];
    activeCourses().forEach((course) => {
      if (courseName && courseName !== course.name) return;
      course.students.forEach((student) => {
        const record = ensureRecord(course.name, student);
        asArray(record.missing).filter((item) => item.active !== false).forEach((item) => {
          items.push({ type: 'legacy', course: course.name, student, name: item.name, status: item.status, due: item.date, id: item.id });
        });
      });
      assignmentsFor(course.name).filter((assignment) => !assignment.archived).forEach((assignment) => {
        course.students.forEach((student) => {
          const row = normalizeSubmission(assignment.students?.[student]);
          if (!row.submitted && !row.notRequired) {
            items.push({ type: 'assignment', course: course.name, student, name: assignment.name, status: assignment.due && assignment.due < todayISO() ? 'Overdue' : 'Missing', due: assignment.due, id: assignment.id });
          }
        });
      });
    });
    return items;
  }

  function countAllRecords() {
    let students = 0;
    let attendance = 0;
    Object.values(state.studentData.students || {}).forEach((course) => {
      Object.values(course || {}).forEach((record) => {
        students += 1;
        attendance += asArray(record?.attendance).length;
      });
    });
    return { students, attendance };
  }

  function currentDayNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function renderHeader() {
    const details = VIEWS[ui.view] || VIEWS.dashboard;
    byId('viewEyebrow').textContent = details.eyebrow;
    byId('viewTitle').textContent = details.title;
    byId('viewSubtitle').textContent = details.subtitle;
    byId('todayLabel').textContent = formatDate(todayISO());
  }

  function renderNavigation() {
    document.querySelectorAll('.nav-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === ui.view);
    });
    document.querySelectorAll('.view').forEach((view) => view.classList.add('hidden'));
    byId(`${ui.view}View`)?.classList.remove('hidden');
  }

  function renderCommandStrip() {
    const index = Math.max(0, currentDayNumber() - 1);
    const word = WORDS[index % WORDS.length];
    const quote = TEACHING_QUOTES[index % TEACHING_QUOTES.length];
    const thought = DAILY_THOUGHTS[(index + 5) % DAILY_THOUGHTS.length];
    byId('commandStrip').innerHTML = `
      <section class="command-card welcome-card">
        <div class="mug-quote"><div class="mug" aria-hidden="true">☕</div><p class="quote-copy">“${escapeHtml(quote)}”<strong>— Quote of the Day</strong></p></div>
      </section>
      <section class="command-card word-card">
        <div class="label">Word of the Day</div>
        <div class="word">${escapeHtml(word[0])}</div>
        <div class="definition">${escapeHtml(word[1])}</div>
      </section>
      <section class="command-card date-card">
        <div class="date-icon" aria-hidden="true">📅</div>
        <div class="daily-thought">“${escapeHtml(thought)}”<div class="doodle-line"></div></div>
      </section>`;
  }

  function renderClassCards() {
    const courses = activeCourses();
    const cards = byId('classCards');
    const empty = byId('emptyState');
    if (!courses.length) {
      cards.innerHTML = '';
      empty.classList.remove('hidden');
      empty.innerHTML = `<h2>Start with your existing backup.</h2><p>This cleaned version stores no student names in the public source. Restore the backup you already use, or create a class and roster from the Manage Classes page.</p><button type="button" class="primary-button" data-action="open-import">Restore Backup File</button> <button type="button" class="secondary-button" data-view="manage">Manage Classes</button>`;
      return;
    }
    empty.classList.add('hidden');
    cards.innerHTML = courses.map((course, index) => {
      const missing = allMissingItems(course.name).length;
      const colour = COURSE_ACCENTS[index % COURSE_ACCENTS.length];
      return `<section class="panel class-card" style="--accent:${colour}" data-action="open-course" data-course="${escapeAttr(course.name)}" tabindex="0" role="button" aria-label="Open ${escapeAttr(course.name)} attendance">
        <h2>${escapeHtml(course.name)}</h2>
        <p>${course.students.length} active student${course.students.length === 1 ? '' : 's'} · ${missing} open item${missing === 1 ? '' : 's'}</p>
        <div class="class-actions">
          <button type="button" class="mini-button" data-action="open-attendance-course" data-course="${escapeAttr(course.name)}">Attendance</button>
          <button type="button" class="mini-button" data-action="open-assignments-course" data-course="${escapeAttr(course.name)}">Assignments</button>
          <button type="button" class="mini-button" data-action="open-notes-course" data-course="${escapeAttr(course.name)}">Notes</button>
        </div>
      </section>`;
    }).join('');
  }

  function attendanceButtons(courseName, studentName, date, status, action) {
    return `<div class="status-group">${ATTENDANCE_CODES.map((code) => `<button type="button" class="status-button ${status === code ? 'active' : ''}" data-action="${action}" data-course="${escapeAttr(courseName)}" data-student="${escapeAttr(studentName)}" data-date="${date}" data-status="${code}" title="${ATTENDANCE_LABELS[code]}">${code}</button>`).join('')}</div>`;
  }

  function participationButtons(courseName, studentName, date, currentLevel) {
    return `<div class="status-group">${[1, 2, 3, 4].map((level) => `<button type="button" class="level-button ${currentLevel === level ? 'active' : ''}" data-action="set-participation" data-course="${escapeAttr(courseName)}" data-student="${escapeAttr(studentName)}" data-date="${date}" data-level="${level}" title="Participation level ${level} for ${escapeAttr(formatShortDate(date))}">${level}</button>`).join('')}</div>`;
  }

  function renderQuickRoster() {
    const courseName = state.currentClass;
    const course = findCourse(courseName);
    byId('quickDate').value = ui.selectedDate;
    byId('quickCourseLabel').textContent = courseName || 'No active class';
    if (!course) {
      byId('quickRoster').innerHTML = '<tbody><tr><td class="empty-copy">Restore a backup or add an active class to begin.</td></tr></tbody>';
      return;
    }
    const canMarkParticipation = isSchoolDay(ui.selectedDate);
    const rows = course.students.map((student, index) => {
      const record = ensureRecord(course.name, student);
      const status = attendanceStatus(course.name, student, ui.selectedDate);
      const openItems = allMissingItems(course.name).filter((item) => item.student === student).length;
      return `<tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(student)}</strong></td>
        <td>${attendanceButtons(course.name, student, ui.selectedDate, status, 'quick-attendance')}</td>
        <td>${canMarkParticipation ? participationButtons(course.name, student, ui.selectedDate, participationLevel(record, ui.selectedDate)) : '—'}</td>
        <td>${openItems ? `<span class="chip warning">${openItems} open</span>` : '—'}</td>
        <td>${countAbsences(record) || '—'}</td>
      </tr>`;
    }).join('');
    byId('quickRoster').innerHTML = `<thead><tr><th>#</th><th>Student</th><th>Attendance</th><th>Participation<br><small>${escapeHtml(formatShortDate(ui.selectedDate))}</small></th><th>Work</th><th>A + E</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="empty-copy">No students are on this active roster yet.</td></tr>'}</tbody>`;
  }

  function renderThresholdSummary() {
    const counts = Object.fromEntries(THRESHOLDS.map((threshold) => [threshold, 0]));
    activeCourses().forEach((course) => course.students.forEach((student) => {
      const total = countAbsences(ensureRecord(course.name, student));
      THRESHOLDS.forEach((threshold) => { if (total >= threshold) counts[threshold] += 1; });
    }));
    byId('attendanceAlertSummary').innerHTML = THRESHOLDS.map((threshold) => `<div class="threshold t${threshold}"><strong>${counts[threshold]}</strong><span>${threshold} A + E</span></div>`).join('');
  }

  function renderMissingSummary() {
    const items = allMissingItems();
    const perCourse = activeCourses().map((course) => ({
      name: course.name,
      count: items.filter((item) => item.course === course.name).length
    }));
    byId('missingSummary').innerHTML = perCourse.length
      ? perCourse.map((entry) => `<div class="compact-item"><span>${escapeHtml(entry.name)}</span><span class="count">${entry.count}</span></div>`).join('')
      : '<p class="empty-copy">No active classes yet.</p>';
  }

  function renderReminders() {
    const reminders = [...state.reminders].sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt.localeCompare(b.createdAt));
    byId('reminderList').innerHTML = reminders.length
      ? reminders.map((reminder) => `<div class="reminder-item ${reminder.done ? 'done' : ''}"><label><input type="checkbox" data-action="toggle-reminder" data-reminder-id="${escapeAttr(reminder.id)}" ${reminder.done ? 'checked' : ''}><span>${escapeHtml(reminder.text)}</span></label><button type="button" class="small-icon" data-action="delete-reminder" data-reminder-id="${escapeAttr(reminder.id)}" aria-label="Delete reminder">×</button></div>`).join('')
      : '<p class="empty-copy">Nothing written down yet. That is allowed.</p>';
  }

  function renderHistory() {
    const fallback = CANADIAN_HISTORY[`${new Date().getMonth() + 1}-${new Date().getDate()}`] || null;
    const item = historyItem || fallback || {
      year: '',
      title: 'A day worth investigating',
      text: 'A Canadian history item will appear here when the live history source is available.',
      trivia: 'This card avoids defaulting to a U.S. event simply because it is prominent in a feed.',
      source: 'Canadian-first history card'
    };
    byId('historyDate').textContent = `TODAY IN HISTORY — ${formatDate(todayISO(), { month: 'long', day: 'numeric' }).toUpperCase()}`;
    byId('historyTitle').textContent = `${item.year ? `${item.year} — ` : ''}${item.title}`;
    byId('historyText').textContent = item.text;
    byId('historyTrivia').textContent = `💡 Trivia: ${item.trivia}`;
    byId('historySource').textContent = item.source || 'Canadian-first daily history selection.';
  }

  function renderDashboard() {
    renderCommandStrip();
    renderClassCards();
    renderQuickRoster();
    renderThresholdSummary();
    renderMissingSummary();
    renderReminders();
    renderHistory();
  }

  function courseOptions(selected, includeArchived = false) {
    const courses = asArray(state.courses.courses).filter((course) => includeArchived || !course.archived);
    return courses.map((course) => `<option value="${escapeAttr(course.name)}" ${course.name === selected ? 'selected' : ''}>${escapeHtml(course.name)}${course.archived ? ' (archived)' : ''}</option>`).join('');
  }

  function daysInMonth(value) {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }

  function isoInMonth(value, day) {
    return `${value}-${String(day).padStart(2, '0')}`;
  }

  function renderAttendance() {
    const courseName = ui.attendanceCourse;
    const course = findCourse(courseName);
    byId('attendanceCourse').innerHTML = courseOptions(courseName);
    byId('attendanceDate').value = ui.selectedDate;
    byId('attendanceMonth').value = ui.selectedMonth;
    const note = schoolDayMessage(ui.selectedDate);
    byId('attendanceSchoolDayNote').classList.toggle('hidden', !note);
    byId('attendanceSchoolDayNote').textContent = note;
    byId('attendanceDayTitle').textContent = `Selected Day — ${formatDate(ui.selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
    if (!course) {
      byId('attendanceDayTable').innerHTML = '<tbody><tr><td class="empty-copy">No active class is available.</td></tr></tbody>';
      byId('attendanceMonthTable').innerHTML = '';
      return;
    }
    const canEdit = isSchoolDay(ui.selectedDate);
    const rows = course.students.map((student, index) => {
      const record = ensureRecord(courseName, student);
      const status = attendanceStatus(courseName, student, ui.selectedDate);
      const participation = participationLevel(record, ui.selectedDate);
      return `<tr><td>${index + 1}</td><td><strong>${escapeHtml(student)}</strong></td><td>${canEdit ? attendanceButtons(courseName, student, ui.selectedDate, status, 'attendance-status') : (status || '—')}</td><td>${countAbsences(record)}</td><td>${canEdit ? participationButtons(courseName, student, ui.selectedDate, participation) : (participation ? `L${participation}` : '—')}</td></tr>`;
    }).join('');
    byId('attendanceDayTable').innerHTML = `<thead><tr><th>#</th><th>Student</th><th>Status</th><th>A + E</th><th>Participation</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="empty-copy">No students are on this active roster yet.</td></tr>'}</tbody>`;

    const totalDays = daysInMonth(ui.selectedMonth);
    const header = Array.from({ length: totalDays }, (_, index) => {
      const date = isoInMonth(ui.selectedMonth, index + 1);
      return `<th title="${escapeAttr(formatShortDate(date))}">${index + 1}</th>`;
    }).join('');
    const calendarRows = course.students.map((student) => {
      const cells = Array.from({ length: totalDays }, (_, index) => {
        const date = isoInMonth(ui.selectedMonth, index + 1);
        const status = attendanceStatus(courseName, student, date);
        const editable = isSchoolDay(date);
        return `<td><button type="button" class="month-cell ${editable ? '' : 'non-school'}" data-action="${editable ? 'open-attendance-picker' : ''}" data-course="${escapeAttr(courseName)}" data-student="${escapeAttr(student)}" data-date="${date}" data-status="${status}" ${editable ? '' : 'disabled'} title="${escapeAttr(editable ? `${student} — ${formatShortDate(date)}` : schoolDayMessage(date))}">${status || (editable ? '·' : '')}</button></td>`;
      }).join('');
      return `<tr><td><strong>${escapeHtml(student)}</strong></td>${cells}</tr>`;
    }).join('');
    byId('attendanceMonthTable').innerHTML = `<thead><tr><th>Student</th>${header}</tr></thead><tbody>${calendarRows || `<tr><td colspan="${totalDays + 1}" class="empty-copy">No students are on this active roster yet.</td></tr>`}</tbody>`;
  }

  function renderAssignments() {
    const courseName = ui.assignmentCourse;
    const course = findCourse(courseName);
    byId('assignmentCourseTabs').innerHTML = activeCourses().map((item) => `<button type="button" class="course-tab ${item.name === courseName ? 'active' : ''}" data-action="select-assignment-course" data-course="${escapeAttr(item.name)}">${escapeHtml(item.name)}</button>`).join('');
    if (!course) {
      byId('assignmentSummary').textContent = 'Add or restore an active class before tracking assignments.';
      byId('assignmentList').innerHTML = '';
      byId('assignmentDetail').innerHTML = '';
      return;
    }
    const assignments = assignmentsFor(courseName);
    const open = assignments.filter((assignment) => !assignment.archived);
    const missing = open.reduce((total, assignment) => total + assignmentStats(courseName, assignment).missing, 0);
    byId('assignmentSummary').textContent = `${open.length} active assignment${open.length === 1 ? '' : 's'} · ${missing} open student item${missing === 1 ? '' : 's'} · ${course.students.length} active student${course.students.length === 1 ? '' : 's'}`;
    byId('assignmentList').innerHTML = assignments.length ? assignments.map((assignment) => {
      const stats = assignmentStats(courseName, assignment);
      return `<article class="assignment-card ${assignment.archived ? 'archived' : ''}">
        <div>
          <h3>${escapeHtml(assignment.name)}</h3>
          <p class="assignment-meta">Assigned ${escapeHtml(formatShortDate(assignment.assigned))}${assignment.due ? ` · Due ${escapeHtml(formatShortDate(assignment.due))}` : ''} · ${escapeHtml(assignment.grading === 'marks' ? `${assignment.maxMark} marks` : `Level ${assignment.maxMark}`)}</p>
          <div class="assignment-stats"><span class="chip success">${stats.submitted} submitted</span><span class="chip warning">${stats.missing} open</span>${stats.notRequired ? `<span class="chip">${stats.notRequired} N/A</span>` : ''}${assignment.participationEvidence ? '<span class="chip">Participation evidence</span>' : ''}${assignment.formativeClasswork ? '<span class="chip">Formative</span>' : ''}${assignment.archived ? '<span class="chip">Archived</span>' : ''}</div>
        </div>
        <div class="assignment-actions"><button type="button" class="secondary-button" data-action="open-assignment" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}">${ui.selectedAssignmentId === assignment.id ? 'Open' : 'Details'}</button><button type="button" class="secondary-button" data-action="edit-assignment" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}">Edit</button><button type="button" class="secondary-button" data-action="archive-assignment" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}">${assignment.archived ? 'Restore' : 'Archive'}</button></div>
      </article>`;
    }).join('') : '<p class="empty-copy">No assignments yet. Add one when you are ready.</p>';
    renderAssignmentDetail(courseName, ui.selectedAssignmentId);
  }

  function renderAssignmentDetail(courseName, assignmentId) {
    const host = byId('assignmentDetail');
    const assignment = findAssignment(courseName, assignmentId);
    if (!assignment) {
      host.innerHTML = '';
      return;
    }
    const course = findCourse(courseName);
    const rows = course.students.map((student) => {
      const row = normalizeSubmission(assignment.students?.[student]);
      return `<tr class="${row.submitted || row.notRequired ? 'submitted-row' : 'missing-row'}"><td><strong>${escapeHtml(student)}</strong></td><td><input type="checkbox" data-assignment-field="submitted" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}" data-student="${escapeAttr(student)}" ${row.submitted ? 'checked' : ''} aria-label="${escapeAttr(student)} submitted"></td><td><input type="checkbox" data-assignment-field="notRequired" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}" data-student="${escapeAttr(student)}" ${row.notRequired ? 'checked' : ''} aria-label="${escapeAttr(student)} not required"></td><td><input type="text" value="${escapeAttr(row.mark)}" data-assignment-field="mark" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}" data-student="${escapeAttr(student)}" aria-label="${escapeAttr(student)} achievement"></td><td><input type="text" value="${escapeAttr(row.note)}" data-assignment-field="note" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}" data-student="${escapeAttr(student)}" aria-label="${escapeAttr(student)} note"></td></tr>`;
    }).join('');
    host.innerHTML = `<section class="detail-panel"><h3>${escapeHtml(assignment.name)}</h3><p class="assignment-meta">Current active roster only. Historical student entries remain in the data but are not re-added to this class.</p><div class="detail-controls"><label><input type="checkbox" data-assignment-toggle="participationEvidence" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}" ${assignment.participationEvidence ? 'checked' : ''}> Participation evidence</label><label><input type="checkbox" data-assignment-toggle="formativeClasswork" data-course="${escapeAttr(courseName)}" data-assignment-id="${escapeAttr(assignment.id)}" ${assignment.formativeClasswork ? 'checked' : ''}> Formative classroom work</label></div><div class="table-wrap"><table class="data-table detail-table"><thead><tr><th>Student</th><th>Submitted</th><th>N/A</th><th>Achievement</th><th>Note</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="empty-copy">No active students are on this roster.</td></tr>'}</tbody></table></div></section>`;
  }


  function renderNotes() {
    const courseName = ui.notesCourse;
    const students = activeStudents(courseName);
    byId('notesCourse').innerHTML = courseOptions(courseName);
    byId('notesStudent').innerHTML = students.map((student) => '<option value="' + escapeAttr(student) + '" ' + (student === ui.notesStudent ? 'selected' : '') + '>' + escapeHtml(student) + '</option>').join('');
    byId('notesList').innerHTML = renderNoteList(courseName, ui.notesStudent, 'Choose an active class and student to review notes.');
  }

  function renderReports() {
    const courseName = ui.reportCourse;
    const course = findCourse(courseName);
    const cards = byId('reportCards');
    const detail = byId('reportDetail');
    byId('reportCourse').innerHTML = courseOptions(courseName);
    if (!course) {
      byId('reportMetrics').innerHTML = '';
      if (cards) cards.innerHTML = '<p class="empty-copy">No active class is available.</p>';
      if (detail) detail.innerHTML = '';
      return;
    }

    const allAssignments = assignmentsFor(courseName).filter((assignment) => !assignment.archived);
    const attendanceTotal = course.students.reduce((total, student) => total + countAbsences(ensureRecord(courseName, student)), 0);
    const missingTotal = allMissingItems(courseName).length;
    const notesTotal = course.students.reduce((total, student) => total + ensureRecord(courseName, student).notes.length, 0);
    byId('reportMetrics').innerHTML = '<div class="metric"><strong>' + course.students.length + '</strong><span>Active students</span></div><div class="metric"><strong>' + attendanceTotal + '</strong><span>Total A + E</span></div><div class="metric"><strong>' + missingTotal + '</strong><span>Open work items</span></div><div class="metric"><strong>' + notesTotal + '</strong><span>Notes</span></div>';

    const selectedStudent = course.students.includes(ui.reportStudent) ? ui.reportStudent : (course.students[0] || '');
    ui.reportStudent = selectedStudent;
    if (cards) {
      cards.innerHTML = course.students.length ? course.students.map((student) => {
        const record = ensureRecord(courseName, student);
        const open = allAssignments.filter((assignment) => {
          const row = normalizeSubmission(assignment.students?.[student]);
          return !row.submitted && !row.notRequired;
        }).length + asArray(record.missing).filter((item) => item.active !== false).length;
        const lates = asArray(record.attendance).filter((entry) => entry.status === 'L').length;
        return '<button type="button" class="report-card ' + (student === selectedStudent ? 'active' : '') + '" data-action="open-report-student" data-course="' + escapeAttr(courseName) + '" data-student="' + escapeAttr(student) + '"><span class="report-card-heading"><strong>' + escapeHtml(student) + '</strong><span>Open profile →</span></span><span class="report-card-stats"><span class="report-card-stat"><strong>' + countAbsences(record) + '</strong><span>A + E</span></span><span class="report-card-stat"><strong>' + lates + '</strong><span>Lates</span></span><span class="report-card-stat"><strong>' + open + '</strong><span>Open work</span></span></span></button>';
      }).join('') : '<p class="empty-copy">No students are on this active roster.</p>';
    }

    if (!detail || !selectedStudent) {
      if (detail) detail.innerHTML = '';
      return;
    }

    const record = ensureRecord(courseName, selectedStudent);
    const lates = asArray(record.attendance).filter((entry) => entry.status === 'L').length;
    const missingLegacy = asArray(record.missing).filter((item) => item.active !== false).map((item) => '<li class="report-assignment"><span><strong>' + escapeHtml(item.name) + '</strong><small>Legacy work item · Due ' + escapeHtml(formatShortDate(item.date)) + '</small></span><span class="chip warning">' + escapeHtml(item.status || 'Missing') + '</span></li>');
    const assignmentRows = allAssignments.map((assignment) => {
      const row = normalizeSubmission(assignment.students?.[selectedStudent]);
      const status = row.notRequired ? 'N/A' : row.submitted ? 'Complete' : (assignment.due && assignment.due < todayISO() ? 'Overdue' : 'Missing');
      const statusClass = status === 'Complete' || status === 'N/A' ? 'success' : 'warning';
      const due = assignment.due ? 'Due ' + formatShortDate(assignment.due) : 'No due date';
      return '<li class="report-assignment"><span><strong>' + escapeHtml(assignment.name) + '</strong><small>' + escapeHtml(due) + '</small></span><span class="chip ' + statusClass + '">' + status + '</span></li>';
    });
    const assignmentItems = [...missingLegacy, ...assignmentRows].join('');
    const submitted = allAssignments.filter((assignment) => normalizeSubmission(assignment.students?.[selectedStudent]).submitted).length;
    const outstanding = allAssignments.filter((assignment) => {
      const row = normalizeSubmission(assignment.students?.[selectedStudent]);
      return !row.submitted && !row.notRequired;
    }).length + missingLegacy.length;

    detail.innerHTML = '<section class="report-profile"><div class="report-profile-heading split-heading"><div><p class="panel-kicker">STUDENT PROFILE</p><h3>' + escapeHtml(selectedStudent) + '</h3><p>' + escapeHtml(courseName) + ' · ' + submitted + '/' + allAssignments.length + ' current assignments submitted</p></div><button type="button" class="primary-button" data-action="report-add-note">＋ Add Note</button></div><div class="report-summary-grid"><div class="report-summary-item"><strong>' + countAbsences(record) + '</strong><span>Total A + E</span></div><div class="report-summary-item"><strong>' + lates + '</strong><span>Total lates</span></div><div class="report-summary-item"><strong>' + outstanding + '</strong><span>Outstanding work</span></div><div class="report-summary-item"><strong>' + record.notes.length + '</strong><span>Notes</span></div></div><div class="report-profile-grid"><section class="report-section"><h4>Assignments</h4>' + (assignmentItems ? '<ul class="report-assignment-list">' + assignmentItems + '</ul>' : '<p class="empty-copy">No assignments or missing work recorded.</p>') + '</section><section class="report-section"><div class="split-heading"><h4>Notes</h4><span class="panel-help">Edit or delete below.</span></div><div class="notes-list">' + renderNoteList(courseName, selectedStudent, 'No notes for this student yet.') + '</div></section></div></section>';
  }

  function renderManage() {
    byId('manageCourse').innerHTML = courseOptions(ui.manageCourse);
    byId('courseList').innerHTML = asArray(state.courses.courses).length ? state.courses.courses.map((course) => `<div class="manage-row ${course.archived ? 'archived' : ''}"><div><strong>${escapeHtml(course.name)}</strong><span>${course.students.length} students · ${course.archived ? 'Archived' : 'Active'}</span></div><div class="manage-actions"><button type="button" class="mini-button" data-action="rename-course" data-course="${escapeAttr(course.name)}">Rename</button><button type="button" class="mini-button" data-action="archive-course" data-course="${escapeAttr(course.name)}">${course.archived ? 'Restore' : 'Archive'}</button></div></div>`).join('') : '<p class="empty-copy">No classes yet.</p>';
    const course = findCourse(ui.manageCourse);
    byId('studentList').innerHTML = course ? (course.students.length ? course.students.map((student) => `<div class="manage-row"><div><strong>${escapeHtml(student)}</strong><span>Active roster</span></div><div class="manage-actions"><button type="button" class="mini-button" data-action="rename-student" data-course="${escapeAttr(course.name)}" data-student="${escapeAttr(student)}">Rename</button><button type="button" class="mini-button" data-action="remove-student" data-course="${escapeAttr(course.name)}" data-student="${escapeAttr(student)}">Remove &amp; clear</button></div></div>`).join('') : '<p class="empty-copy">No students are on this active roster.</p>') : '<p class="empty-copy">Select an active class to manage students.</p>';
  }

  function renderBackup() {
    const payload = exportText();
    byId('backupPayload').value = payload;
  }

  function renderMigrationNotice() {
    const notice = byId('migrationNotice');
    if (!migratedLegacyData) {
      notice.classList.add('hidden');
      return;
    }
    notice.classList.remove('hidden');
    notice.textContent = 'Your existing local dashboard data was safely migrated into the cleaned v17 format. Current active rosters are authoritative; students no longer on a roster are cleared from the dashboard data.';
  }

  function renderAll() {
    ensureSelections();
    renderHeader();
    renderNavigation();
    renderMigrationNotice();
    renderDashboard();
    renderAttendance();
    renderAssignments();
    renderNotes();
    renderReports();
    renderManage();
    renderBackup();
  }

  function showView(view) {
    ui.view = VIEWS[view] ? view : 'dashboard';
    renderAll();
  }

  function setCurrentClass(courseName, saveMessage = 'Class selection saved') {
    if (!activeCourses().some((course) => course.name === courseName)) return;
    state.currentClass = courseName;
    ui.attendanceCourse = courseName;
    ui.assignmentCourse = courseName;
    ui.notesCourse = courseName;
    ui.reportCourse = courseName;
    ui.manageCourse = courseName;
    ui.notesStudent = activeStudents(courseName)[0] || '';
    ui.reportStudent = activeStudents(courseName)[0] || '';
    ui.selectedAssignmentId = assignmentsFor(courseName).find((assignment) => !assignment.archived)?.id || assignmentsFor(courseName)[0]?.id || '';
    save(saveMessage);
  }

  function showModal(content, extraClass = '') {
    byId('modalRoot').innerHTML = `<div id="modalBackdrop" class="modal-backdrop"><div class="modal ${extraClass}" role="dialog" aria-modal="true">${content}</div></div>`;
    const focusTarget = byId('modalRoot').querySelector('input, textarea, select, button');
    focusTarget?.focus();
  }

  function closeModal() {
    byId('modalRoot').innerHTML = '';
  }

  function showAttendancePicker(courseName, studentName, date) {
    const status = attendanceStatus(courseName, studentName, date);
    showModal(`<h2>${escapeHtml(studentName)}</h2><p>${escapeHtml(formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}</p><div class="picker-statuses">${ATTENDANCE_CODES.map((code) => `<button type="button" class="status-button ${status === code ? 'active' : ''}" data-action="picker-set-status" data-course="${escapeAttr(courseName)}" data-student="${escapeAttr(studentName)}" data-date="${date}" data-status="${code}">${code}<span class="sr-only"> ${ATTENDANCE_LABELS[code]}</span></button>`).join('')}<button type="button" class="secondary-button picker-clear" data-action="picker-set-status" data-course="${escapeAttr(courseName)}" data-student="${escapeAttr(studentName)}" data-date="${date}" data-status="">Clear entry</button></div><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button></div>`, 'modal-picker');
  }

  function showThresholdAlert(studentName, threshold) {
    const serious = threshold === 20;
    const detail = serious
      ? '20 cumulative A + E entries have been reached. Refer this attendance concern to the Student Success Team.'
      : `${threshold} cumulative A + E entries have been reached. Let Jake know about the attendance pattern.`;
    showModal(`<p class="panel-kicker">${serious ? 'SERIOUS ATTENDANCE ALERT' : 'ATTENDANCE THRESHOLD REACHED'}</p><div class="alert-word">${serious ? 'REFER' : 'TEXT JAKE'}</div><h2>${escapeHtml(studentName)} — ${threshold} A + E</h2><p>${escapeHtml(detail)}</p><div class="modal-actions"><button type="button" class="primary-button" data-action="close-modal">Got it</button></div>`, `alert-modal ${serious ? 'serious' : ''}`);
  }

  function showAddAssignment(courseName = ui.assignmentCourse) {
    if (!findCourse(courseName)) return;
    showModal(`<h2>Add Assignment</h2><p>Create the item once; the active roster is added automatically.</p><form id="assignmentForm" class="modal-form"><label>Class<select name="course">${courseOptions(courseName)}</select></label><label>Assignment name<input name="name" required autocomplete="off" placeholder="e.g. Communities You Belong To"></label><div class="modal-row"><label>Assigned<input type="date" name="assigned" value="${todayISO()}" required></label><label>Due date<input type="date" name="due" aria-label="Assignment due date" title="Choose the due date from the calendar"></label></div><div class="modal-row"><label>Grading<select name="grading"><option value="levels">Levels</option><option value="marks">Marks</option></select></label><label>Maximum<input type="number" name="maxMark" min="1" value="4" required></label></div><div class="modal-row"><label><input type="checkbox" name="participationEvidence"> Participation evidence</label><label><input type="checkbox" name="formativeClasswork"> Formative classroom work</label></div><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button">Add Assignment</button></div></form>`);
  }

  function showEditAssignment(courseName, assignmentId) {
    const assignment = findAssignment(courseName, assignmentId);
    if (!assignment) return;
    showModal(`<h2>Edit Assignment</h2><form id="assignmentEditForm" class="modal-form"><input type="hidden" name="course" value="${escapeAttr(courseName)}"><input type="hidden" name="assignmentId" value="${escapeAttr(assignment.id)}"><label>Assignment name<input name="name" required value="${escapeAttr(assignment.name)}"></label><div class="modal-row"><label>Assigned<input type="date" name="assigned" value="${assignment.assigned}"></label><label>Due date<input type="date" name="due" value="${assignment.due}" aria-label="Assignment due date" title="Choose the due date from the calendar"></label></div><div class="modal-row"><label>Grading<select name="grading"><option value="levels" ${assignment.grading === 'levels' ? 'selected' : ''}>Levels</option><option value="marks" ${assignment.grading === 'marks' ? 'selected' : ''}>Marks</option></select></label><label>Maximum<input type="number" name="maxMark" min="1" value="${assignment.maxMark}"></label></div><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button">Save Changes</button></div></form>`);
  }

  function showAddNote(courseName = ui.notesCourse, studentName = ui.notesStudent) {
    if (!findCourse(courseName)) return;
    showModal(`<h2>Add Student Note</h2><p>Capture concise, factual evidence that will still make sense later.</p><form id="noteForm" class="modal-form"><label>Class<select name="course">${courseOptions(courseName)}</select></label><label>Student<select name="student">${activeStudents(courseName).map((student) => `<option value="${escapeAttr(student)}" ${student === studentName ? 'selected' : ''}>${escapeHtml(student)}</option>`).join('')}</select></label><div class="modal-row"><label>Category<select name="category"><option>Observation</option><option>Participation</option><option>Attendance</option><option>Follow-up</option><option>Support</option></select></label><label>Date<input type="date" name="date" value="${todayISO()}"></label></div><label>Note<textarea name="text" required placeholder="Observation, participation evidence, follow-up note…"></textarea></label><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button">Save Note</button></div></form>`);
  }


  function findNote(courseName, studentName, noteId) {
    return ensureRecord(courseName, studentName).notes.find((note) => note.id === noteId) || null;
  }

  function showEditNote(courseName, studentName, noteId) {
    const note = findNote(courseName, studentName, noteId);
    if (!note) return;
    const categories = ['Observation', 'Participation', 'Attendance', 'Follow-up', 'Support'];
    const options = categories.map((category) => '<option value="' + escapeAttr(category) + '" ' + (note.category === category ? 'selected' : '') + '>' + escapeHtml(category) + '</option>').join('');
    showModal([
      '<h2>Edit Student Note</h2>',
      '<p>Keep the wording factual and useful when you return to it later.</p>',
      '<form id="noteEditForm" class="modal-form">',
      '<input type="hidden" name="course" value="' + escapeAttr(courseName) + '">',
      '<input type="hidden" name="student" value="' + escapeAttr(studentName) + '">',
      '<input type="hidden" name="noteId" value="' + escapeAttr(note.id) + '">',
      '<div class="modal-row"><label>Category<select name="category">' + options + '</select></label><label>Date<input type="date" name="date" value="' + escapeAttr(note.date) + '"></label></div>',
      '<label>Note<textarea name="text" required>' + escapeHtml(note.text) + '</textarea></label>',
      '<div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button">Save Changes</button></div>',
      '</form>'
    ].join(''));
  }

  function noteMarkup(courseName, studentName, note) {
    return '<article class="note-item"><h3>' + escapeHtml(note.category || 'Observation') + '</h3><p>' + escapeHtml(note.text) + '</p><p class="note-meta">' + escapeHtml(formatShortDate(note.date)) + '</p><div class="note-actions"><button type="button" class="mini-button" data-action="edit-note" data-course="' + escapeAttr(courseName) + '" data-student="' + escapeAttr(studentName) + '" data-note-id="' + escapeAttr(note.id) + '">Edit</button><button type="button" class="mini-button" data-action="delete-note" data-course="' + escapeAttr(courseName) + '" data-student="' + escapeAttr(studentName) + '" data-note-id="' + escapeAttr(note.id) + '">Delete</button></div></article>';
  }

  function renderNoteList(courseName, studentName, emptyText) {
    if (!courseName || !studentName) return '<p class="empty-copy">' + escapeHtml(emptyText || 'Choose an active class and student to review notes.') + '</p>';
    const notes = [...ensureRecord(courseName, studentName).notes].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
    return notes.length ? notes.map((note) => noteMarkup(courseName, studentName, note)).join('') : '<p class="empty-copy">' + escapeHtml(emptyText || 'No notes for this student yet.') + '</p>';
  }

  function extractBackup(parsed) {
    if (!isObject(parsed)) throw new Error('This is not valid dashboard backup data.');
    if (parsed.format === 'teacher-command-centre-winston-export' || isObject(parsed.teacherApp)) {
      const app = isObject(parsed.teacherApp) ? parsed.teacherApp : {};
      const studentData = isObject(app.studentData) ? app.studentData : null;
      if (!studentData || !isObject(studentData.students)) throw new Error('This backup does not contain student dashboard data.');
      return {
        currentClass: app.currentClass || studentData.currentClass || '',
        courses: app.courses || null,
        studentData,
        assignmentTracker: parsed.assignmentTracker || { classes: {} },
        reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
        assessments: isObject(parsed.assessments) ? parsed.assessments : null
      };
    }
    if (isObject(parsed.students)) {
      return { currentClass: parsed.currentClass || '', courses: null, studentData: parsed, assignmentTracker: { classes: {} }, reminders: [], assessments: null };
    }
    throw new Error('I could not find Teacher Command Centre data in that file.');
  }

  function backupSummary(data) {
    const normalized = normalizeState(data);
    const counts = countRecords(normalized);
    const assignments = Object.values(normalized.assignmentTracker.classes).reduce((total, item) => total + asArray(item.assignments).length, 0);
    const assessmentClasses = isObject(data.assessments?.classes) ? data.assessments.classes : {};
    const assessments = Object.values(assessmentClasses).reduce((total, item) => total + asArray(item?.assessments).length, 0);
    return `${normalized.courses.courses.length} classes · ${counts.students} student records · ${counts.attendance} attendance entries · ${assignments} assignments · ${assessments} tests/quizzes · ${normalized.reminders.length} reminders`;
  }

  function countRecords(targetState) {
    let students = 0;
    let attendance = 0;
    Object.values(targetState.studentData.students || {}).forEach((course) => Object.values(course || {}).forEach((record) => {
      students += 1;
      attendance += asArray(record?.attendance).length;
    }));
    return { students, attendance };
  }

  function previewImport(parsed) {
    const extracted = extractBackup(parsed);
    const summary = backupSummary(extracted);
    pendingImport = extracted;
    showModal(`<h2>Restore this backup?</h2><p>${escapeHtml(summary)}</p><p>This replaces the current dashboard data on this device. A local pre-import recovery copy will be kept first.</p><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="button" class="primary-button" data-action="confirm-import">Restore Backup</button></div>`);
  }

  function performImport() {
    if (!pendingImport) return;
    const importedAssessments = pendingImport.assessments;
    writeLocal(PRE_IMPORT_KEY, state);
    state = normalizeState(pendingImport);
    if (importedAssessments && window.teacherCommandCentreAssessments?.importData) {
      window.teacherCommandCentreAssessments.importData(importedAssessments);
    }
    migratedLegacyData = false;
    pendingImport = null;
    ensureSelections();
    save('Backup restored locally');
    closeModal();
    byId('backupStatus').textContent = 'Backup restored successfully. The dashboard is now using that data.';
    const restoreBox = byId('restorePayload');
    if (restoreBox) restoreBox.value = '';
    renderAll();
  }

  function downloadBackup() {
    const body = exportText();
    const blob = new Blob([body], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    anchor.href = url;
    anchor.download = `teacher-command-centre-backup-${stamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    byId('backupStatus').textContent = 'Backup file downloaded. Keep it as a recovery point.';
  }

  async function copyBackup() {
    const payload = exportText();
    const box = byId('backupPayload');
    box.value = payload;
    let copied = false;
    try {
      await navigator.clipboard.writeText(payload);
      copied = true;
    } catch (_) {
      box.focus();
      box.select();
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    }
    byId('backupStatus').textContent = copied
      ? 'Copied. Return to this ChatGPT conversation and paste the complete data.'
      : 'Automatic copy was blocked. The full export is in the box below—select all, copy, then paste it here.';
    if (!copied) {
      box.focus();
      box.select();
    }
  }

  function parsePastedBackup(raw) {
    let value = text(raw);
    const fence = String.fromCharCode(96).repeat(3);
    value = value.replace(new RegExp('^' + fence + '(?:json)?\\s*', 'i'), '').replace(new RegExp('\\s*' + fence + '$', 'i'), '').trim();
    if (!value) throw new Error('Paste the complete backup data into the box first.');
    return JSON.parse(value);
  }

  function restorePastedBackup() {
    const box = byId('restorePayload');
    try {
      previewImport(parsePastedBackup(box?.value || ''));
    } catch (error) {
      byId('backupStatus').textContent = 'Backup not ready: ' + (error.message || 'The pasted data could not be read.');
      box?.focus();
    }
  }

  async function pasteFromClipboard() {
    const box = byId('restorePayload');
    try {
      const value = await navigator.clipboard.readText();
      if (!value) throw new Error('The clipboard is empty.');
      box.value = value;
      box.focus();
      byId('backupStatus').textContent = 'Backup pasted from the clipboard. Review it, then choose Restore Pasted Data.';
    } catch (_) {
      box?.focus();
      byId('backupStatus').textContent = 'Clipboard access was blocked. Tap the box and paste the backup manually.';
    }
  }


  async function pasteAndPreviewBackup() {
    const box = byId('restorePayload');
    let value = '';
    try {
      value = await navigator.clipboard.readText();
    } catch (_) {
      box?.focus();
      byId('backupStatus').textContent = 'Clipboard access was blocked. Paste the backup into the box manually, then choose Restore Pasted Data.';
      return;
    }
    if (!value) {
      byId('backupStatus').textContent = 'The clipboard is empty.';
      return;
    }
    if (box) box.value = value;
    try {
      previewImport(parsePastedBackup(value));
    } catch (error) {
      byId('backupStatus').textContent = 'Backup not ready: ' + (error.message || 'The pasted data could not be read.');
      box?.focus();
    }
  }

  function createCourse(courseName) {
    const name = text(courseName);
    if (!name) throw new Error('Enter a class name.');
    if (asArray(state.courses.courses).some((course) => course.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('A class with that name already exists.');
    state.courses.courses.push({ name, archived: false, students: [] });
    state.studentData.students[name] = {};
    state.assignmentTracker.classes[name] = { assignments: [] };
    setCurrentClass(name, 'Class added');
  }

  function renameCourse(oldName) {
    const course = findCourse(oldName);
    if (!course) return;
    const next = text(window.prompt('Rename class:', oldName));
    if (!next || next === oldName) return;
    if (asArray(state.courses.courses).some((item) => item.name !== oldName && item.name.toLocaleLowerCase() === next.toLocaleLowerCase())) {
      window.alert('A class with that name already exists.');
      return;
    }
    course.name = next;
    if (state.studentData.students[oldName]) {
      state.studentData.students[next] = state.studentData.students[oldName];
      delete state.studentData.students[oldName];
    }
    if (state.assignmentTracker.classes[oldName]) {
      state.assignmentTracker.classes[next] = state.assignmentTracker.classes[oldName];
      delete state.assignmentTracker.classes[oldName];
    }
    Object.keys(ui).forEach((key) => { if (ui[key] === oldName) ui[key] = next; });
    if (state.currentClass === oldName) state.currentClass = next;
    save('Class renamed');
  }

  function toggleCourseArchive(courseName) {
    const course = findCourse(courseName);
    if (!course) return;
    if (!course.archived && activeCourses().length <= 1) {
      window.alert('Keep at least one active class. Add or restore another class first.');
      return;
    }
    const action = course.archived ? 'restore' : 'archive';
    if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${course.name}? Historical records are kept either way.`)) return;
    course.archived = !course.archived;
    ensureSelections();
    save(`Class ${course.archived ? 'archived' : 'restored'}`);
  }

  function addStudent(courseName, studentName) {
    const course = findCourse(courseName);
    const name = text(studentName);
    if (!course || course.archived) throw new Error('Choose an active class first.');
    if (!name) throw new Error('Enter a student display name.');
    if (course.students.some((student) => student.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('That student is already in this active roster.');
    course.students.push(name);
    ensureRecord(courseName, name);
    assignmentsFor(courseName).forEach((assignment) => {
      if (!assignment.students[name]) assignment.students[name] = normalizeSubmission({});
    });
    ui.manageCourse = courseName;
    save('Student added');
  }

  function renameStudent(courseName, oldName) {
    const course = findCourse(courseName);
    if (!course || !course.students.includes(oldName)) return;
    const next = text(window.prompt('Rename student:', oldName));
    if (!next || next === oldName) return;
    if (course.students.some((student) => student !== oldName && student.toLocaleLowerCase() === next.toLocaleLowerCase())) {
      window.alert('That name is already in this active roster.');
      return;
    }
    course.students = course.students.map((student) => student === oldName ? next : student);
    const records = state.studentData.students[courseName] || {};
    if (records[oldName]) {
      records[next] = records[oldName];
      delete records[oldName];
    }
    assignmentsFor(courseName).forEach((assignment) => {
      if (assignment.students[oldName]) {
        assignment.students[next] = assignment.students[oldName];
        delete assignment.students[oldName];
      }
    });
    if (ui.notesStudent === oldName && ui.notesCourse === courseName) ui.notesStudent = next;
    save('Student renamed');
  }

  function removeStudentFromRoster(courseName, studentName) {
    const course = findCourse(courseName);
    if (!course || !course.students.includes(studentName)) return;
    const message = `Remove ${studentName} from ${courseName}? This permanently clears their attendance, participation, notes, and assignment records for this class. A previous backup is the only way to restore them.`;
    if (!window.confirm(message)) return;
    course.students = course.students.filter((student) => student !== studentName);
    const records = state.studentData.students[courseName];
    if (records) delete records[studentName];
    assignmentsFor(courseName).forEach((assignment) => {
      delete assignment.students[studentName];
    });
    if (ui.notesCourse === courseName && ui.notesStudent === studentName) ui.notesStudent = '';
    ensureSelections();
    save('Student and related records removed');
  }

  function updateAssignmentSubmission(target) {
    const courseName = target.dataset.course;
    const assignment = findAssignment(courseName, target.dataset.assignmentId);
    const studentName = target.dataset.student;
    if (!assignment || !studentName) return;
    if (!assignment.students[studentName]) assignment.students[studentName] = normalizeSubmission({});
    const row = assignment.students[studentName];
    const field = target.dataset.assignmentField;
    if (field === 'submitted' || field === 'notRequired') row[field] = target.checked;
    else if (field === 'mark') {
      row.mark = target.value;
      row.achievement = target.value;
      if (text(target.value)) row.submitted = true;
    } else if (field === 'note') row.note = target.value;
    save('Assignment status saved');
  }

  function updateAssignmentToggle(target) {
    const assignment = findAssignment(target.dataset.course, target.dataset.assignmentId);
    if (!assignment) return;
    assignment[target.dataset.assignmentToggle] = target.checked;
    save('Assignment details saved');
  }

  function isCanadaText(value) {
    return /\b(canada|canadian|ontario|quebec|manitoba|saskatchewan|alberta|british columbia|newfoundland|nova scotia|new brunswick|pei|prince edward|nunavut|yukon|northwest territories|ottawa|toronto|montreal|vancouver|winnipeg|halifax|indigenous|first nations|inuit|métis)\b/i.test(value);
  }

  function historyScore(event) {
    const page = event.pages?.[0] || {};
    const value = `${event.text || ''} ${page.description || ''} ${page.extract || ''} ${page.title || ''}`;
    let score = isCanadaText(value) ? 100 : 0;
    if (/world war|armistice|independence|revolution|invasion|declaration|earthquake|tsunami|moon landing|nuclear|attack/i.test(value)) score += 20;
    if (Number(event.year) >= 1800) score += 4;
    return score;
  }

  async function loadHistory() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('History source unavailable');
      const data = await response.json();
      const events = asArray(data.events).map((event) => ({ ...event, score: historyScore(event) })).sort((a, b) => b.score - a.score);
      const chosen = events.find((event) => event.score >= 100) || events[0];
      if (!chosen) throw new Error('No history event returned');
      const page = chosen.pages?.[0] || {};
      historyItem = {
        year: text(chosen.year),
        title: text(page.normalizedtitle || page.title || chosen.year).replaceAll('_', ' '),
        text: text(chosen.text || page.extract),
        trivia: text(page.description) || 'A date on the calendar can hold a surprisingly large story.',
        source: chosen.score >= 100 ? 'Live daily event with Canadian relevance prioritized.' : 'Live daily event; no stronger Canadian event was available in this feed.'
      };
    } catch (_) {
      historyItem = CANADIAN_HISTORY[`${month}-${day}`] ? { ...CANADIAN_HISTORY[`${month}-${day}`], source: 'Built-in Canadian history fallback.' } : null;
    }
    renderHistory();
  }

  function handleClick(event) {
    if (event.target.id === 'modalBackdrop') {
      closeModal();
      return;
    }
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      event.preventDefault();
      showView(viewButton.dataset.view);
      return;
    }
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'toggle-reminder') return;
    event.preventDefault();
    switch (action) {
      case 'close-modal': closeModal(); break;
      case 'open-course': setCurrentClass(target.dataset.course); showView('attendance'); break;
      case 'open-attendance-course': setCurrentClass(target.dataset.course); showView('attendance'); break;
      case 'open-assignments-course': setCurrentClass(target.dataset.course); showView('assignments'); break;
      case 'open-notes-course': setCurrentClass(target.dataset.course); showView('notes'); break;
      case 'quick-attendance':
      case 'attendance-status': {
        const threshold = setAttendance(target.dataset.course, target.dataset.student, target.dataset.date, target.dataset.status);
        renderAll();
        if (threshold) showThresholdAlert(target.dataset.student, threshold);
        break;
      }
      case 'set-participation': setParticipation(target.dataset.course, target.dataset.student, target.dataset.date, Number(target.dataset.level)); renderAll(); break;
      case 'attendance-today': ui.selectedDate = todayISO(); ui.selectedMonth = monthISO(); renderAll(); break;
      case 'open-attendance-picker': showAttendancePicker(target.dataset.course, target.dataset.student, target.dataset.date); break;
      case 'picker-set-status': {
        const threshold = setAttendance(target.dataset.course, target.dataset.student, target.dataset.date, target.dataset.status);
        closeModal();
        renderAll();
        if (threshold) showThresholdAlert(target.dataset.student, threshold);
        break;
      }
      case 'select-assignment-course':
        ui.assignmentCourse = target.dataset.course;
        state.currentClass = ui.assignmentCourse;
        ui.selectedAssignmentId = assignmentsFor(ui.assignmentCourse).find((assignment) => !assignment.archived)?.id || assignmentsFor(ui.assignmentCourse)[0]?.id || '';
        save('Class selection saved');
        renderAll();
        break;
      case 'show-add-assignment': showAddAssignment(); break;
      case 'open-assignment': ui.assignmentCourse = target.dataset.course; ui.selectedAssignmentId = target.dataset.assignmentId; renderAll(); break;
      case 'edit-assignment': showEditAssignment(target.dataset.course, target.dataset.assignmentId); break;
      case 'archive-assignment': {
        const assignment = findAssignment(target.dataset.course, target.dataset.assignmentId);
        if (assignment) {
          assignment.archived = !assignment.archived;
          save(`Assignment ${assignment.archived ? 'archived' : 'restored'}`);
          renderAll();
        }
        break;
      }
      case 'show-add-note': showAddNote(); break;
      case 'edit-note': showEditNote(target.dataset.course, target.dataset.student, target.dataset.noteId); break;
      case 'delete-note': {
        const record = ensureRecord(target.dataset.course, target.dataset.student);
        const note = findNote(target.dataset.course, target.dataset.student, target.dataset.noteId);
        if (note && window.confirm('Delete this student note?')) {
          record.notes = record.notes.filter((item) => item.id !== note.id);
          save('Student note deleted');
          renderAll();
        }
        break;
      }
      case 'open-report-student':
        ui.reportCourse = target.dataset.course;
        ui.reportStudent = target.dataset.student;
        renderAll();
        break;
      case 'report-add-note': showAddNote(ui.reportCourse, ui.reportStudent); break;
      case 'delete-reminder': {
        const reminder = state.reminders.find((item) => item.id === target.dataset.reminderId);
        if (reminder && window.confirm(`Delete reminder: ${reminder.text}?`)) {
          state.reminders = state.reminders.filter((item) => item.id !== reminder.id);
          save('Reminder deleted');
          renderAll();
        }
        break;
      }
      case 'download-backup': downloadBackup(); break;
      case 'open-import': byId('restoreFile').value = ''; byId('restoreFile').click(); break;
      case 'copy-backup': copyBackup(); break;
      case 'paste-clipboard': pasteFromClipboard(); break;
      case 'paste-preview': pasteAndPreviewBackup(); break;
      case 'restore-pasted': restorePastedBackup(); break;
      case 'confirm-import': performImport(); break;
      case 'rename-course': renameCourse(target.dataset.course); renderAll(); break;
      case 'archive-course': toggleCourseArchive(target.dataset.course); renderAll(); break;
      case 'rename-student': renameStudent(target.dataset.course, target.dataset.student); renderAll(); break;
      case 'remove-student': removeStudentFromRoster(target.dataset.course, target.dataset.student); renderAll(); break;
      default: break;
    }
  }

  function handleChange(event) {
    const target = event.target;
    if (target.id === 'quickDate') {
      ui.selectedDate = target.value || todayISO();
      ui.selectedMonth = monthISO(ui.selectedDate);
      renderAll();
    } else if (target.id === 'attendanceCourse') {
      setCurrentClass(target.value);
      renderAll();
    } else if (target.id === 'attendanceDate') {
      ui.selectedDate = target.value || todayISO();
      ui.selectedMonth = monthISO(ui.selectedDate);
      renderAll();
    } else if (target.id === 'attendanceMonth') {
      ui.selectedMonth = target.value || monthISO();
      renderAll();
    } else if (target.id === 'notesCourse') {
      ui.notesCourse = target.value;
      ui.notesStudent = activeStudents(ui.notesCourse)[0] || '';
      renderAll();
    } else if (target.id === 'notesStudent') {
      ui.notesStudent = target.value;
      renderAll();
    } else if (target.id === 'reportCourse') {
      ui.reportCourse = target.value;
      ui.reportStudent = activeStudents(ui.reportCourse)[0] || '';
      renderAll();
    } else if (target.id === 'manageCourse') {
      ui.manageCourse = target.value;
      renderAll();
    } else if (target.dataset.action === 'toggle-reminder') {
      const reminder = state.reminders.find((item) => item.id === target.dataset.reminderId);
      if (reminder) {
        reminder.done = target.checked;
        save('Reminder saved');
        renderAll();
      }
    } else if (target.dataset.assignmentField) {
      updateAssignmentSubmission(target);
      renderAll();
    } else if (target.dataset.assignmentToggle) {
      updateAssignmentToggle(target);
      renderAll();
    }
  }

  function handleSubmit(event) {
    const form = event.target;
    if (!form.matches('form')) return;
    event.preventDefault();
    const data = new FormData(form);
    try {
      if (form.id === 'reminderForm') {
        const reminderText = text(data.get('reminderText'));
        if (!reminderText) return;
        state.reminders.push({ id: makeId('reminder'), text: reminderText, done: false, createdAt: new Date().toISOString() });
        form.reset();
        save('Reminder saved');
        renderAll();
      } else if (form.id === 'courseForm') {
        createCourse(data.get('courseName'));
        form.reset();
        renderAll();
      } else if (form.id === 'studentForm') {
        addStudent(ui.manageCourse, data.get('studentName'));
        form.reset();
        renderAll();
      } else if (form.id === 'assignmentForm') {
        const courseName = text(data.get('course'));
        const course = findCourse(courseName);
        const name = text(data.get('name'));
        if (!course || !name) throw new Error('Enter an assignment name and active class.');
        const assignment = normalizeAssignment({
          id: makeId('assignment'),
          name,
          assigned: data.get('assigned'),
          due: data.get('due'),
          grading: data.get('grading'),
          maxMark: data.get('maxMark'),
          participationEvidence: data.get('participationEvidence') === 'on',
          formativeClasswork: data.get('formativeClasswork') === 'on',
          archived: false,
          students: {}
        }, course.students);
        assignmentsFor(courseName).push(assignment);
        ui.assignmentCourse = courseName;
        state.currentClass = courseName;
        ui.selectedAssignmentId = assignment.id;
        save('Assignment added');
        closeModal();
        renderAll();
      } else if (form.id === 'assignmentEditForm') {
        const assignment = findAssignment(text(data.get('course')), text(data.get('assignmentId')));
        if (!assignment) throw new Error('That assignment could not be found.');
        assignment.name = text(data.get('name')) || assignment.name;
        assignment.assigned = validDate(data.get('assigned')) ? data.get('assigned') : assignment.assigned;
        assignment.due = validDate(data.get('due')) ? data.get('due') : '';
        assignment.grading = text(data.get('grading')) || assignment.grading;
        assignment.maxMark = Math.max(1, Number(data.get('maxMark')) || assignment.maxMark);
        save('Assignment updated');
        closeModal();
        renderAll();
      } else if (form.id === 'noteForm') {
        const courseName = text(data.get('course'));
        const studentName = text(data.get('student'));
        const noteText = text(data.get('text'));
        if (!findCourse(courseName) || !activeStudents(courseName).includes(studentName) || !noteText) throw new Error('Choose an active student and enter a note.');
        ensureRecord(courseName, studentName).notes.push({
          id: makeId('note'),
          text: noteText,
          date: validDate(data.get('date')) ? data.get('date') : todayISO(),
          category: text(data.get('category')) || 'Observation'
        });
        ui.notesCourse = courseName;
        ui.notesStudent = studentName;
        save('Student note saved');
        closeModal();
        renderAll();
      } else if (form.id === 'noteEditForm') {
        const courseName = text(data.get('course'));
        const studentName = text(data.get('student'));
        const note = findNote(courseName, studentName, text(data.get('noteId')));
        const noteText = text(data.get('text'));
        if (!note || !findCourse(courseName) || !activeStudents(courseName).includes(studentName) || !noteText) throw new Error('Choose an active student and enter a note.');
        note.text = noteText;
        note.date = validDate(data.get('date')) ? data.get('date') : todayISO();
        note.category = text(data.get('category')) || 'Observation';
        ui.notesCourse = courseName;
        ui.notesStudent = studentName;
        ui.reportCourse = courseName;
        ui.reportStudent = studentName;
        save('Student note updated');
        closeModal();
        renderAll();
      }
    } catch (error) {
      window.alert(error.message || 'That change could not be saved.');
    }
  }

  async function handleRestoreFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      previewImport(JSON.parse(await file.text()));
    } catch (error) {
      window.alert(`Backup not restored: ${error.message || 'The file could not be read.'}`);
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && byId('modalRoot').children.length) closeModal();
    const card = event.target.closest?.('[data-action="open-course"]');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setCurrentClass(card.dataset.course);
      showView('attendance');
    }
  }

  function init() {
    state = loadState();
    ensureSelections();
    save(migratedLegacyData ? 'Local data migrated safely' : 'Local-first dashboard ready');
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('keydown', handleKeydown);
    byId('restoreFile').addEventListener('change', handleRestoreFile);
    renderAll();
    loadHistory();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
