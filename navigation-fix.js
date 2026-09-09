(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function normalizedText(el){return (el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}

  function dedupeButtons(scope,selector,preferredIds=[]){
    const groups=new Map();
    scope.querySelectorAll(selector).forEach(btn=>{
      const key=normalizedText(btn);
      if(!key)return;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(btn);
    });
    groups.forEach(buttons=>{
      if(buttons.length<2)return;
      const preferred=buttons.find(b=>preferredIds.includes(b.id))||buttons[0];
      buttons.forEach(b=>{if(b!==preferred)b.remove()});
    });
  }

  function apply(){
    const d=frame.contentDocument;
    if(!d||!d.head||!d.body)return false;

    // Remove the redundant legacy Class button if it is still present.
    d.querySelectorAll('.nav button').forEach(b=>{
      const txt=b.textContent.trim();
      if((b.dataset.view||'')==='class'||/^👥?\s*Class(es)?$/i.test(txt)) b.remove();
    });

    // Sidebar tools should never appear twice. Prefer the canonical modern IDs.
    const nav=d.querySelector('.nav');
    if(nav){
      dedupeButtons(nav,'button',[
        'notesCentreNav','winstonExportNav','studentManagerNav','courseManagerNav',
        'attendanceHistoryNav','assignmentTrackerNav','resetBtn'
      ]);
    }

    // Assignment actions should be unique within each assignment card.
    d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{
      dedupeButtons(card,'.assignment-actions button, .v1-delete-assignment, .delete-assignment-btn');
    });

    // Class-card quick actions should also be unique within each class card.
    d.querySelectorAll('.class-card').forEach(card=>{
      const actions=card.querySelector('.card-actions');
      if(actions)dedupeButtons(actions,'button');
    });

    // The sidebar has more tools now than it did in the original prototype.
    // Make it independently scrollable so Manage Courses / Winston / etc.
    // can never be clipped below the bottom of the screen.
    if(!d.getElementById('sidebarNavigationFix')){
      const style=d.createElement('style');
      style.id='sidebarNavigationFix';
      style.textContent=`
        .sidebar{overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding-bottom:18px!important}
        .sidebar .nav{padding-bottom:8px}
        .sidebar .nav button{padding:9px 11px!important;margin:2px 0!important}
        .sidebar .quote{position:static!important;display:block!important;margin:12px 8px 8px!important;left:auto!important;right:auto!important;bottom:auto!important;font-size:12px!important}
        @media(max-width:1050px){.sidebar{overflow:visible}.sidebar .quote{display:none!important}}
      `;
      d.head.appendChild(style);
    }

    // Put the administrative tools together in a predictable order.
    if(nav){
      const reset=d.getElementById('resetBtn');
      const exportBtn=d.getElementById('winstonExportNav');
      const students=d.getElementById('studentManagerNav');
      const courses=d.getElementById('courseManagerNav');
      [exportBtn,students,courses].forEach(btn=>{if(btn)nav.insertBefore(btn,reset)});
    }

    return !!d.getElementById('courseManagerNav');
  }

  frame.addEventListener('load',()=>setTimeout(apply,900));
  let tries=0;
  const timer=setInterval(()=>{
    apply();
    if(++tries>40)clearInterval(timer);
  },250);

  // Keep watching briefly for late-loading enhancement modules and clean up
  // accidental duplicates as soon as they appear.
  function installObserver(){
    const d=frame.contentDocument;
    if(!d||!d.body)return false;
    if(d.getElementById('redundancyCleanupObserver'))return true;
    const marker=d.createElement('div');marker.id='redundancyCleanupObserver';marker.hidden=true;d.body.appendChild(marker);
    let queued=false;
    new MutationObserver(()=>{
      if(queued)return;queued=true;
      setTimeout(()=>{queued=false;apply()},50);
    }).observe(d.body,{childList:true,subtree:true});
    return true;
  }
  let observerTries=0;
  const observerTimer=setInterval(()=>{if(installObserver()||++observerTries>40)clearInterval(observerTimer)},250);
})();