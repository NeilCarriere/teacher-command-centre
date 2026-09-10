(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const ASSIGN_KEY='neil_teacher_assignments_v1';

  function read(w){try{return JSON.parse(w.localStorage.getItem(ASSIGN_KEY))||{classes:{}}}catch(e){return{classes:{}}}}
  function write(w,data){w.localStorage.setItem(ASSIGN_KEY,JSON.stringify(data))}
  function activeClass(d,w){return d.querySelector('.assignment-tab.active')?.dataset.assignmentClass||w.currentClass||''}
  function findAssignment(d,w,data){
    const cls=activeClass(d,w),detail=d.getElementById('assignmentDetail');
    const id=detail?.dataset.levelAssignmentId||'';
    const name=detail?.querySelector('h3')?.textContent?.trim()||'';
    const arr=data?.classes?.[cls]?.assignments||[];
    return {cls,a:arr.find(x=>String(x.id)===String(id))||arr.find(x=>String(x.name||'').trim()===name)||null};
  }

  function syncDetail(d,w){
    const detail=d.getElementById('assignmentDetail');if(!detail||!detail.querySelector('table'))return;
    const data=read(w),found=findAssignment(d,w,data),a=found.a;if(!a)return;
    if(!a.students)a.students={};
    let outstanding=0;
    detail.querySelectorAll('tbody tr').forEach(row=>{
      const cb=row.querySelector('[data-submit-student]');if(!cb)return;
      const student=cb.dataset.submitStudent,r=a.students[student]||(a.students[student]={submitted:false,mark:'',achievement:'',note:''});
      cb.checked=!!r.submitted;
      row.classList.toggle('submitted-row',!!r.submitted);row.classList.toggle('missing-row',!r.submitted);
      if(!r.submitted)outstanding++;
      const status=row.querySelector('td:last-child');if(status)status.textContent=r.submitted?'Handed in':'Outstanding';
      const sel=row.querySelector('.assignment-level-select');if(sel){const v=String(r.achievement??r.mark??'');if([...sel.options].some(o=>o.value===v))sel.value=v;else sel.value='';}
    });
    const meta=detail.querySelector('.assignment-meta');if(meta)meta.textContent=outstanding+' students outstanding · achievement levels R–4+';
  }

  function syncCards(d,w){
    const cls=activeClass(d,w),data=read(w),arr=data?.classes?.[cls]?.assignments||[];
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      const ref=card.querySelector('[data-open-assignment],[data-archive-assignment]');if(!ref)return;
      const id=ref.dataset.openAssignment||ref.dataset.archiveAssignment,a=arr.find(x=>String(x.id)===String(id));if(!a)return;
      const roster=w.ROSTERS?.[cls]||Object.keys(a.students||{});
      const outstanding=roster.filter(n=>!a.students?.[n]?.submitted).length;
      const entered=roster.filter(n=>String(a.students?.[n]?.achievement??a.students?.[n]?.mark??'').trim()!=='').length;
      const chips=card.querySelectorAll('.assignment-chip');if(chips[0])chips[0].textContent=outstanding+' not handed in';if(chips[1])chips[1].textContent=entered+' levels entered';
    });
  }

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!d.body||!w.ROSTERS)return false;
    if(d.body.dataset.assignmentPersistenceFix==='1'){syncCards(d,w);syncDetail(d,w);return true}
    d.body.dataset.assignmentPersistenceFix='1';

    d.addEventListener('change',e=>{
      const cb=e.target.closest?.('[data-submit-student]');
      const sel=e.target.closest?.('.assignment-level-select');
      if(!cb&&!sel)return;
      e.preventDefault();e.stopImmediatePropagation();
      const data=read(w),found=findAssignment(d,w,data),a=found.a;if(!a)return;
      if(!a.students)a.students={};
      const student=(cb||sel).dataset.submitStudent||(cb||sel).dataset.markStudent;
      if(!student)return;
      const r=a.students[student]||(a.students[student]={submitted:false,mark:'',achievement:'',note:''});
      if(cb){
        r.submitted=cb.checked;
        if(!cb.checked){r.achievement='';r.mark='';}
      }else{
        const v=sel.value||'';r.achievement=v;r.mark=v;if(v)r.submitted=true;
      }
      a.grading='levels';write(w,data);
      syncDetail(d,w);syncCards(d,w);
    },true);

    let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;syncCards(d,w);syncDetail(d,w)},50)}).observe(d.body,{childList:true,subtree:true});
    syncCards(d,w);syncDetail(d,w);return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,1100));let tries=0;const t=setInterval(()=>{if(install()||++tries>60)clearInterval(t)},250);
})();