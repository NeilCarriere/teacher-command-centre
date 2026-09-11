(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  const CLASS_KEY='neil_teacher_classes_v1';
  const ASSIGN_KEY='neil_teacher_assignments_v1';
  const REMINDER_KEY='neil_teacher_reminders_v1';
  const PERSIST_KEY='neil_teacher_dashboard_v2';

  function readJson(w,key,fallback){
    try{return JSON.parse(w.localStorage.getItem(key))||fallback}catch(e){return fallback}
  }

  function buildPayload(w){
    try{if(typeof w.saveTeacherState==='function')w.saveTeacherState()}catch(e){}
    const courses=readJson(w,CLASS_KEY,{courses:Object.keys(w.ROSTERS||{}).map(name=>({name,archived:false,students:[...(w.ROSTERS[name]||[])]}))});
    const assignments=readJson(w,ASSIGN_KEY,{});
    const reminders=readJson(w,REMINDER_KEY,[]);
    const persisted=readJson(w,PERSIST_KEY,null);
    const studentData=(w.state&&w.state.students)?w.state:(persisted||w.state||{});
    return JSON.stringify({
      format:'teacher-command-centre-winston-export',
      version:14,
      exportedAt:new Date().toISOString(),
      teacherApp:{
        currentClass:w.currentClass||studentData.currentClass||'',
        courses:courses,
        studentData:studentData
      },
      assignmentTracker:assignments,
      reminders:reminders
    },null,2);
  }

  function showOnly(d,id){
    ['dashboardView','homeworkView','reportsView','attendanceHistoryView','assignmentTrackerView','notesCentreView','winstonExportView','studentManagerView','courseManagerView'].forEach(x=>{
      const el=d.getElementById(x);if(el)el.classList.toggle('hidden',x!==id);
    });
    d.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  }

  let repairing=false;
  function installWinston(){
    if(repairing)return false;
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.state)return false;
    const main=d.querySelector('main.main'),nav=d.querySelector('.nav');
    if(!main||!nav)return false;
    repairing=true;
    try{
      let section=d.querySelector('#winstonExportView[data-winston-direct="1"]');
      [...d.querySelectorAll('#winstonExportView')].forEach(s=>{if(s!==section)s.remove()});
      if(!section){
        section=d.createElement('section');
        section.id='winstonExportView';
        section.dataset.winstonDirect='1';
        section.className='hidden';
        section.innerHTML='<div class="panel manage-grid"><div><h2>Send to Winston</h2><div class="history-help">Prepare the complete current dashboard data, copy it, then paste it into this ChatGPT conversation.</div></div><button class="secondary" id="winstonBackDirect">← Back to Dashboard</button><div class="privacy-note"><strong>Privacy:</strong> this handoff contains identifiable student information. Only paste it into the ChatGPT conversation you intend to use for your teacher dashboard.</div><div><button class="primary" id="downloadWinstonJson">↗ Send to Winston</button></div><div id="winstonSendStatus" class="winston-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid rgba(99,214,139,.45);background:rgba(99,214,139,.08);font-size:13px;line-height:1.4"></div><textarea id="winstonPayloadBox" readonly aria-label="Winston teacher data" style="display:none;width:100%;min-height:220px;margin-top:10px;padding:10px;border-radius:8px;box-sizing:border-box;font:12px/1.35 monospace;background:rgba(0,0,0,.22);color:inherit;border:1px solid rgba(255,255,255,.18)"></textarea></div>';
        main.appendChild(section);
      }

      const winstonButtons=[...nav.querySelectorAll('button')].filter(b=>b.id==='winstonExportNav'||/winston/i.test(b.textContent||''));
      let navBtn=winstonButtons.find(b=>b.dataset.winstonDirect==='1');
      if(!navBtn){
        navBtn=d.createElement('button');
        navBtn.id='winstonExportNav';
        navBtn.dataset.winstonDirect='1';
        const reset=d.getElementById('resetBtn');
        if(reset)nav.insertBefore(navBtn,reset);else nav.appendChild(navBtn);
      }
      winstonButtons.forEach(b=>{if(b!==navBtn)b.remove()});
      if(navBtn.textContent!=='↗ Send to Winston')navBtn.textContent='↗ Send to Winston';

      const action=section.querySelector('#downloadWinstonJson');
      const back=section.querySelector('#winstonBackDirect');
      const status=section.querySelector('#winstonSendStatus');
      const box=section.querySelector('#winstonPayloadBox');
      if(!action||!back||!status||!box)return false;

      navBtn.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        showOnly(d,'winstonExportView');
        section.classList.remove('hidden');
        navBtn.classList.add('active');
      };
      back.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        showOnly(d,'dashboardView');
        d.querySelector('.nav button[data-view="dashboard"]')?.classList.add('active');
      };
      action.onclick=async function(e){
        e.preventDefault();e.stopPropagation();
        const text=buildPayload(w);
        box.value=text;
        box.style.display='block';
        status.style.display='block';
        status.textContent='Your complete dashboard data is ready. I am copying it to the clipboard now. Then return to ChatGPT, press Ctrl+V (or Paste on iPad), and send it.';
        box.focus();box.select();

        let copied=false;
        try{
          if(w.navigator.clipboard&&w.isSecureContext){
            await w.navigator.clipboard.writeText(text);
            copied=true;
          }
        }catch(e){}
        if(!copied){
          try{copied=d.execCommand('copy')}catch(e){}
        }
        if(copied){
          action.textContent='✓ Copied — Paste in ChatGPT';
          status.textContent='Copied successfully. Return to this ChatGPT conversation, paste, and send. Leave the data box visible until Winston confirms receipt.';
        }else{
          action.textContent='Copy the Data Below';
          status.textContent='Automatic copying was blocked by this browser. The full data is visible below: click/tap in the box, Select All, Copy, then paste it into ChatGPT.';
          box.focus();box.select();
        }
      };
      return true;
    }finally{repairing=false}
  }

  function watch(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!d.body||!w)return false;
    if(w.__winstonDirectObserver)return true;
    let timer=null;
    w.__winstonDirectObserver=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(installWinston,40);
    });
    w.__winstonDirectObserver.observe(d.body,{childList:true,subtree:true});
    return true;
  }

  function load(){
    const d=frame.contentDocument;
    if(!d||!d.body)return false;

    installWinston();
    watch();

    if(d.getElementById('v1ControlsLoader'))return true;
    const m=d.createElement('div');m.id='v1ControlsLoader';m.hidden=true;d.body.appendChild(m);
    const s=d.createElement('script');
    s.src='v1-inner.js?v=20260910-direct-winston-v11';
    s.onload=()=>{installWinston();watch()};
    d.body.appendChild(s);
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(load,250));
  let n=0,t=setInterval(()=>{
    if(load()||++n>40)clearInterval(t);
  },200);
})();