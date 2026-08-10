(function(){
  'use strict';

  var LANGS=['en','es','de','zh'];
  var POST_MODE_LABELS={
    double:{en:'Outreach',es:'Divulgativo',de:'Populär',zh:'科普'},
    specialized:{en:'Specialized',es:'Especializado',de:'Spezial',zh:'专业'}
  };
  var DOUBLE_LAYER_SLUGS={
    'klein-graphene':true,
    'spin-hall':true,
    'liquid-helium':true,
    'butterfly':true,
    'surface-charge':true,
    'paper-3qubits':true,
    'paper-entropy-ising':true
  };
  var MATERIAL_LABELS={
    notes:{en:'Notes',es:'Apuntes',de:'Skripte',zh:'讲义'},
    teaching:{en:'Teaching',es:'Docencia',de:'Lehre',zh:'教学'}
  };
  var SEARCH_LABELS={
    placeholder:{en:'Search by keyword or topic',es:'Busca por palabra clave o tema',de:'Nach Stichwort oder Thema suchen',zh:'按关键词或主题搜索'},
    aria:{en:'Search posts and study material',es:'Buscar posts y material de estudio',de:'Beiträge und Lernmaterial durchsuchen',zh:'搜索文章和学习资料'},
    clear:{en:'Clear search',es:'Limpiar búsqueda',de:'Suche leeren',zh:'清除搜索'},
    post:{en:'Post',es:'Post',de:'Beitrag',zh:'文章'},
    result:{en:function(n){return n+' result'+(n===1?'':'s');},es:function(n){return n+' resultado'+(n===1?'':'s');},de:function(n){return n+' Ergebnis'+(n===1?'':'se');},zh:function(n){return '找到 '+n+' 项结果';}},
    openPost:{en:'Read the post',es:'Leer el post',de:'Beitrag lesen',zh:'阅读文章'},
    openMaterial:{en:'Open the material',es:'Abrir el material',de:'Material öffnen',zh:'打开资料'}
  };

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function asLang(value){
    if(value&&typeof value==='object')return value;
    var text=String(value==null?'':value);
    return {en:text,es:text,de:text,zh:text};
  }
  function langFromElement(element){
    var fallback=element?String(element.textContent||'').replace(/\s+/g,' ').trim():'';
    var result={};
    LANGS.forEach(function(lang){
      var child=element&&element.querySelector('.lang-'+lang);
      result[lang]=child?String(child.textContent||'').replace(/\s+/g,' ').trim():fallback;
    });
    return result;
  }
  function allLangText(value){
    var obj=asLang(value);
    return LANGS.map(function(lang){return String(obj[lang]||obj.en||'');}).join(' ');
  }
  function shorten(value,max){
    var text=String(value||'').replace(/\s+/g,' ').trim();
    if(text.length<=max)return text;
    var cut=text.slice(0,max-1).replace(/\s+\S*$/,'');
    return (cut||text.slice(0,max-1))+'…';
  }
  function excerptLang(value,max){
    var obj=asLang(value),result={};
    LANGS.forEach(function(lang){
      var paragraphs=String(obj[lang]||obj.en||'').split('\n').filter(function(p){return p.trim();});
      result[lang]=shorten(paragraphs[0]||'',max);
    });
    return result;
  }
  function normalizeSearch(value){
    return String(value||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\u0080-\uFFFF]+/g,' ').trim();
  }
  function safeSearchHref(value){
    var href=String(value||'').trim();
    if(/^\/(?!\/)[A-Za-z0-9._~!$&()*+,;=:@/%-]*$/.test(href))return href;
    if(/^https:\/\/(?:drive\.google\.com|www\.castorene\.cl|castorene\.cl)\//i.test(href))return href;
    return '#material';
  }
  function ml(value){
    var obj=asLang(value);
    return LANGS.map(function(lang){return '<span class="lang-'+lang+'">'+esc(obj[lang]||obj.en||'')+'</span>';}).join('');
  }
  function bodyHtml(value){
    var obj=value&&typeof value==='object'?value:{en:String(value||''),es:String(value||''),de:String(value||''),zh:String(value||'')};
    var paragraphs={},count=0;
    LANGS.forEach(function(lang){paragraphs[lang]=String(obj[lang]||obj.en||'').split('\n').filter(function(p){return p.trim();});count=Math.max(count,paragraphs[lang].length);});
    var html='';
    for(var i=0;i<count;i++){
      html+='<p>'+LANGS.map(function(lang){return '<span class="lang-'+lang+'">'+esc(paragraphs[lang][i]||'')+'</span>';}).join('')+'</p>';
    }
    return html;
  }
  function validPath(value){
    var path=String(value||'');
    return /^\/(?!\/)[A-Za-z0-9._~!$&()*+,;=:@/%-]*$/.test(path)?path:'/blog';
  }
  function sitePath(value){return window.pfSitePath?window.pfSitePath(value):value;}
  function dateValue(value){
    var time=Date.parse(String(value||''));
    return isFinite(time)?time:0;
  }
  function driveId(value){
    var id=String(value||'');
    return /^[A-Za-z0-9_-]{10,}$/.test(id)?id:null;
  }
  function youtubeId(value){
    var id=String(value||'');
    return /^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
  }
  function mediaHtml(post){
    var html='';
    var images=(post.images||[]).map(driveId).filter(Boolean);
    if(images.length){
      html+='<div class="pgallery">'+images.map(function(id){return '<a href="https://drive.google.com/file/d/'+id+'/view" target="_blank" rel="noopener"><img loading="lazy" src="https://drive.google.com/thumbnail?id='+id+'&amp;sz=w1600" alt="" /></a>';}).join('')+'</div>';
    }
    var yt=youtubeId(post.youtube),video=driveId(post.video);
    if(yt)html+='<div class="pvideo"><iframe src="https://www.youtube.com/embed/'+yt+'" title="Video" allowfullscreen loading="lazy"></iframe></div>';
    else if(video)html+='<div class="pvideo"><iframe src="https://drive.google.com/file/d/'+video+'/preview" title="Video" allow="autoplay" allowfullscreen loading="lazy"></iframe></div>';
    return html;
  }
  function postMode(post){
    if(post&&post.doubleExplanation===true)return 'double';
    if(post&&post.doubleExplanation===false)return 'specialized';
    var url=String(post&&post.link&&post.link.url||'').replace(/^\/blog\//,'').replace(/\/?$/,'').replace(/\.html$/,'');
    return DOUBLE_LAYER_SLUGS[url]?'double':'specialized';
  }
  function blogCard(post,featured){
    var link=post.link||{url:'/blog',label:{en:'Read more',es:'Leer más',de:'Mehr lesen',zh:'阅读更多'}};
    var arrowAfter=' <span aria-hidden="true">&#8592;</span>';
    var mode=postMode(post);
    return '<article class="post pf-item pf-post-card'+(featured?' post-feat':'')+'" data-kind="blog" data-sort="'+dateValue(post.date)+'">'+
      (featured?'<span class="pf-featured-star" aria-hidden="true">&#9733;</span>':'')+
      '<div class="pmeta"><span class="pdate">'+ml(post.dateLabel||post.date)+'</span>'+(post.category?'<span class="pcat">'+ml(post.category)+'</span>':'')+'<span class="pcat pf-audience-badge" data-audience="'+mode+'">'+ml(POST_MODE_LABELS[mode])+'</span></div>'+ 
      '<h3>'+ml(post.title)+'</h3>'+bodyHtml(post.body)+mediaHtml(post)+
      '<a class="plink" href="'+esc(sitePath(validPath(link.url)))+'">'+ml(link.label)+arrowAfter+'</a></article>';
  }
  function templateElement(html){
    var template=document.createElement('template');template.innerHTML=html.trim();return template.content.firstElementChild;
  }
  function decorateMaterial(item,kind,number,order){
    item.classList.add('pf-item');
    item.dataset.kind=kind;
    item.dataset.sort=String(dateValue((item.querySelector('.docdate')||{}).textContent)+(100-order));
    var num=item.querySelector('.docnum');if(num)num.textContent=String(number).padStart(2,'0');
    var head=item.querySelector('.dochead');
    if(!head)return;
    head.setAttribute('aria-expanded','false');
    head.addEventListener('click',function(event){
      var wasOpen=item.classList.contains('open');
      document.querySelectorAll('#material .docitem.open').forEach(function(other){
        if(other!==item){other.classList.remove('open');var otherHead=other.querySelector('.dochead');if(otherHead)otherHead.setAttribute('aria-expanded','false');}
      });
      item.classList.toggle('open',!wasOpen);
      head.setAttribute('aria-expanded',String(!wasOpen));
    });
  }
  function noteVariant(node){
    var title=node&&node.querySelector('.doctitle .lang-en'),text=String(title?title.textContent:'').toLowerCase();
    if(/\bspanish notes\b/.test(text))return 'es';
    if(/\benglish notes\b/.test(text))return 'en';
    return 'universal';
  }
  function markNoteVariant(node,kind){
    if(kind!=='notes')return;
    var variant=noteVariant(node);node.dataset.pfNoteVariant=variant;node.classList.add('pf-note-'+variant);
  }
  function noteAllowed(node){
    var variant=node&&node.dataset.pfNoteVariant||'universal';
    if(variant==='universal')return true;
    var lang=document.documentElement.getAttribute('data-lang')||'es';
    return variant===(lang==='es'?'es':'en');
  }
  function renumberNoteFeed(){
    var count=0;
    document.querySelectorAll('#notes-feed .docitem').forEach(function(item){
      var num=item.querySelector('.docnum');
      if(noteAllowed(item)){count++;if(num)num.textContent=String(count).padStart(2,'0');item.removeAttribute('aria-hidden');}
      else{if(num)num.textContent='';item.setAttribute('aria-hidden','true');}
    });
  }
  function observeNoteLanguage(){
    if(observeNoteLanguage.ready||!window.MutationObserver)return;
    observeNoteLanguage.ready=true;
    new MutationObserver(renumberNoteFeed).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
  }
  function fetchMaterials(){
    var sources=[{url:sitePath('/notes-lectures.html'),kind:'notes'},{url:sitePath('/notes-teaching.html'),kind:'teaching'}];
    return Promise.all(sources.map(function(source){
      return fetch(source.url,{credentials:'same-origin'}).then(function(response){if(!response.ok)throw new Error(source.url);return response.text();}).then(function(text){
        var parsed=new DOMParser().parseFromString(text,'text/html');
        return Array.prototype.slice.call(parsed.querySelectorAll('.doclist .docitem')).map(function(item){return {node:item,kind:source.kind};});
      }).catch(function(){return [];});
    })).then(function(groups){return groups.reduce(function(all,group){return all.concat(group);},[]);});
  }
  function renderMaterialGroup(items,targetId,kind){
    var target=document.getElementById(targetId);if(!target)return;
    target.innerHTML='';
    items.slice(0,kind==='notes'?4:3).forEach(function(material,index){
      var node=material.node.cloneNode(true);
      decorateMaterial(node,kind,index+1,items.length-index);
      markNoteVariant(node,kind);
      target.appendChild(node);
    });
    if(kind==='notes'){renumberNoteFeed();observeNoteLanguage();}
  }
  var searchItems=[];
  function postSearchItem(post){
    var title=asLang(post.title||''),body=asLang(post.body||''),category=post.category||null;
    var link=post.link||{url:'/blog',label:{en:'Read more',es:'Leer más',de:'Mehr lesen',zh:'阅读更多'}};
    return {
      type:SEARCH_LABELS.post,
      category:category,
      date:asLang(post.dateLabel||post.date||''),
      title:title,
      summary:excerptLang(body,240),
      url:safeSearchHref(validPath(link.url)),
      action:link.label||SEARCH_LABELS.openPost,
      external:false,
      sort:dateValue(post.date),
      searchText:normalizeSearch([allLangText(title),allLangText(body),allLangText(category||''),allLangText(SEARCH_LABELS.post)].join(' '))
    };
  }
  function materialSearchItem(material){
    var node=material.node;
    var title=langFromElement(node.querySelector('.doctitle'));
    var summary=langFromElement(node.querySelector('.docsum p'));
    var date=langFromElement(node.querySelector('.docdate'));
    var primary=node.querySelector('.docopen'),head=node.querySelector('.dochead');
    var rawUrl=(primary&&primary.getAttribute('href'))||(head&&head.getAttribute('data-url'))||'#material';
    var url=safeSearchHref(rawUrl);
    return {
      type:MATERIAL_LABELS[material.kind]||MATERIAL_LABELS.notes,
      category:null,
      date:date,
      title:title,
      summary:excerptLang(summary,240),
      url:url,
      action:SEARCH_LABELS.openMaterial,
      external:/^https:\/\//i.test(url),
      sort:dateValue(date.en),
      searchText:normalizeSearch([allLangText(title),allLangText(summary),allLangText(MATERIAL_LABELS[material.kind]||'')].join(' '))
    };
  }
  function buildSearchIndex(posts,materials){
    searchItems=posts.map(postSearchItem).concat(materials.map(materialSearchItem));
  }
  function searchStatus(count){
    var result={};
    LANGS.forEach(function(lang){result[lang]=SEARCH_LABELS.result[lang](count);});
    return result;
  }
  function searchCard(item){
    var category=item.category?'<span class="pf-search-category">'+ml(item.category)+'</span>':'';
    var target=item.external?' target="_blank" rel="noopener"':'';
    return '<article class="pf-search-card">'+
      '<div class="pf-search-meta"><span class="pf-search-type">'+ml(item.type)+'</span>'+category+'<span class="pf-search-date">'+ml(item.date)+'</span></div>'+
      '<h3>'+ml(item.title)+'</h3><p>'+ml(item.summary)+'</p>'+
      '<a class="plink" href="'+esc(item.external?item.url:sitePath(item.url))+'"'+target+'>'+ml(item.action)+' <span aria-hidden="true">&#8594;</span></a></article>';
  }
  function renderSearch(){
    var input=document.getElementById('pf-search-input'),results=document.getElementById('pf-search-results'),status=document.getElementById('pf-search-status'),empty=document.getElementById('pf-search-empty'),clear=document.getElementById('pf-search-clear');
    if(!input||!results||!status||!empty)return;
    var query=String(input.value||'').trim();
    if(clear)clear.hidden=!query;
    if(!query){results.innerHTML='';status.innerHTML='';status.hidden=true;empty.hidden=true;return;}
    var tokens=normalizeSearch(query).split(/\s+/).filter(Boolean);
    var matches=searchItems.map(function(item,index){
      if(!tokens.every(function(token){return item.searchText.indexOf(token)>-1;}))return null;
      var titleText=normalizeSearch(allLangText(item.title)),score=0;
      tokens.forEach(function(token){if(titleText.indexOf(token)>-1)score+=4;else score+=1;});
      return {item:item,score:score,index:index};
    }).filter(Boolean).sort(function(a,b){return b.score-a.score||b.item.sort-a.item.sort||a.index-b.index;}).map(function(match){return match.item;});
    status.innerHTML=ml(searchStatus(matches.length));status.hidden=false;
    results.innerHTML=matches.map(searchCard).join('');
    empty.hidden=matches.length>0;
  }
  function updateSearchControls(){
    var lang=document.documentElement.getAttribute('data-lang')||'es',input=document.getElementById('pf-search-input'),clear=document.getElementById('pf-search-clear');
    if(input){input.placeholder=SEARCH_LABELS.placeholder[lang];input.setAttribute('aria-label',SEARCH_LABELS.aria[lang]);}
    if(clear)clear.setAttribute('aria-label',SEARCH_LABELS.clear[lang]);
  }
  function setupSearch(){
    var form=document.getElementById('pf-search-form'),input=document.getElementById('pf-search-input'),clear=document.getElementById('pf-search-clear');
    if(!form||!input||form.dataset.ready==='true')return;
    form.dataset.ready='true';
    updateSearchControls();
    input.addEventListener('input',renderSearch);
    form.addEventListener('submit',function(event){event.preventDefault();renderSearch();});
    if(clear)clear.addEventListener('click',function(){input.value='';renderSearch();input.focus();});
    if(window.MutationObserver)new MutationObserver(updateSearchControls).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
  }
  function setupSearchDrawer(){
    var toggle=document.getElementById('pf-search-toggle'),panel=document.getElementById('buscar'),close=document.getElementById('pf-search-close'),input=document.getElementById('pf-search-input'),nav=document.querySelector('nav');
    if(!toggle||!panel||toggle.dataset.ready==='true')return;
    toggle.dataset.ready='true';
    function positionPanel(){
      if(nav)document.documentElement.style.setProperty('--pf-search-top',Math.ceil(nav.getBoundingClientRect().bottom)+'px');
    }
    function setOpen(open,focus){
      if(open)positionPanel();
      panel.hidden=!open;
      toggle.setAttribute('aria-expanded',String(open));
      if(open&&focus&&input)window.setTimeout(function(){input.focus();},0);
    }
    toggle.addEventListener('click',function(){
      var open=toggle.getAttribute('aria-expanded')==='true';
      setOpen(!open,true);
      var links=document.querySelector('.nav-links');
      if(links)links.classList.remove('open');
    });
    if(close)close.addEventListener('click',function(){setOpen(false,false);toggle.focus();});
    document.addEventListener('click',function(event){
      if(panel.hidden||panel.contains(event.target)||toggle.contains(event.target))return;
      setOpen(false,false);
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setOpen(false,false);toggle.focus();}
    });
    window.addEventListener('resize',function(){
      if(toggle.getAttribute('aria-expanded')==='true')positionPanel();
    });
    if(new URLSearchParams(window.location.search).get('open-search')==='1')window.setTimeout(function(){toggle.click();},80);
  }
  function restoreHash(){
    var id=String(location.hash||'').slice(1);if(!id)return;
    var target=document.getElementById(id);if(!target)return;
    window.setTimeout(function(){target.scrollIntoView({block:'start'});},60);
  }
  window.addEventListener('hashchange',function(){window.setTimeout(restoreHash,0);});
  function render(posts,materials){
    var featured=posts.filter(function(post){return post.featured;});
    var recent=posts.filter(function(post){return !post.featured;});
    var recentVisible=recent.slice(0,3);
    var featuredBox=document.getElementById('bf');if(featuredBox)featuredBox.innerHTML=featured.map(function(post){return blogCard(post,true);}).join('');
    var recentBox=document.getElementById('bt');if(recentBox)recentBox.innerHTML=recentVisible.map(function(post){return blogCard(post,false);}).join('');
    var empty=document.getElementById('pf-post-empty');if(empty)empty.hidden=recent.length>0;
    renderMaterialGroup(materials.filter(function(material){return material.kind==='notes';}),'notes-feed','notes');
    renderMaterialGroup(materials.filter(function(material){return material.kind==='teaching';}),'teaching-feed','teaching');
    buildSearchIndex(posts,materials);
    setupSearch();
    setupSearchDrawer();
    loadInteractions(restoreHash);
  }
  function loadScript(src,done){
    var script=document.createElement('script');script.src=src;script.onload=done;script.onerror=done;document.body.appendChild(script);
  }
  function loadInteractions(done){
    loadScript(sitePath('/blog-interactions.js?v=10'),function(){
      loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?onload=castoreneTurnstileReady&render=explicit',function(){if(done)done();});
    });
  }
  setupSearch();
  setupSearchDrawer();
  var posts=(window.PRIMO_POSTS||[]).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));});
  fetchMaterials().then(function(materials){render(posts,materials);}).catch(function(){render(posts,[]);});
})();

/* Evita el rebote superior del navegador móvil, que desplaza visualmente el
   contenido mientras el fondo fijo permanece en su posición. El desplazamiento
   normal hacia abajo no se bloquea. */
(function(){
  if(!('ontouchstart' in window))return;
  var startY=0,startX=0;
  document.addEventListener('touchstart',function(event){
    if(event.touches.length===1){startY=event.touches[0].clientY;startX=event.touches[0].clientX;}
  },{passive:true});
  document.addEventListener('touchmove',function(event){
    if(event.touches.length!==1||window.scrollY>0)return;
    var target=event.target;
    if(target&&target.closest&&target.closest('input,textarea,select,[contenteditable="true"]'))return;
    var dy=event.touches[0].clientY-startY,dx=event.touches[0].clientX-startX;
    if(dy>0&&Math.abs(dy)>=Math.abs(dx))event.preventDefault();
  },{passive:false});
})();

/* El logo abre la sección About con un destello breve, sin añadir otra
   entrada al menú principal. */
(function(){
  document.querySelectorAll('.pf-about-trigger').forEach(function(trigger){
    trigger.addEventListener('click',function(){
      trigger.classList.remove('pf-about-pulse');
      void trigger.offsetWidth;
      trigger.classList.add('pf-about-pulse');
      window.setTimeout(function(){trigger.classList.remove('pf-about-pulse');},920);
    });
  });
})();

/* La tarjeta de quien mantiene el proyecto funciona como acceso directo al
   sitio personal, mientras que su botón conserva un enlace explícito. */
(function(){
  var owner=document.querySelector('.pf-about-owner');
  if(!owner)return;
  function goToProfile(){
    var url=owner.getAttribute('data-profile-url');
    if(url)window.location.href=url;
  }
  owner.addEventListener('click',function(event){
    if(event.target.closest&&event.target.closest('a'))return;
    goToProfile();
  });
  owner.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    event.preventDefault();
    goToProfile();
  });
})();
