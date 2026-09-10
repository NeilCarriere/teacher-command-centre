(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!d.body||d.body.dataset.homeRefresh==='1')return false;
    const home=d.querySelector('.nav button[data-view="dashboard"]');
    if(!home)return false;
    d.body.dataset.homeRefresh='1';
    home.addEventListener('click',function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      try{if(typeof w.saveTeacherState==='function')w.saveTeacherState();}catch(err){}
      try{window.top.location.reload();}catch(err){location.reload();}
    },true);
    return true;
  }
  frame.addEventListener('load',()=>setTimeout(install,500));
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>40)clearInterval(timer)},250);
})();