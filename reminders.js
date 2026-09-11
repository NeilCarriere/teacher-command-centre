(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  const KEY='neil_teacher_reminders_v1';

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!d.body||d.getElementById('reminderUpgrade'))return !!d?.getElementById('reminderUpgrade');
    const recent=d.getElementById('recentNotes');
    if(!recent)return false;

    const marker=d.createElement('div');marker.id='reminderUpgrade';marker.hidden=true;d.body.appendChild(marker);
    const style=d.createElement('style');
    style.textContent=`
      .reminder-sticky{position:relative;background:linear-gradient(145deg,#ffe77d,#f5cf56);color:#1f241f;border-radius:3px 4px 10px 3px;box-shadow:0 8px 18px rgba(0,0,0,.28);padding:16px 15px 14px;font-family:"Segoe Print","Comic Sans MS",cursive;transform:rotate(.35deg);max-width:100%;overflow:hidden}
      .reminder-sticky:before{content:"";position:absolute;width:18px;height:18px;border-radius:50%;background:#d84838;top:-8px;left:50%;transform:translateX(-50%);box-shadow:0 3px 3px rgba(0,0,0,.35),inset -3px -3px 4px rgba(0,0,0,.18)}
      .reminder-sticky h3{color:#1f241f!important;margin:0 0 10px!important;font-size:19px}.reminder-sticky h3:after{background:linear-gradient(90deg,#1f241f,transparent)!important}
      .reminder-form{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(125px,.7fr) minmax(110px,.6fr) minmax(150px,.85fr);gap:9px;align-items:end;margin-bottom:11px;min-width:0;width:100%}
      .reminder-field{display:grid;gap:4px;min-width:0}.reminder-field label{font-family:"Trebuchet MS",sans-serif;font-size:12px;font-weight:900;color:#1f241f;letter-spacing:.02em}.reminder-field input,.reminder-field select{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:rgba(255,255,255,.68);border:1px solid rgba(31,36,31,.35);color:#1f241f;padding:9px 10px;border-radius:7px;font:600 13px "Trebuchet MS",sans-serif}.reminder-field input:focus,.reminder-field select:focus{outline:2px solid rgba(31,36,31,.38);outline-offset:1px;background:rgba(255,255,255,.84)}
      .reminder-form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:7px;flex-wrap:wrap}.reminder-form-actions button,.reminder-alert-permission{border:1px solid rgba(31,36,31,.35);background:rgba(31,36,31,.14);color:#1f241f;border-radius:8px;padding:9px 12px;font-weight:900;cursor:pointer;min-height:40px}.reminder-form-actions button:hover,.reminder-alert-permission:hover{background:rgba(31,36,31,.22)}
      .reminder-help{grid-column:1/-1;font-family:"Trebuchet MS",sans-serif;font-size:11px;opacity:.76;margin-top:-2px;overflow-wrap:anywhere}.reminder-alert-row{grid-column:1/-1;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-family:"Trebuchet MS",sans-serif;font-size:11px}.reminder-alert-status{opacity:.72}
      .reminder-list{display:grid;gap:7px;min-width:0}.reminder-item{display:grid;grid-template-columns:minmax(120px,auto) minmax(0,1fr) auto;gap:8px;align-items:start;padding:8px 0;border-top:1px dashed rgba(31,36,31,.28);min-width:0}.reminder-item:first-child{border-top:0}.reminder-date{font-family:"Trebuchet MS",sans-serif;font-size:11px;font-weight:900;white-space:nowrap;padding-top:2px}.reminder-alert-label{display:block;font-size:9px;font-weight:700;opacity:.67;margin-top:2px}.reminder-text{font-size:13px;line-height:1.3;min-width:0;overflow-wrap:anywhere}.reminder-actions{display:flex;gap:3px}.reminder-actions button{border:0;background:transparent;color:#1f241f;cursor:pointer;padding:2px 3px;font-size:14px}.reminder-overdue .reminder-date{color:#9b1c1c}.reminder-today .reminder-date{color:#205c35}.reminder-empty{font-size:12px;opacity:.7;padding:5px 0}.reminder-done{opacity:.48;text-decoration:line-through}
      .reminder-manager{margin-top:14px;min-width:0}.reminder-manager .reminder-sticky{max-width:900px;transform:none}
      .reminder-pop{position:fixed;right:24px;top:24px;z-index:100300;width:min(390px,calc(100vw - 48px));background:#ffe77d;color:#1f241f;border:2px solid rgba(31,36,31,.34);border-radius:12px;box-shadow:0 16px 45px rgba(0,0,0,.48);padding:15px 16px;font-family:"Segoe Print","Comic Sans MS",cursive}.reminder-pop h3{margin:0 0 6px;color:#1f241f}.reminder-pop-time{font:800 12px "Trebuchet MS",sans-serif;margin-bottom:8px}.reminder-pop-actions{display:flex;gap:7px;justify-content:flex-end;margin-top:11px}.reminder-pop-actions button{border:1px solid rgba(31,36,31,.35);background:rgba(31,36,31,.12);color:#1f241f;border-radius:7px;padding:7px 10px;font-weight:800;cursor:pointer}
      @media(max-width:1000px){.reminder-form{grid-template-columns:1fr 1fr}.reminder-form .reminder-text-field{grid-column:1/-1}}
      @media(max-width:700px){.reminder-form{grid-template-columns:1fr}.reminder-form>*{grid-column:1;width:100%}.reminder-form-actions{justify-content:stretch}.reminder-form-actions button{flex:1}.reminder-item{grid-template-columns:1fr auto}.reminder-date{grid-column:1/-1}.reminder-pop{right:12px;top:12px;width:calc(100vw - 24px)}}
    `;
    d.head.appendChild(style);

    function load(){
      try{
        const x=JSON.parse(localStorage.getItem(KEY));
        if(!Array.isArray(x))return[];
        return x.map(r=>({
          id:r.id||('r'+Date.now()+Math.random().toString(36).slice(2,6)),
          text:r.text||'',date:r.date||todayISO(),time:r.time||'08:00',
          alertOffset:Number.isFinite(Number(r.alertOffset))?Number(r.alertOffset):0,
          done:!!r.done,notifiedFor:r.notifiedFor||'',createdAt:r.createdAt||''
        }));
      }catch(e){return[]}
    }
    let reminders=load(),editingId=null;
    function save(){localStorage.setItem(KEY,JSON.stringify(reminders));renderAll()}
    function pad(n){return String(n).padStart(2,'0')}
    function todayISO(){const x=new Date();return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate())}
    function defaultTime(){const x=new Date();x.setMinutes(Math.ceil((x.getMinutes()+1)/15)*15,0,0);if(x.getMinutes()===60)x.setHours(x.getHours()+1,0,0,0);return pad(x.getHours())+':'+pad(x.getMinutes())}
    function prettyDate(ds){if(!ds)return'No date';try{return new Date(ds+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}catch(e){return ds}}
    function prettyTime(ts){if(!ts)return'';try{const [h,m]=ts.split(':').map(Number),x=new Date();x.setHours(h,m,0,0);return x.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}catch(e){return ts}}
    function alertLabel(offset){const n=Number(offset)||0;if(n===0)return'At time';if(n===5)return'5 min before';if(n===10)return'10 min before';if(n===15)return'15 min before';if(n===30)return'30 min before';if(n===60)return'1 hour before';if(n===120)return'2 hours before';if(n===1440)return'1 day before';return n+' min before'}
    function eventMs(r){const t=(r.time||'08:00')+':00';const x=new Date((r.date||todayISO())+'T'+t);return x.getTime()}
    function triggerMs(r){return eventMs(r)-(Number(r.alertOffset)||0)*60000}
    function triggerKey(r){return String(triggerMs(r))}
    function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

    function notifySystem(r){
      try{
        const N=(window.top&&window.top.Notification)||window.Notification;
        if(N&&N.permission==='granted')new N('Teacher Command Centre Reminder',{body:r.text+' — '+prettyTime(r.time),tag:'teacher-reminder-'+r.id});
      }catch(e){}
    }
    function showPop(r){
      d.getElementById('activeReminderPop')?.remove();
      const pop=d.createElement('div');pop.id='activeReminderPop';pop.className='reminder-pop';
      pop.innerHTML='<h3>⏰ Reminder</h3><div class="reminder-pop-time">'+esc(prettyDate(r.date)+' · '+prettyTime(r.time))+'</div><div>'+esc(r.text)+'</div><div class="reminder-pop-actions"><button data-dismiss>Dismiss</button><button data-done>✓ Done</button></div>';
      d.body.appendChild(pop);
      pop.querySelector('[data-dismiss]').onclick=()=>pop.remove();
      pop.querySelector('[data-done]').onclick=()=>{r.done=true;save();pop.remove()};
    }
    function checkAlerts(){
      const now=Date.now();
      reminders.filter(r=>!r.done).forEach(r=>{
        const trig=triggerMs(r),evt=eventMs(r),key=triggerKey(r);
        if(!Number.isFinite(trig)||r.notifiedFor===key)return;
        if(now>=trig&&now<=evt+6*60*60*1000){r.notifiedFor=key;localStorage.setItem(KEY,JSON.stringify(reminders));notifySystem(r);showPop(r)}
      });
    }

    function notificationStatus(){
      try{const N=(window.top&&window.top.Notification)||window.Notification;if(!N)return'Browser notifications are not supported here.';if(N.permission==='granted')return'Browser alerts enabled.';if(N.permission==='denied')return'Browser alerts are blocked; in-app alerts will still appear while the dashboard is open.';return'Enable browser alerts if you want a notification when this tab is in the background.'}catch(e){return'In-app alerts will appear while the dashboard is open.'}
    }
    async function requestNotifications(sticky){
      const status=sticky.querySelector('.reminder-alert-status');
      try{
        const N=(window.top&&window.top.Notification)||window.Notification;
        if(!N){status.textContent='Browser notifications are not supported here.';return}
        const p=await N.requestPermission();status.textContent=p==='granted'?'Browser alerts enabled.':'Browser alerts were not enabled; in-app alerts will still work.';
      }catch(e){status.textContent='Could not enable browser alerts; in-app alerts will still work.'}
    }

    function makeSticky(){
      const wrap=d.createElement('div');wrap.className='reminder-sticky';
      wrap.innerHTML='<h3>📌 Reminders</h3><div class="reminder-form"><div class="reminder-field reminder-text-field"><label>Reminder</label><input type="text" class="reminder-text-input" placeholder="e.g. Cover Grade 10 during prep"></div><div class="reminder-field"><label>Date</label><input type="date" class="reminder-date-input"></div><div class="reminder-field"><label>Time</label><input type="time" class="reminder-time-input"></div><div class="reminder-field"><label>Remind me</label><select class="reminder-alert-input"><option value="0">At the time</option><option value="5">5 minutes before</option><option value="10">10 minutes before</option><option value="15" selected>15 minutes before</option><option value="30">30 minutes before</option><option value="60">1 hour before</option><option value="120">2 hours before</option><option value="1440">1 day before</option></select></div><div class="reminder-form-actions"><button class="reminder-add">＋ Add Reminder</button><button class="reminder-cancel" style="display:none">Cancel Edit</button></div><div class="reminder-alert-row"><button type="button" class="reminder-alert-permission">🔔 Enable Browser Alerts</button><span class="reminder-alert-status"></span></div><div class="reminder-help">Choose the date and time, then decide whether to be reminded at that time or beforehand. In-app alerts work while the dashboard is open; browser alerts can also appear when this tab is in the background if your browser allows them.</div></div><div class="reminder-list"></div>';
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
      const list=sticky.querySelector('.reminder-list'),today=todayISO();
      const sorted=reminders.slice().sort((a,b)=>(a.done-b.done)||eventMs(a)-eventMs(b));
      const visible=limit?sorted.filter(r=>!r.done).slice(0,limit):sorted;
      if(!visible.length){list.innerHTML='<div class="reminder-empty">No reminders. Enjoy the suspicious calm.</div>';return}
      list.innerHTML=visible.map(r=>{
        const overdue=eventMs(r)<Date.now(),cls=r.done?' reminder-done':overdue?' reminder-overdue':r.date===today?' reminder-today':'';
        const label=(r.date===today?'TODAY · ':r.date<today?'OVERDUE · ':prettyDate(r.date)+' · ')+prettyTime(r.time);
        return '<div class="reminder-item'+cls+'"><div class="reminder-date">'+esc(label)+'<span class="reminder-alert-label">🔔 '+esc(alertLabel(r.alertOffset))+'</span></div><div class="reminder-text">'+esc(r.text)+'</div><div class="reminder-actions"><button title="Edit reminder" data-reminder-edit="'+r.id+'">✎</button><button title="'+(r.done?'Mark active':'Mark done')+'" data-reminder-done="'+r.id+'">'+(r.done?'↩':'✓')+'</button><button title="Delete reminder" data-reminder-delete="'+r.id+'">🗑</button></div></div>';
      }).join('');
      list.querySelectorAll('[data-reminder-edit]').forEach(b=>b.onclick=()=>startEdit(b.dataset.reminderEdit));
      list.querySelectorAll('[data-reminder-done]').forEach(b=>b.onclick=()=>{const r=reminders.find(x=>x.id===b.dataset.reminderDone);if(r){r.done=!r.done;save()}});
      list.querySelectorAll('[data-reminder-delete]').forEach(b=>b.onclick=()=>{const r=reminders.find(x=>x.id===b.dataset.reminderDelete);if(!r)return;if(!confirm('Are you sure you want to delete this reminder?'))return;reminders=reminders.filter(x=>x.id!==r.id);if(editingId===r.id)editingId=null;save();resetForms()});
    }

    function allStickies(){return[dashboardSticky,notesSticky].filter(Boolean)}
    function setForm(sticky,r){
      sticky.querySelector('.reminder-text-input').value=r?.text||'';
      sticky.querySelector('.reminder-date-input').value=r?.date||todayISO();
      sticky.querySelector('.reminder-time-input').value=r?.time||defaultTime();
      sticky.querySelector('.reminder-alert-input').value=String(r?.alertOffset??15);
      sticky.querySelector('.reminder-add').textContent=r?'✓ Save Changes':'＋ Add Reminder';
      sticky.querySelector('.reminder-cancel').style.display=r?'inline-block':'none';
    }
    function resetForms(){editingId=null;allStickies().forEach(s=>setForm(s,null))}
    function startEdit(id){const r=reminders.find(x=>x.id===id);if(!r)return;editingId=id;allStickies().forEach(s=>setForm(s,r));dashboardSticky.scrollIntoView({behavior:'smooth',block:'center'})}

    function wire(sticky){
      if(!sticky)return;
      const date=sticky.querySelector('.reminder-date-input'),time=sticky.querySelector('.reminder-time-input'),text=sticky.querySelector('.reminder-text-input'),alertInput=sticky.querySelector('.reminder-alert-input'),add=sticky.querySelector('.reminder-add'),cancel=sticky.querySelector('.reminder-cancel');
      date.value=todayISO();time.value=defaultTime();sticky.querySelector('.reminder-alert-status').textContent=notificationStatus();
      sticky.querySelector('.reminder-alert-permission').onclick=()=>requestNotifications(sticky);
      const go=()=>{
        const t=text.value.trim();if(!t){alert('Type your reminder first.');text.focus();return}
        if(!date.value){alert('Choose a date.');date.focus();return}
        if(!time.value){alert('Choose a time.');time.focus();return}
        if(editingId){const r=reminders.find(x=>x.id===editingId);if(r){r.text=t;r.date=date.value;r.time=time.value;r.alertOffset=Number(alertInput.value)||0;r.notifiedFor='';r.done=false}}
        else reminders.push({id:'r'+Date.now()+Math.random().toString(36).slice(2,6),date:date.value,time:time.value,text:t,alertOffset:Number(alertInput.value)||0,done:false,notifiedFor:'',createdAt:new Date().toISOString()});
        save();resetForms();checkAlerts();
      };
      add.onclick=go;cancel.onclick=resetForms;text.addEventListener('keydown',e=>{if(e.key==='Enter')go()});
    }

    wire(dashboardSticky);wire(notesSticky);
    function renderAll(){renderInto(dashboardSticky,6);renderInto(notesSticky,0)}
    renderAll();checkAlerts();
    const alertTimer=setInterval(checkAlerts,30000);
    w.addEventListener('beforeunload',()=>clearInterval(alertTimer),{once:true});
    return true;
  }

  let tries=0;const timer=setInterval(()=>{if(install()||++tries>40)clearInterval(timer)},250);
})();