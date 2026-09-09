(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function setMonth(input,value){
    if(!input||!value)return;
    input.value=value;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    setTimeout(()=>renderTabs(),40);
  }

  function academicMonths(value){
    const now=new Date();
    let y=now.getFullYear(),m=now.getMonth()+1;
    if(/^\d{4}-\d{2}$/.test(value||'')){const parts=value.split('-');y=+parts[0];m=+parts[1]}
    const startYear=m>=7?y:y-1;
    const out=[];
    for(let i=0;i<10;i++){
      const monthIndex=8+i,yy=startYear+Math.floor(monthIndex/12),mm=(monthIndex%12)+1;
      out.push({value:yy+'-'+String(mm).padStart(2,'0'),label:monthNames[mm-1],year:yy});
    }
    return out;
  }

  function renderTabs(){
    const d=frame.contentDocument;if(!d)return;
    const input=d.getElementById('attendanceMonth'),host=d.getElementById('attendanceMonthTabs');
    if(!input||!host)return;
    const months=academicMonths(input.value);host.innerHTML='';
    const prev=d.createElement('button');prev.className='attendance-month-arrow';prev.type='button';prev.textContent='‹';prev.title='Previous month';
    prev.onclick=()=>{const [y,m]=input.value.split('-').map(Number),dt=new Date(y,m-2,1);setMonth(input,dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0'))};host.appendChild(prev);
    months.forEach(item=>{const b=d.createElement('button');b.type='button';b.className='attendance-month-tab'+(item.value===input.value?' active':'');b.textContent=item.label;b.title=item.label+' '+item.year;b.onclick=()=>setMonth(input,item.value);host.appendChild(b)});
    const next=d.createElement('button');next.className='attendance-month-arrow';next.type='button';next.textContent='›';next.title='Next month';
    next.onclick=()=>{const [y,m]=input.value.split('-').map(Number),dt=new Date(y,m,1);setMonth(input,dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0'))};host.appendChild(next);
  }

  function removeDailyEditor(d,overview){
    const view=d.getElementById('attendanceHistoryView');if(!view||!overview)return;
    // Month at a Glance is now the sole attendance editor. Remove everything after its grid.
    let node=overview.nextElementSibling;
    while(node){const next=node.nextElementSibling;node.remove();node=next;}
    // Hide any daily/date editing controls above the month grid while retaining class/month navigation.
    const dateInput=d.getElementById('attendanceDate');
    if(dateInput){const wrapper=dateInput.closest('.field,.control,.input-group,label')||dateInput;wrapper.style.display='none'}
    [...view.querySelectorAll('button')].forEach(b=>{const t=(b.textContent||'').trim().toLowerCase();if(t==='today'&&b.closest('#attendanceHistoryView'))b.style.display='none'});
  }

  function install(){
    const d=frame.contentDocument;if(!d||!d.head||!d.body)return false;
    if(!d.getElementById('attendanceRosterScrollV4')){
      const s=d.createElement('style');s.id='attendanceRosterScrollV4';s.textContent=`
        #attendanceMonthOverview.month-overview{height:min(650px,68vh)!important;max-height:min(650px,68vh)!important;min-height:360px!important;overflow-x:auto!important;overflow-y:scroll!important;overscroll-behavior:contain!important;scrollbar-gutter:stable both-edges!important;-webkit-overflow-scrolling:touch!important;position:relative!important}
        #attendanceMonthOverview table{margin:0!important}#attendanceMonthOverview table thead th{position:sticky!important;top:0!important;background:#17332e!important;z-index:8!important;box-shadow:0 1px 0 rgba(255,255,255,.16)!important}
        #attendanceMonthOverview table thead th:first-child{left:0!important;z-index:10!important}#attendanceMonthOverview table tbody td:first-child{position:sticky!important;left:0!important;background:#17332e!important;z-index:6!important}
        .attendance-month-tabs{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:2px 0;padding:6px 0}.attendance-month-tab,.attendance-month-arrow{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.045);color:var(--chalk);border-radius:8px;padding:7px 10px;cursor:pointer;font-weight:700}.attendance-month-tab.active{background:rgba(99,214,139,.16)!important;border-color:var(--green)!important;box-shadow:inset 0 0 0 1px rgba(99,214,139,.25)!important;color:#f7fff9!important}.attendance-month-arrow{font-size:20px;line-height:1;padding:5px 10px}.attendance-scroll-hint{font-size:12px;color:var(--muted);margin-top:4px}
        @media(max-width:700px){#attendanceMonthOverview.month-overview{height:62vh!important;max-height:62vh!important;min-height:300px!important}.attendance-month-tabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:8px}.attendance-month-tab{flex:0 0 auto}}
      `;d.head.appendChild(s);
    }
    const monthInput=d.getElementById('attendanceMonth'),overview=d.getElementById('attendanceMonthOverview');if(!monthInput||!overview)return false;
    removeDailyEditor(d,overview);
    if(!d.getElementById('attendanceMonthTabs')){const wrap=d.createElement('div');wrap.id='attendanceMonthTabs';wrap.className='attendance-month-tabs';const heading=overview.parentElement?.querySelector('h3');if(heading)heading.insertAdjacentElement('afterend',wrap);else overview.insertAdjacentElement('beforebegin',wrap);const hint=d.createElement('div');hint.className='attendance-scroll-hint';hint.textContent='Scroll up/down for the full class roster; scroll left/right for the rest of the month.';wrap.insertAdjacentElement('afterend',hint)}
    if(monthInput.dataset.monthTabsBound!=='1'){monthInput.dataset.monthTabsBound='1';monthInput.addEventListener('change',()=>setTimeout(renderTabs,0));monthInput.addEventListener('input',()=>setTimeout(renderTabs,0))}
    renderTabs();return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,900));let tries=0;const timer=setInterval(()=>{install();if(++tries>60)clearInterval(timer)},250);
})();