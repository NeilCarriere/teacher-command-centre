(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const NON_SCHOOL_KEY='neil_teacher_non_school_days_v1';

  function localDate(y,m,d){return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
  function selectedClass(d,w){return d.getElementById('attendanceClassSelect')?.value||w.currentClass||''}
  function save(w){localStorage.setItem(w.KEY||'neil_teacher_dashboard_v1',JSON.stringify(w.state));}
  function nonSchoolDates(){try{const x=JSON.parse(localStorage.getItem(NON_SCHOOL_KEY));return new Set(Array.isArray(x)?x:[])}catch(e){return new Set()}}
  function isWeekend(date){const [y,m,d]=date.split('-').map(Number),day=new Date(y,m-1,d).getDay();return day===0||day===6}
  function isNonSchool(date){return isWeekend(date)||nonSchoolDates().has(date)}
  function currentStatus(w,cls,student,date){const rec=w.state?.students?.[cls]?.[student];const item=(rec?.attendance||[]).find(x=>x.date===date);return item?.status||''}
  function setStatus(w,cls,student,date,status){
    const rec=w.state?.students?.[cls]?.[student];if(!rec)return false;
    if(!Array.isArray(rec.attendance))rec.attendance=[];
    const idx=rec.attendance.findIndex(x=>x.date===date);
    if(!status){if(idx>=0)rec.attendance.splice(idx,1)}
    else if(idx>=0)rec.attendance[idx].status=status;
    else rec.attendance.push({date,status});
    save(w);return true;
  }
  function paintCell(cell,status){
    cell.dataset.status=status||'';
    cell.textContent=status||'·';
    cell.classList.toggle('grid-has-status',!!status);
  }

  function closePicker(d){d.getElementById('attendanceGridPicker')?.remove()}
  function openPicker(d,w,cell){
    closePicker(d);
    const cls=cell.dataset.gridClass,student=cell.dataset.gridStudent,date=cell.dataset.gridDate;
    if(!cls||!student||!date||cell.dataset.nonSchool==='1')return;
    const picker=d.createElement('div');picker.id='attendanceGridPicker';picker.className='attendance-grid-picker';
    const status=currentStatus(w,cls,student,date);
    picker.innerHTML='<div class="attendance-grid-picker-title"><strong>'+w.esc(student)+'</strong><span>'+date+'</span></div><div class="attendance-grid-options"><button data-grid-status="A" class="grid-a '+(status==='A'?'active':'')+'">A</button><button data-grid-status="E" class="grid-e '+(status==='E'?'active':'')+'">E</button><button data-grid-status="L" class="grid-l '+(status==='L'?'active':'')+'">L</button><button data-grid-status="" class="grid-p '+(!status||status==='P'?'active':'')+'">P / Clear</button></div>';
    d.body.appendChild(picker);
    const r=cell.getBoundingClientRect(),pw=picker.offsetWidth||250,ph=picker.offsetHeight||110;
    const left=Math.min(Math.max(8,r.left+r.width/2-pw/2),d.documentElement.clientWidth-pw-8);
    let top=r.bottom+7;if(top+ph>d.documentElement.clientHeight-8)top=Math.max(8,r.top-ph-7);
    picker.style.left=left+'px';picker.style.top=top+'px';
    picker.querySelectorAll('[data-grid-status]').forEach(b=>b.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const newStatus=b.dataset.gridStatus;
      if(setStatus(w,cls,student,date,newStatus))paintCell(cell,newStatus);
      closePicker(d);
      // Refresh the daily editor and alerts, then restore grid hooks.
      if(typeof w.renderAll==='function')w.renderAll();
      setTimeout(enhanceGrid,40);
    });
  }

  function enhanceGrid(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!w||!w.state)return false;
    const overview=d.getElementById('attendanceMonthOverview'),month=d.getElementById('attendanceMonth');if(!overview||!month)return false;
    const parts=(month.value||'').split('-').map(Number);if(parts.length!==2||!parts[0]||!parts[1])return false;
    const [year,mon]=parts,cls=selectedClass(d,w);
    const headerCells=[...overview.querySelectorAll('thead th')].slice(1);
    headerCells.forEach((th,i)=>{
      const date=localDate(year,mon,i+1),off=isNonSchool(date);
      th.classList.toggle('attendance-nonschool-header',off);
      th.title=off?(isWeekend(date)?'Weekend — no attendance':'Non-school day — no attendance'):'';
    });
    const rows=overview.querySelectorAll('tbody tr');
    rows.forEach(row=>{
      const first=row.querySelector('td');if(!first)return;
      const student=(first.textContent||'').trim();if(!student)return;
      [...row.querySelectorAll('td')].slice(1).forEach((cell,i)=>{
        const date=localDate(year,mon,i+1),off=isNonSchool(date);
        cell.dataset.gridClass=cls;cell.dataset.gridStudent=student;cell.dataset.gridDate=date;
        cell.dataset.nonSchool=off?'1':'0';
        cell.classList.toggle('attendance-grid-editable',!off);
        cell.classList.toggle('attendance-nonschool',off);
        if(off){cell.textContent='';cell.removeAttribute('data-status');cell.title=isWeekend(date)?'Weekend — no attendance':'Non-school day — no attendance'}
        else{const status=currentStatus(w,cls,student,date);paintCell(cell,status);cell.title='Click to mark Absent, Excused, Late, or clear to Present'}
      });
    });
    return true;
  }

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;if(!d||!d.head||!d.body||!w)return false;
    if(!d.getElementById('attendanceGridEntryStyles')){const s=d.createElement('style');s.id='attendanceGridEntryStyles';s.textContent=`
      #attendanceMonthOverview .attendance-grid-editable{cursor:pointer!important;min-width:34px!important;transition:background .1s ease,box-shadow .1s ease}
      #attendanceMonthOverview .attendance-grid-editable:hover{background:rgba(255,255,255,.12)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}
      #attendanceMonthOverview .attendance-nonschool,#attendanceMonthOverview .attendance-nonschool-header{background:rgba(0,0,0,.28)!important;color:rgba(255,255,255,.18)!important;cursor:default!important;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.025) 0 5px,transparent 5px 10px)!important}
      #attendanceMonthOverview .grid-has-status[data-status="A"]{color:var(--red)!important;font-weight:900}#attendanceMonthOverview .grid-has-status[data-status="E"]{color:var(--yellow)!important;font-weight:900}#attendanceMonthOverview .grid-has-status[data-status="L"]{color:var(--blue)!important;font-weight:900}#attendanceMonthOverview .grid-has-status[data-status="P"]{color:var(--green)!important;font-weight:900}
      .attendance-grid-picker{position:fixed;z-index:99999;width:270px;padding:10px;border:1px solid rgba(255,255,255,.25);border-radius:12px;background:#17332e;color:var(--chalk);box-shadow:0 12px 30px rgba(0,0,0,.5)}
      .attendance-grid-picker-title{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px;font-size:12px}.attendance-grid-picker-title strong{font-size:14px}.attendance-grid-picker-title span{color:var(--muted)}
      .attendance-grid-options{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.attendance-grid-options button{padding:9px 5px;border-radius:8px;border:1px solid rgba(255,255,255,.2);font-weight:900;cursor:pointer;color:#f7fff9;background:rgba(255,255,255,.06)}
      .attendance-grid-options .grid-a{border-color:var(--red);color:var(--red)}.attendance-grid-options .grid-e{border-color:var(--yellow);color:var(--yellow)}.attendance-grid-options .grid-l{border-color:var(--blue);color:var(--blue)}.attendance-grid-options .grid-p{border-color:var(--green);color:var(--green);font-size:11px}.attendance-grid-options button.active{box-shadow:inset 0 0 0 2px currentColor;background:rgba(255,255,255,.12)}
      .attendance-grid-instruction{font-size:12px;color:var(--muted);margin:5px 0 8px}.attendance-grid-instruction strong{color:var(--chalk)}
    `;d.head.appendChild(s)}
    const overview=d.getElementById('attendanceMonthOverview');if(!overview)return false;
    let note=d.getElementById('attendanceGridInstruction');if(!note){note=d.createElement('div');note.id='attendanceGridInstruction';note.className='attendance-grid-instruction';overview.insertAdjacentElement('beforebegin',note)}
    note.innerHTML='<strong>Quick entry:</strong> click a school-day cell and choose A, E, or L. P / Clear returns it to assumed Present. Weekends are blocked; school holidays will be blocked when your calendar is added.';
    if(d.body.dataset.attendanceGridEntryV2!=='1'){
      d.body.dataset.attendanceGridEntryV2='1';
      d.addEventListener('click',e=>{
        const cell=e.target.closest('#attendanceMonthOverview td.attendance-grid-editable');
        if(cell){e.preventDefault();e.stopImmediatePropagation();openPicker(d,w,cell);return}
        if(!e.target.closest('#attendanceGridPicker'))closePicker(d);
      },true);
      const observer=new MutationObserver(()=>setTimeout(enhanceGrid,0));observer.observe(overview,{childList:true,subtree:true});
      d.getElementById('attendanceClassSelect')?.addEventListener('change',()=>setTimeout(enhanceGrid,20));
      d.getElementById('attendanceMonth')?.addEventListener('change',()=>setTimeout(enhanceGrid,20));
    }
    enhanceGrid();return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,900));let tries=0;const timer=setInterval(()=>{install();enhanceGrid();if(++tries>60)clearInterval(timer)},250);
})();