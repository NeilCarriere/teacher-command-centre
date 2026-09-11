(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  const CLASS_KEY='neil_teacher_classes_v1';
  const ASSIGN_KEY='neil_teacher_assignments_v1';
  const PERSIST_KEY='neil_teacher_dashboard_v2';

  function readJson(w,key,fallback){
    try{const raw=w.localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}
  }

  function currentPayload(w){
    try{if(typeof w.saveTeacherState==='function')w.saveTeacherState()}catch(e){}
    const studentData=(w.state&&w.state.students)?w.state:readJson(w,PERSIST_KEY,{});
    const courses=readJson(w,CLASS_KEY,{courses:Object.keys(w.ROSTERS||{}).map(name=>({name,archived:false,students:[...(w.ROSTERS[name]||[])]}))});
    const assignments=readJson(w,ASSIGN_KEY,{classes:{}});
    return {
      format:'teacher-command-centre-winston-export',
      version:12,
      exportedAt:new Date().toISOString(),
      teacherApp:{currentClass:w.currentClass||studentData.currentClass||'',courses,studentData},
      assignmentTracker:assignments
    };
  }

  function downloadBackup(w){
    const payload=currentPayload(w);
    const text=JSON.stringify(payload,null,2);
    const blob=new Blob([text],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=w.document.createElement('a');
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    a.href=url;a.download='teacher-command-centre-backup-'+stamp+'.json';
    w.document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  function extract(parsed){
    if(!parsed||typeof parsed!=='object')throw new Error('The selected file is not a valid dashboard backup.');
    if(parsed.format==='teacher-command-centre-winston-export'){
      const app=parsed.teacherApp||{};
      const studentData=app.studentData;
      if(!studentData||!studentData.students)throw new Error('This Winston export does not contain student dashboard data.');
      return {studentData,courses:app.courses||null,assignments:parsed.assignmentTracker||null,currentClass:app.currentClass||studentData.currentClass||''};
    }
    if(parsed.students){
      return {studentData:parsed,courses:null,assignments:null,currentClass:parsed.currentClass||''};
    }
    if(parsed.teacherApp&&parsed.teacherApp.studentData&&parsed.teacherApp.studentData.students){
      const app=parsed.teacherApp;
      return {studentData:app.studentData,courses:app.courses||null,assignments:parsed.assignmentTracker||null,currentClass:app.currentClass||app.studentData.currentClass||''};
    }
    throw new Error('I could not find Teacher Command Centre data in this file.');
  }

  function restoreParsed(w,parsed){
    const data=extract(parsed);
    if(data.currentClass)data.studentData.currentClass=data.currentClass;
    data.studentData.lastSavedAt=new Date().toISOString();
    const stateText=JSON.stringify(data.studentData);
    w.localStorage.setItem(w.KEY||'neil_teacher_dashboard',stateText);
    w.localStorage.setItem(PERSIST_KEY,stateText);
    try{w.parent.localStorage.setItem(PERSIST_KEY,stateText)}catch(e){}
    try{w.top.localStorage.setItem(PERSIST_KEY,stateText)}catch(e){}
    if(data.courses)w.localStorage.setItem(CLASS_KEY,JSON.stringify(data.courses));
    if(data.assignments)w.localStorage.setItem(ASSIGN_KEY,JSON.stringify(data.assignments));
    return data;
  }

  function install(){
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w||!d.body||!w.state||!w.KEY)return false;
    if(d.getElementById('backupRestoreControls'))return true;
    const nav=d.querySelector('.nav');if(!nav)return false;

    const marker=d.createElement('div');marker.id='backupRestoreControls';marker.hidden=true;d.body.appendChild(marker);
    const input=d.createElement('input');input.type='file';input.accept='.json,application/json,text/plain';input.id='restoreBackupFile';input.style.display='none';d.body.appendChild(input);

    const backup=d.createElement('button');backup.id='downloadBackupBtn';backup.type='button';backup.textContent='⬆ Backup File';backup.title='Download a complete backup file of this dashboard';
    const restore=d.createElement('button');restore.id='restoreBackupBtn';restore.type='button';restore.textContent='⬇ Restore Backup';restore.title='Restore this dashboard from a backup or Winston export file';
    const reset=d.getElementById('resetBtn');
    if(reset){nav.insertBefore(backup,reset);nav.insertBefore(restore,reset)}else{nav.appendChild(backup);nav.appendChild(restore)}

    backup.onclick=function(){
      try{downloadBackup(w);const old=backup.textContent;backup.textContent='✓ Backup Downloaded';setTimeout(()=>backup.textContent=old,1800)}
      catch(err){alert('Backup failed: '+(err&&err.message?err.message:err));}
    };

    restore.onclick=function(){input.value='';input.click()};
    input.onchange=async function(){
      const file=input.files&&input.files[0];if(!file)return;
      try{
        const text=await file.text();
        const parsed=JSON.parse(text);
        const preview=extract(parsed);
        const classCount=preview.studentData&&preview.studentData.students?Object.keys(preview.studentData.students).length:0;
        let studentCount=0;Object.values(preview.studentData.students||{}).forEach(group=>studentCount+=Object.keys(group||{}).length);
        const assignmentCount=preview.assignments&&preview.assignments.classes?Object.values(preview.assignments.classes).reduce((n,c)=>n+((c&&c.assignments)||[]).length,0):0;
        const when=parsed.exportedAt?new Date(parsed.exportedAt).toLocaleString():'unknown date';
        const ok=confirm('Restore this backup?\n\nBackup date: '+when+'\nClasses: '+classCount+'\nStudent records: '+studentCount+'\nAssignments: '+assignmentCount+'\n\nThis will replace the dashboard data currently stored on this device.');
        if(!ok)return;
        restoreParsed(w,parsed);
        alert('Backup restored successfully. The dashboard will reload now.');
        w.top.location.reload();
      }catch(err){
        alert('Restore failed. No data was changed.\n\n'+(err&&err.message?err.message:String(err)));
      }
    };
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,700));
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>60)clearInterval(timer)},250);
})();