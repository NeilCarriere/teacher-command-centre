(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function esc(w,s){return w.esc?w.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function countAbsences(r){return (r?.attendance||[]).filter(x=>x.status==='A'||x.status==='E').length}
  function allRows(w){
    const rows=[];
    Object.entries(w.state?.students||{}).forEach(([cls,students])=>{
      Object.entries(students||{}).forEach(([student,r])=>{
        const total=countAbsences(r);
        const absent=(r.attendance||[]).filter(x=>x.status==='A').length;
        const excused=(r.attendance||[]).filter(x=>x.status==='E').length;
        const last=(r.attendance||[]).filter(x=>x.status==='A'||x.status==='E').map(x=>x.date).sort().pop()||'';
        rows.push({cls,student,total,absent,excused,last});
      });
    });
    return rows;
  }
  function atThreshold(w,t){return allRows(w).filter(x=>x.total>=t).sort((a,b)=>b.total-a.total||a.cls.localeCompare(b.cls)||a.student.localeCompare(b.student))}

  function ensureStyle(d){
    if(d.getElementById('attendanceAlertFixStyle'))return;
    const s=d.createElement('style');s.id='attendanceAlertFixStyle';s.textContent=`
      .attendance-global-note{font-size:11px;color:var(--muted);margin:-7px 0 10px}
      .attendance-alert-overlay{position:fixed;inset:0;z-index:100250;background:rgba(0,0,0,.68);display:flex;align-items:center;justify-content:center;padding:18px}
      .attendance-alert-modal{width:min(720px,96vw);max-height:86vh;overflow:auto;background:#17332e;border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.55)}
      .attendance-alert-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.attendance-alert-head h2{margin:0;font-family:"Segoe Print","Comic Sans MS",cursive}.attendance-alert-list{display:grid;gap:8px}.attendance-alert-person{border:1px solid rgba(255,255,255,.13);border-radius:10px;padding:10px 12px;background:rgba(0,0,0,.08);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.attendance-alert-meta{font-size:11px;color:var(--muted);margin-top:3px}.attendance-alert-badge{display:inline-flex;min-width:38px;height:30px;align-items:center;justify-content:center;border:2px solid currentColor;border-radius:999px;font-weight:900}.attendance-alert-empty{padding:18px;border:1px dashed rgba(255,255,255,.18);border-radius:10px;color:var(--muted);text-align:center}
    `;d.head.appendChild(s);
  }

  function openModal(d,w,t){
    d.getElementById('attendanceAlertFixOverlay')?.remove();
    const rows=atThreshold(w,t),action=t>=20?'Refer to Student Success Team':'TEXT JAKE';
    const o=d.createElement('div');o.id='attendanceAlertFixOverlay';o.className='attendance-alert-overlay';
    o.innerHTML='<div class="attendance-alert-modal"><div class="attendance-alert-head"><div><h2>Attendance Alert — '+t+'+</h2><div class="small">All active classes · '+rows.length+' student record'+(rows.length===1?'':'s')+' at or above this threshold</div></div><button class="secondary" data-close>× Close</button></div><div class="attendance-alert-list">'+(rows.length?rows.map(x=>'<div class="attendance-alert-person"><div><strong>'+esc(w,x.student)+'</strong> <span class="small">· '+esc(w,x.cls)+'</span><div class="attendance-alert-meta">'+x.absent+' absent · '+x.excused+' excused'+(x.last?' · most recent '+esc(w,x.last):'')+'</div><div class="attendance-alert-meta">Follow-up: <strong>'+esc(w,action)+'</strong></div></div><span class="attendance-alert-badge b'+(x.total>=20?'20':x.total>=15?'15':x.total>=10?'10':'5')+'">'+x.total+'</span></div>').join(''):'<div class="attendance-alert-empty">No students are currently at this threshold.</div>')+'</div></div>';
    d.body.appendChild(o);const close=()=>o.remove();o.querySelector('[data-close]').onclick=close;o.onclick=e=>{if(e.target===o)close()};
  }

  function refresh(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!w.state)return false;
    ensureStyle(d);
    const box=d.querySelector('#dashboardView .kpis');if(!box)return false;
    let note=box.previousElementSibling;
    if(!note||!note.classList?.contains('attendance-global-note')){
      note=d.createElement('div');note.className='attendance-global-note';note.textContent='Across all active classes. Click a threshold to see names and classes.';box.parentNode.insertBefore(note,box);
      const old=box.parentNode.querySelector('.alert-click-hint');if(old&&old!==note)old.style.display='none';
    }
    [5,10,15,20].forEach(t=>{
      const n=d.getElementById('a'+t);if(!n)return;
      n.textContent=atThreshold(w,t).length;
      const k=n.closest('.kpi');if(!k)return;
      k.style.cursor='pointer';k.tabIndex=0;k.setAttribute('role','button');
      const go=()=>openModal(d,w,t);k.onclick=go;k.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};
    });
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(refresh,1200));
  let ticks=0;const timer=setInterval(()=>{refresh();if(++ticks>7200)clearInterval(timer)},1000);
})();
