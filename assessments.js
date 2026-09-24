(() => {
  'use strict';

  const KEY = 'teacher_command_centre_assessments_v1';
  const APP_KEY = 'teacher_command_centre_v15';
  let data = load();
  let courseName = '';
  let selectedId = '';

  const byId = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr = esc;
  const uid = () => window.crypto?.randomUUID ? `assessment-${crypto.randomUUID()}` : `assessment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
  const fmt = (v) => validDate(v) ? new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(new Date(`${v}T12:00:00`)) : 'No date';

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : { classes: {} };
    } catch (_) { return { classes: {} }; }
  }
  function save(message='Test / quiz saved') {
    localStorage.setItem(KEY, JSON.stringify(data));
    const status = byId('saveStatus');
    if (status) status.textContent = `${message} · ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`;
  }
  function appState() {
    try { return JSON.parse(localStorage.getItem(APP_KEY) || '{}'); } catch (_) { return {}; }
  }
  function courses() {
    const s = appState();
    const supplied = Array.isArray(s?.courses?.courses) ? s.courses.courses : [];
    if (supplied.length) return supplied.filter(c => !c.archived && c.name).map(c => ({name:c.name, students:Array.isArray(c.students)?c.students:[]}));
    const map = s?.studentData?.students || {};
    return Object.keys(map).map(name => ({name, students:Object.keys(map[name] || {})}));
  }
  function roster(name) {
    return courses().find(c => c.name === name)?.students || [];
  }
  function bucket(name) {
    data.classes ||= {};
    data.classes[name] ||= { assessments: [] };
    data.classes[name].assessments ||= [];
    return data.classes[name].assessments;
  }
  function current() { return bucket(courseName).find(a => a.id === selectedId); }
  function normalize(a) {
    a.students ||= {};
    roster(courseName).forEach(student => { a.students[student] ||= {completed:false, mark:'', note:''}; });
    return a;
  }

  function showModal(html) {
    const root = byId('modalRoot');
    if (!root) return;
    root.innerHTML = `<div id="modalBackdrop" class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true">${html}</section></div>`;
    root.querySelector('input, textarea, select, button')?.focus();
  }
  function closeModal() { const root = byId('modalRoot'); if (root) root.innerHTML=''; }

  function render() {
    const view = byId('assessmentsView');
    if (!view || view.classList.contains('hidden')) return;
    const list = courses();
    if (!list.length) return;
    if (!list.some(c => c.name === courseName)) courseName = list[0].name;
    const assessments = bucket(courseName);
    if (!assessments.some(a => a.id === selectedId)) selectedId = assessments.find(a => !a.archived)?.id || assessments[0]?.id || '';

    byId('assessmentCourseTabs').innerHTML = list.map(c => `<button type="button" class="course-tab ${c.name===courseName?'active':''}" data-assessment-course="${attr(c.name)}">${esc(c.name)}</button>`).join('');
    const active = assessments.filter(a => !a.archived);
    const upcoming = active.filter(a => validDate(a.date) && a.date >= today()).length;
    byId('assessmentSummary').innerHTML = `<div class="summary-card"><strong>${active.length}</strong><span>Active tests / quizzes</span></div><div class="summary-card"><strong>${upcoming}</strong><span>Upcoming</span></div><div class="summary-card"><strong>${roster(courseName).length}</strong><span>Students</span></div>`;
    byId('assessmentList').innerHTML = assessments.length ? assessments.map(a => `<div class="assessment-list-item ${a.id===selectedId?'active':''} ${a.archived?'archived':''}"><button type="button" class="assessment-select" data-assessment-id="${attr(a.id)}" aria-label="Open ${attr(a.name)}"><strong>${esc(a.name)}</strong><span>${esc(a.type || 'Test')} · ${fmt(a.date)} · /${Number(a.maxMark)||100}</span></button><button type="button" class="secondary-button assessment-edit-button" data-assessment-edit-id="${attr(a.id)}" aria-label="Edit ${attr(a.name)}">Edit</button></div>`).join('') : `<div class="empty-state"><h3>No tests or quizzes yet</h3><p>Add one when you are ready.</p></div>`;
    renderDetail();
  }

  function renderDetail() {
    const box = byId('assessmentDetail');
    const a = current();
    if (!box) return;
    if (!a) { box.innerHTML=''; return; }
    normalize(a);
    const students = roster(courseName);
    box.innerHTML = `<div class="panel-heading split-heading"><div><p class="panel-kicker">${esc(a.type || 'TEST')}</p><h3>${esc(a.name)}</h3><p class="panel-help">Date: ${fmt(a.date)} · Maximum: ${Number(a.maxMark)||100}</p></div><div><button type="button" class="secondary-button" data-action="edit-assessment">Edit</button> <button type="button" class="secondary-button" data-action="archive-assessment">${a.archived?'Restore':'Archive'}</button></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Completed</th><th>Mark</th><th>Note</th></tr></thead><tbody>${students.map(student => { const r=a.students[student]||{}; return `<tr><td><strong>${esc(student)}</strong></td><td><input type="checkbox" data-assessment-student="${attr(student)}" data-field="completed" ${r.completed?'checked':''}></td><td><input type="number" min="0" max="${Number(a.maxMark)||100}" step="0.5" value="${attr(r.mark)}" data-assessment-student="${attr(student)}" data-field="mark" style="max-width:7rem"></td><td><input value="${attr(r.note)}" data-assessment-student="${attr(student)}" data-field="note" placeholder="Optional note"></td></tr>`; }).join('')}</tbody></table></div>`;
  }

  function addForm(a=null) {
    const editing = Boolean(a);
    showModal(`<h2>${editing?'Edit':'Add'} Test / Quiz</h2><form id="assessmentForm" class="modal-form"><label>Class<select name="course">${courses().map(c=>`<option ${c.name===courseName?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Name<input name="name" required value="${attr(a?.name||'')}" placeholder="e.g. Municipal Elections Quiz"></label><div class="modal-row"><label>Type<select name="type"><option ${a?.type==='Test'?'selected':''}>Test</option><option ${a?.type==='Quiz'?'selected':''}>Quiz</option></select></label><label>Date<input type="date" name="date" required value="${attr(a?.date||today())}" aria-label="Test or quiz date" title="Choose the date from the calendar"></label></div><label>Maximum mark<input type="number" name="maxMark" min="1" value="${Number(a?.maxMark)||100}" required></label>${editing?`<input type="hidden" name="id" value="${attr(a.id)}">`:''}<div class="modal-actions"><button type="button" class="secondary-button" data-assessment-close>Cancel</button><button type="submit" class="primary-button">${editing?'Save Changes':'Add Test / Quiz'}</button></div></form>`);
  }

  function cloneData(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return { classes: {} }; }
  }

  window.teacherCommandCentreAssessments = {
    exportData: () => cloneData(data),
    importData: (incoming) => {
      data = incoming && typeof incoming === 'object' ? cloneData(incoming) : { classes: {} };
      data.classes ||= {};
      save('Tests & quizzes restored');
      render();
    }
  };

  document.addEventListener('click', (e) => {
    const editItem = e.target.closest?.('[data-assessment-edit-id]');
    if (editItem) {
      const assessment = bucket(courseName).find((item) => item.id === editItem.dataset.assessmentEditId);
      if (assessment) {
        selectedId = assessment.id;
        render();
        addForm(assessment);
      }
      return;
    }
    const course = e.target.closest('[data-assessment-course]');
    if (course) { courseName=course.dataset.assessmentCourse; selectedId=''; render(); return; }
    const item = e.target.closest('[data-assessment-id]');
    if (item) { selectedId=item.dataset.assessmentId; render(); return; }
    if (e.target.closest('[data-action="show-add-assessment"]')) { addForm(); return; }
    if (e.target.closest('[data-action="edit-assessment"]')) { addForm(current()); return; }
    if (e.target.closest('[data-action="archive-assessment"]')) { const a=current(); if(a){a.archived=!a.archived; save(a.archived?'Test / quiz archived':'Test / quiz restored'); render();} return; }
    if (e.target.closest('[data-assessment-close]')) { closeModal(); return; }
    const nav = e.target.closest('[data-view="assessments"]');
    if (nav) setTimeout(render,0);
  });

  document.addEventListener('change', (e) => {
    const input=e.target.closest('[data-assessment-student]');
    if(!input) return;
    const a=current(); if(!a) return;
    normalize(a);
    const student=input.dataset.assessmentStudent;
    const field=input.dataset.field;
    a.students[student][field] = field==='completed' ? input.checked : input.value;
    if(field==='mark' && input.value !== '') a.students[student].completed=true;
    save('Test / quiz result saved');
    renderDetail();
  });

  document.addEventListener('submit', (e) => {
    if(e.target.id!=='assessmentForm') return;
    e.preventDefault(); e.stopImmediatePropagation();
    const f=new FormData(e.target); const targetCourse=String(f.get('course')||''); const id=String(f.get('id')||'');
    let a=id ? bucket(courseName).find(x=>x.id===id) : null;
    if(!a){ a={id:uid(),students:{},archived:false}; bucket(targetCourse).push(a); }
    a.name=String(f.get('name')||'').trim(); a.type=String(f.get('type')||'Test'); a.date=String(f.get('date')||today()); a.maxMark=Math.max(1,Number(f.get('maxMark'))||100);
    if(targetCourse!==courseName && id){ bucket(courseName).splice(bucket(courseName).indexOf(a),1); bucket(targetCourse).push(a); }
    courseName=targetCourse; selectedId=a.id; normalize(a); save('Test / quiz saved'); closeModal(); render();
  }, true);

  const observer = new MutationObserver(() => { if(!byId('assessmentsView')?.classList.contains('hidden')) render(); });
  window.addEventListener('DOMContentLoaded', () => { const v=byId('assessmentsView'); if(v) observer.observe(v,{attributes:true,attributeFilter:['class']}); });
})();
