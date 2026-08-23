(function(){
  'use strict';
  var LABELS={
    region:{en:'Knowledge for knowledge’s sake carousel',es:'Carrusel de Saber por Saber',de:'Karussell Wissen um des Wissens willen',zh:'为求知而求知轮播'},
    previous:{en:'Previous curiosities',es:'Curiosidades anteriores',de:'Vorherige Kuriositäten',zh:'上一组趣闻'},
    next:{en:'Next curiosities',es:'Curiosidades siguientes',de:'Nächste Kuriositäten',zh:'下一组趣闻'},
    page:{en:'Go to group',es:'Ir al grupo',de:'Zur Gruppe',zh:'前往分组'},
    read:{en:'Read the curiosity',es:'Leer la curiosidad',de:'Kuriosität lesen',zh:'阅读趣闻'}
  };
  function language(){return document.documentElement.getAttribute('data-lang')||'es';}
  function localized(label){return ['en','es','de','zh'].map(function(lang){return '<span class="lang-'+lang+'">'+label[lang]+'</span>';}).join('');}
  function arrowSvg(){return '<svg class="pf-carousel-arrow-svg" viewBox="0 0 48 56" aria-hidden="true"><path class="pf-carousel-chevron pf-carousel-chevron-a" d="M7 7 L26 28 L7 49"></path><path class="pf-carousel-chevron pf-carousel-chevron-b" d="M23 7 L42 28 L23 49"></path></svg>';}
  function card(source){
    var anchor=source.querySelector('a'),title=source.querySelector('h2'),summary=source.querySelector('p'),meta=source.querySelector('.pf-saber-card-meta'),kicker=source.querySelector('.pf-saber-card-kicker'),image=source.querySelector('img');
    if(!anchor||!title)return '';
    var href=anchor.getAttribute('href')||'/saber/';
    if(!/^\/saber\/[A-Za-z0-9._~!$&()*+,;=:@/%-]*$/.test(href))href='/saber/';
    return '<article class="post pf-item pf-post-card pf-saber-post-card">'+
      (image?'<a class="pf-saber-post-media" href="'+href+'" tabindex="-1" aria-hidden="true"><img src="'+image.getAttribute('src')+'" alt="" loading="lazy"></a>':'')+
      '<div class="pmeta">'+(meta?meta.innerHTML:'')+(kicker?'<span class="pcat pf-saber-category">'+kicker.innerHTML+'</span>':'')+'</div>'+
      '<h3>'+title.innerHTML+'</h3>'+(summary?'<p>'+summary.innerHTML+'</p>':'')+
      '<a class="plink" href="'+href+'">'+localized(LABELS.read)+' <span aria-hidden="true">&#8594;</span></a></article>';
  }
  function setupCarousel(target){
    if(!target||target.children.length<2||target.dataset.carouselReady==='true')return;
    target.dataset.carouselReady='true';
    var shell=document.createElement('div');shell.className='pf-carousel-shell pf-saber-carousel-shell';target.parentNode.insertBefore(shell,target);shell.appendChild(target);
    var previous=document.createElement('button');previous.type='button';previous.className='pf-carousel-arrow pf-carousel-arrow--prev';previous.innerHTML=arrowSvg();
    var next=document.createElement('button');next.type='button';next.className='pf-carousel-arrow pf-carousel-arrow--next';next.innerHTML=arrowSvg();
    var controls=document.createElement('div');controls.className='pf-carousel-controls';var dots=document.createElement('div');dots.className='pf-carousel-dots';dots.setAttribute('role','tablist');controls.appendChild(dots);
    shell.appendChild(previous);shell.appendChild(next);shell.appendChild(controls);target.setAttribute('role','region');target.setAttribute('tabindex','0');
    function items(){return Array.prototype.slice.call(target.children);}
    function step(){var list=items();if(list.length<2)return list[0]?list[0].getBoundingClientRect().width:1;return Math.max(1,list[1].getBoundingClientRect().left-list[0].getBoundingClientRect().left);}
    function pageSize(){var list=items();if(!list.length)return 1;var width=list[0].getBoundingClientRect().width,gap=Math.max(0,step()-width);return Math.max(1,Math.min(list.length,Math.floor((target.clientWidth+gap)/step())));}
    function pageCount(){return Math.max(1,Math.ceil(items().length/pageSize()));}
    function currentPage(){var max=Math.max(0,target.scrollWidth-target.clientWidth),pages=pageCount();return max?Math.max(0,Math.min(pages-1,Math.round(target.scrollLeft/max*(pages-1)))):0;}
    function go(page,behavior){var list=items(),pages=pageCount();page=Math.max(0,Math.min(pages-1,page));var item=list[Math.min(list.length-1,page*pageSize())];if(!item)return;var left=target.scrollLeft+item.getBoundingClientRect().left-target.getBoundingClientRect().left;target.scrollTo({left:left,behavior:behavior||'smooth'});}
    function labels(){var lang=language();target.setAttribute('aria-label',LABELS.region[lang]);previous.setAttribute('aria-label',LABELS.previous[lang]);next.setAttribute('aria-label',LABELS.next[lang]);Array.prototype.slice.call(dots.children).forEach(function(dot,index){dot.setAttribute('aria-label',LABELS.page[lang]+' '+(index+1));});}
    function update(){var page=currentPage(),pages=pageCount(),targetRect=target.getBoundingClientRect();items().forEach(function(item){var rect=item.getBoundingClientRect(),overlap=Math.max(0,Math.min(rect.right,targetRect.right)-Math.max(rect.left,targetRect.left)),ratio=rect.width?overlap/rect.width:0;item.classList.toggle('is-active',ratio>=.75);});previous.disabled=page===0;next.disabled=page>=pages-1;Array.prototype.slice.call(dots.children).forEach(function(dot,index){var active=index===page;dot.classList.toggle('is-active',active);dot.setAttribute('aria-selected',String(active));dot.tabIndex=active?0:-1;});}
    function rebuild(){var pages=pageCount();dots.innerHTML='';for(var index=0;index<pages;index++){(function(page){var dot=document.createElement('button');dot.type='button';dot.className='pf-carousel-dot';dot.setAttribute('role','tab');dot.addEventListener('click',function(){go(page);});dots.appendChild(dot);})(index);}controls.hidden=pages<2;labels();update();}
    var snapTimer=0;target.addEventListener('scroll',function(){update();clearTimeout(snapTimer);snapTimer=setTimeout(function(){go(currentPage(),'auto');},180);},{passive:true});
    previous.addEventListener('click',function(){go(currentPage()-1);});next.addEventListener('click',function(){go(currentPage()+1);});
    target.addEventListener('keydown',function(event){if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();go(currentPage()+(event.key==='ArrowLeft'?-1:1));}});
    var dragging=false,startX=0,startScroll=0;target.addEventListener('pointerdown',function(event){if(event.pointerType==='touch'||event.button!==0)return;dragging=true;startX=event.clientX;startScroll=target.scrollLeft;});target.addEventListener('pointermove',function(event){if(!dragging)return;var dx=event.clientX-startX;if(Math.abs(dx)<7)return;target.classList.add('is-dragging');event.preventDefault();target.scrollLeft=startScroll-dx;});['pointerup','pointercancel','mouseleave'].forEach(function(name){target.addEventListener(name,function(){if(!dragging)return;dragging=false;target.classList.remove('is-dragging');go(currentPage(),'auto');});});
    if(window.ResizeObserver)new ResizeObserver(rebuild).observe(target);else window.addEventListener('resize',rebuild,{passive:true});
    if(window.MutationObserver)new MutationObserver(rebuild).observe(target,{childList:true});
    if(window.MutationObserver)new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
    rebuild();
  }
  function render(){
    var target=document.querySelector('[data-saber-feed]'),empty=document.querySelector('[data-saber-empty]');if(!target)return;
    var fallback=target.innerHTML;
    if(target.children.length)setupCarousel(target);
    fetch('/saber/',{credentials:'same-origin'}).then(function(response){if(!response.ok)throw new Error('Saber feed unavailable');return response.text();}).then(function(html){
      var documentCopy=new DOMParser().parseFromString(html,'text/html'),sources=Array.prototype.slice.call(documentCopy.querySelectorAll('#saber-posts .pf-saber-card')).slice(0,6);
      target.innerHTML=sources.map(card).join('');target.hidden=!sources.length;if(empty)empty.hidden=!!sources.length;if(sources.length)setupCarousel(target);
    }).catch(function(){target.innerHTML=fallback;target.hidden=!target.children.length;if(empty)empty.hidden=!!target.children.length;});
  }
  var randomButton=document.getElementById('pf-saber-random');
  if(randomButton)randomButton.addEventListener('click',function(){
    var links=Array.prototype.slice.call(document.querySelectorAll('#saber-feed .pf-saber-post-card .plink'));
    if(!links.length)return;
    var destination=links[Math.floor(Math.random()*links.length)].getAttribute('href');
    if(destination)window.location.assign(destination);
  });
  render();
})();
