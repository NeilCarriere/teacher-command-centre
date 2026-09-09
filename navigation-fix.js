(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function normalizedText(el){return (el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function dedupeButtons(scope,selector,preferredIds=[]){
    const groups=new Map();
    scope.querySelectorAll(selector).forEach(btn=>{const key=normalizedText(btn);if(!key)return;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(btn)});
    groups.forEach(buttons=>{if(buttons.length<2)return;const preferred=buttons.find(b=>preferredIds.includes(b.id))||buttons[0];buttons.forEach(b=>{if(b!==preferred)b.remove()})});
  }

  function installAttendanceRepair(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!d.body||!w||d.body.dataset.attendanceRepair==='1')return false;
    d.body.dataset.attendanceRepair='1';
    // Delegated handler makes the main P/A/E/L buttons reliable even after
    // other modules redraw the student table. History buttons keep their own handler.
    d.addEventListener('click',e=>{
      const b=e.target.closest('.status-btn[data-student][data-status]');
      if(!b)return;
      e.preventDefault();e.stopImmediatePropagation();
      try{
        const cls=w.currentClass,student=b.dataset.student,status=b.dataset.status;
        const rec=w.state?.students?.[cls]?.[student];
        if(!rec)return;
        const now=new Date(),local=new Date(now.getTime()-now.getTimezoneOffset()*60000),date=local.toISOString().slice(0,10);
        if(!Array.isArray(rec.attendance))rec.attendance=[];
        const idx=rec.attendance.findIndex(x=>x.date===date);
        if(idx>=0)rec.attendance[idx].status=status;else rec.attendance.push({date,status});
        w.state.currentClass=cls;
        localStorage.setItem(w.KEY||'neil_teacher_dashboard_v1',JSON.stringify(w.state));
        if(typeof w.renderAll==='function')w.renderAll();
      }catch(err){console.error('Attendance save failed',err)}
    },true);
    return true;
  }

  function apply(){
    const d=frame.contentDocument;if(!d||!d.head||!d.body)return false;
    d.querySelectorAll('.nav button').forEach(b=>{const txt=b.textContent.trim();if((b.dataset.view||'')==='class'||/^👥?\s*Class(es)?$/i.test(txt))b.remove()});
    const nav=d.querySelector('.nav');
    if(nav)dedupeButtons(nav,'button',['notesCentreNav','winstonExportNav','studentManagerNav','courseManagerNav','attendanceHistoryNav','assignmentTrackerNav','resetBtn']);
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>dedupeButtons(card,'.assignment-actions button, .v1-delete-assignment, .delete-assignment-btn'));
    d.querySelectorAll('.class-card').forEach(card=>{const actions=card.querySelector('.card-actions');if(actions)dedupeButtons(actions,'button')});
    if(!d.getElementById('sidebarNavigationFix')){const style=d.createElement('style');style.id='sidebarNavigationFix';style.textContent=`.sidebar{overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding-bottom:18px!important}.sidebar .nav{padding-bottom:8px}.sidebar .nav button{padding:9px 11px!important;margin:2px 0!important}.sidebar .quote{position:static!important;display:block!important;margin:12px 8px 8px!important;left:auto!important;right:auto!important;bottom:auto!important;font-size:12px!important}@media(max-width:1050px){.sidebar{overflow:visible}.sidebar .quote{display:none!important}}`;d.head.appendChild(style)}
    if(nav){const reset=d.getElementById('resetBtn'),exportBtn=d.getElementById('winstonExportNav'),students=d.getElementById('studentManagerNav'),courses=d.getElementById('courseManagerNav');[exportBtn,students,courses].forEach(btn=>{if(btn&&btn.nextElementSibling!==reset)nav.insertBefore(btn,reset)})}
    installAttendanceRepair();
    return !!d.getElementById('courseManagerNav');
  }

  frame.addEventListener('load',()=>setTimeout(apply,900));
  let tries=0;const timer=setInterval(()=>{apply();if(++tries>40)clearInterval(timer)},250);
  function installObserver(){const d=frame.contentDocument;if(!d||!d.body)return false;if(d.getElementById('redundancyCleanupObserver'))return true;const marker=d.createElement('div');marker.id='redundancyCleanupObserver';marker.hidden=true;d.body.appendChild(marker);let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;apply()},50)}).observe(d.body,{childList:true,subtree:true});return true}
  let observerTries=0;const observerTimer=setInterval(()=>{if(installObserver()||++observerTries>40)clearInterval(observerTimer)},250);
})();