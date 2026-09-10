(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.head||d.getElementById('notesExportUpgrade'))return false;
    if(!w.ROSTERS||!w.state||!w.KEY||!w.teacherShowOnly)return false;

    const style=d.createElement('style');
    style.id='notesExportUpgrade';
    style.textContent=`
      .notes-shell,.export-shell{display:grid;gap:14px}
      .notes-top,.export-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
      .notes-heading,.export-heading{font-family:"Segoe Print","Comic Sans MS",cursive;font-size:24px;margin:0}
      .notes-form{display:grid;grid-template-columns:minmax(170px,.8fr) minmax(170px,.8fr) minmax(160px,.7fr) minmax(150px,.65fr);gap:9px;align-items:end}
      .notes-form label,.notes-editor label{display:grid;gap:4px;font-size:12px;color:var(--muted)}
      .notes-form textarea{grid-column:1/-1;min-height:86px}
      .notes-actions{display:flex;gap:8px;flex-wrap:wrap;grid-column:1/-1}
      .notes-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-top:4px}
      .notes-filters select,.notes-filters input{min-width:160px}
      .notes-list{display:grid;gap:9px}
      .note-card{border:1px solid rgba(255,255,255,.13);border-radius:10px;padding:11px 12px;background:rgba(0,0,0,.07);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}
      .note-meta{font-size:11px;color:var(--muted);margin-bottom:5px}.note-text{line-height:1.4;white-space:pre-wrap}.note-category{display:inline-block;padding:3px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.16);font-size:10px;margin-left:5px}
      .note-buttons{display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap}.note-buttons button{padding:6px 8px;font-size:11px}
      .notes-empty{padding:18px;border:1px dashed rgba(255,255,255,.18);border-radius:10px;color:var(--muted);text-align:center}
      .recent-notes-tools{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px}.recent-notes-tools button{padding:6px 8px;font-size:11px}
      .recent-note-link{cursor:pointer}.recent-note-link:hover{background:rgba(255,255,255,.05)}
      .export-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .export-card{border:1px solid rgba(255,255,255,.13);border-radius:11px;padding:14px;background:rgba(0,0,0,.07)}
      .export-card h3{margin-top:0}.export-card p{color:var(--muted);font-size:13px;line-height:1.45}.export-card button{margin-top:6px}
      .export-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.export-stat{padding:10px;border:1px solid rgba(255,255,255,.12);border-radius:9px;text-align:center}.export-stat strong{display:block;font-size:22px}
      .privacy-note{padding:12px;border-left:3px solid var(--yellow);background:rgba(246,211,101,.05);font-size:12px;line-height:1.45}
      .winston-status{margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid rgba(99,214,139,.45);background:rgba(99,214,139,.08);font-size:13px;line-height:1.4}
      .winston-status.warn{border-color:rgba(246,211,101,.45);background:rgba(246,211,101,.07)}
      @media(max-width:900px){.notes-form{grid-template-columns:1fr 1fr}.export-grid{grid-template-columns:1fr}.export-summary{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){.notes-form{grid-template-columns:1fr}.notes-form textarea,.notes-actions{grid-column:auto}.note-card{grid-template-columns:1fr}.notes-filters>*{width:100%}}
    `;
    d.head.appendChild(style);

    const main=d.querySelector('main.main');
    const notesSection=d.createElement('section');
    notesSection.id='notesCentreView';notesSection.className='hidden';
    notesSection.innerHTML=`<div class="panel notes-shell"><div class="notes-top"><div><h2 class="notes-heading">Notes Centre</h2><div class="history-help">Record, review, edit, and filter teacher observations. Notes are dated and saved on this device.</div></div><button class="secondary" id="notesBackBtn">← Back to Dashboard</button></div><div><h3>Add Observation</h3><div class="notes-form"><label>Class<select id="notesClass"></select></label><label>Student<select id="notesStudent"></select></label><label>Category<select id="notesCategory"><option>Participation</option><option>Academic</option><option>Behaviour</option><option>Attendance Follow-up</option><option>Parent Contact</option><option>Accommodation/Support</option><option>General</option></select></label><label>Date<input type="date" id="notesDate"></label><textarea id="notesText" placeholder="Observation, participation evidence, follow-up, parent contact, support note..."></textarea><div class="notes-actions"><button class="primary" id="saveCentreNote">Save Note</button><button class="secondary hidden" id="cancelNoteEdit">Cancel Edit</button></div></div></div><div><h3>Observation Log</h3><div class="notes-filters"><select id="notesFilterClass"></select><select id="notesFilterStudent"></select><select id="notesFilterCategory"><option>All Categories</option><option>Participation</option><option>Academic</option><option>Behaviour</option><option>Attendance Follow-up</option><option>Parent Contact</option><option>Accommodation/Support</option><option>General</option></select><input type="search" id="notesSearch" placeholder="Search notes"></div><div class="notes-list" id="notesCentreList"></div></div></div>`;
    main.appendChild(notesSection);

    const exportSection=d.createElement('section');
    exportSection.id='winstonExportView';exportSection.className='hidden';
    exportSection.innerHTML=`<div class="panel export-shell"><div class="export-top"><div><h2 class="export-heading">Send to Winston</h2><div class="history-help">Copy your current teacher data, then paste it directly into this ChatGPT conversation.</div></div><button class="secondary" id="exportBackBtn">← Back to Dashboard</button></div><div class="export-summary" id="exportSummary"></div><div class="export-grid"><div class="export-card"><h3>Send Current Teacher Data</h3><p>Copies attendance, participation, notes, missing work, roster changes, and Assignment Tracker data to your clipboard. Then return to ChatGPT, paste, and send.</p><button class="primary" id="downloadWinstonJson">↗ Send to Winston</button><div id="winstonSendStatus" class="winston-status" style="display:none"></div></div><div class="export-card"><h3>Readable Gradebook CSV</h3><p>Creates a spreadsheet-friendly CSV of assignment marks and submission status. Useful for a quick backup or opening in Excel/Sheets.</p><button class="secondary" id="downloadGradeCsv">Download Assignment CSV</button></div></div><div class="privacy-note"><strong>Privacy:</strong> this data contains identifiable student information. Only paste/share it where your school or board permits.</div></div>`;
    main.appendChild(exportSection);

    const nav=d.querySelector('.nav');
    if(nav){
      const reset=d.getElementById('resetBtn');
      const n=d.createElement('button');n.id='notesCentreNav';n.textContent='🗒 Notes';nav.insertBefore(n,reset);
      const x=d.createElement('button');x.id='winstonExportNav';x.textContent='↗ Send to Winston';nav.insertBefore(x,reset);
    }

    const pad=n=>String(n).padStart(2,'0'),iso=x=>x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());
    let editRef=null;
    const notesClass=d.getElementById('notesClass'),notesStudent=d.getElementById('notesStudent'),notesCategory=d.getElementById('notesCategory'),notesDate=d.getElementById('notesDate'),notesText=d.getElementById('notesText');
    const filterClass=d.getElementById('notesFilterClass'),filterStudent=d.getElementById('notesFilterStudent'),filterCategory=d.getElementById('notesFilterCategory'),search=d.getElementById('notesSearch');

    function classOptions(includeAll=false){return (includeAll?'<option>All Classes</option>':'')+Object.keys(w.ROSTERS).map(c=>'<option>'+w.esc(c)+'</option>').join('')}
    notesClass.innerHTML=classOptions();filterClass.innerHTML=classOptions(true);notesClass.value=w.currentClass||Object.keys(w.ROSTERS)[0];notesDate.value=iso(new Date());
    function fillStudents(sel,cls,all=false){sel.innerHTML=(all?'<option>All Students</option>':'')+(cls&&w.ROSTERS[cls]?w.ROSTERS[cls].map(n=>'<option>'+w.esc(n)+'</option>').join(''):'')}
    fillStudents(notesStudent,notesClass.value);fillStudents(filterStudent,'',true);

    function normalizeNotes(){Object.entries(w.state.students).forEach(([cls,students])=>Object.entries(students).forEach(([student,r])=>{if(!Array.isArray(r.notes))r.notes=[];r.notes.forEach(n=>{if(!n.category)n.category='General';if(!n.id)n.id='n'+Date.now()+Math.random().toString(36).slice(2,7)})}))}
    function saveState(){localStorage.setItem(w.KEY,JSON.stringify(w.state));if(typeof w.renderAll==='function')w.renderAll();refreshDashboardNotes();renderNotesCentre()}
    function allNotes(){const out=[];Object.entries(w.state.students).forEach(([cls,students])=>Object.entries(students).forEach(([student,r])=>(r.notes||[]).forEach(n=>out.push({cls,student,n}))));return out.sort((a,b)=>(b.n.date||'').localeCompare(a.n.date||''))}
    function renderNotesCentre(){normalizeNotes();let rows=allNotes();if(filterClass.value&&filterClass.value!=='All Classes')rows=rows.filter(x=>x.cls===filterClass.value);if(filterStudent.value&&filterStudent.value!=='All Students')rows=rows.filter(x=>x.student===filterStudent.value);if(filterCategory.value&&filterCategory.value!=='All Categories')rows=rows.filter(x=>(x.n.category||'General')===filterCategory.value);const q=search.value.trim().toLowerCase();if(q)rows=rows.filter(x=>(x.n.text+' '+x.student+' '+x.cls+' '+(x.n.category||'General')).toLowerCase().includes(q));const list=d.getElementById('notesCentreList');if(!rows.length){list.innerHTML='<div class="notes-empty">No notes match these filters.</div>';return}list.innerHTML=rows.map(x=>'<div class="note-card"><div><div class="note-meta">'+w.esc(x.n.date||'')+' · <strong>'+w.esc(x.student)+'</strong> · '+w.esc(x.cls)+' <span class="note-category">'+w.esc(x.n.category||'General')+'</span></div><div class="note-text">'+w.esc(x.n.text)+'</div></div><div class="note-buttons"><button class="secondary" data-note-edit="'+x.n.id+'">Edit</button><button class="secondary" data-note-delete="'+x.n.id+'">Delete</button></div></div>').join('');list.querySelectorAll('[data-note-edit]').forEach(b=>b.onclick=()=>beginEdit(b.dataset.noteEdit));list.querySelectorAll('[data-note-delete]').forEach(b=>b.onclick=()=>deleteNote(b.dataset.noteDelete))}
    function findNote(id){for(const [cls,students] of Object.entries(w.state.students))for(const [student,r] of Object.entries(students)){const idx=(r.notes||[]).findIndex(n=>n.id===id);if(idx>=0)return{cls,student,idx,n:r.notes[idx]}}return null}
    function beginEdit(id){const f=findNote(id);if(!f)return;editRef=f;notesClass.value=f.cls;fillStudents(notesStudent,f.cls);notesStudent.value=f.student;notesCategory.value=f.n.category||'General';notesDate.value=f.n.date||iso(new Date());notesText.value=f.n.text||'';d.getElementById('saveCentreNote').textContent='Save Changes';d.getElementById('cancelNoteEdit').classList.remove('hidden');notesText.focus();notesText.scrollIntoView({behavior:'smooth',block:'center'})}
    function clearEdit(){editRef=null;notesText.value='';notesDate.value=iso(new Date());d.getElementById('saveCentreNote').textContent='Save Note';d.getElementById('cancelNoteEdit').classList.add('hidden')}
    function deleteNote(id){const f=findNote(id);if(!f)return;if(!confirm('Delete this note?'))return;w.state.students[f.cls][f.student].notes.splice(f.idx,1);saveState()}
    function refreshDashboardNotes(){const box=d.getElementById('recentNotes');if(!box)return;normalizeNotes();const rows=allNotes().filter(x=>x.cls===(w.currentClass||x.cls)).slice(0,5);box.innerHTML='<div class="recent-notes-tools"><span class="small">Latest observations</span><button class="secondary" id="openAllNotes">View / Add Notes</button></div>'+(rows.length?rows.map(x=>'<div class="alert-item recent-note-link" data-recent-note="'+x.n.id+'"><span><strong>'+w.esc(x.student)+'</strong> <span class="note-category">'+w.esc(x.n.category||'General')+'</span><br><span class="small">'+w.esc(x.n.text)+'</span></span><span class="small">'+w.esc(x.n.date||'')+'</span></div>').join(''):'<div class="small">No notes yet.</div>');d.getElementById('openAllNotes').onclick=()=>openNotes(w.currentClass);box.querySelectorAll('[data-recent-note]').forEach(el=>el.onclick=()=>{openNotes(w.currentClass);beginEdit(el.dataset.recentNote)})}

    function showOnly(id){['dashboardView','homeworkView','reportsView','attendanceHistoryView','assignmentTrackerView','notesCentreView','winstonExportView'].forEach(x=>d.getElementById(x)?.classList.toggle('hidden',x!==id));d.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));const map={notesCentreView:'notesCentreNav',winstonExportView:'winstonExportNav',attendanceHistoryView:'attendanceHistoryNav',assignmentTrackerView:'assignmentTrackerNav'};if(map[id])d.getElementById(map[id])?.classList.add('active');else d.querySelector('.nav button[data-view="dashboard"]')?.classList.add('active')}
    w.teacherShowOnly=function(id){showOnly(id)};
    function openNotes(cls){if(cls&&w.ROSTERS[cls]){notesClass.value=cls;filterClass.value=cls;fillStudents(notesStudent,cls);fillStudents(filterStudent,cls,true)}showOnly('notesCentreView');renderNotesCentre()}
    w.openNotesCentre=openNotes;

    notesClass.onchange=()=>fillStudents(notesStudent,notesClass.value);
    filterClass.onchange=()=>{fillStudents(filterStudent,filterClass.value==='All Classes'?'':filterClass.value,true);renderNotesCentre()};filterStudent.onchange=renderNotesCentre;filterCategory.onchange=renderNotesCentre;search.oninput=renderNotesCentre;
    d.getElementById('saveCentreNote').onclick=()=>{const text=notesText.value.trim();if(!text){alert('Enter a note.');return}normalizeNotes();if(editRef){const f=findNote(editRef.n.id);if(f){if(f.cls!==notesClass.value||f.student!==notesStudent.value){w.state.students[f.cls][f.student].notes.splice(f.idx,1);w.state.students[notesClass.value][notesStudent.value].notes.push(f.n)}f.n.text=text;f.n.date=notesDate.value||iso(new Date());f.n.category=notesCategory.value||'General'}}else{w.state.students[notesClass.value][notesStudent.value].notes.push({id:'n'+Date.now()+Math.random().toString(36).slice(2,7),text,date:notesDate.value||iso(new Date()),category:notesCategory.value||'General'})}clearEdit();saveState()};
    d.getElementById('cancelNoteEdit').onclick=clearEdit;d.getElementById('notesBackBtn').onclick=()=>showOnly('dashboardView');d.getElementById('notesCentreNav').onclick=()=>openNotes(w.currentClass);d.getElementById('winstonExportNav').onclick=()=>{showOnly('winstonExportView');renderExportSummary()};d.getElementById('exportBackBtn').onclick=()=>showOnly('dashboardView');

    d.addEventListener('click',e=>{const b=e.target.closest('.class-card .mini-btn');if(b&&b.textContent.trim()==='Participation'){/* leave participation button unchanged */}const add=e.target.closest('#addNoteBtn');if(add){e.preventDefault();e.stopImmediatePropagation();openNotes(w.currentClass)}},true);

    function assignmentData(){try{return JSON.parse(localStorage.getItem('neil_teacher_assignments_v1'))||{}}catch(e){return{}}}
    function buildExport(){normalizeNotes();return{format:'teacher-command-centre-winston-export',version:7,exportedAt:new Date().toISOString(),teacherApp:{currentClass:w.currentClass,studentData:w.state},assignmentTracker:assignmentData()}}
    function download(name,type,text){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=d.createElement('a');a.href=url;a.download=name;d.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
    function renderExportSummary(){const notes=allNotes().length;let attendance=0;Object.values(w.state.students).forEach(ss=>Object.values(ss).forEach(r=>attendance+=(r.attendance||[]).length));const a=assignmentData();let assignments=0,marks=0;Object.values(a.classes||{}).forEach(c=>(c.assignments||[]).forEach(x=>{assignments++;Object.values(x.students||{}).forEach(s=>{if(String(s.mark??'').trim()!=='')marks++})}));d.getElementById('exportSummary').innerHTML='<div class="export-stat"><strong>'+attendance+'</strong><span class="small">attendance records</span></div><div class="export-stat"><strong>'+notes+'</strong><span class="small">notes</span></div><div class="export-stat"><strong>'+assignments+'</strong><span class="small">assignments</span></div><div class="export-stat"><strong>'+marks+'</strong><span class="small">marks entered</span></div>'}
    function setWinstonStatus(message,warn=false){const box=d.getElementById('winstonSendStatus');box.style.display='block';box.classList.toggle('warn',warn);box.textContent=message}
    async function copyWinstonData(){
      const btn=d.getElementById('downloadWinstonJson');
      const text=JSON.stringify(buildExport(),null,2);
      btn.disabled=true;btn.textContent='Preparing…';
      let copied=false;
      try{await navigator.clipboard.writeText(text);copied=true}catch(err){
        try{const ta=d.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';d.body.appendChild(ta);ta.select();copied=d.execCommand('copy');ta.remove()}catch(_){copied=false}
      }
      if(copied){btn.textContent='✓ Copied — paste in ChatGPT';setWinstonStatus('Ready. Return to this ChatGPT conversation, press Ctrl+V, and send. Winston will reply “Yeah I got it.”')}else{btn.textContent='Copy blocked';setWinstonStatus('Your browser blocked clipboard access. Try this dashboard in Chrome or Edge, or use the newest downloaded Winston export as a fallback.',true)}
      btn.disabled=false;
    }
    d.getElementById('downloadWinstonJson').onclick=copyWinstonData;
    d.getElementById('downloadGradeCsv').onclick=()=>{const data=assignmentData(),rows=[['Class','Assignment','Assigned','Due','Out Of','Student','Handed In','Mark']];Object.entries(data.classes||{}).forEach(([cls,c])=>(c.assignments||[]).forEach(a=>Object.entries(a.students||{}).forEach(([student,r])=>rows.push([cls,a.name,a.assigned||'',a.due||'',a.maxMark||100,student,r.submitted?'Yes':'No',r.mark??'']))));const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n');download('teacher-command-centre-assignments-'+iso(new Date())+'.csv','text/csv;charset=utf-8',csv)};

    normalizeNotes();renderNotesCentre();refreshDashboardNotes();
    const oldRenderNotes=w.renderNotes;if(typeof oldRenderNotes==='function')w.renderNotes=function(){oldRenderNotes();refreshDashboardNotes()};
  }

  function tryInstall(){if(!install())setTimeout(tryInstall,500)}
  frame.addEventListener('load',()=>setTimeout(tryInstall,300));
  setTimeout(tryInstall,800);
})();