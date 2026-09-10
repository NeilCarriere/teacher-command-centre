(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function parseISO(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return null;const [y,m,d]=v.split('-').map(Number);return new Date(y,m-1,d)}
  function iso(dt){return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0')}
  function fmt(v){const dt=parseISO(v);return dt?dt.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'}):'Choose a date'}
  function nextMonday(base){const d=new Date(base.getFullYear(),base.getMonth(),base.getDate());let add=(8-d.getDay())%7;if(add===0)add=7;d.setDate(d.getDate()+add);return d}

  function ensureStyles(d){
    if(d.getElementById('assignmentCalendarStylesV2'))return;
    d.getElementById('assignmentCalendarStyles')?.remove();
    const s=d.createElement('style');s.id='assignmentCalendarStylesV2';s.textContent=`
      .assignment-date-wrap{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 8px;align-items:center;width:100%}
      .assignment-date-wrap input[type="date"]{width:100%;box-sizing:border-box;cursor:pointer;min-height:40px}
      .assignment-calendar-trigger{white-space:nowrap;min-height:40px;padding:8px 11px!important;border-radius:8px!important;font-weight:800!important;cursor:pointer!important;opacity:1!important;visibility:visible!important}
      .assignment-weekday{grid-column:1/-1;font-size:12px;color:var(--yellow);font-weight:700;min-height:16px;line-height:1.25}
      .assignment-calendar-pop{position:fixed;z-index:100050;width:min(340px,calc(100vw - 16px));box-sizing:border-box;background:#17332e;border:1px solid rgba(255,255,255,.24);border-radius:13px;padding:12px;box-shadow:0 16px 38px rgba(0,0,0,.5);color:var(--chalk);touch-action:manipulation}
      .assignment-calendar-head{display:grid;grid-template-columns:40px 1fr 40px 34px;gap:6px;align-items:center;margin-bottom:8px}.assignment-calendar-head strong{text-align:center;font-size:15px}.assignment-calendar-head button{padding:7px;border-radius:8px;min-height:34px}
      .assignment-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.assignment-calendar-dow{text-align:center;font-size:10px;color:var(--muted);font-weight:800;padding:4px 0}.assignment-calendar-day{min-width:0;min-height:36px;padding:8px 3px;border-radius:7px;border:1px solid transparent;background:rgba(255,255,255,.035);color:var(--chalk);cursor:pointer;font-weight:700;touch-action:manipulation}.assignment-calendar-day:hover,.assignment-calendar-day:focus-visible{background:rgba(255,255,255,.1);outline:none}.assignment-calendar-day.other{opacity:.38}.assignment-calendar-day.today{border-color:var(--blue)}.assignment-calendar-day.selected{background:rgba(99,214,139,.18);border-color:var(--green);box-shadow:inset 0 0 0 1px rgba(99,214,139,.25)}
      .assignment-calendar-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.assignment-calendar-quick button{padding:8px 5px;font-size:11px;border-radius:8px;min-height:36px;touch-action:manipulation}.assignment-date-help{font-size:11px;color:var(--muted);margin-top:7px;text-align:center}
      @media(max-width:520px){.assignment-date-wrap{grid-template-columns:1fr}.assignment-calendar-trigger{width:100%}.assignment-weekday{grid-column:1}.assignment-calendar-pop{width:calc(100vw - 12px);padding:10px}.assignment-calendar-day{min-height:40px}.assignment-calendar-head{grid-template-columns:38px 1fr 38px 34px}}
    `;d.head.appendChild(s);
  }

  function close(d){
    const pop=d.getElementById('assignmentCalendarPop');
    if(pop){
      const owner=pop._calendarOwner;
      if(owner){owner.setAttribute('aria-expanded','false');owner.closest('.assignment-date-wrap')?.querySelector('.assignment-calendar-trigger')?.setAttribute('aria-expanded','false')}
      pop.remove();
    }
  }
  function setValue(input,dt,d){input.value=iso(dt);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));updateLabel(input);close(d)}
  function updateLabel(input){const wrap=input.closest('.assignment-date-wrap');const label=wrap?.querySelector('.assignment-weekday');if(label)label.textContent=fmt(input.value)}

  function positionCalendar(pop,input,d){
    const r=input.getBoundingClientRect();
    const pad=8;
    const pw=Math.min(340,d.documentElement.clientWidth-pad*2);
    const actualH=Math.min(pop.offsetHeight||410,d.documentElement.clientHeight-pad*2);
    let left=Math.min(Math.max(pad,r.left),Math.max(pad,d.documentElement.clientWidth-pw-pad));
    let top=r.bottom+7;
    if(top+actualH>d.documentElement.clientHeight-pad)top=Math.max(pad,r.top-actualH-7);
    pop.style.left=left+'px';pop.style.top=top+'px';
  }

  function openCalendar(input){
    const d=frame.contentDocument;if(!d)return;
    const existing=d.getElementById('assignmentCalendarPop');
    if(existing&&existing._calendarOwner===input){close(d);return}
    close(d);
    let cursor=parseISO(input.value)||new Date();cursor=new Date(cursor.getFullYear(),cursor.getMonth(),1);
    const pop=d.createElement('div');pop.id='assignmentCalendarPop';pop.className='assignment-calendar-pop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Choose assignment date');pop._calendarOwner=input;d.body.appendChild(pop);
    input.setAttribute('aria-expanded','true');input.closest('.assignment-date-wrap')?.querySelector('.assignment-calendar-trigger')?.setAttribute('aria-expanded','true');

    function draw(){
      const selected=parseISO(input.value),today=new Date();
      pop.innerHTML='<div class="assignment-calendar-head"><button type="button" class="secondary" id="calPrev" aria-label="Previous month">‹</button><strong>'+months[cursor.getMonth()]+' '+cursor.getFullYear()+'</strong><button type="button" class="secondary" id="calNext" aria-label="Next month">›</button><button type="button" class="secondary" id="calClose" aria-label="Close calendar">×</button></div><div class="assignment-calendar-grid" id="calGrid"></div><div class="assignment-calendar-quick"><button type="button" class="secondary" id="calToday">Today</button><button type="button" class="secondary" id="calMonday">Next Monday</button><button type="button" class="secondary" id="calWeek">+1 Week</button></div><div class="assignment-date-help">Click or tap a day. The calendar stays open until you choose a date or close it.</div>';
      const grid=pop.querySelector('#calGrid');weekdays.forEach(x=>{const h=d.createElement('div');h.className='assignment-calendar-dow';h.textContent=x;grid.appendChild(h)});
      const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);const mondayIndex=(first.getDay()+6)%7;const start=new Date(first);start.setDate(first.getDate()-mondayIndex);
      for(let i=0;i<42;i++){
        const day=new Date(start);day.setDate(start.getDate()+i);const b=d.createElement('button');b.type='button';b.className='assignment-calendar-day';if(day.getMonth()!==cursor.getMonth())b.classList.add('other');if(iso(day)===iso(today))b.classList.add('today');if(selected&&iso(day)===iso(selected))b.classList.add('selected');b.textContent=day.getDate();b.title=day.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});b.onclick=e=>{e.preventDefault();e.stopPropagation();setValue(input,day,d)};grid.appendChild(b)}
      pop.querySelector('#calPrev').onclick=e=>{e.preventDefault();e.stopPropagation();cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);draw();requestAnimationFrame(()=>positionCalendar(pop,input,d))};
      pop.querySelector('#calNext').onclick=e=>{e.preventDefault();e.stopPropagation();cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);draw();requestAnimationFrame(()=>positionCalendar(pop,input,d))};
      pop.querySelector('#calClose').onclick=e=>{e.preventDefault();e.stopPropagation();close(d)};
      pop.querySelector('#calToday').onclick=e=>{e.preventDefault();e.stopPropagation();setValue(input,new Date(),d)};
      pop.querySelector('#calMonday').onclick=e=>{e.preventDefault();e.stopPropagation();setValue(input,nextMonday(new Date()),d)};
      pop.querySelector('#calWeek').onclick=e=>{e.preventDefault();e.stopPropagation();const base=parseISO(input.value)||new Date();const n=new Date(base);n.setDate(n.getDate()+7);setValue(input,n,d)};
    }
    draw();requestAnimationFrame(()=>positionCalendar(pop,input,d));
  }

  function decorate(){
    const d=frame.contentDocument;if(!d||!d.body)return false;ensureStyles(d);
    d.querySelectorAll('#assignmentTrackerView input[type="date"],#assignmentEditOverlay input[type="date"]').forEach(input=>{
      if(input.dataset.weekdayCalendar==='2'){updateLabel(input);return}
      input.dataset.weekdayCalendar='2';
      const oldWrap=input.closest('.assignment-date-wrap');
      if(oldWrap){oldWrap.querySelectorAll('.assignment-calendar-trigger').forEach(b=>b.remove());oldWrap.querySelectorAll('.assignment-weekday').forEach(b=>b.remove())}
      const parent=oldWrap||input.parentElement;if(!parent)return;
      let wrap=oldWrap;
      if(!wrap){wrap=d.createElement('div');wrap.className='assignment-date-wrap';parent.insertBefore(wrap,input);wrap.appendChild(input)}
      const trigger=d.createElement('button');trigger.type='button';trigger.className='secondary assignment-calendar-trigger';trigger.textContent='📅 Calendar';trigger.setAttribute('aria-expanded','false');trigger.title='Open calendar';
      const label=d.createElement('div');label.className='assignment-weekday';wrap.appendChild(trigger);wrap.appendChild(label);updateLabel(input);

      const open=e=>{e.preventDefault();e.stopPropagation();openCalendar(input)};
      input.addEventListener('click',open);
      trigger.addEventListener('click',open);
      input.addEventListener('change',()=>updateLabel(input));
      input.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();openCalendar(input)}});
    });
    return true;
  }

  function install(){
    const d=frame.contentDocument;if(!d||!d.body)return false;
    if(d.body.dataset.assignmentCalendarInstalledV2!=='1'){
      d.body.dataset.assignmentCalendarInstalledV2='1';
      d.addEventListener('click',e=>{if(!e.target.closest('#assignmentCalendarPop')&&!e.target.closest('.assignment-date-wrap'))close(d)},true);
      d.addEventListener('keydown',e=>{if(e.key==='Escape')close(d)});
      let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate()},40)}).observe(d.body,{childList:true,subtree:true});
    }
    decorate();return true;
  }
  frame.addEventListener('load',()=>setTimeout(install,900));let tries=0;const timer=setInterval(()=>{install();if(++tries>60)clearInterval(timer)},250);
})();