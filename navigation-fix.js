(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const CLASS_KEY='neil_teacher_classes_v1',ASSIGN_KEY='neil_teacher_assignments_v1';

  function normalizedText(el){return (el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function dedupeButtons(scope,selector,preferredIds=[]){const groups=new Map();scope.querySelectorAll(selector).forEach(btn=>{const key=normalizedText(btn);if(!key)return;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(btn)});groups.forEach(buttons=>{if(buttons.length<2)return;const preferred=buttons.find(b=>preferredIds.includes(b.id))||buttons[0];buttons.forEach(b=>{if(b!==preferred)b.remove()})})}

  function getCfg(w){
    let cfg=null;try{cfg=JSON.parse(localStorage.getItem(CLASS_KEY))}catch(e){}
    if(!cfg||!Array.isArray(cfg.courses))cfg={courses:Object.keys(w.ROSTERS||{}).map(name=>({name,archived:false,students:[...(w.ROSTERS[name]||[])]}))};
    return cfg;
  }
  function saveCfg(cfg){localStorage.setItem(CLASS_KEY,JSON.stringify(cfg))}
  function blankStudent(){return{attendance:[],participation:null,notes:[],missing:[]}}
  function syncFromCfg(w,cfg){
    const active=cfg.courses.filter(c=>!c.archived);
    Object.keys(w.ROSTERS||{}).forEach(k=>delete w.ROSTERS[k]);
    active.forEach(c=>w.ROSTERS[c.name]=[...c.students]);
    if(!w.state.students)w.state.students={};
    cfg.courses.forEach(c=>{if(!w.state.students[c.name])w.state.students[c.name]={};c.students.forEach(n=>{if(!w.state.students[c.name][n])w.state.students[c.name][n]=blankStudent()})});
    if(!w.ROSTERS[w.currentClass])w.currentClass=active[0]?.name||'';
    w.state.currentClass=w.currentClass;
    localStorage.setItem(w.KEY||'neil_teacher_dashboard_v1',JSON.stringify(w.state));
    if(typeof w.renderAll==='function')w.renderAll();
  }

  function showView(d,target,button){
    ['dashboardView','homeworkView','reportsView','attendanceHistoryView','assignmentTrackerView','notesCentreView','winstonExportView','studentManagerView','courseManagerView'].forEach(id=>d.getElementById(id)?.classList.toggle('hidden',id!==target));
    d.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));button?.classList.add('active');
  }

  function ensureManagementUI(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!d.body||!w||!w.ROSTERS||!w.state)return false;
    const main=d.querySelector('main.main'),nav=d.querySelector('.nav'),reset=d.getElementById('resetBtn');if(!main||!nav)return false;
    let cfg=getCfg(w);

    let courseView=d.getElementById('courseManagerView');if(!courseView){courseView=d.createElement('section');courseView.id='courseManagerView';courseView.className='hidden';main.appendChild(courseView)}
    courseView.innerHTML='<div class="panel manage-grid"><div><h2>Manage Courses</h2><div class="history-help">Add, rename, archive, or restore classes.</div></div><button class="secondary" id="courseBackFixed">← Back to Dashboard</button><div><h3>Add a Course</h3><div class="manage-add"><input id="newCourseNameFixed" placeholder="e.g. Geography S2"><button class="primary" id="addCourseFixed">＋ Add Course</button></div></div><div><h3>Courses</h3><div id="courseRowsFixed"></div></div></div>';

    let studentView=d.getElementById('studentManagerView');if(!studentView){studentView=d.createElement('section');studentView.id='studentManagerView';studentView.className='hidden';main.appendChild(studentView)}
    studentView.innerHTML='<div class="panel manage-grid"><div><h2>Manage Students</h2><div class="history-help">Add late registrations or remove students from an active class.</div></div><button class="secondary" id="studentBackFixed">← Back to Dashboard</button><select id="studentClassFixed"></select><div class="manage-add"><input id="studentNameFixed" placeholder="Student display name"><button class="primary" id="studentAddFixed">＋ Add Student</button></div><div id="studentRowsFixed"></div></div>';

    let studentNav=d.getElementById('studentManagerNav');if(!studentNav){studentNav=d.createElement('button');studentNav.id='studentManagerNav';studentNav.textContent='➕ Manage Students';nav.insertBefore(studentNav,reset)}
    let courseNav=d.getElementById('courseManagerNav');if(!courseNav){courseNav=d.createElement('button');courseNav.id='courseManagerNav';courseNav.textContent='⚙ Manage Courses';nav.insertBefore(courseNav,reset)}

    function renderCourses(){cfg=getCfg(w);const box=d.getElementById('courseRowsFixed');if(!box)return;box.innerHTML=cfg.courses.map((c,i)=>'<div class="manage-row '+(c.archived?'archived':'')+'"><div><strong>'+w.esc(c.name)+'</strong><div class="small">'+c.students.length+' students · '+(c.archived?'Archived':'Active')+'</div></div><div class="manage-actions"><button class="secondary" data-rename-fixed="'+i+'">✎ Rename</button><button class="secondary" data-archive-fixed="'+i+'">'+(c.archived?'↩ Restore':'Archive')+'</button></div></div>').join('');
      box.querySelectorAll('[data-rename-fixed]').forEach(b=>b.onclick=()=>{const i=+b.dataset.renameFixed,c=cfg.courses[i],next=prompt('Rename course:',c.name)?.trim();if(!next||next===c.name)return;if(cfg.courses.some((x,j)=>j!==i&&x.name.toLowerCase()===next.toLowerCase())){alert('A course with that name already exists.');return}const old=c.name;c.name=next;if(w.state.students[old]){w.state.students[next]=w.state.students[old];delete w.state.students[old]}try{const a=JSON.parse(localStorage.getItem(ASSIGN_KEY));if(a?.classes?.[old]){a.classes[next]=a.classes[old];delete a.classes[old];localStorage.setItem(ASSIGN_KEY,JSON.stringify(a))}}catch(e){}if(w.currentClass===old)w.currentClass=next;saveCfg(cfg);syncFromCfg(w,cfg);renderCourses();renderStudents()});
      box.querySelectorAll('[data-archive-fixed]').forEach(b=>b.onclick=()=>{const i=+b.dataset.archiveFixed,c=cfg.courses[i];if(!c.archived&&cfg.courses.filter(x=>!x.archived).length<=1){alert('Keep at least one active course.');return}if(!confirm((c.archived?'Restore ':'Archive ')+c.name+'?'))return;c.archived=!c.archived;saveCfg(cfg);syncFromCfg(w,cfg);renderCourses();renderStudents()});
    }
    function renderStudents(){cfg=getCfg(w);const sel=d.getElementById('studentClassFixed'),prior=sel.value;const active=cfg.courses.filter(c=>!c.archived);sel.innerHTML=active.map(c=>'<option>'+w.esc(c.name)+'</option>').join('');sel.value=active.some(c=>c.name===prior)?prior:(active.some(c=>c.name===w.currentClass)?w.currentClass:(active[0]?.name||''));const c=active.find(x=>x.name===sel.value),box=d.getElementById('studentRowsFixed');box.innerHTML=(c?.students||[]).map(n=>'<div class="manage-row"><strong>'+w.esc(n)+'</strong><span></span><button class="secondary danger-v1" data-delete-fixed="'+w.esc(n)+'">🗑 Delete</button></div>').join('')||'<div class="small">No students yet.</div>';box.querySelectorAll('[data-delete-fixed]').forEach(b=>b.onclick=()=>{const name=b.dataset.deleteFixed,course=cfg.courses.find(x=>x.name===sel.value);if(!course)return;if(!confirm('Delete '+name+' from '+course.name+'? Their locally stored records for this class will also be deleted.'))return;course.students=course.students.filter(x=>x!==name);delete w.state.students?.[course.name]?.[name];try{const a=JSON.parse(localStorage.getItem(ASSIGN_KEY));(a?.classes?.[course.name]?.assignments||[]).forEach(x=>{if(x.students)delete x.students[name]});localStorage.setItem(ASSIGN_KEY,JSON.stringify(a))}catch(e){}saveCfg(cfg);syncFromCfg(w,cfg);renderStudents();renderCourses()})}

    studentNav.onclick=e=>{e.preventDefault();showView(d,'studentManagerView',studentNav);renderStudents()};
    courseNav.onclick=e=>{e.preventDefault();showView(d,'courseManagerView',courseNav);renderCourses()};
    d.getElementById('studentBackFixed').onclick=()=>showView(d,'dashboardView',d.querySelector('.nav button[data-view="dashboard"]'));
    d.getElementById('courseBackFixed').onclick=()=>showView(d,'dashboardView',d.querySelector('.nav button[data-view="dashboard"]'));
    d.getElementById('studentClassFixed').onchange=renderStudents;
    d.getElementById('studentAddFixed').onclick=()=>{cfg=getCfg(w);const sel=d.getElementById('studentClassFixed'),inp=d.getElementById('studentNameFixed'),name=inp.value.trim(),course=cfg.courses.find(c=>c.name===sel.value&&!c.archived);if(!name){alert('Enter a student name.');return}if(!course)return;if(course.students.some(x=>x.toLowerCase()===name.toLowerCase())){alert('That student is already in this class.');return}course.students.push(name);if(!w.state.students[course.name])w.state.students[course.name]={};w.state.students[course.name][name]=blankStudent();saveCfg(cfg);syncFromCfg(w,cfg);inp.value='';renderStudents();renderCourses()};
    d.getElementById('addCourseFixed').onclick=()=>{cfg=getCfg(w);const inp=d.getElementById('newCourseNameFixed'),name=inp.value.trim();if(!name){alert('Enter a course name.');return}if(cfg.courses.some(c=>c.name.toLowerCase()===name.toLowerCase())){alert('That course already exists.');return}cfg.courses.push({name,archived:false,students:[]});w.state.students[name]={};saveCfg(cfg);syncFromCfg(w,cfg);inp.value='';renderCourses();renderStudents()};
    renderCourses();renderStudents();
    return true;
  }

  function installButtonFeedback(){const d=frame.contentDocument;if(!d||!d.head)return false;if(!d.getElementById('buttonFeedbackStyles')){const style=d.createElement('style');style.id='buttonFeedbackStyles';style.textContent='button{transition:transform .08s ease,box-shadow .12s ease,background-color .12s ease,border-color .12s ease,filter .12s ease}button:active,.button-pressed{transform:translateY(2px) scale(.97)!important;filter:brightness(1.25);box-shadow:inset 0 3px 7px rgba(0,0,0,.38),0 0 0 2px rgba(255,255,255,.12)!important}.status-btn.active{font-weight:900!important;color:#071b17!important}.status-btn.active[data-status="P"]{background:var(--green)!important}.status-btn.active[data-status="A"]{background:var(--red)!important}.status-btn.active[data-status="E"]{background:var(--yellow)!important}.status-btn.active[data-status="L"]{background:var(--blue)!important}';d.head.appendChild(style)}if(d.body.dataset.buttonFeedback!=='1'){d.body.dataset.buttonFeedback='1';d.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b)b.classList.add('button-pressed')},true);const release=e=>{const b=e.target.closest?.('button');if(b)setTimeout(()=>b.classList.remove('button-pressed'),90)};d.addEventListener('pointerup',release,true);d.addEventListener('pointercancel',release,true)}return true}

  function installAttendanceRepair(){const d=frame.contentDocument,w=frame.contentWindow;if(!d||!d.body||!w||d.body.dataset.attendanceRepair==='1')return false;d.body.dataset.attendanceRepair='1';d.addEventListener('click',e=>{const b=e.target.closest('.status-btn[data-student][data-status]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const cls=w.currentClass,student=b.dataset.student,status=b.dataset.status,rec=w.state?.students?.[cls]?.[student];if(!rec)return;const now=new Date(),local=new Date(now.getTime()-now.getTimezoneOffset()*60000),date=local.toISOString().slice(0,10);if(!Array.isArray(rec.attendance))rec.attendance=[];const idx=rec.attendance.findIndex(x=>x.date===date);if(idx>=0)rec.attendance[idx].status=status;else rec.attendance.push({date,status});w.state.currentClass=cls;localStorage.setItem(w.KEY||'neil_teacher_dashboard_v1',JSON.stringify(w.state));if(typeof w.renderAll==='function')w.renderAll()},true);return true}

  function apply(){const d=frame.contentDocument;if(!d||!d.head||!d.body)return false;const nav=d.querySelector('.nav');if(nav)dedupeButtons(nav,'button',['notesCentreNav','winstonExportNav','studentManagerNav','courseManagerNav','attendanceHistoryNav','assignmentTrackerNav','resetBtn']);if(!d.getElementById('sidebarNavigationFix')){const s=d.createElement('style');s.id='sidebarNavigationFix';s.textContent='.sidebar{overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding-bottom:18px!important}.sidebar .nav{padding-bottom:8px}.sidebar .nav button{padding:9px 11px!important;margin:2px 0!important}.sidebar .quote{position:static!important;display:block!important;margin:12px 8px 8px!important;font-size:12px!important}';d.head.appendChild(s)}if(!d.getElementById('attendanceScrollFix')){const s=d.createElement('style');s.id='attendanceScrollFix';s.textContent='#attendanceMonthOverview.month-overview{height:min(58vh,560px)!important;max-height:min(58vh,560px)!important;overflow:auto!important}#attendanceMonthOverview table thead th{position:sticky;top:0;background:#17332e;z-index:4}#attendanceMonthOverview table thead th:first-child{left:0;z-index:6}';d.head.appendChild(s)}installButtonFeedback();installAttendanceRepair();ensureManagementUI();return true}

  frame.addEventListener('load',()=>setTimeout(apply,700));let tries=0;const timer=setInterval(()=>{apply();if(++tries>50)clearInterval(timer)},250);
})();