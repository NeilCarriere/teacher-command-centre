(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const ASSIGN_KEY='neil_teacher_assignments_v1';
  const LEVELS=['R','1-','1','1+','2-','2','2+','3-','3','3+','4-','4','4+'];

  function readData(w){try{return JSON.parse(w.localStorage.getItem(ASSIGN_KEY))||{classes:{}}}catch(e){return{classes:{}}}}
  function saveData(w,data){w.localStorage.setItem(ASSIGN_KEY,JSON.stringify(data))}
  function esc(w,s){return w.esc?w.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function activeClass(d,w){return d.querySelector('.assignment-tab.active')?.dataset.assignmentClass||w.currentClass||''}
  function findAssignment(data,cls,id,name){const arr=data?.classes?.[cls]?.assignments||[];return arr.find(a=>String(a.id)===String(id))||arr.find(a=>a.name===name)||null}
  function achievement(r){const v=String(r?.achievement??r?.mark??'').trim();return LEVELS.includes(v)?v:''}

  function ensureStyles(d){
    if(d.getElementById('assignmentLevelStyles'))return;
    const s=d.createElement('style');s.id='assignmentLevelStyles';s.textContent=`
      #trackerMaxMark{display:none!important}#trackerMaxMark+*{display:none!important}
      .assignment-form label:has(#trackerMaxMark){display:none!important}
      .assignment-form{grid-template-columns:minmax(220px,1.7fr) minmax(150px,.75fr) minmax(150px,.75fr) auto!important}
      .assignment-level-note{grid-column:1/-1;font-size:11px;color:var(--muted);margin-top:-2px}
      .assignment-level-select{min-width:92px;padding:7px 8px;background:#102c27;color:var(--chalk);border:1px solid #4d6c62;border-radius:8px;font-weight:800}
      .assignment-level-edit-btn{border-color:rgba(99,214,139,.42)!important;color:#e4f8ea!important}
      .assignment-edit-btn{display:none!important}
      .level-pill{display:inline-flex;min-width:38px;justify-content:center;padding:4px 8px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font-weight:900}
      .level-pill.r{color:var(--red);border-color:rgba(255,107,107,.42)}
      .level-pill.l4{color:var(--green);border-color:rgba(99,214,139,.42)}
      .assignment-level-overlay{position:fixed;inset:0;z-index:100150;background:rgba(0,0,0,.64);display:flex;align-items:center;justify-content:center;padding:18px}
      .assignment-level-modal{width:min(620px,96vw);background:#17332e;border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:18px;box-shadow:0 18px 55px rgba(0,0,0,.48)}
      .assignment-level-modal h3{margin:0 0 14px;font-family:"Segoe Print","Comic Sans MS",cursive}
      .assignment-level-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.assignment-level-grid label{display:grid;gap:5px;font-size:12px;color:var(--muted)}.assignment-level-grid .wide{grid-column:1/-1}.assignment-level-grid input{width:100%}
      .assignment-level-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
      @media(max-width:700px){.assignment-form{grid-template-columns:1fr!important}.assignment-level-note{grid-column:auto}.assignment-level-grid{grid-template-columns:1fr}.assignment-level-grid .wide{grid-column:auto}.assignment-level-select{width:100%}}
    `;d.head.appendChild(s);
  }

  function addFormNote(d){
    const form=d.querySelector('#assignmentTrackerView .assignment-form');if(!form)return;
    const max=d.getElementById('trackerMaxMark');if(max){const label=max.closest('label');if(label)label.style.display='none'}
    if(!form.querySelector('.assignment-level-note')){const n=d.createElement('div');n.className='assignment-level-note';n.textContent='Achievement scale: R, 1−, 1, 1+, 2−, 2, 2+, 3−, 3, 3+, 4−, 4, 4+ (highest).';form.appendChild(n)}
    const help=d.querySelector('#assignmentTrackerView .history-help');if(help&&/marks/i.test(help.textContent))help.textContent='Track active assignments, submissions, and rubric achievement levels separately for each class. Changes save immediately on this device.';
  }

  function openLevelEditor(d,w,id){
    const cls=activeClass(d,w),data=readData(w),a=findAssignment(data,cls,id,'');if(!a)return;
    d.getElementById('assignmentLevelOverlay')?.remove();
    const o=d.createElement('div');o.id='assignmentLevelOverlay';o.className='assignment-level-overlay';
    o.innerHTML='<div class="assignment-level-modal"><h3>Edit Assignment</h3><div class="assignment-level-grid"><label class="wide">Assignment name<input id="levelEditName"></label><label>Assigned date<input type="date" id="levelEditAssigned"></label><label>Due date<input type="date" id="levelEditDue"></label></div><div class="assignment-level-actions"><button class="secondary" id="levelEditCancel">Cancel</button><button class="primary" id="levelEditSave">Save Changes</button></div></div>';
    d.body.appendChild(o);d.getElementById('levelEditName').value=a.name||'';d.getElementById('levelEditAssigned').value=a.assigned||'';d.getElementById('levelEditDue').value=a.due||'';
    const close=()=>o.remove();d.getElementById('levelEditCancel').onclick=close;o.onclick=e=>{if(e.target===o)close()};
    d.getElementById('levelEditSave').onclick=()=>{const name=d.getElementById('levelEditName').value.trim(),assigned=d.getElementById('levelEditAssigned').value,due=d.getElementById('levelEditDue').value;if(!name){alert('Enter an assignment name.');return}if(!assigned||!due){alert('Choose both the assigned and due dates.');return}a.name=name;a.assigned=assigned;a.due=due;a.grading='levels';saveData(w,data);close();const tab=d.querySelector('.assignment-tab.active');if(tab)tab.click();setTimeout(()=>decorate(d,w),80)};
  }

  function decorateCards(d,w){
    const cls=activeClass(d,w),data=readData(w);
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      const ref=card.querySelector('[data-open-assignment],[data-archive-assignment]');if(!ref)return;const id=ref.dataset.openAssignment||ref.dataset.archiveAssignment;const a=findAssignment(data,cls,id,'');if(!a)return;
      a.grading='levels';
      card.querySelector('.assignment-meta')?.childNodes.forEach(()=>{});
      const meta=card.querySelector('.assignment-meta');if(meta)meta.textContent='Assigned '+(a.assigned||'—')+' · Due '+(a.due||'—')+' · Rubric levels R–4+';
      const chips=card.querySelectorAll('.assignment-chip');if(chips[1])chips[1].textContent=Object.values(a.students||{}).filter(r=>achievement(r)).length+' levels entered';if(chips[2])chips[2].remove();
      const oldEdit=card.querySelector('.assignment-edit-btn');if(oldEdit)oldEdit.style.display='none';
      const actions=card.querySelector('.assignment-actions')||card;if(!actions.querySelector('.assignment-level-edit-btn')){const b=d.createElement('button');b.type='button';b.className='secondary assignment-level-edit-btn';b.textContent='✎ Edit';b.onclick=e=>{e.preventDefault();e.stopPropagation();openLevelEditor(d,w,id)};const del=actions.querySelector('.v1-delete-assignment,.delete-assignment-btn');if(del)actions.insertBefore(b,del);else actions.appendChild(b)}
    });
    saveData(w,data);
  }

  function decorateDetail(d,w){
    const detail=d.getElementById('assignmentDetail');if(!detail||!detail.querySelector('table'))return;
    const cls=activeClass(d,w),data=readData(w),id=detail.dataset.levelAssignmentId||'',name=detail.querySelector('h3')?.textContent.trim()||'',a=findAssignment(data,cls,id,name);if(!a)return;detail.dataset.levelAssignmentId=a.id;a.grading='levels';if(!a.students)a.students={};
    const meta=detail.querySelector('.assignment-meta');if(meta)meta.textContent=Object.values(a.students).filter(r=>!r.submitted).length+' students outstanding · achievement levels R–4+';
    const th=[...detail.querySelectorAll('th')].find(x=>x.textContent.trim()==='Mark');if(th)th.textContent='Achievement Level';
    detail.querySelectorAll('[data-mark-student]').forEach(input=>{
      if(input.tagName==='SELECT')return;const student=input.dataset.markStudent,r=a.students[student]||(a.students[student]={submitted:false,mark:'',achievement:'',note:''});const select=d.createElement('select');select.className='assignment-level-select';select.dataset.markStudent=student;select.setAttribute('aria-label','Achievement level for '+student);select.innerHTML='<option value="">—</option>'+LEVELS.map(v=>'<option value="'+v+'">'+v+'</option>').join('');select.value=achievement(r);select.onchange=()=>{const fresh=readData(w),fa=findAssignment(fresh,cls,a.id,a.name);if(!fa)return;if(!fa.students[student])fa.students[student]={submitted:false,mark:'',achievement:'',note:''};const fr=fa.students[student],v=select.value;fr.achievement=v;fr.mark=v;if(v)fr.submitted=true;fa.grading='levels';saveData(w,fresh);const row=select.closest('tr'),cb=row?.querySelector('[data-submit-student]');if(cb&&v)cb.checked=true;if(row){row.classList.toggle('submitted-row',!!fr.submitted);row.classList.toggle('missing-row',!fr.submitted);const cells=row.querySelectorAll('td');if(cells.length)cells[cells.length-1].textContent=fr.submitted?'Handed in':'Outstanding'}decorateCards(d,w)};input.replaceWith(select)});
    saveData(w,data);
  }

  function decorate(d,w){ensureStyles(d);addFormNote(d);decorateCards(d,w);decorateDetail(d,w)}

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!d.body||!w.ROSTERS)return false;ensureStyles(d);addFormNote(d);
    if(d.body.dataset.assignmentLevelsInstalled!=='1'){
      d.body.dataset.assignmentLevelsInstalled='1';
      d.addEventListener('click',e=>{
        const open=e.target.closest('[data-open-assignment]');if(open){const detail=d.getElementById('assignmentDetail');if(detail)detail.dataset.levelAssignmentId=open.dataset.openAssignment;setTimeout(()=>decorate(d,w),0)}
        if(e.target.closest('#trackerAddAssignment')){setTimeout(()=>{const cls=activeClass(d,w),data=readData(w),arr=data?.classes?.[cls]?.assignments||[],a=arr[arr.length-1];if(a){a.grading='levels';const detail=d.getElementById('assignmentDetail');if(detail)detail.dataset.levelAssignmentId=a.id;saveData(w,data)}decorate(d,w)},0)}
      },false);
      let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate(d,w)},35)}).observe(d.body,{childList:true,subtree:true});
    }
    decorate(d,w);return true;
  }
  frame.addEventListener('load',()=>setTimeout(install,1000));let tries=0;const t=setInterval(()=>{if(install()||++tries>60)clearInterval(t)},250);
})();