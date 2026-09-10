(function(){
  const frame=document.getElementById('app');
  if(!frame)return;

  const teachingQuotes=[
    'A classroom changes when a student realizes someone believes they can succeed.',
    'Good teaching turns curiosity into momentum.',
    'A teacher may forget the lesson plan; a student may remember the encouragement for years.',
    'Every student brings a story to the room. Great teaching makes space for it.',
    'Teaching is the daily work of turning possibility into progress.',
    'The best classrooms are built on curiosity, patience, and the courage to try again.',
    'A small moment of encouragement can become a very large part of a student’s story.',
    'Teaching is planting ideas whose results may appear long after the bell rings.',
    'A good lesson teaches content. A great one makes students want to know what comes next.',
    'Progress in a classroom is often quiet before it becomes visible.',
    'A teacher opens doors; students decide how far they will walk through them.',
    'The work matters because the people in the room matter.',
    'Every question a student asks is an invitation to keep learning.',
    'Teaching is helping students discover that they are capable of more than they expected.',
    'Some days the win is a breakthrough. Some days the win is simply getting them to try.',
    'A classroom is one of the few places where tomorrow can be changed on purpose.',
    'The best teaching leaves students with better questions than the ones they started with.',
    'Patience is not waiting for learning to happen; it is helping learning find its way.',
    'Students do not need perfection from a teacher. They need presence, purpose, and care.',
    'A teacher’s influence often travels farther than the teacher ever gets to see.',
    'Teaching is serious work powered by curiosity, humour, and a little controlled chaos.',
    'When students feel safe enough to be wrong, they become brave enough to learn.',
    'One meaningful conversation can teach as much as an entire worksheet.',
    'The goal is not simply to finish the lesson. It is to move the learner forward.',
    'Every class is another chance to make learning feel possible.',
    'A good teacher notices the student who is almost ready to give up.',
    'Teaching is the art of making difficult things feel reachable.',
    'The most important progress is not always the easiest progress to measure.',
    'A student who asks for help has already taken an important step toward success.',
    'The classroom works best when effort is noticed as carefully as achievement.',
    'A teacher can turn “I can’t” into “I can’t yet.”',
    'Learning grows fastest where curiosity is welcomed and mistakes are useful.',
    'Teaching is showing students the map while helping them learn to navigate for themselves.',
    'Every day in the classroom contains at least one moment worth getting right.',
    'A lesson becomes powerful when students can see themselves somewhere inside it.',
    'The best teachers keep learning because the students never stop changing.',
    'A calm word at the right moment can be as important as the perfect explanation.',
    'Education is built one question, one conversation, and one small success at a time.',
    'Teaching is helping young people practice becoming the people they will be.',
    'A student does not have to love every lesson to feel that the teacher cares about their learning.',
    'There is no ordinary school day when someone in the room is becoming more capable.',
    'A teacher’s job is not to provide every answer, but to make searching for answers worthwhile.',
    'Some of the best teaching begins with, “That is a good question.”',
    'The classroom is a workshop for confidence as much as it is a place for content.',
    'Great teaching combines high expectations with a clear path toward reaching them.',
    'The lesson matters, but the relationship often determines whether the lesson gets through.',
    'Teaching is a long game played one school day at a time.',
    'A student’s first attempt is information, not a verdict.',
    'The best classroom victories are often the ones no one outside the room ever sees.',
    'A good day of teaching does not require everything to go as planned—only that something worthwhile moves forward.'
  ];

  const generalQuotes=[
    'Small steps still move you forward.',
    'You do not need the whole plan to take the next useful step.',
    'Momentum begins with one thing finished.',
    'A little progress can change the shape of an entire day.',
    'Make room for the things that make the work worthwhile.',
    'Done with care beats perfect in theory.',
    'A fresh start does not need a new week. It only needs a decision.',
    'Leave some room in the day for something unexpectedly good.',
    'The next step is often smaller than the problem makes it look.',
    'Curiosity makes ordinary days more interesting.',
    'A difficult day can still contain a good hour.',
    'Do one useful thing, then decide what comes next.',
    'Progress is easier to see when you remember where you started.',
    'Protect a little time for the things that make you feel like yourself.',
    'You are allowed to enjoy the process before the result arrives.',
    'There is usually more than one good way forward.',
    'Some days are for building. Some days are for clearing the workbench.',
    'Rest is part of making progress sustainable.',
    'The ordinary things you repeat eventually become the life you built.',
    'A good idea deserves at least one small attempt.',
    'Make today useful, not impossible.',
    'Not every important change arrives dramatically.',
    'The best time to organize the mess is before it becomes a crisis.',
    'A sense of humour is useful equipment for almost any day.',
    'Do not underestimate what fifteen focused minutes can accomplish.',
    'Sometimes the most productive decision is deciding what can wait.',
    'Give your attention to the next thing, not every thing.',
    'A little order creates a surprising amount of breathing room.',
    'Keep what works. Change what does not. Continue.',
    'There is value in making something simply because you wanted to make it.',
    'A day does not have to be extraordinary to be good.',
    'The unfinished list is not evidence that nothing was accomplished.',
    'Start where you are, with what is actually available.',
    'A good routine should support your life, not become another burden.',
    'You can take your work seriously without taking every inconvenience seriously.',
    'One clear priority is often more useful than ten urgent-looking ones.',
    'Keep enough energy for the part of the day that belongs to you.',
    'There is nothing wrong with improving the system while you are using it.',
    'A small adjustment today can save a great deal of frustration tomorrow.',
    'Some problems disappear when they are finally written down.',
    'Make the next version better, not flawless.',
    'The point of getting organized is to spend less time thinking about being organized.',
    'Leave yesterday’s mistakes there; bring forward only what they taught you.',
    'A useful day can include work, laughter, and absolutely nothing productive for a while.',
    'When the path is cluttered, clear one square foot.',
    'Consistency is impressive precisely because it rarely feels impressive while you are doing it.',
    'You do not have to hurry to be moving forward.',
    'Good systems make room for imperfect humans.',
    'There is always time for one more good idea—just maybe not all of them today.',
    'Tomorrow benefits from one thoughtful decision made today.'
  ];

  function dayNumber(){
    const now=new Date();
    const start=new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }

  function install(){
    const d=frame.contentDocument;
    if(!d||!d.body)return false;
    const teaching=d.querySelector('.mug-copy');
    const general=d.querySelector('.mini-quote');
    if(!teaching||!general)return false;
    const day=dayNumber();
    const tq=teachingQuotes[(day-1)%teachingQuotes.length];
    const gq=generalQuotes[(day+17)%generalQuotes.length];
    teaching.innerHTML='“'+tq+'”<strong>— Daily teaching thought</strong>';
    general.textContent='“'+gq+'” ✦';
    teaching.title='A new teaching quote appears each day';
    general.title='A new inspirational quote appears each day';
    return true;
  }

  frame.addEventListener('load',()=>setTimeout(install,700));
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>60)clearInterval(timer)},250);
})();
