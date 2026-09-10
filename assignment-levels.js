(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const ASSIGN_KEY='neil_teacher_assignments_v1';
  const REOPEN_KEY='neil_assignment_reopen_v1';
  const LEVELS=['R','1-','1','1+','2-','2','2+','3-','3','3+','4-','4','4+'];

  function readData(w){try{return JSON.parse(w.localStorage.getItem(ASSIGN_KEY))||{classes:{}}}catch(e){return{classes:{}}}}
  function saveData(w,data){w.localStorage.setItem(ASSIGN_KEY,JSON.stringify(data))}
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function activeClass(d,w){return d.querySelector('.assignment-tab.active')?.dataset.assignmentClass||w.currentClass||''}
  function findAssignment(data,cls,id,name){const arr=data?.classes?.[cls]?.assignments||[];return arr.find(a=>String(a.id)===String(id))||arr.find(a=>a.name===name)||null}
  function achievement(r){const v=String(r?.achievement??r?.mark??'').trim();return LEVELS.includes(v)?v:''}
  function nowId(){return'a'+Date.now()+Math.random().toString(36).slice(2,6)}
  function reloadTo(w,cls,id){try{w.localStorage.setItem(REOPEN_KEY,JSON.stringify({class:cls||'',id:id||''}))}catch(e){}window.location.reload()}
  function assignmentTypes(a){const out=[];if(a?.participationEvidence)out.push(['participation','🗣 Participation']);if(a?.formativeClasswork)out.push(['formative','📝 Formative']);return out}

  function ensureStyles(d){
    if(d.getElementById('assignmentLevelStyles'))return;
    const s=d.createElement('style');s.id='assignmentLevelStyles';s.textContent=`
      #trackerMaxMark{display:none!important}.assignment-form label:has(#trackerMaxMark){display:none!important}
      .assignment-form{grid-template-columns:minmax(220px,1.7fr) minmax(150px,.75fr) minmax(150px,.75fr) auto!important}
      .assignment-level-note{grid-column:1/-1;font-size:11px;color:var(--muted);margin-top:-2px}
      .assignment-level-select{min-width:92px;padding:7px 8px;background:#102c27;color:var(--chalk);border:1px solid #4d6c62;border-radius:8px;font-weight:800}
      .assignment-level-edit-btn{border-color:rgba(99,214,139,.42)!important;color:#e4f8ea!important}.assignment-edit-btn{display:none!important}
      .assignment-level-overlay{position:fixed;inset:0;z-index:100150;background:rgba(0,0,0,.64);display:flex;align-items:center;justify-content:center;padding:18px}
      .assignment-level-modal{width:min(680px,96vw);background:#17332e;border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:18px;box-shadow:0 18px 55px rgba(0,0,0,.48)}
      .assignment-level-modal h3{margin:0 0 14px;font-family:"Segoe Print","Comic Sans MS",cursive}
      .assignment-level-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.assignment-level-grid label{display:grid;gap:5px;font-size:12px;color:var(--muted)}.assignment-level-grid .wide{grid-column:1/-1}.assignment-level-grid input{width:100%}
      .assignment-level-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
      .assignment-type-options{grid-column:1/-1;display:flex;gap:9px;flex-wrap:wrap;align-items:center;padding:8px 0 2px}
      .assignment-type-label{width:100%;font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.55px}
      .assignment-type-toggle{display:inline-flex!important;align-items:center;gap:7px!important;padding:8px 11px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(255,255,255,.035);color:var(--chalk)!important;cursor:pointer;font-size:12px!important;font-weight:800;user-select:none}
      .assignment-type-toggle:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.27)}
      .assignment-type-toggle input{width:18px!important;height:18px;margin:0;accent-color:var(--green)}
      .assignment-type-help{width:100%;font-size:10px;color:var(--muted);line-height:1.35}
      .assignment-level-grid .assignment-type-options{grid-column:1/-1;padding-top:3px}
      .assignment-type-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
      .assignment-type-badge{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.16);font-size:10px;font-weight:800;white-space:nowrap}
      .assignment-type-badge.participation{color:#d8f0ff;border-color:rgba(89,169,255,.42);background:rgba(89,169,255,.07)}
      .assignment-type-badge.formative{color:#e3f6e8;border-color:rgba(99,214,139,.42);background:rgba(99,214,139,.07)}
      @media(max-width:700px){.assignment-form{grid-template-columns:1fr!important}.assignment-level-note,.assignment-type-options{grid-column:auto}.assignment-level-grid{grid-template-columns:1fr}.assignment-level-grid .wide,.assignment-level-grid .assignment-type-options{grid-column:auto}.assignment-level-select{width:100%}.assignment-type-toggle{width:100%;justify-content:flex-start}}
    `;d.head.appendChild(s);
  }

  function ensureTypeControls(d){
    const form=d.querySelector('#assignmentTrackerView .assignment-form');if(!form)return;
    if(form.querySelector('#trackerAssignmentTypes'))return;
    const wrap=d.createElement('div');wrap.id='trackerAssignmentTypes';wrap.className='assignment-type-options';
    wrap.innerHTML='<div class="assignment-type-label">Use this assignment as…</div><label class="assignment-type-toggle"><input type="checkbox" id="trackerParticipationEvidence"> 🗣 Participation evidence</label><label class="assignment-type-toggle"><input type="checkbox" id="trackerFormativeClasswork"> 📝 Formative class work</label><div class="assignment-type-help">These tags can be used together. Participation tags identify evidence for participation; formative tags identify practice/class work rather than summative evaluation.</div>';
    const note=form.querySelector('.assignment-level-note');if(note)form.insertBefore(wrap,note);else form.appendChild(wrap);
  }

  function addFormNote(d){
    const form=d.querySelector('#assignmentTrackerView .assignment-form');if(!form)return;
    const max=d.getElementById('trackerMaxMark');if(max){const label=max.closest('label');if(label&&label.style.display!=='none')label.style.display='none'}
    if(!form.querySelector('.assignment-level-note')){const n=d.createElement('div');n.className='assignment-level-note';n.textContent='Achievement scale: R, 1−, 1, 1+, 2−, 2, 2+, 3−, 3, 3+, 4−, 4, 4+ (highest).';form.appendChild(n)}
    ensureTypeControls(d);
    const help=d.querySelector('#assignmentTrackerView .history-help');if(help&&/marks|rubric achievement/i.test(help.textContent))setText(help,'Track active assignments, submissions, rubric achievement levels, and whether an assignment provides participation evidence or formative class-work evidence. Changes save immediately on this device.');
  }

  function wireAddForm(d,w){
    const btn=d.getElementById('trackerAddAssignment');if(!btn||btn.dataset.levelAdd==='1')return;btn.dataset.levelAdd='1';
    btn.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const cls=activeClass(d,w),name=d.getElementById('trackerAssignmentName')?.value.trim()||'',assigned=d.getElementById('trackerAssignedDate')?.value||'',due=d.getElementById('trackerDueDate')?.value||'';
      if(!name){alert('Enter an assignment name.');return}
      const data=readData(w);if(!data.classes)data.classes={};if(!data.classes[cls])data.classes[cls]={assignments:[]};if(!Array.isArray(data.classes[cls].assignments))data.classes[cls].assignments=[];
      const a={id:nowId(),name,assigned,due,maxMark:4,grading:'levels',participationEvidence:!!d.getElementById('trackerParticipationEvidence')?.checked,formativeClasswork:!!d.getElementById('trackerFormativeClasswork')?.checked,archived:false,students:{}};
      (w.ROSTERS?.[cls]||[]).forEach(n=>a.students[n]={submitted:false,mark:'',achievement:'',note:''});data.classes[cls].assignments.push(a);saveData(w,data);reloadTo(w,cls,a.id)
    };
  }

  function openLevelEditor(d,w,id){
    const cls=activeClass(d,w),data=readData(w),a=findAssignment(data,cls,id,'');if(!a)return;
    d.getElementById('assignmentLevelOverlay')?.remove();
    const o=d.createElement('div');o.id='assignmentLevelOverlay';o.className='assignment-level-overlay';
    o.innerHTML='<div class="assignment-level-modal"><h3>Edit Assignment</h3><div class="assignment-level-grid"><label class="wide">Assignment name<input id="levelEditName"></label><label>Assigned date<input type="date" id="levelEditAssigned"></label><label>Due date<input type="date" id="levelEditDue"></label><div class="assignment-type-options"><div class="assignment-type-label">Use this assignment as…</div><label class="assignment-type-toggle"><input type="checkbox" id="levelEditParticipation"> 🗣 Participation evidence</label><label class="assignment-type-toggle"><input type="checkbox" id="levelEditFormative"> 📝 Formative class work</label><div class="assignment-type-help">These tags can be used together. They document how this assignment should be treated without automatically changing a student\'s overall participation level.</div></div></div><div class="assignment-level-actions"><button class="secondary" id="levelEditCancel">Cancel</button><button class="primary" id="levelEditSave">Save Changes</button></div></div>';
    d.body.appendChild(o);d.getElementById('levelEditName').value=a.name||'';d.getElementById('levelEditAssigned').value=a.assigned||'';d.getElementById('levelEditDue').value=a.due||'';d.getElementById('levelEditParticipation').checked=!!a.participationEvidence;d.getElementById('levelEditFormative').checked=!!a.formativeClasswork;
    const close=()=>o.remove();d.getElementById('levelEditCancel').onclick=close;o.onclick=e=>{if(e.target===o)close()};
    d.getElementById('levelEditSave').onclick=()=>{const name=d.getElementById('levelEditName').value.trim(),assigned=d.getElementById('levelEditAssigned').value,due=d.getElementById('levelEditDue').value;if(!name){alert('Enter an assignment name.');return}if(!assigned||!due){alert('Choose both the assigned and due dates.');return}a.name=name;a.assigned=assigned;a.due=due;a.maxMark=4;a.grading='levels';a.participationEvidence=!!d.getElementById('levelEditParticipation').checked;a.formativeClasswork=!!d.getElementById('levelEditFormative').checked;saveData(w,data);reloadTo(w,cls,a.id)};
  }

  function renderTypeBadges(d,host,a){
    if(!host)return;
    const types=assignmentTypes(a);let box=host.querySelector('.assignment-type-badges');
    if(!types.length){if(box)box.remove();return}
    if(!box){box=d.createElement('div');box.className='assignment-type-badges';host.appendChild(box)}
    const html=types.map(([cls,label])=>'<span class="assignment-type-badge '+cls+'">'+label+'</span>').join('');if(box.innerHTML!==html)box.innerHTML=html;
  }

  function decorateCards(d,w){
    const cls=activeClass(d,w),data=readData(w);let dirty=false;
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      const ref=card.querySelector('[data-open-assignment],[data-archive-assignment]');if(!ref)return;const id=ref.dataset.openAssignment||ref.dataset.archiveAssignment;const a=findAssignment(data,cls,id,'');if(!a)return;
      if(a.grading!=='levels'){a.grading='levels';dirty=true}if(a.maxMark!==4){a.maxMark=4;dirty=true}
      setText(card.querySelector('.assignment-meta'),'Assigned '+(a.assigned||'—')+' · Due '+(a.due||'—')+' · Rubric levels R–4+');
      const body=card.firstElementChild||card;renderTypeBadges(d,body,a);
      const chips=card.querySelectorAll('.assignment-chip');
      const roster=w.ROSTERS?.[cls]||Object.keys(a.students||{});
      const outstanding=roster.filter(n=>!a.students?.[n]?.submitted&&!a.students?.[n]?.notRequired).length;
      const entered=roster.filter(n=>achievement(a.students?.[n])).length;
      if(chips[0])setText(chips[0],outstanding+' not handed in');
      if(chips[1])setText(chips[1],entered+' levels entered');
      if(chips[2])chips[2].remove();
      const oldEdit=card.querySelector('.assignment-edit-btn');if(oldEdit)oldEdit.style.display='none';
      const actions=card.querySelector('.assignment-actions')||card;if(!actions.querySelector('.assignment-level-edit-btn')){const b=d.createElement('button');b.type='button';b.className='secondary assignment-level-edit-btn';b.textContent='✎ Edit';b.onclick=e=>{e.preventDefault();e.stopPropagation();openLevelEditor(d,w,id)};const del=actions.querySelector('.v1-delete-assignment,.delete-assignment-btn');if(del)actions.insertBefore(b,del);else actions.appendChild(b)}
      const archive=card.querySelector('[data-archive-assignment]');if(archive&&archive.dataset.levelArchive!=='1'){archive.dataset.levelArchive='1';archive.onclick=e=>{e.preventDefault();e.stopPropagation();const fresh=readData(w),fa=findAssignment(fresh,cls,id,'');if(!fa)return;fa.archived=!fa.archived;saveData(w,fresh);reloadTo(w,cls,'')}}
    });
    if(dirty)saveData(w,data);
  }

  function decorateDetail(d,w){
    const detail=d.getElementById('assignmentDetail');if(!detail||!detail.querySelector('table'))return;
    const cls=activeClass(d,w),data=readData(w),id=detail.dataset.levelAssignmentId||'',name=detail.querySelector('h3')?.textContent.trim()||'',a=findAssignment(data,cls,id,name);if(!a)return;detail.dataset.levelAssignmentId=a.id;if(!a.students)a.students={};
    let dirty=false;if(a.grading!=='levels'){a.grading='levels';dirty=true}if(a.maxMark!==4){a.maxMark=4;dirty=true}
    const roster=w.ROSTERS?.[cls]||Object.keys(a.students||{});
    const outstanding=roster.filter(n=>!a.students?.[n]?.submitted&&!a.students?.[n]?.notRequired).length;
    const notRequired=roster.filter(n=>!!a.students?.[n]?.notRequired).length;
    const metaText=outstanding+' students outstanding'+(notRequired?' · '+notRequired+' not required':'')+' · achievement levels R–4+';
    const meta=detail.querySelector('.assignment-meta');setText(meta,metaText);if(meta?.parentElement)renderTypeBadges(d,meta.parentElement,a);
    const th=[...detail.querySelectorAll('th')].find(x=>x.textContent.trim()==='Mark');if(th)setText(th,'Achievement Level');
    detail.querySelectorAll('input[data-mark-student]').forEach(input=>{
      const student=input.dataset.markStudent,r=a.students[student]||(a.students[student]={submitted:false,mark:'',achievement:'',note:''});
      const select=d.createElement('select');select.className='assignment-level-select';select.dataset.markStudent=student;select.setAttribute('aria-label','Achievement level for '+student);select.innerHTML='<option value="">—</option>'+LEVELS.map(v=>'<option value="'+v+'">'+v+'</option>').join('');select.value=achievement(r);select.disabled=!!r.notRequired;
      input.replaceWith(select);
    });
    if(dirty)saveData(w,data);
  }

  function decorate(d,w){ensureStyles(d);addFormNote(d);wireAddForm(d,w);decorateCards(d,w);decorateDetail(d,w)}

  function reopenIfNeeded(d,w){
    let x=null;try{x=JSON.parse(w.localStorage.getItem(REOPEN_KEY));w.localStorage.removeItem(REOPEN_KEY)}catch(e){}if(!x||!x.class)return;
    setTimeout(()=>{if(typeof w.openAssignmentTracker==='function'){w.openAssignmentTracker(x.class);setTimeout(()=>{decorate(d,w);if(x.id){const b=d.querySelector('[data-open-assignment="'+CSS.escape(String(x.id))+'"]');if(b)b.click()}},100)}},120);
  }

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!d.body||!w.ROSTERS)return false;ensureStyles(d);addFormNote(d);wireAddForm(d,w);
    if(d.body.dataset.assignmentLevelsInstalled!=='3'){
      d.body.dataset.assignmentLevelsInstalled='3';
      d.addEventListener('click',e=>{const open=e.target.closest('[data-open-assignment]');if(open){const detail=d.getElementById('assignmentDetail');if(detail)detail.dataset.levelAssignmentId=open.dataset.openAssignment;setTimeout(()=>decorate(d,w),0)}},false);
      let queued=false;new MutationObserver(records=>{if(queued)return;const meaningful=records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1));if(!meaningful)return;queued=true;setTimeout(()=>{queued=false;decorate(d,w)},50)}).observe(d.body,{childList:true,subtree:true});
      reopenIfNeeded(d,w);
    }
    decorate(d,w);return true;
  }
  frame.addEventListener('load',()=>setTimeout(install,1000));let tries=0;const t=setInterval(()=>{if(install()||++tries>60)clearInterval(t)},250);
})();