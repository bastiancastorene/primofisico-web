(function(){
  'use strict';
  var ms=document.getElementById('ms'), glow=document.getElementById('msglow');
  if(!ms||!glow)return;
  var btns=[].slice.call(ms.querySelectorAll('.ms-btn'));
  var panels={pop:document.getElementById('p-pop'),tech:document.getElementById('p-tech')};
  if(!panels.pop||!panels.tech)return;
  var mode='pop',dragging=false,startX=0,moved=0,w=0;
  function paint(next,animate){
    mode=next;
    document.documentElement.setAttribute('data-mode',next);
    glow.style.transform='translateX('+(next==='tech'?'100%':'0%')+')';
    btns.forEach(function(btn){btn.classList.toggle('active',btn.dataset.mode===next);});
    Object.keys(panels).forEach(function(key){panels[key].classList.remove('on');});
    panels[next].classList.add('on');
    if(animate){panels[next].style.animation='none';void panels[next].offsetWidth;panels[next].style.animation='';}
  }
  btns.forEach(function(btn){btn.addEventListener('click',function(){if(btn.dataset.mode!==mode)paint(btn.dataset.mode,true);});});
  ms.addEventListener('pointerdown',function(event){
    dragging=true;moved=0;startX=event.clientX;w=ms.clientWidth/2;
    ms.classList.add('dragging');
    if(ms.setPointerCapture)ms.setPointerCapture(event.pointerId);
  });
  ms.addEventListener('pointermove',function(event){
    if(!dragging||w<=0)return;
    moved=event.clientX-startX;
    var base=mode==='tech'?w:0;
    var x=Math.max(0,Math.min(w,base+moved));
    glow.style.transform='translateX('+(x/w*100)+'%)';
  });
  function release(event){
    if(!dragging)return;
    dragging=false;ms.classList.remove('dragging');
    var next;
    if(Math.abs(moved)<6){
      var rect=ms.getBoundingClientRect();
      var cx=event&&event.clientX!=null?event.clientX:rect.left+rect.width/2;
      next=(cx-rect.left>rect.width/2)?'tech':'pop';
    }else{
      var base=mode==='tech'?w:0;
      var x=Math.max(0,Math.min(w,base+moved));
      next=x>w/2?'tech':'pop';
    }
    if(next!==mode)paint(next,true);
    else glow.style.transform='translateX('+(mode==='tech'?'100%':'0%')+')';
  }
  ms.addEventListener('pointerup',release);
  ms.addEventListener('pointercancel',release);
  var sent=document.getElementById('mssent');
  if(sent&&'IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      if(innerWidth<=760){ms.classList.remove('docked');return;}
      ms.classList.toggle('docked',!entries[0].isIntersecting&&entries[0].boundingClientRect.top<0);
    },{threshold:0}).observe(sent);
  }
})();
