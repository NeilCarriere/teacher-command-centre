(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  function apply(){
    const d=frame.contentDocument;
    if(!d||!d.head||!d.body)return false;

    // Remove the redundant legacy Class button if it is still present.
    d.querySelectorAll('.nav button').forEach(b=>{
      const txt=b.textContent.trim();
      if((b.dataset.view||'')==='class'||/^👥?\s*Class(es)?$/i.test(txt)) b.remove();
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
    const nav=d.querySelector('.nav');
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
})();