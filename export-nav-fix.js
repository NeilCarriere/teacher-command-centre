(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function showExport(){
    const d=frame.contentDocument;
    if(!d)return false;
    const target=d.getElementById('winstonExportView');
    if(!target)return false;
    ['dashboardView','homeworkView','reportsView','attendanceHistoryView','assignmentTrackerView','notesCentreView','winstonExportView','studentManagerView','courseManagerView'].forEach(id=>{
      const el=d.getElementById(id);if(el)el.classList.toggle('hidden',id!=='winstonExportView');
    });
    d.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
    d.getElementById('winstonExportNav')?.classList.add('active');
    if(typeof frame.contentWindow.renderExportSummary==='function'){
      try{frame.contentWindow.renderExportSummary();}catch(e){}
    }
    return true;
  }

  function install(){
    const d=frame.contentDocument;
    if(!d||!d.body)return false;
    const btn=d.getElementById('winstonExportNav');
    if(!btn)return false;
    if(btn.dataset.exportNavFixed==='1')return true;
    btn.dataset.exportNavFixed='1';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      showExport();
    },true);
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,1200));
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>80)clearInterval(timer)},250);
})();