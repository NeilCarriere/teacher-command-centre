(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const CLASS_KEY='neil_teacher_classes_v1';

  function compareStudents(a,b){
    const split=s=>String(s||'').trim().split(/\s+/).filter(Boolean);
    const pa=split(a),pb=split(b);
    const la=(pa[pa.length-1]||'').toLowerCase(),lb=(pb[pb.length-1]||'').toLowerCase();
    const byLast=la.localeCompare(lb,undefined,{sensitivity:'base'});
    if(byLast)return byLast;
    return String(a).localeCompare(String(b),undefined,{sensitivity:'base'});
  }
  function sorted(list){return [...(list||[])].sort(compareStudents)}
  function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}

  function normalize(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!d.body||!w||!w.ROSTERS)return false;
    let cfg=null;try{cfg=JSON.parse(localStorage.getItem(CLASS_KEY))}catch(e){}
    if(!cfg||!Array.isArray(cfg.courses))return false;

    let changed=false;
    cfg.courses.forEach(c=>{
      const next=sorted(c.students);
      if(!same(c.students||[],next)){c.students=next;changed=true}
    });
    if(changed)localStorage.setItem(CLASS_KEY,JSON.stringify(cfg));

    let rosterChanged=false;
    cfg.courses.filter(c=>!c.archived).forEach(c=>{
      const current=w.ROSTERS[c.name]||[];
      if(!same(current,c.students)){
        w.ROSTERS[c.name]=[...c.students];
        rosterChanged=true;
      }
    });
    if(rosterChanged&&typeof w.renderAll==='function')w.renderAll();
    return true;
  }

  function install(){
    const d=frame.contentDocument;if(!d||!d.body)return false;
    if(d.body.dataset.studentAutoSort==='1')return true;
    d.body.dataset.studentAutoSort='1';
    d.addEventListener('click',e=>{
      if(e.target.closest('#studentAddFixed,#studentAdd,#addStudentNow'))setTimeout(normalize,0);
    },false);
    normalize();
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(()=>{install();normalize()},700));
  let tries=0;const timer=setInterval(()=>{if((install()&&normalize())||++tries>40)clearInterval(timer)},250);
})();