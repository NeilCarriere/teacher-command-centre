(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function isoDate(){
    const d=new Date(), l=new Date(d.getTime()-d.getTimezoneOffset()*60000);
    return l.toISOString().slice(0,10);
  }
  function assignmentData(w){
    try{return JSON.parse(w.localStorage.getItem('neil_teacher_assignments_v1'))||{}}catch(e){return{}}
  }
  function payload(w){
    return JSON.stringify({
      format:'teacher-command-centre-winston-export',
      version:6,
      exportedAt:new Date().toISOString(),
      teacherApp:{currentClass:w.currentClass,studentData:w.state},
      assignmentTracker:assignmentData(w)
    },null,2);
  }
  function ensureStatus(d,btn,msg,ok=true){
    let box=d.getElementById('winstonSendStatus');
    if(!box){box=d.createElement('div');box.id='winstonSendStatus';btn.insertAdjacentElement('afterend',box)}
    box.textContent=msg;
    box.style.cssText='margin-top:10px;padding:10px 12px;border-radius:8px;font-size:13px;line-height:1.4;border:1px solid '+(ok?'rgba(99,214,139,.45)':'rgba(246,211,101,.45)')+';background:'+(ok?'rgba(99,214,139,.08)':'rgba(246,211,101,.07)');';
  }
  function ensureSave(d,w){
    const nav=d.querySelector('.nav');if(!nav||d.getElementById('manualSaveBtn'))return;
    const btn=d.createElement('button');btn.id='manualSaveBtn';btn.type='button';btn.textContent='💾 Save Now';btn.title='Manually save all dashboard information on this device';
    btn.onclick=function(){
      try{
        if(typeof w.saveTeacherState==='function')w.saveTeacherState();
        else if(w.state){
          w.state.currentClass=w.currentClass;
          const json=JSON.stringify(w.state);
          w.localStorage.setItem(w.KEY||'neil_teacher_dashboard_v1',json);
          w.localStorage.setItem('neil_teacher_dashboard_v2',json);
        }
        const original='💾 Save Now';btn.textContent='✓ Saved';
        setTimeout(()=>btn.textContent=original,1500);
      }catch(e){btn.textContent='⚠ Save failed';setTimeout(()=>btn.textContent='💾 Save Now',1800)}
    };
    const reset=d.getElementById('resetBtn');if(reset)nav.insertBefore(btn,reset);else nav.appendChild(btn);
  }
  function ensureWinston(d,w){
    const old=d.getElementById('downloadWinstonJson');if(!old)return;
    if(old.dataset.winstonFinal==='1')return;
    const btn=old.cloneNode(false);
    btn.id='downloadWinstonJson';btn.className=old.className;btn.dataset.winstonFinal='1';
    btn.textContent='↗ Send to Winston';
    btn.title='Copy your current Teacher Command Centre data for Winston';
    old.replaceWith(btn);

    const section=d.getElementById('winstonExportView');
    const help=section?.querySelector('.export-top .history-help');
    if(help)help.textContent='Copy your current teacher data, then paste it directly into your ChatGPT conversation with Winston.';
    const card=btn.closest('.export-card');
    if(card){
      const h=card.querySelector('h3');if(h)h.textContent='Send to Winston';
      const p=card.querySelector('p');if(p)p.textContent='Copies attendance, participation, notes, missing work, and assignment data. Then return to ChatGPT, paste, and send — no downloaded file needed.';
    }

    btn.onclick=async function(e){
      e.preventDefault();e.stopPropagation();
      const text=payload(w);btn.disabled=true;btn.textContent='Preparing…';
      let copied=false;
      try{await navigator.clipboard.writeText(text);copied=true}catch(err){
        try{
          const ta=d.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';ta.style.pointerEvents='none';d.body.appendChild(ta);ta.select();copied=d.execCommand('copy');ta.remove();
        }catch(_){copied=false}
      }
      if(copied){
        btn.textContent='✓ Copied — paste in ChatGPT';
        ensureStatus(d,btn,'Ready. Return to this ChatGPT conversation, press Ctrl+V, and send. Winston will reply “Yeah I got it.”',true);
      }else{
        btn.textContent='Copy blocked';
        ensureStatus(d,btn,'Your browser blocked clipboard access. Use the normal ChatGPT attachment button and choose the newest Winston export file, or open this page in Chrome/Edge and try again.',false);
      }
      btn.disabled=false;
    };
  }
  function repair(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.state)return false;
    ensureSave(d,w);ensureWinston(d,w);return true;
  }
  frame.addEventListener('load',()=>setTimeout(repair,1200));
  let count=0;const timer=setInterval(()=>{repair();if(++count>240)clearInterval(timer)},250);
})();