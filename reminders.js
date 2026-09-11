(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const KEY='neil_teacher_reminders_v1';

  function install(){
    const d=frame.contentDocument;
    if(!d||!d.body||d.getElementById('reminderUpgrade'))return !!d?.getElementById('reminderUpgrade');
    const recent=d.getElementById('recentNotes');
    if(!recent)return false;

    const marker=d.createElement('div');marker.id='reminderUpgrade';marker.hidden=true;d.body.appendChild(marker);
    const style=d.createElement('style');
    style.textContent=`
      .reminder-sticky{position:relative;background:linear-gradient(145deg,#ffe77d,#f5cf56);color:#1f241f;border-radius:3px 4px 10px 3px;box-shadow:0 8px 18px rgba(0,0,0,.28);padding:16px 15px 14px;font-family:"Segoe Print","Comic Sans MS",cursive;transform:rotate(.35deg);max-width:100%;overflow:hidden}
      .reminder-sticky:before{content:"";position:absolute;width:18px;height:18px;border-radius:50%;background:#d84838;top:-8px;left:50%;transform:translateX(-50%);box-shadow:0 3px 3px rgba(0,0,0,.35),inset -3px -3px 4px rgba(0,0,0,.18)}
      .reminder-sticky h3{color:#1f241f!important;margin:0 0 10px!important;font-size:19px}.reminder-sticky h3:after{background:linear-gradient(90deg,#1f241f,transparent)!important}
      .reminder-form{display:flex;gap:8px;align-items:center;margin-bottom:10px;min-width:0;width:100%}
      .reminder-text-input{flex:1;min-width:0;width:100%;box-sizing:border-box;background:rgba(255,255,255,.65);border:1px solid rgba(31,36,31,.35);color:#1f241f;padding:10px 11px;border-radius:7px;font:600 14px "Trebuchet MS",sans-serif;min-height:42px}
      .reminder-text-input:focus{outline:2px solid rgba(31,36,31,.38);outline-offset:1px;background:rgba(255,255,255,.82)}
      .reminder-add{border:1px solid rgba(31,36,31,.35);background:rgba(31,36,31,.14);color:#1f241f;border-radius:8px;padding:10px 13px;font-weight:900;cursor:pointer;min-height:42px;white-space:nowrap}.reminder-add:hover{background:rgba(31,36,31,.22)}
      .reminder-help{font-family:"Trebuchet MS",sans-serif;font-size:11px;opacity:.72;margin:-2px 0 8px}
      .reminder-list{display:grid;gap:6px;min-width:0}.reminder-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:start;padding:7px 0;border-top:1px dashed rgba(31,36,31,.28);min-width:0}.reminder-item:first-child{border-top:0}
      .reminder-check{width:24px;height:24px;border:1.5px solid rgba(31,36,31,.5);background:rgba(255,255,255,.24);color:#1f241f;border-radius:6px;cursor:pointer;font-weight:900;line-height:1;padding:0;margin-top:1px}.reminder-check.checked{background:rgba(31,36,31,.16)}
      .reminder-text{font-size:14px;line-height:1.35;min-width:0;overflow-wrap:anywhere}.reminder-actions{display:flex;gap:4px}.reminder-actions button{border:0;background:transparent;color:#1f241f;cursor:pointer;padding:2px 3px;font-size:14px}.reminder-empty{font-size:12px;opacity:.7;padding:5px 0}.reminder-done{opacity:.48}.reminder-done .reminder-text{text-decoration:line-through}
      .reminder-manager{margin-top:14px;min-width:0}.reminder-manager .reminder-sticky{max-width:780px;transform:none}
      @media(max-width:700px){.reminder-form{align-items:stretch}.reminder-add{padding:10px}.reminder-item{grid-template-columns:auto minmax(0,1fr) auto}}
    `;
    d.head.appendChild(style);

    function load(){
      try{
        const x=JSON.parse(localStorage.getItem(KEY));
        if(!Array.isArray(x))return[];
        return x.map(r=>({id:r.id||('r'+Date.now()+Math.random().toString(36).slice(2,6)),text:r.text||'',done:!!r.done,createdAt:r.createdAt||''})).filter(r=>r.text.trim());
      }catch(e){return[]}
    }
    let reminders=load();
    function save(){localStorage.setItem(KEY,JSON.stringify(reminders));renderAll()}
    function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

    function makeSticky(){
      const wrap=d.createElement('div');wrap.className='reminder-sticky';
      wrap.innerHTML='<h3>📌 Reminders</h3><div class="reminder-form"><input type="text" class="reminder-text-input" placeholder="Type something you want to remember…"><button class="reminder-add">＋ Add</button></div><div class="reminder-help">A simple running checklist. Add it, leave it here, check it off when it is done.</div><div class="reminder-list"></div>';
      return wrap;
    }

    const recentPanel=recent.closest('.panel');
    const dashboardSticky=makeSticky();dashboardSticky.id='dashboardReminderSticky';
    if(recentPanel)recentPanel.insertAdjacentElement('afterend',dashboardSticky);
    const notesView=d.getElementById('notesCentreView');
    let notesSticky=null;
    if(notesView){const shell=notesView.querySelector('.notes-shell')||notesView.querySelector('.panel');notesSticky=makeSticky();const holder=d.createElement('div');holder.className='reminder-manager';holder.appendChild(notesSticky);if(shell)shell.appendChild(holder)}

    function renderInto(sticky,limit){
      if(!sticky)return;
      const list=sticky.querySelector('.reminder-list');
      const sorted=reminders.slice().sort((a,b)=>(a.done-b.done)||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
      const visible=limit?sorted.slice(0,limit):sorted;
      if(!visible.length){list.innerHTML='<div class="reminder-empty">No reminders. Enjoy the suspicious calm.</div>';return}
      list.innerHTML=visible.map(r=>'<div class="reminder-item'+(r.done?' reminder-done':'')+'"><button class="reminder-check'+(r.done?' checked':'')+'" title="'+(r.done?'Mark active':'Mark done')+'" data-reminder-done="'+r.id+'">'+(r.done?'✓':'')+'</button><div class="reminder-text">'+esc(r.text)+'</div><div class="reminder-actions"><button title="Delete reminder" data-reminder-delete="'+r.id+'">🗑</button></div></div>').join('');
      list.querySelectorAll('[data-reminder-done]').forEach(b=>b.onclick=()=>{const r=reminders.find(x=>x.id===b.dataset.reminderDone);if(r){r.done=!r.done;save()}});
      list.querySelectorAll('[data-reminder-delete]').forEach(b=>b.onclick=()=>{const r=reminders.find(x=>x.id===b.dataset.reminderDelete);if(!r)return;if(!confirm('Delete this reminder?'))return;reminders=reminders.filter(x=>x.id!==r.id);save()});
    }

    function wire(sticky){
      if(!sticky)return;
      const text=sticky.querySelector('.reminder-text-input'),add=sticky.querySelector('.reminder-add');
      const go=()=>{const t=text.value.trim();if(!t){text.focus();return}reminders.push({id:'r'+Date.now()+Math.random().toString(36).slice(2,6),text:t,done:false,createdAt:new Date().toISOString()});text.value='';save();text.focus()};
      add.onclick=go;text.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});
    }

    wire(dashboardSticky);wire(notesSticky);
    function renderAll(){renderInto(dashboardSticky,8);renderInto(notesSticky,0)}
    renderAll();
    return true;
  }

  let tries=0;const timer=setInterval(()=>{if(install()||++tries>40)clearInterval(timer)},250);
})();