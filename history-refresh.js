(function(){
  const frame=document.getElementById('app');
  if(!frame)return;
  function apply(){
    const d=frame.contentDocument;
    if(!d||!d.body)return false;
    const now=new Date();
    if(now.getMonth()===8 && now.getDate()===10){
      const date=d.getElementById('historyDate');
      const title=d.getElementById('historyTitle');
      const text=d.getElementById('historyText');
      const trivia=d.querySelector('#historyTrivia span');
      const source=d.getElementById('historySource');
      if(!title||!text)return false;
      if(date)date.textContent='September 10 · Today in Canadian History';
      title.textContent='1939 — Canada Declares War on Germany';
      text.textContent='On September 10, 1939, Canada formally declared war on Germany, one week after Britain and France entered the Second World War. The decision followed debate in Canada’s own Parliament and marked the first time Canada declared war independently rather than automatically entering a conflict with Britain.';
      if(trivia)trivia.textContent='More than one million Canadians and Newfoundlanders served during the Second World War, and more than 45,000 lost their lives.';
      if(source)source.textContent='Source: Government of Canada / Royal Canadian Air Force';
    }
    return true;
  }
  frame.addEventListener('load',()=>setTimeout(apply,250));
  let tries=0;const timer=setInterval(()=>{if(apply()||++tries>30)clearInterval(timer)},200);
})();