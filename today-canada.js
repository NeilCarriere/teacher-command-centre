(function(){
  const CBC_RSS='https://www.cbc.ca/cmlink/rss-canada';
  const CBC_CANADA='https://www.cbc.ca/news/canada';
  const GLOBAL_CANADA='https://globalnews.ca/canada/';

  function clean(html){
    const div=document.createElement('div');
    div.innerHTML=html||'';
    return (div.textContent||div.innerText||'').replace(/\s+/g,' ').trim();
  }

  function truncate(s,n){
    if(!s) return '';
    return s.length>n ? s.slice(0,n-1).replace(/\s+\S*$/,'')+'…' : s;
  }

  function findLegacyDoc(){
    const app=document.getElementById('app');
    return app && app.contentDocument ? app.contentDocument : null;
  }

  function ensureStyles(d){
    if(d.getElementById('todayCanadaStyles')) return;
    const s=d.createElement('style');
    s.id='todayCanadaStyles';
    s.textContent=`
      .today-canada-note{position:relative;background:linear-gradient(145deg,#f8e9a2,#f2d977);color:#20251f;border-radius:3px 4px 10px 3px;box-shadow:0 8px 18px rgba(0,0,0,.28);padding:16px 16px 14px;margin:0 0 14px;font-family:"Segoe Print","Comic Sans MS",cursive;transform:rotate(.25deg);border:1px solid rgba(80,70,20,.15)}
      .today-canada-note:before{content:"";position:absolute;width:18px;height:18px;border-radius:50%;background:#d84838;top:-8px;left:50%;transform:translateX(-50%);box-shadow:0 3px 3px rgba(0,0,0,.35),inset -3px -3px 4px rgba(0,0,0,.18)}
      .today-canada-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}
      .today-canada-title{font-weight:900;font-size:18px;line-height:1.1;border-bottom:2px solid rgba(195,70,55,.55)}
      .today-canada-date{font-size:11px;opacity:.72;font-family:"Trebuchet MS",sans-serif}
      .today-canada-story{font-family:"Trebuchet MS",sans-serif;font-size:14px;line-height:1.35;font-weight:800;margin-top:5px}
      .today-canada-summary{font-family:"Trebuchet MS",sans-serif;font-size:12.5px;line-height:1.42;margin-top:6px}
      .today-canada-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .today-canada-links a{font-family:"Trebuchet MS",sans-serif;font-size:12px;font-weight:800;color:#153e55;text-decoration:none;border:1px solid rgba(21,62,85,.28);border-radius:999px;padding:5px 9px;background:rgba(255,255,255,.26)}
      .today-canada-links a:hover{text-decoration:underline;background:rgba(255,255,255,.42)}
      @media(max-width:700px){.today-canada-note{transform:none}.today-canada-head{align-items:flex-start;flex-direction:column}}
    `;
    d.head.appendChild(s);
  }

  function ensureCard(d){
    let card=d.getElementById('todayCanadaNote');
    if(card) return card;
    const dash=d.getElementById('dashboardView');
    if(!dash) return null;
    card=d.createElement('section');
    card.id='todayCanadaNote';
    card.className='today-canada-note';
    card.innerHTML=`
      <div class="today-canada-head"><div class="today-canada-title">🇨🇦 TODAY IN CANADA</div><div class="today-canada-date" id="todayCanadaDate"></div></div>
      <div class="today-canada-story" id="todayCanadaStory">Loading a Canadian headline…</div>
      <div class="today-canada-summary" id="todayCanadaSummary">Canadian-first news, with links to trusted Canadian sources.</div>
      <div class="today-canada-links" id="todayCanadaLinks">
        <a href="${CBC_CANADA}" target="_blank" rel="noopener">CBC News →</a>
        <a href="${GLOBAL_CANADA}" target="_blank" rel="noopener">Global News →</a>
      </div>`;
    const commandStrip=d.querySelector('#dashboardView .command-strip');
    if(commandStrip && commandStrip.nextSibling) commandStrip.parentNode.insertBefore(card,commandStrip.nextSibling);
    else dash.insertBefore(card,dash.firstChild);
    const date=card.querySelector('#todayCanadaDate');
    if(date) date.textContent=new Date().toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'});
    return card;
  }

  function renderFeed(d,xmlText){
    const parser=new DOMParser();
    const xml=parser.parseFromString(xmlText,'application/xml');
    const items=[...xml.querySelectorAll('item')];
    if(!items.length) throw new Error('No feed items');
    const item=items[0];
    const title=clean(item.querySelector('title')?.textContent||'');
    const desc=clean(item.querySelector('description')?.textContent||'');
    const link=clean(item.querySelector('link')?.textContent||'') || CBC_CANADA;
    const story=d.getElementById('todayCanadaStory');
    const summary=d.getElementById('todayCanadaSummary');
    const links=d.getElementById('todayCanadaLinks');
    if(story) story.textContent=title || 'Top Canadian story';
    if(summary) summary.textContent=truncate(desc,260) || 'A leading Canadian story from CBC News.';
    if(links) links.innerHTML=`<a href="${link}" target="_blank" rel="noopener">Read on CBC →</a><a href="${GLOBAL_CANADA}" target="_blank" rel="noopener">More Canada news →</a>`;
  }

  async function loadNews(d){
    const sources=[
      CBC_RSS,
      'https://api.allorigins.win/raw?url='+encodeURIComponent(CBC_RSS)
    ];
    for(const url of sources){
      try{
        const r=await fetch(url,{cache:'no-store'});
        if(!r.ok) continue;
        const text=await r.text();
        renderFeed(d,text);
        return;
      }catch(e){}
    }
    const story=d.getElementById('todayCanadaStory');
    const summary=d.getElementById('todayCanadaSummary');
    if(story) story.textContent='Canadian news at a glance';
    if(summary) summary.textContent='Open one of the Canadian sources below for today’s top national and regional stories. The dashboard will keep trying to load a live CBC Canada headline automatically.';
  }

  function install(){
    const d=findLegacyDoc();
    if(!d||!d.head||!d.body) return false;
    ensureStyles(d);
    const card=ensureCard(d);
    if(!card) return false;
    loadNews(d);
    return true;
  }

  let tries=0;
  const timer=setInterval(function(){
    if(install() || ++tries>40) clearInterval(timer);
  },250);
  window.addEventListener('load',function(){setTimeout(install,500)});
})();
