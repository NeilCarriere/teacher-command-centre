(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function isoDate(){
    const d=new Date(), l=new Date(d.getTime()-d.getTimezoneOffset()*60000);
    return l.toISOString().slice(0,10);
  }
  function assignmentData(){
    try{return JSON.parse(localStorage.getItem('neil_teacher_assignments_v1'))||{}}catch(e){return{}}
  }
  function buildExport(w){
    return {
      format:'teacher-command-centre-winston-export',
      version:2,
      exportedAt:new Date().toISOString(),
      teacherApp:{currentClass:w.currentClass,studentData:w.state},
      assignmentTracker:assignmentData()
    };
  }
  function setStatus(d,msg,kind){
    let box=d.getElementById('winstonSendStatus');
    if(!box){
      box=d.createElement('div');
      box.id='winstonSendStatus';
      const btn=d.getElementById('downloadWinstonJson');
      if(btn)btn.insertAdjacentElement('afterend',box);
    }
    if(!box)return;
    box.textContent=msg;
    box.style.marginTop='10px';
    box.style.padding='10px 12px';
    box.style.borderRadius='8px';
    box.style.fontSize='13px';
    box.style.lineHeight='1.4';
    box.style.border='1px solid '+(kind==='ok'?'rgba(99,214,139,.45)':'rgba(246,211,101,.45)');
    box.style.background=kind==='ok'?'rgba(99,214,139,.08)':'rgba(246,211,101,.07)';
  }
  function downloadFallback(d,text){
    const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=d.createElement('a');
    a.href=url;a.download='winston-teacher-export-'+isoDate()+'.json';d.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  async function sendToWinston(d,w,btn){
    const payload=JSON.stringify(buildExport(w),null,2);
    const original=btn.textContent;
    btn.disabled=true;btn.textContent='Preparing…';
    try{
      const file=new File([payload],'winston-teacher-export-'+isoDate()+'.json',{type:'application/json'});
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        try{
          await navigator.share({
            title:'Teacher Command Centre — Winston Export',
            text:'Teacher Command Centre data for Winston. Please upload/send this file in my ChatGPT conversation.',
            files:[file]
          });
          btn.textContent='✓ Shared';
          setStatus(d,'Shared successfully. Send the attachment in ChatGPT and Winston will confirm: “Yeah I got it.”','ok');
          return;
        }catch(e){
          if(e && e.name==='AbortError'){
            btn.textContent=original;
            setStatus(d,'Share cancelled — nothing was sent.','warn');
            return;
          }
        }
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(payload);
        btn.textContent='✓ Copied for Winston';
        setStatus(d,'Your teacher data is copied to the clipboard. Return to this ChatGPT conversation, paste it into the message box, and send. Winston will reply: “Yeah I got it.”','ok');
      }else{
        downloadFallback(d,payload);
        btn.textContent='✓ Export ready';
        setStatus(d,'Your browser cannot share or copy the export directly, so a JSON backup was downloaded. Upload that file into this ChatGPT conversation.','warn');
      }
    }catch(e){
      try{downloadFallback(d,payload)}catch(_){}
      btn.textContent='Export ready';
      setStatus(d,'Direct sharing is not available in this browser, so a JSON file was created instead. Upload it into this ChatGPT conversation.','warn');
    }finally{
      setTimeout(()=>{btn.disabled=false;if(btn.textContent!=='✓ Copied for Winston'&&btn.textContent!=='✓ Shared')btn.textContent=original},1800);
    }
  }
  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.state)return false;
    const btn=d.getElementById('downloadWinstonJson');
    if(!btn)return false;
    if(btn.dataset.winstonShareV2==='1')return true;
    btn.dataset.winstonShareV2='1';
    btn.textContent='↗ Send to Winston';
    btn.title='Share your current Teacher Command Centre data with Winston';
    const card=btn.closest('.export-card');
    if(card){
      const h=card.querySelector('h3');if(h)h.textContent='Send to Winston';
      const p=card.querySelector('p');if(p)p.textContent='One tap prepares your current attendance, participation, notes, missing work, and assignment data. On supported devices it opens the share sheet; otherwise it copies the data so you can paste it directly into your ChatGPT conversation.';
    }
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();sendToWinston(d,w,btn);
    },true);
    return true;
  }
  frame.addEventListener('load',()=>setTimeout(install,1000));
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>120)clearInterval(timer)},250);
})();
