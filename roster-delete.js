(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.ROSTERS||!w.state||!w.KEY)return false;
    if(d.getElementById('rosterDeleteUpgrade'))return true;
    const marker=d.createElement('div');marker.id='rosterDeleteUpgrade';marker.hidden=true;d.body.appendChild(marker);
    const style=d.createElement('style');style.textContent='.danger-mini{border:1px solid rgba(255,107,107,.55)!important;color:#ffd4d4!important;background:rgba(255,107,107,.08)!important}.student-manager{display:grid;gap:12px}.student-manager-head{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.student-manager-head input{min-width:220px}.student-manager-list{display:grid;gap:7px}.student-manager-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 10px;border:1px solid rgba(255,255,255,.12);border-radius:9px}.student-manager-title{font-family:"Segoe Print","Comic Sans MS",cursive;font-size:24px;margin:0}.student-count{color:var(--muted);font-size:12px}@media(max-width:650px){.student-manager-head>*{width:100%}.student-manager-row{align-items:flex-start}}';d.head.appendChild(style);
    const main=d.querySelector('main.main');
    // v1-inner owns persistent student management. Only install this older
    // manager as a fallback when the newer one is absent.
    let sec=d.getElementById('studentManagerView');
    if(!sec){sec=d.createElement('section');sec.id='studentManagerView';sec.className='hidden';sec.innerHTML='<div class="panel student-manager"><div><h2 class="student-manager-title">Manage Students</h2><div class="history-help">Add late registrations or remove students who are no longer in a class.</div></div><div class="student-manager-head"><button class="secondary" id="studentManagerBack">← Back to Dashboard</button><select id="studentManagerClass"></select><input id="newStudentName" placeholder="Student display name"><button class="primary" id="addStudentNow">＋ Add Student</button></div><div class="student-count" id="studentManagerCount"></div><div class="student-manager-list" id="studentManagerList"></div></div>';main.appendChild(sec)}
    const nav=d.querySelector('.nav'),reset=d.getElementById('resetBtn');if(nav&&!d.getElementById('studentManagerNav')){const b=d.createElement('button');b.id='studentManagerNav';b.textContent='➕ Manage Students';nav.insertBefore(b,reset)}

    // Assignment deletion is now supplied by v1-inner. Do not add a second
    // trash button. If an older duplicate is already present, remove it.
    function removeDuplicateTrash(){d.querySelectorAll('#assignmentList .assignment-card').forEach(card=>{const buttons=[...card.querySelectorAll('.v1-delete-assignment,.delete-assignment-btn')];if(buttons.length>1){const keep=buttons.find(b=>b.classList.contains('v1-delete-assignment'))||buttons[0];buttons.forEach(b=>{if(b!==keep)b.remove()})}})}
    new MutationObserver(removeDuplicateTrash).observe(d.body,{childList:true,subtree:true});removeDuplicateTrash();
    return true;
  }
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>30)clearInterval(timer)},250);frame.addEventListener('load',()=>{tries=0});
})();