(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function assignmentData(w){
    try{return JSON.parse(w.localStorage.getItem('neil_teacher_assignments_v1'))||{}}catch(e){return{}}
  }

  function buildPayload(w){
    return JSON.stringify({
      format:'teacher-command-centre-winston-export',
      version:9,
      exportedAt:new Date().toISOString(),
      teacherApp:{currentClass:w.currentClass,studentData:w.state},
      assignmentTracker:assignmentData(w)
    },null,2);
  }

  function showOnly(d,id){
    ['dashboardView','homeworkView','reportsView','attendanceHistoryView','assignmentTrackerView','notesCentreView','winstonExportView','studentManagerView','courseManagerView'].forEach(x=>{
      const el=d.getElementById(x);if(el)el.classList.toggle('hidden',x!==id);
    });
    d.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  }

  function repair(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.state)return false;

    // Keep exactly one Winston navigation button.
    const winstonNav=[...d.querySelectorAll('.nav button')].filter(b=>/winston/i.test(b.textContent||''));
    let navBtn=winstonNav.find(b=>/send to winston/i.test(b.textContent||''))||winstonNav[0];
    winstonNav.forEach(b=>{if(b!==navBtn)b.remove();});
    if(navBtn){
      navBtn.id='winstonExportNav';
      navBtn.textContent='↗ Send to Winston';
    }

    // v1-inner.js creates an older Winston export panel before notes-export.js runs.
    // Keep the newer panel (the one with #downloadWinstonJson) and remove the stale one.
    const sections=[...d.querySelectorAll('#winstonExportView')];
    let section=sections.find(s=>s.querySelector('#downloadWinstonJson')) || sections[sections.length-1];
    if(!section)return false;
    sections.forEach(s=>{if(s!==section)s.remove();});

    const heading=section.querySelector('.export-heading, h2');if(heading)heading.textContent='Send to Winston';
    const help=section.querySelector('.export-top .history-help, .history-help');if(help)help.textContent='Prepare your current teacher data here, then paste it into this ChatGPT conversation.';

    const action=section.querySelector('#downloadWinstonJson');
    if(!action)return false;
    action.textContent='↗ Send to Winston';
    action.removeAttribute('download');

    let status=section.querySelector('#winstonSendStatus');
    if(!status){status=d.createElement('div');status.id='winstonSendStatus';action.insertAdjacentElement('afterend',status);}
    status.style.cssText='display:none;margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid rgba(99,214,139,.45);background:rgba(99,214,139,.08);font-size:13px;line-height:1.4';

    let box=section.querySelector('#winstonPayloadBox');
    if(!box){
      box=d.createElement('textarea');
      box.id='winstonPayloadBox';
      box.readOnly=true;
      box.setAttribute('aria-label','Winston export data');
      box.style.cssText='display:none;width:100%;min-height:180px;margin-top:10px;padding:10px;border-radius:8px;box-sizing:border-box;font:12px/1.35 monospace;background:rgba(0,0,0,.22);color:inherit;border:1px solid rgba(255,255,255,.18)';
      status.insertAdjacentElement('afterend',box);
    }

    navBtn.onclick=function(e){
      e.preventDefault();e.stopPropagation();
      showOnly(d,'winstonExportView');
      section.classList.remove('hidden');
      navBtn.classList.add('active');
    };

    action.onclick=function(e){
      e.preventDefault();e.stopPropagation();
      const text=buildPayload(w);
      box.value=text;
      box.style.display='block';
      status.style.display='block';
      status.textContent='Your data is ready below. I am also trying to copy it to your clipboard. If that is blocked, click in the box, press Ctrl+A, Ctrl+C, then paste it into ChatGPT.';
      box.focus();box.select();
      let copied=false;
      try{copied=d.execCommand('copy');}catch(_){copied=false;}
      if(copied){
        action.textContent='✓ Copied — paste in ChatGPT';
        status.textContent='Copied. Return to this ChatGPT conversation, press Ctrl+V, and send.';
      }else{
        action.textContent='Data Ready — Copy Below';
      }
      try{navigator.clipboard&&navigator.clipboard.writeText(text).then(()=>{
        action.textContent='✓ Copied — paste in ChatGPT';
        status.textContent='Copied. Return to this ChatGPT conversation, press Ctrl+V, and send.';
      }).catch(()=>{});}catch(_){ }
    };
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(repair,900));
  let tries=0;const timer=setInterval(()=>{repair();if(++tries>120)clearInterval(timer)},500);
})();