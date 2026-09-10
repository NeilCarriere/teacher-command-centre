(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function readJson(w,key){try{return JSON.parse(w.localStorage.getItem(key))||{}}catch(e){return{}}}
  function buildPayload(w){
    return JSON.stringify({
      format:'teacher-command-centre-winston-export',
      version:10,
      exportedAt:new Date().toISOString(),
      courses:readJson(w,'neil_teacher_classes_v1'),
      teacherApp:{currentClass:w.currentClass,studentData:w.state},
      assignmentTracker:readJson(w,'neil_teacher_assignments_v1')
    },null,2);
  }
  function showOnly(d,id){
    ['dashboardView','homeworkView','reportsView','attendanceHistoryView','assignmentTrackerView','notesCentreView','winstonExportView','studentManagerView','courseManagerView'].forEach(x=>{
      d.querySelectorAll('#'+x).forEach(el=>el.classList.toggle('hidden',x!==id));
    });
    d.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  }

  function repair(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.state)return false;
    const main=d.querySelector('main.main'),nav=d.querySelector('.nav');
    if(!main||!nav)return false;

    // Remove every Winston panel and rebuild one known-good panel.
    d.querySelectorAll('#winstonExportView').forEach(el=>el.remove());
    const section=d.createElement('section');
    section.id='winstonExportView';
    section.className='hidden';
    section.innerHTML='<div class="panel manage-grid"><div><h2>Send to Winston</h2><div class="history-help">Prepare your current teacher data here, then paste it into this ChatGPT conversation.</div></div><button class="secondary" id="winstonBackBtn">← Back to Dashboard</button><div class="privacy-note"><strong>Privacy:</strong> this contains identifiable student information. Only paste/share it where your school or board permits.</div><div><button class="primary" id="winstonSendBtn">↗ Send to Winston</button><div id="winstonSendStatus" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid rgba(99,214,139,.45);background:rgba(99,214,139,.08);font-size:13px;line-height:1.4"></div><textarea id="winstonPayloadBox" readonly aria-label="Winston export data" style="display:none;width:100%;min-height:220px;margin-top:10px;padding:10px;border-radius:8px;box-sizing:border-box;font:12px/1.35 monospace;background:rgba(0,0,0,.22);color:inherit;border:1px solid rgba(255,255,255,.18)"></textarea></div></div>';
    main.appendChild(section);

    // Keep one sidebar Winston button.
    const candidates=[...d.querySelectorAll('.nav button')].filter(b=>/winston/i.test(b.textContent||''));
    let navBtn=candidates[0];
    candidates.slice(1).forEach(b=>b.remove());
    if(!navBtn){navBtn=d.createElement('button');nav.appendChild(navBtn);}
    navBtn.id='winstonExportNav';
    navBtn.textContent='↗ Send to Winston';

    const action=d.getElementById('winstonSendBtn');
    const status=d.getElementById('winstonSendStatus');
    const box=d.getElementById('winstonPayloadBox');
    const homeBtn=d.querySelector('.nav button[data-view="dashboard"]');

    navBtn.onclick=function(e){
      e.preventDefault();e.stopImmediatePropagation();
      showOnly(d,'winstonExportView');
      section.classList.remove('hidden');
      navBtn.classList.add('active');
    };
    d.getElementById('winstonBackBtn').onclick=function(){showOnly(d,'dashboardView');homeBtn?.classList.add('active');};

    action.onclick=async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      const text=buildPayload(w);
      box.value=text;
      box.style.display='block';
      status.style.display='block';
      status.textContent='Your current dashboard data is ready below. I am also trying to copy it automatically. If copying is blocked, click in the box and press Ctrl+A, Ctrl+C, then paste here in ChatGPT.';
      action.textContent='Data Ready — Copy Below';
      box.focus();box.select();
      let copied=false;
      try{copied=d.execCommand('copy');}catch(_){copied=false;}
      if(!copied){try{await navigator.clipboard.writeText(text);copied=true}catch(_){}}
      if(copied){action.textContent='✓ Copied — paste in ChatGPT';status.textContent='Copied. Return to this ChatGPT conversation, press Ctrl+V, and send.';}
    };
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(repair,1000));
  let tries=0;const timer=setInterval(()=>{if(repair()||++tries>80)clearInterval(timer)},400);
})();