(function(){
  'use strict';

  var source=document.body.dataset.materialSource;
  var feed=document.getElementById('material-all-feed');
  var status=document.getElementById('material-archive-status');
  var isNotes=/notes-lectures\.html/.test(source||'');
  var isTeaching=/notes-teaching\.html/.test(source||'');
  var LANG_ORDER=['en','es','de','zh'];
  var TEACHING_GROUPS=[
    {id:'statistical-mechanics',title:{en:'Statistical Mechanics',es:'Mecánica Estadística',de:'Statistische Mechanik',zh:'统计力学'},description:{en:'Tutorials, problem sets and formula sheets from FIS330.',es:'Ayudantías, problemas y formularios de FIS330.',de:'Übungen, Aufgaben und Formelsammlungen aus FIS330.',zh:'FIS330 的习题课、习题与公式汇总。'}},
    {id:'mathematical-methods',title:{en:'Mathematical Methods',es:'Métodos Matemáticos',de:'Mathematische Methoden',zh:'数学方法'},description:{en:"Green's functions and tools for inhomogeneous problems.",es:'Funciones de Green y herramientas para resolver problemas inhomogéneos.',de:'Greensche Funktionen und Werkzeuge für inhomogene Probleme.',zh:'格林函数与求解非齐次问题的工具。'}},
    {id:'solid-state-physics',title:{en:'Solid-State Physics',es:'Física del Estado Sólido',de:'Festkörperphysik',zh:'固体物理'},description:{en:'Seminar presentations on topological and spin-dependent phenomena.',es:'Presentaciones sobre fenómenos topológicos y dependientes del espín.',de:'Seminarpräsentationen zu topologischen und spinabhängigen Phänomenen.',zh:'关于拓扑与自旋相关现象的研讨报告。'}},
    {id:'electromagnetism',title:{en:'Electromagnetism',es:'Electromagnetismo',de:'Elektromagnetismus',zh:'电磁学'},description:{en:"A self-contained derivation of Maxwell's equations.",es:'Una derivación autocontenida de las ecuaciones de Maxwell.',de:'Eine in sich geschlossene Herleitung der Maxwell-Gleichungen.',zh:'自成体系地推导麦克斯韦方程组。'}},
    {id:'other-teaching',title:{en:'Other teaching material',es:'Otros materiales de docencia',de:'Weitere Lehrmaterialien',zh:'其他教学材料'},description:{en:'Additional material that does not fit the subject groups above.',es:'Material adicional que no pertenece a las áreas anteriores.',de:'Zusätzliches Material außerhalb der oben genannten Fachgebiete.',zh:'不属于上述主题的其他资料。'}}
  ];

  function langText(values){
    return LANG_ORDER.map(function(lang){return '<span class="lang-'+lang+'">'+values[lang]+'</span>';}).join('');
  }

  function countText(count){
    return {en:count+' materials',es:count+(count===1?' material':' materiales'),de:count+(count===1?' Material':' Materialien'),zh:count+' 份资料'};
  }

  function groupById(items){
    var grouped={};
    TEACHING_GROUPS.forEach(function(group){grouped[group.id]=[];});
    items.forEach(function(item){
      var groupId=item.getAttribute('data-material-group')||'other-teaching';
      if(!grouped[groupId])grouped.other-teaching.push(item);
      else grouped[groupId].push(item);
    });
    return grouped;
  }

  function renderTeachingIndex(grouped){
    var index=document.createElement('nav');
    index.id='material-index';
    index.className='pf-material-index';
    index.setAttribute('aria-labelledby','material-index-title');
    index.innerHTML='<span class="pf-group-kicker">'+langText({en:'Browse by subject',es:'Índice por área',de:'Nach Fachgebiet',zh:'按主题浏览'})+'</span><h2 id="material-index-title">'+langText({en:'Choose a folder',es:'Elige una carpeta',de:'Ordner auswählen',zh:'选择文件夹'})+'</h2><div class="pf-material-index-grid"></div>';
    var grid=index.querySelector('.pf-material-index-grid');
    TEACHING_GROUPS.forEach(function(group){
      var count=grouped[group.id].length;
      if(!count)return;
      var link=document.createElement('a');
      link.className='pf-material-index-card';
      link.href='#material-topic-'+group.id;
      link.innerHTML='<span class="pf-material-folder" aria-hidden="true"></span><span class="pf-material-index-copy"><strong>'+langText(group.title)+'</strong><small>'+langText(countText(count))+'</small></span><span class="pf-material-index-arrow" aria-hidden="true">&#8594;</span>';
      grid.appendChild(link);
    });
    feed.parentNode.insertBefore(index,feed);
  }

  function renderTeachingGroups(items){
    var grouped=groupById(items);
    renderTeachingIndex(grouped);
    feed.innerHTML='';
    TEACHING_GROUPS.forEach(function(group){
      var groupItems=grouped[group.id];
      if(!groupItems.length)return;
      var headingId='material-topic-title-'+group.id;
      var section=document.createElement('section');
      section.id='material-topic-'+group.id;
      section.className='pf-material-topic';
      section.setAttribute('aria-labelledby',headingId);
      section.innerHTML='<div class="pf-material-topic-heading"><div><span class="pf-group-kicker">'+langText({en:'Teaching area',es:'Área de docencia',de:'Lehrgebiet',zh:'教学领域'})+'</span><h2 id="'+headingId+'">'+langText(group.title)+'</h2><p class="pf-material-topic-lead">'+langText(group.description)+'</p></div><span class="pf-material-topic-count">'+langText(countText(groupItems.length))+'</span></div>';
      var topicFeed=document.createElement('div');
      topicFeed.className='doclist pf-material-topic-feed';
      groupItems.forEach(function(item,index){
        var node=item.cloneNode(true);
        decorate(node,index);
        topicFeed.appendChild(node);
      });
      section.appendChild(topicFeed);
      feed.appendChild(section);
    });
    refreshNumbers();
    if(location.hash){
      window.setTimeout(function(){
        var target=document.getElementById(String(location.hash).slice(1));
        if(target)target.scrollIntoView({block:'start'});
      },0);
    }
  }

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
    if(isTeaching){
      Array.prototype.forEach.call(feed.querySelectorAll('.pf-material-topic-feed'),function(topic){
        var count=0;
        Array.prototype.forEach.call(topic.children,function(item){
          if(noteAllowed(item)){count++;var num=item.querySelector('.docnum');if(num)num.textContent=String(count).padStart(2,'0');item.removeAttribute('aria-hidden');}
          else{var hiddenNum=item.querySelector('.docnum');if(hiddenNum)hiddenNum.textContent='';item.setAttribute('aria-hidden','true');}
        });
      });
      return;
    }
    var count=0;
    Array.prototype.forEach.call(feed.querySelectorAll('.docitem'),function(item){
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
    loadScript(window.pfSitePath?window.pfSitePath('/blog-interactions.js?v=11'):'/blog-interactions.js?v=11',function(){
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
    if(isTeaching)renderTeachingGroups(items);
    else items.forEach(function(item,index){
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
