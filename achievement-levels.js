(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const ASSIGN_KEY='neil_teacher_assignments_v1';
  const LEVELS=['','R','1-','1','1+','2-','2','2+','3-','3','3+','4-','4','4+'];

  function load(w){try{return JSON.parse(w.localStorage.getItem(ASSIGN_KEY))||{classes:{}}}catch(e){return{classes:{}}}}
  function save(w,data){w.localStorage.setItem(ASSIGN_KEY,JSON.stringify(data))}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function activeClass(d,w){return d.querySelector('.assignment-tab.active')?.dataset.assignmentClass||w.currentClass||''}
  function currentAssignment(d,w){
    const cls=activeClass(d,w),data=load(w),name=d.querySelector('#assignmentDetail h3')?.textContent?.trim()||'';
    const arr=data?.classes?.[cls]?.assignments||[];
    return {data,cls,a:arr.find(x=>String(x.name||'').trim()===name)||null};
  }

  function ensureStyles(d){
    if(d.getElementById('achievementLevelStyles'))return;
    const s=d.createElement('style');s.id='achievementLevelStyles';s.textContent=`
      .achievement-level-select{min-width:88px;padding:7px 8px;background:#102c27;color:var(--chalk);border:1px solid #4d6c62;border-radius:8px;font-weight:800}
      .achievement-scale-note{font-size:11px;color:var(--muted);margin-top:5px}
      .achievement-scale-note strong{color:var(--chalk)}
      .assignment-max-level-wrap{display:grid;gap:4px;font-size:12px;color:var(--muted)}
      .assignment-max-level-display{min-height:42px;display:flex;align-items:center;padding:9px 10px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(255,255,255,.035);color:var(--chalk);font-weight:800}
    `;d.head.appendChild(s);
  }

  function updateCreateForm(d){
    const max=d.getElementById('assignmentMax');if(!max)return;
    const label=max.closest('label');
    max.value='4';max.type='hidden';
    if(label&&!label.dataset.levelMode){
      label.dataset.levelMode='1';
      [...label.childNodes].forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent=''});
      const title=d.createElement('span');title.textContent='Assessment';
      const display=d.createElement('div');display.className='assignment-max-level-display';display.textContent='Level 1–4 / R';
      const note=d.createElement('div');note.className='achievement-scale-note';note.innerHTML='<strong>Scale:</strong> R, 1−, 1, 1+, 2−, 2, 2+, 3−, 3, 3+, 4−, 4, 4+';
      label.insertBefore(title,max);label.appendChild(display);label.appendChild(note);
    }
  }

  function updateEditOverlay(d){
    const max=d.getElementById('editAssignmentMax');if(!max)return;
    const label=max.closest('label');max.value='4';max.type='hidden';
    if(label&&!label.dataset.levelMode){
      label.dataset.levelMode='1';
      [...label.childNodes].forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent=''});
      const title=d.createElement('span');title.textContent='Assessment';
      const display=d.createElement('div');display.className='assignment-max-level-display';display.textContent='Level 1–4 / R';
      label.insertBefore(title,max);label.appendChild(display);
    }
  }

  function decorateDetail(d,w){
    const detail=d.getElementById('assignmentDetail');if(!detail)return;
    const found=currentAssignment(d,w);if(!found.a)return;
    found.a.maxMark=4;
    Object.entries(found.a.students||{}).forEach(([student,r])=>{
      if(r.mark!=null&&r.level==null&&String(r.mark).trim()!=='')r.level=String(r.mark);
    });
    save(w,found.data);

    detail.querySelectorAll('input[data-mark-student]').forEach(inp=>{
      const student=inp.dataset.markStudent;
      if(inp.dataset.levelReplaced==='1')return;
      const select=d.createElement('select');select.className='achievement-level-select';select.dataset.levelStudent=student;
      const record=found.a.students?.[student]||{};const val=String(record.level??record.mark??'');
      select.innerHTML=LEVELS.map(x=>'<option value="'+esc(x)+'">'+(x||'—')+'</option>').join('');select.value=LEVELS.includes(val)?val:'';
      select.onchange=()=>{
        const cur=currentAssignment(d,w);if(!cur.a)return;const r=cur.a.students?.[student];if(!r)return;
        r.level=select.value;r.mark=select.value;r.submitted=select.value!==''||r.submitted;
        cur.a.maxMark=4;save(w,cur.data);
        const row=select.closest('tr');if(row){row.classList.toggle('submitted-row',!!r.submitted);row.classList.toggle('missing-row',!r.submitted);const status=row.querySelector('td:last-child');if(status)status.textContent=r.submitted?'Handed in':'Outstanding';const cb=row.querySelector('input[data-submit-student]');if(cb)cb.checked=!!r.submitted;}
      };
      inp.dataset.levelReplaced='1';inp.replaceWith(select);
    });

    const meta=detail.querySelector('.assignment-meta');if(meta)meta.textContent=meta.textContent.replace(/marks out of\s*\d+(?:\.\d+)?/i,'achievement levels: R to 4+');
  }

  function cleanList(d){
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      const meta=card.querySelector('.assignment-meta');if(meta)meta.textContent=meta.textContent.replace(/Out of\s*\d+(?:\.\d+)?/i,'Level 1–4 / R');
      card.querySelectorAll('.assignment-chip').forEach(ch=>{
        if(/marks entered/i.test(ch.textContent))ch.textContent=ch.textContent.replace(/marks entered/i,'levels entered');
        if(/^Average\s/i.test(ch.textContent))ch.style.display='none';
      });
    });
  }

  function decorate(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!d.body)return false;
    ensureStyles(d);updateCreateForm(d);updateEditOverlay(d);decorateDetail(d,w);cleanList(d);return true;
  }

  function install(){
    const d=frame.contentDocument;if(!d||!d.body)return false;
    if(!d.body.dataset.achievementLevelsInstalled){
      d.body.dataset.achievementLevelsInstalled='1';
      let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate()},35)}).observe(d.body,{childList:true,subtree:true});
    }
    decorate();return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,900));let tries=0;const t=setInterval(()=>{if(install()||++tries>60)clearInterval(t)},250);
})();