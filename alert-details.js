(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const ASSIGN_KEY='neil_teacher_assignments_v1';

  function esc(w,s){return w.esc?w.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function todayISO(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
  function readAssignments(w){try{return JSON.parse(w.localStorage.getItem(ASSIGN_KEY))||{classes:{}}}catch(e){return{classes:{}}}}
  function absenceCount(w,r){if(typeof w.absences==='function')return w.absences(r);return (r?.attendance||[]).filter(x=>x.status==='A'||x.status==='E').length}

  function ensureStyles(d){
    if(d.getElementById('alertDetailStyles'))return;
    const s=d.createElement('style');s.id='alertDetailStyles';s.textContent=`
      .alert-click-hint{font-size:11px;color:var(--muted);margin:-7px 0 10px}
      .kpi.alert-detail-kpi{cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease}
      .kpi.alert-detail-kpi:hover,.kpi.alert-detail-kpi:focus{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.26);transform:translateY(-1px);outline:none}
      .kpi.alert-detail-kpi:after{content:'View names';display:block;font-size:9px;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.6px}
      #homeworkSummary .alert-item.alert-detail-homework{cursor:pointer;transition:background .12s ease,border-color .12s ease}
      #homeworkSummary .alert-item.alert-detail-homework:hover,#homeworkSummary .alert-item.alert-detail-homework:focus{background:rgba(255,255,255,.065);border-color:rgba(255,255,255,.25);outline:none}
      .alert-detail-overlay{position:fixed;inset:0;z-index:100200;background:rgba(0,0,0,.66);display:flex;align-items:center;justify-content:center;padding:18px}
      .alert-detail-modal{width:min(680px,96vw);max-height:86vh;overflow:auto;background:#17332e;border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.55)}
      .alert-detail-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.alert-detail-head h2{margin:0;font-family:"Segoe Print","Comic Sans MS",cursive}.alert-detail-head button{padding:7px 10px}
      .alert-detail-list{display:grid;gap:8px}.alert-detail-person{border:1px solid rgba(255,255,255,.13);border-radius:10px;padding:10px 12px;background:rgba(0,0,0,.08);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start}
      .alert-detail-person strong{font-size:15px}.alert-detail-meta{font-size:11px;color:var(--muted);margin-top:3px}.alert-detail-badge{display:inline-flex;min-width:38px;height:30px;align-items:center;justify-content:center;border:2px solid currentColor;border-radius:999px;font-weight:900}.alert-detail-empty{padding:18px;border:1px dashed rgba(255,255,255,.18);border-radius:10px;color:var(--muted);text-align:center}
      .homework-detail-shell{display:grid;gap:13px}.homework-detail-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.homework-detail-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.homework-detail-controls select{min-width:210px}
      .homework-student-card{border:1px solid rgba(255,255,255,.13);border-radius:11px;padding:12px 14px;background:rgba(0,0,0,.08)}.homework-student-card h4{margin:0 0 7px;font-size:16px}.homework-assignment-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:7px 0;border-top:1px dashed rgba(255,255,255,.11)}.homework-assignment-row:first-of-type{border-top:0}.homework-assignment-name{font-weight:700}.homework-status-chip{font-size:10px;border:1px solid rgba(255,255,255,.17);border-radius:999px;padding:4px 7px;white-space:nowrap}.homework-status-chip.overdue{color:var(--red);border-color:rgba(255,107,107,.45)}.homework-status-chip.today{color:var(--yellow);border-color:rgba(246,211,101,.45)}
      @media(max-width:650px){.alert-detail-person,.homework-assignment-row{grid-template-columns:1fr}.homework-detail-controls>*{width:100%}}
    `;d.head.appendChild(s);
  }

  function attendanceRows(w,threshold){
    const cls=w.currentClass||'';const students=w.state?.students?.[cls]||{};
    return Object.entries(students).map(([student,r])=>{
      const total=absenceCount(w,r);const absent=(r.attendance||[]).filter(x=>x.status==='A').length;const excused=(r.attendance||[]).filter(x=>x.status==='E').length;
      const last=(r.attendance||[]).filter(x=>x.status==='A'||x.status==='E').map(x=>x.date).sort().pop()||'';
      return{student,total,absent,excused,last};
    }).filter(x=>x.total>=threshold).sort((a,b)=>b.total-a.total||a.student.localeCompare(b.student));
  }

  function openAttendanceModal(d,w,threshold){
    d.getElementById('alertDetailOverlay')?.remove();
    const rows=attendanceRows(w,threshold),cls=w.currentClass||'Current Class';
    const overlay=d.createElement('div');overlay.id='alertDetailOverlay';overlay.className='alert-detail-overlay';
    const action=threshold>=20?'Student Success Team referral':('TEXT JAKE');
    overlay.innerHTML='<div class="alert-detail-modal"><div class="alert-detail-head"><div><h2>Attendance Alert — '+threshold+'+</h2><div class="small">'+esc(w,cls)+' · '+rows.length+' student'+(rows.length===1?'':'s')+' at or above this threshold</div></div><button class="secondary" id="closeAlertDetail">× Close</button></div><div class="alert-detail-list">'+(rows.length?rows.map(x=>'<div class="alert-detail-person"><div><strong>'+esc(w,x.student)+'</strong><div class="alert-detail-meta">'+x.absent+' absent · '+x.excused+' excused'+(x.last?' · most recent '+esc(w,x.last):'')+'</div><div class="alert-detail-meta">Follow-up: <strong>'+esc(w,action)+'</strong></div></div><span class="alert-detail-badge b'+(x.total>=20?'20':x.total>=15?'15':x.total>=10?'10':'5')+'">'+x.total+'</span></div>').join(''):'<div class="alert-detail-empty">No students are currently at this attendance threshold.</div>')+'</div></div>';
    d.body.appendChild(overlay);const close=()=>overlay.remove();overlay.querySelector('#closeAlertDetail').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
  }

  function trackerAlerts(w,cls){
    const data=readAssignments(w),today=todayISO(),out=[];
    const assignments=data?.classes?.[cls]?.assignments||[];
    assignments.filter(a=>!a.archived).forEach(a=>{
      const due=a.due||'';
      Object.entries(a.students||{}).forEach(([student,r])=>{
        if(r?.submitted)return;
        if(!due||due>today)return;
        out.push({class:cls,student,assignment:a.name||'Untitled Assignment',due,status:due<today?'Overdue':'Due Today',source:'tracker'});
      });
    });
    return out;
  }

  function legacyAlerts(w,cls){
    const out=[];Object.entries(w.state?.students?.[cls]||{}).forEach(([student,r])=>{
      (r.missing||[]).filter(m=>m.active!==false).forEach(m=>out.push({class:cls,student,assignment:m.name||'Missing work',due:m.due||m.date||'',status:m.status||'Missing',source:'legacy'}));
    });return out;
  }

  function combinedAlerts(w,cls){
    const rows=[...trackerAlerts(w,cls),...legacyAlerts(w,cls)],seen=new Set();
    return rows.filter(x=>{const k=[x.class,x.student,x.assignment,x.status,x.due].join('|').toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
  }

  function renderHomeworkSummary(d,w){
    const box=d.getElementById('homeworkSummary');if(!box)return;
    const cls=w.currentClass||'',rows=combinedAlerts(w,cls);
    const counts={Overdue:0,'Due Today':0,'Other Flagged':0};
    rows.forEach(x=>{if(x.status==='Overdue'||x.status==='Overdue (>1 week)')counts.Overdue++;else if(x.status==='Due Today')counts['Due Today']++;else counts['Other Flagged']++});
    const labels=[['Overdue',counts.Overdue],['Due Today',counts['Due Today']],['Other Flagged',counts['Other Flagged']]];
    const html='<div class="alert-click-hint">Click an alert to see student names and assignments.</div>'+labels.map(([label,count])=>'<div class="alert-item alert-detail-homework" tabindex="0" role="button" data-homework-filter="'+label+'"><span>'+esc(w,label)+'</span><strong>'+count+'</strong></div>').join('');
    if(box.dataset.alertDetailHtml!==html){box.dataset.alertDetailHtml=html;box.innerHTML=html;}
    box.querySelectorAll('[data-homework-filter]').forEach(el=>{
      const go=()=>openHomeworkView(d,w,el.dataset.homeworkFilter,cls);
      el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};
    });
    const panel=box.closest('.panel');if(panel){const h=panel.querySelector('h3');if(h){h.style.cursor='pointer';h.title='View student names and missing assignments';h.onclick=()=>openHomeworkView(d,w,'All',cls);}}
  }

  function ensureHomeworkView(d){
    const view=d.getElementById('homeworkView');if(!view)return null;
    const panel=view.querySelector('.panel')||view;
    if(panel.dataset.alertDetailBuilt!=='1'){
      panel.dataset.alertDetailBuilt='1';
      panel.innerHTML='<div class="homework-detail-shell"><div class="homework-detail-top"><div><h2>Homework Alerts</h2><div class="history-help">Students with work due today, overdue assignments, or other manually flagged missing work.</div></div><button class="secondary" id="homeworkDetailBack">← Back to Dashboard</button></div><div class="homework-detail-controls"><label class="small">Class <select id="homeworkDetailClass"></select></label><label class="small">Show <select id="homeworkDetailFilter"><option>All</option><option>Overdue</option><option>Due Today</option><option>Other Flagged</option></select></label></div><div id="homeworkDetailList"></div></div>';
    }
    return view;
  }

  function renderHomeworkFull(d,w){
    const view=ensureHomeworkView(d);if(!view)return;
    const classSel=d.getElementById('homeworkDetailClass'),filterSel=d.getElementById('homeworkDetailFilter'),list=d.getElementById('homeworkDetailList');if(!classSel||!filterSel||!list)return;
    if(!classSel.options.length){classSel.innerHTML='<option>All Classes</option>'+Object.keys(w.ROSTERS||{}).map(c=>'<option>'+esc(w,c)+'</option>').join('')}
    let classes=classSel.value==='All Classes'?Object.keys(w.ROSTERS||{}):[classSel.value];let rows=classes.flatMap(c=>combinedAlerts(w,c));
    const f=filterSel.value;if(f==='Overdue')rows=rows.filter(x=>x.status==='Overdue'||x.status==='Overdue (>1 week)');else if(f==='Due Today')rows=rows.filter(x=>x.status==='Due Today');else if(f==='Other Flagged')rows=rows.filter(x=>!['Overdue','Overdue (>1 week)','Due Today'].includes(x.status));
    rows.sort((a,b)=>a.class.localeCompare(b.class)||a.student.localeCompare(b.student)||String(a.due).localeCompare(String(b.due)));
    const grouped=new Map();rows.forEach(x=>{const k=x.class+'|'+x.student;if(!grouped.has(k))grouped.set(k,{class:x.class,student:x.student,items:[]});grouped.get(k).items.push(x)});
    list.innerHTML=grouped.size?[...grouped.values()].map(g=>'<div class="homework-student-card"><h4>'+esc(w,g.student)+' <span class="small">· '+esc(w,g.class)+'</span></h4>'+g.items.map(x=>'<div class="homework-assignment-row"><div><div class="homework-assignment-name">'+esc(w,x.assignment)+'</div><div class="small">'+(x.due?'Due '+esc(w,x.due):'No due date recorded')+'</div></div><span class="homework-status-chip '+((x.status==='Overdue'||x.status==='Overdue (>1 week)')?'overdue':x.status==='Due Today'?'today':'')+'">'+esc(w,x.status)+'</span></div>').join('')+'</div>').join(''):'<div class="alert-detail-empty">No homework alerts match this view.</div>';
    classSel.onchange=()=>renderHomeworkFull(d,w);filterSel.onchange=()=>renderHomeworkFull(d,w);
    d.getElementById('homeworkDetailBack').onclick=()=>{if(typeof w.teacherShowOnly==='function')w.teacherShowOnly('dashboardView');else{view.classList.add('hidden');d.getElementById('dashboardView')?.classList.remove('hidden')}};
  }

  function openHomeworkView(d,w,filter,cls){
    ensureHomeworkView(d);const classSel=d.getElementById('homeworkDetailClass'),filterSel=d.getElementById('homeworkDetailFilter');
    if(classSel){if(!classSel.options.length)classSel.innerHTML='<option>All Classes</option>'+Object.keys(w.ROSTERS||{}).map(c=>'<option>'+esc(w,c)+'</option>').join('');classSel.value=(cls&&w.ROSTERS?.[cls])?cls:'All Classes'}
    if(filterSel)filterSel.value=filter||'All';
    if(typeof w.teacherShowOnly==='function')w.teacherShowOnly('homeworkView');else{d.querySelectorAll('main.main>section').forEach(s=>s.classList.toggle('hidden',s.id!=='homeworkView'))}
    renderHomeworkFull(d,w);
  }

  function wireSidebarHomework(d,w){
    const nav=[...d.querySelectorAll('.nav button')].find(b=>b.dataset.view==='homework');if(!nav)return;
    nav.onclick=e=>{e.preventDefault();e.stopPropagation();openHomeworkView(d,w,'All','All Classes')};
  }

  function decorateAttendance(d,w){
    const box=d.querySelector('#dashboardView .kpis');if(!box)return;
    if(!box.previousElementSibling?.classList?.contains('alert-click-hint')){const hint=d.createElement('div');hint.className='alert-click-hint';hint.textContent='Click a threshold to see the student names.';box.parentNode.insertBefore(hint,box)}
    [5,10,15,20].forEach(t=>{const n=d.getElementById('a'+t);const k=n?.closest('.kpi');if(!k)return;k.classList.add('alert-detail-kpi');k.tabIndex=0;k.setAttribute('role','button');k.setAttribute('aria-label','View students with '+t+' or more absences');const go=()=>openAttendanceModal(d,w,t);k.onclick=go;k.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
  }

  let busy=false;
  function refresh(){
    if(busy)return false;const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!d.body||!w.state||!w.ROSTERS)return false;busy=true;
    try{ensureStyles(d);decorateAttendance(d,w);renderHomeworkSummary(d,w);ensureHomeworkView(d);wireSidebarHomework(d,w);return true}finally{busy=false}
  }

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!d.body||!w)return false;refresh();
    if(!w.__alertDetailObserver){let timer=null;w.__alertDetailObserver=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,80)});w.__alertDetailObserver.observe(d.body,{childList:true,subtree:true,characterData:true});}
    return true;
  }
  frame.addEventListener('load',()=>setTimeout(install,1000));let tries=0;const timer=setInterval(()=>{install();if(++tries>80)clearInterval(timer)},250);
})();