(function(){
  'use strict';

  var source=document.body.dataset.materialSource;
  var feed=document.getElementById('material-all-feed');
  var status=document.getElementById('material-archive-status');
  var isNotes=/notes-lectures\.html/.test(source||'');

  function noteVariant(node){
    var title=node&&node.querySelector('.doctitle .lang-en'),text=String(title?title.textContent:'').toLowerCase();
    if(/\bspanish notes\b/.test(text))return 'es';
    if(/\benglish notes\b/.test(text))return 'en';
    return 'universal';
  }

  function noteAllowed(item){
    var variant=item&&item.dataset.pfNoteVariant||'universal';
    if(!isNotes||variant==='universal')return true;
    var lang=document.documentElement.getAttribute('data-lang')||'es';
    return variant===(lang==='es'?'es':'en');
  }

  function refreshNumbers(){
    var count=0;
    Array.prototype.forEach.call(feed.children,function(item){
      var num=item.querySelector('.docnum');
      if(noteAllowed(item)){count++;if(num)num.textContent=String(count).padStart(2,'0');item.removeAttribute('aria-hidden');}
      else{if(num)num.textContent='';item.setAttribute('aria-hidden','true');}
    });
  }

  function decorate(item,index){
    item.classList.add('pf-material-archive-item');
    if(window.pfNormalizeDocActions)window.pfNormalizeDocActions(item);
    if(isNotes){var variant=noteVariant(item);item.dataset.pfNoteVariant=variant;item.classList.add('pf-note-'+variant);}
    var num=item.querySelector('.docnum');
    if(num)num.textContent=String(index+1).padStart(2,'0');
    var head=item.querySelector('.dochead');
    if(!head)return;
    head.setAttribute('aria-expanded','false');
    head.addEventListener('click',function(){
      var wasOpen=item.classList.contains('open');
      document.querySelectorAll('.pf-material-archive-item.open').forEach(function(other){
        if(other!==item){other.classList.remove('open');var otherHead=other.querySelector('.dochead');if(otherHead)otherHead.setAttribute('aria-expanded','false');}
      });
      item.classList.toggle('open',!wasOpen);
      head.setAttribute('aria-expanded',String(!wasOpen));
    });
  }

  function loadScript(src,done){
    var script=document.createElement('script');
    script.src=src;
    script.onload=done;
    script.onerror=done;
    document.body.appendChild(script);
  }

  function loadInteractions(){
    loadScript(window.pfSitePath?window.pfSitePath('/blog-interactions.js?v=10'):'/blog-interactions.js?v=10',function(){
      loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?onload=castoreneTurnstileReady&render=explicit',function(){});
    });
  }

  if(!source||!feed)return;
  fetch(source,{credentials:'same-origin'}).then(function(response){
    if(!response.ok)throw new Error(source);
    return response.text();
  }).then(function(text){
    var parsed=new DOMParser().parseFromString(text,'text/html');
    var items=Array.prototype.slice.call(parsed.querySelectorAll('.doclist .docitem'));
    items.forEach(function(item,index){
      var node=item.cloneNode(true);
      decorate(node,index);
      feed.appendChild(node);
    });
    refreshNumbers();
    if(window.MutationObserver)new MutationObserver(refreshNumbers).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
    if(status)status.hidden=true;
    loadInteractions();
  }).catch(function(){
    if(status)status.hidden=false;
  });
})();
