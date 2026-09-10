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

  function ensureStyles(d){
    if(d.getElementById('assignmentNotRequiredStyles'))return;
    const s=d.createElement('style');s.id='assignmentNotRequiredStyles';s.textContent=`
      .assignment-detail input[data-not-required-student]{width:20px;height:20px;accent-color:var(--yellow)}
      .assignment-detail .not-required-row{background:rgba(246,211,101,.045)!important}
      .assignment-detail .not-required-row td:last-child{color:var(--yellow);font-weight:800}
      .assignment-detail th[data-not-required-head]{white-space:nowrap}
    `;d.head.appendChild(s);
  }

  function ensureNotRequiredColumn(d,row,r,student){
    const table=row.closest('table');
    const headRow=table?.querySelector('thead tr');
    if(headRow&&!headRow.querySelector('[data-not-required-head]')){
      const th=d.createElement('th');th.dataset.notRequiredHead='1';th.textContent='Absent / N/A';th.title='Use when the student was absent and this assignment does not need to be completed.';
      const statusHead=headRow.lastElementChild;headRow.insertBefore(th,statusHead||null);
    }
    let cell=row.querySelector('.not-required-cell');
    if(!cell){
      cell=d.createElement('td');cell.className='not-required-cell';
      const statusCell=row.lastElementChild;row.insertBefore(cell,statusCell||null);
    }
    let na=cell.querySelector('[data-not-required-student]');
    if(!na){
      na=d.createElement('input');na.type='checkbox';na.dataset.notRequiredStudent=student;na.title='Absent — assignment not required';na.setAttribute('aria-label','Absent, assignment not required for '+student);cell.appendChild(na);
    }
    na.checked=!!r.notRequired;
    return na;
  }

  function syncDetail(d,w){
    const detail=d.getElementById('assignmentDetail');if(!detail||!detail.querySelector('table'))return;
    const data=read(w),found=findAssignment(d,w,data),a=found.a;if(!a)return;
    if(!a.students)a.students={};
    let outstanding=0,notRequired=0;
    detail.querySelectorAll('tbody tr').forEach(row=>{
      const cb=row.querySelector('[data-submit-student]');if(!cb)return;
      const student=cb.dataset.submitStudent,r=a.students[student]||(a.students[student]={submitted:false,mark:'',achievement:'',note:''});
      const na=ensureNotRequiredColumn(d,row,r,student);
      const exempt=!!r.notRequired;
      if(exempt)notRequired++;else if(!r.submitted)outstanding++;
      cb.checked=!exempt&&!!r.submitted;
      cb.disabled=exempt;
      row.classList.toggle('submitted-row',!exempt&&!!r.submitted);
      row.classList.toggle('missing-row',!exempt&&!r.submitted);
      row.classList.toggle('not-required-row',exempt);
      const status=row.querySelector('td:last-child');if(status)status.textContent=exempt?'Not Required — Absent':(r.submitted?'Handed in':'Outstanding');
      const sel=row.querySelector('.assignment-level-select');if(sel){const v=String(r.achievement??r.mark??'');if([...sel.options].some(o=>o.value===v))sel.value=v;else sel.value='';sel.disabled=exempt;}
      na.onchange=()=>{
        const fresh=read(w),f=findAssignment(d,w,fresh),fa=f.a;if(!fa)return;
        if(!fa.students)fa.students={};
        const fr=fa.students[student]||(fa.students[student]={submitted:false,mark:'',achievement:'',note:''});
        if(na.checked){
          fr.notRequired=true;fr.notRequiredReason='Absent';fr.submitted=true;fr.achievement='';fr.mark='';
        }else{
          fr.notRequired=false;delete fr.notRequiredReason;fr.submitted=false;
        }
        fa.grading='levels';write(w,fresh);syncDetail(d,w);syncCards(d,w);
      };
    });
    const meta=detail.querySelector('.assignment-meta');if(meta)meta.textContent=outstanding+' students outstanding'+(notRequired?' · '+notRequired+' not required':'')+' · achievement levels R–4+';
  }

  function syncCards(d,w){
    const cls=activeClass(d,w),data=read(w),arr=data?.classes?.[cls]?.assignments||[];
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      const ref=card.querySelector('[data-open-assignment],[data-archive-assignment]');if(!ref)return;
      const id=ref.dataset.openAssignment||ref.dataset.archiveAssignment,a=arr.find(x=>String(x.id)===String(id));if(!a)return;
      const roster=w.ROSTERS?.[cls]||Object.keys(a.students||{});
      const outstanding=roster.filter(n=>!a.students?.[n]?.submitted&&!a.students?.[n]?.notRequired).length;
      const entered=roster.filter(n=>String(a.students?.[n]?.achievement??a.students?.[n]?.mark??'').trim()!=='').length;
      const chips=card.querySelectorAll('.assignment-chip');if(chips[0])chips[0].textContent=outstanding+' not handed in';if(chips[1])chips[1].textContent=entered+' levels entered';
    });
  }

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!d.body||!w.ROSTERS)return false;
    ensureStyles(d);
    if(d.body.dataset.assignmentPersistenceFix==='2'){syncCards(d,w);syncDetail(d,w);return true}
    d.body.dataset.assignmentPersistenceFix='2';

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
        r.notRequired=false;delete r.notRequiredReason;
        r.submitted=cb.checked;
        if(!cb.checked){r.achievement='';r.mark='';}
      }else{
        const v=sel.value||'';r.achievement=v;r.mark=v;if(v){r.submitted=true;r.notRequired=false;delete r.notRequiredReason;}
      }
      a.grading='levels';write(w,data);
      syncDetail(d,w);syncCards(d,w);
    },true);

    let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;syncCards(d,w);syncDetail(d,w)},50)}).observe(d.body,{childList:true,subtree:true});
    syncCards(d,w);syncDetail(d,w);return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,1100));let tries=0;const t=setInterval(()=>{if(install()||++tries>60)clearInterval(t)},250);
})();