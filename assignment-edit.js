(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const ASSIGN_KEY='neil_teacher_assignments_v1';

  function loadData(){try{return JSON.parse(localStorage.getItem(ASSIGN_KEY))||{classes:{}}}catch(e){return{classes:{}}}}
  function saveData(data){localStorage.setItem(ASSIGN_KEY,JSON.stringify(data))}
  function activeClass(d,w){return d.querySelector('.assignment-tab.active')?.dataset.assignmentClass||w.currentClass||''}

  function ensureStyles(d){
    if(d.getElementById('assignmentEditStyles'))return;
    const s=d.createElement('style');s.id='assignmentEditStyles';s.textContent=`
      .assignment-edit-btn{border-color:rgba(89,169,255,.45)!important;color:#dcecff!important}
      .assignment-edit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:18px;z-index:9999}
      .assignment-edit-modal{width:min(620px,96vw);background:#17332e;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:18px;box-shadow:0 18px 55px rgba(0,0,0,.45)}
      .assignment-edit-modal h3{margin:0 0 14px;font-family:"Segoe Print","Comic Sans MS",cursive;font-size:24px}
      .assignment-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.assignment-edit-grid label{display:grid;gap:5px;font-size:12px;color:var(--muted)}.assignment-edit-grid .wide{grid-column:1/-1}.assignment-edit-grid input{width:100%;box-sizing:border-box}.assignment-edit-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
      @media(max-width:650px){.assignment-edit-grid{grid-template-columns:1fr}.assignment-edit-grid .wide{grid-column:auto}}
    `;d.head.appendChild(s);
  }

  function openEditor(d,w,assignmentId){
    const cls=activeClass(d,w),data=loadData(),assignments=data?.classes?.[cls]?.assignments||[],a=assignments.find(x=>String(x.id)===String(assignmentId));
    if(!a){alert('Could not find that assignment to edit.');return}
    d.getElementById('assignmentEditOverlay')?.remove();
    const wrap=d.createElement('div');wrap.id='assignmentEditOverlay';wrap.className='assignment-edit-overlay';
    wrap.innerHTML=`<div class="assignment-edit-modal"><h3>Edit Assignment</h3><div class="assignment-edit-grid"><label class="wide">Assignment name<input id="editAssignmentName"></label><label>Assigned date<input type="date" id="editAssignmentAssigned"></label><label>Due date<input type="date" id="editAssignmentDue"></label><label>Out of<input type="number" min="0.5" step="0.5" id="editAssignmentMax"></label></div><div class="assignment-edit-actions"><button class="secondary" id="editAssignmentCancel">Cancel</button><button class="primary" id="editAssignmentSave">Save Changes</button></div></div>`;
    d.body.appendChild(wrap);
    d.getElementById('editAssignmentName').value=a.name||'';
    d.getElementById('editAssignmentAssigned').value=a.assigned||'';
    d.getElementById('editAssignmentDue').value=a.due||'';
    d.getElementById('editAssignmentMax').value=a.maxMark||100;
    const close=()=>wrap.remove();
    d.getElementById('editAssignmentCancel').onclick=close;
    wrap.addEventListener('click',e=>{if(e.target===wrap)close()});
    d.getElementById('editAssignmentSave').onclick=()=>{
      const name=d.getElementById('editAssignmentName').value.trim(),assigned=d.getElementById('editAssignmentAssigned').value,due=d.getElementById('editAssignmentDue').value,max=Number(d.getElementById('editAssignmentMax').value);
      if(!name){alert('Enter an assignment name.');return}
      if(!assigned||!due){alert('Choose both the assigned and due dates.');return}
      if(!Number.isFinite(max)||max<=0){alert('Enter a valid “Out of” mark.');return}
      a.name=name;a.assigned=assigned;a.due=due;a.maxMark=max;
      saveData(data);close();
      const tab=d.querySelector('.assignment-tab.active');
      if(tab){tab.click();setTimeout(decorate,80)}else location.reload();
    };
  }

  function decorate(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!d.body||!w)return false;
    ensureStyles(d);
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      if(card.querySelector('.assignment-edit-btn'))return;
      const ref=card.querySelector('[data-open-assignment],[data-archive-assignment]');if(!ref)return;
      const id=ref.dataset.openAssignment||ref.dataset.archiveAssignment;if(!id)return;
      const b=d.createElement('button');b.type='button';b.className='secondary assignment-edit-btn';b.textContent='✎ Edit';
      b.onclick=e=>{e.preventDefault();e.stopPropagation();openEditor(d,w,id)};
      const actions=card.querySelector('.assignment-actions')||card;
      const deleteBtn=actions.querySelector('.v1-delete-assignment,.delete-assignment-btn');
      if(deleteBtn)actions.insertBefore(b,deleteBtn);else actions.appendChild(b);
    });
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(decorate,900));
  let tries=0;const timer=setInterval(()=>{decorate();if(++tries>60)clearInterval(timer)},250);
  function observe(){const d=frame.contentDocument;if(!d||!d.body)return false;if(d.body.dataset.assignmentEditObserver==='1')return true;d.body.dataset.assignmentEditObserver='1';let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate()},50)}).observe(d.body,{childList:true,subtree:true});return true}
  let o=0;const ot=setInterval(()=>{if(observe()||++o>50)clearInterval(ot)},250);
})();