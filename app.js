var _yr=document.getElementById('yr'); if(_yr)_yr.textContent=new Date().getFullYear();

/* Works both at the custom-domain root and at GitHub Pages' project path. */
function pfSiteBase(){
  var p=String(location.pathname||'/'),marker='/blog/',i=p.indexOf(marker);
  if(i>=0)return p.slice(0,i);
  if(/\/blog\/?$/.test(p))return p.replace(/\/blog\/?$/,'');
  if(p==='/'||/\/$/.test(p))return p.replace(/\/$/,'');
  return p.slice(0,p.lastIndexOf('/'));
}
function pfSitePath(path){return pfSiteBase()+String(path||'');}
window.pfSitePath=pfSitePath;

/* ---------- language ---------- */
var LANGS=['en','es','de','zh'];
function detectLang(){
  try{var s=localStorage.getItem('lang'); if(s&&LANGS.indexOf(s)>-1)return s;}catch(e){}
  var cands=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||'en'];
  for(var i=0;i<cands.length;i++){var p=(cands[i]||'').toLowerCase().slice(0,2); if(LANGS.indexOf(p)>-1)return p;}
  return 'en';
}
function setLang(l){
  if(LANGS.indexOf(l)<0)l='en';
  var h=document.documentElement;
  h.setAttribute('data-lang',l); h.setAttribute('lang',l);
  try{localStorage.setItem('lang',l);}catch(e){}
  var cur=document.querySelector('.lang-cur');
  var li=document.querySelector('.lang-menu li[data-lang="'+l+'"]');
  if(cur&&li)cur.innerHTML=li.innerHTML;
  var m=document.querySelector('.lang-menu'); if(m)m.classList.remove('open');
  var b=document.querySelector('.lang-btn'); if(b)b.setAttribute('aria-expanded','false');
}
function pickLang(l){setLang(l);}
function toggleLangMenu(btn){
  var m=document.querySelector('.lang-menu'); if(!m)return;
  var open=m.classList.toggle('open');
  btn.setAttribute('aria-expanded', open?'true':'false');
}
document.addEventListener('click',function(e){
  if(!e.target.closest('.lang-dd')){var m=document.querySelector('.lang-menu'); if(m)m.classList.remove('open');}
});

/* ---------- theme ---------- */
function detectTheme(){
  try{var s=localStorage.getItem('theme'); if(s==='light'||s==='dark')return s;}catch(e){}
  return (window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';
}
function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  try{localStorage.setItem('theme',t);}catch(e){}
  var mc=document.querySelector('meta[name="theme-color"]'); if(mc)mc.setAttribute('content', t==='light'?'#f5f2fc':'#0a0713');
}
function toggleTheme(){setTheme(document.documentElement.getAttribute('data-theme')==='light'?'dark':'light');}

/* ---------- init ---------- */
setTheme(detectTheme());
setLang(detectLang());

/* ---------- hero photo crossfade ---------- */
(function(){
  var pf=document.querySelectorAll('.hero-photo .pf'); if(pf.length<2)return;
  var i=0;
  setInterval(function(){pf[i].classList.remove('active'); i=(i+1)%pf.length; pf[i].classList.add('active');},5000);
})();

/* ---------- reveal on scroll ---------- */
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  /* safety: reveal anything already on screen or if something goes wrong */
  setTimeout(function(){var vh=innerHeight||document.documentElement.clientHeight;document.querySelectorAll('.reveal:not(.in)').forEach(function(el){if(el.getBoundingClientRect().top<vh)el.classList.add('in');});},400);
}else{
  document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});
}

/* ---------- close mobile menu on link click ---------- */
document.querySelectorAll('.nav-links a').forEach(function(a){a.addEventListener('click',function(){var n=document.querySelector('.nav-links'); if(n)setTimeout(function(){n.classList.remove('open');},340);});});

/* ---------- energy-transfer particle canvas ---------- */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var c=document.getElementById('energy'); if(!c)return;
  var x=c.getContext('2d',{alpha:true,desynchronized:false});
  var w=0,h=0,parts=[],DPR=Math.min(window.devicePixelRatio||1,2);
  var COLORS=['#7c3aed','#d946ef','#4f46e5','#a855f7','#6453a1'];
  var RGB=COLORS.map(function(c){return [parseInt(c.substr(1,2),16),parseInt(c.substr(3,2),16),parseInt(c.substr(5,2),16)];});
  var NEAR=[168,132,228];
  var RMIN=1.1*DPR, RBASE=2.0*DPR, RMAX=4.6*DPR;
  var SPLIT_RATE=0.006, MERGE_SLACK=0.80;

  function ok(n){ return typeof n==='number' && isFinite(n); }   /* nada de NaN/Infinity al canvas */
  function ch(v){ v=v|0; return v<0?0:(v>255?255:v); }           /* canal RGB siempre válido */
  function tint(p){
    var t=p.heat*0.50, c=p.rgb;
    if(!ok(t)||!c) return 'rgb(124,58,237)';
    if(t<0)t=0; else if(t>1)t=1;
    return 'rgb('+ch(c[0]+(NEAR[0]-c[0])*t)+','+ch(c[1]+(NEAR[1]-c[1])*t)+','+ch(c[2]+(NEAR[2]-c[2])*t)+')';
  }

  /* sobre la caja del lienzo, no sobre innerHeight: así el número de partículas
     tampoco fluctúa cuando la barra de URL aparece o se oculta */
  /* color de la línea entre dos partículas: la media de sus tintes, ya resuelta a un
     rgb() sólido. Sustituye al degradado por pareja; ver el bucle de líneas en step(). */
  function mix(p,q){
    var tp=p.heat*0.50, tq=q.heat*0.50, a=p.rgb, b=q.rgb;
    if(!a||!b||!ok(tp)||!ok(tq)) return 'rgb(124,58,237)';
    if(tp<0)tp=0; else if(tp>1)tp=1;
    if(tq<0)tq=0; else if(tq>1)tq=1;
    return 'rgb('+ch((a[0]+(NEAR[0]-a[0])*tp + b[0]+(NEAR[0]-b[0])*tq)/2)+','
                 +ch((a[1]+(NEAR[1]-a[1])*tp + b[1]+(NEAR[1]-b[1])*tq)/2)+','
                 +ch((a[2]+(NEAR[2]-a[2])*tp + b[2]+(NEAR[2]-b[2])*tq)/2)+')';
  }

  function target(){ var a=(cssW||innerWidth)*(cssH||innerHeight); return Math.max(30,Math.min(95,Math.round(a/11000))); }
  function mass(p){ return p.r*p.r; }

  function make(px,py){
    var ci=(Math.random()*COLORS.length)|0;
    return {x:px,y:py,
            vx:(Math.random()-.5)*.35*DPR, vy:(Math.random()-.5)*.35*DPR,
            r:(Math.random()*0.9+1.1)*DPR, col:COLORS[ci], rgb:RGB[ci],
            flash:0, near:0, heat:0,
            /* fade: envolvente de opacidad. Nada aparece ni desaparece de golpe:
               al nacer sube de 0 a 1 y al morir baja a 0. Sin esto, una fusión o
               fisión hacía saltar varias líneas de una sola vez en un solo frame. */
            fade:1, dying:false};
  }
  function seed(n){
    while(parts.length<n) parts.push(make(Math.random()*w,Math.random()*h));
    if(parts.length>n) parts.length=n;
  }

  var cssW=0, cssH=0;
  function resize(){
    /* Se mide la caja REAL del lienzo, nunca innerHeight. El CSS lo fija en 100lvh, que
       no cambia cuando la barra de URL del móvil se oculta o reaparece al hacer scroll,
       así que aquí no se toca nada durante el scroll: ni el tamaño del elemento, ni el
       búfer, ni las posiciones. Sólo una rotación o una ventana de escritorio cambian
       estas medidas, y ahí sí toca reescalar. */
    var iw=c.clientWidth||innerWidth, ih=c.clientHeight||innerHeight;
    if(iw===cssW && ih===cssH) return;
    var nw=Math.round(iw*DPR), nh=Math.round(ih*DPR);
    if(nw===w && nh===h){ cssW=iw; cssH=ih; return; }
    var sx=w?nw/w:1, sy=h?nh/h:1;
    w=c.width=nw; h=c.height=nh;                 /* fijar width/height limpia el lienzo */
    for(var i=0;i<parts.length;i++){
      parts[i].x=Math.min(w,Math.max(0,parts[i].x*sx));
      parts[i].y=Math.min(h,Math.max(0,parts[i].y*sy));
    }
    cssW=iw; cssH=ih;
    seed(target());
  }

  function coalesce(){
    for(var i=0;i<parts.length;i++){
      var p=parts[i]; if(p.dying) continue;
      for(var j=i+1;j<parts.length;j++){
        var q=parts[j]; if(q.dying) continue;
        var dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d < (p.r+q.r)*MERGE_SLACK){
          var nr=Math.sqrt(p.r*p.r+q.r*q.r);
          if(nr>RMAX) continue;
          var mp=mass(p), mq=mass(q), mt=mp+mq;
          if(!ok(mt)||mt<=0) continue;
          p.x=(p.x*mp+q.x*mq)/mt; p.y=(p.y*mp+q.y*mq)/mt;
          p.vx=(p.vx*mp+q.vx*mq)/mt; p.vy=(p.vy*mp+q.vy*mq)/mt;
          p.r=nr; p.flash=1;
          /* q no se borra en el acto: se marca y se apaga en ~15 frames, así sus
             líneas hacia los vecinos se desvanecen en vez de cortarse de golpe. */
          q.dying=true;
        }
      }
    }
  }

  function fission(){
    if(parts.length>=target()) return;
    if(Math.random()>SPLIT_RATE) return;
    var big=[],i;
    for(i=0;i<parts.length;i++) if(parts[i].r>RBASE && !parts[i].dying) big.push(parts[i]);
    if(!big.length) return;
    var p=big[(Math.random()*big.length)|0];
    var nr=p.r/Math.SQRT2;
    if(nr<RMIN) return;
    var ang=Math.random()*Math.PI*2, push=0.16*DPR;
    var q=make(p.x,p.y);
    q.r=nr; var qi=(Math.random()*COLORS.length)|0; q.col=COLORS[qi]; q.rgb=RGB[qi];
    q.fade=0;                                   /* la partícula nueva entra desvanecida */
    q.vx=p.vx-Math.cos(ang)*push; q.vy=p.vy-Math.sin(ang)*push; q.flash=1;
    p.r=nr; p.vx+=Math.cos(ang)*push; p.vy+=Math.sin(ang)*push; p.flash=1;
    var sep=(p.r+q.r)*0.9;
    p.x+=Math.cos(ang)*sep; p.y+=Math.sin(ang)*sep;
    q.x-=Math.cos(ang)*sep; q.y-=Math.sin(ang)*sep;
    parts.push(q);
  }

  function step(){
    if(!(w>0&&h>0)){ if(!reduce)requestAnimationFrame(step); return; }
    x.setTransform(1,0,0,1,0,0);
    x.globalCompositeOperation='source-over';   /* nunca aditivo: evita que se sature a blanco */
    x.clearRect(0,0,w,h);
    x.lineCap='round'; x.lineJoin='round';

    var max=Math.min(w,h)*0.22, i,j,p,q;
    for(i=parts.length-1;i>=0;i--){
      p=parts[i];
      /* una partícula con valores corruptos se reemplaza en vez de dibujarse */
      if(!ok(p.x)||!ok(p.y)||!ok(p.r)||!ok(p.vx)||!ok(p.vy)||p.r<=0){ var np=make(Math.random()*w,Math.random()*h); np.fade=0; parts[i]=np; continue; }
      /* envolvente de opacidad: nacer y morir toma ~15 frames (0.25 s) */
      if(p.dying){ p.fade-=0.07; if(p.fade<=0.02){ parts.splice(i,1); continue; } }
      else if(p.fade<1){ p.fade+=0.07; if(p.fade>1) p.fade=1; }
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0){p.x=0;p.vx=Math.abs(p.vx);} else if(p.x>w){p.x=w;p.vx=-Math.abs(p.vx);}
      if(p.y<0){p.y=0;p.vy=Math.abs(p.vy);} else if(p.y>h){p.y=h;p.vy=-Math.abs(p.vy);}
      if(p.flash>0) p.flash*=0.93;
      p.near=0;
    }
    coalesce();
    fission();

    for(i=0;i<parts.length;i++){
      p=parts[i];
      for(j=i+1;j<parts.length;j++){
        q=parts[j];
        var dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
        if(!(d<max) || d<=1.5) continue;         /* descarta NaN y segmentos degenerados */
        var f=1-d/max; p.near+=f*f; q.near+=f*f;
        var al=f*(.40+p.heat*0.08)*(p.fade<q.fade?p.fade:q.fade);
        /* Umbral de visibilidad. Justo por debajo del corte de conexión la opacidad pedida
           baja a ~0.01: invisible, pero iOS rasterizaba a veces ese caso extremo como una
           línea BLANCA y opaca durante un frame. Es el "rayo". Si no se ve, no se dibuja. */
        if(al<0.02) continue;
        /* Color sólido en lugar de un CanvasGradient nuevo por pareja y por frame. A 2 px
           de grosor el degradado no se distingue, y así se dejan de crear ~1800 gradientes
           por segundo — la presión de recursos que acompañaba al fallo. */
        x.strokeStyle=mix(p,q);
        x.globalAlpha=al<1?al:1; x.lineWidth=(1.1+p.heat*0.14)*DPR;
        x.beginPath(); x.moveTo(p.x,p.y); x.lineTo(q.x,q.y); x.stroke();
      }
    }

    for(i=0;i<parts.length;i++){
      p=parts[i];
      var tgt=Math.min(1,p.near/1.8);
      if(!ok(tgt)) tgt=0;
      p.heat+=(tgt-p.heat)*0.07;
      if(!ok(p.heat)||p.heat<0) p.heat=0; else if(p.heat>1) p.heat=1;
      if(!ok(p.flash)||p.flash<0) p.flash=0; else if(p.flash>1) p.flash=1;
      var col=tint(p);
      if(p.heat>0.05){
        x.globalAlpha=p.heat*0.07*p.fade;
        x.beginPath(); x.arc(p.x,p.y,p.r*(1.5+p.heat*0.8),0,6.2832); x.fillStyle=col; x.fill();
      }
      if(p.flash>0.02){
        x.globalAlpha=p.flash*0.32*p.fade;
        x.beginPath(); x.arc(p.x,p.y,p.r*(1+(1-p.flash)*2.6),0,6.2832); x.fillStyle=col; x.fill();
      }
      x.globalAlpha=.95*p.fade;
      x.beginPath(); x.arc(p.x,p.y,p.r*(1+p.heat*0.05),0,6.2832); x.fillStyle=col; x.fill();
    }
    x.globalAlpha=1;
    if(!reduce)requestAnimationFrame(step);
  }

  var t=null;
  function onResize(){ clearTimeout(t); t=setTimeout(resize,150); }
  addEventListener('resize',onResize);
  addEventListener('orientationchange',onResize);
  resize(); step();
})();

/* ---------- generic carousels (team photos, group banner) ---------- */
document.querySelectorAll('.carousel').forEach(function(c){
  var s=c.querySelectorAll('.cslide'); if(s.length<2)return;
  var i=0;
  setInterval(function(){s[i].classList.remove('active'); i=(i+1)%s.length; s[i].classList.add('active');}, 4000+Math.random()*1600);
});

/* ---------- nav link tap/click energy pulse ---------- */
document.querySelectorAll('.nav-links a').forEach(function(a){
  a.addEventListener('pointerdown',function(){/*navtap*/ a.classList.remove('tap'); void a.offsetWidth; a.classList.add('tap'); setTimeout(function(){a.classList.remove('tap');},520);});
});

/* ---------- hero CTA button click pulse ---------- */
document.querySelectorAll('.hero-cta .btn').forEach(function(b){
  b.addEventListener('pointerdown',function(){b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); setTimeout(function(){b.classList.remove('pulse');},560);});
});

/* ---------- nav submenus ---------- */
function toggleSub(btn){
  var g = btn.parentNode.parentNode, was = g.classList.contains('open');
  document.querySelectorAll('.navgroup.open').forEach(function(o){ o.classList.remove('open'); });
  if(!was) g.classList.add('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest || !e.target.closest('.navgroup')){
    document.querySelectorAll('.navgroup.open').forEach(function(o){ o.classList.remove('open'); });
  }
});

/* ---------- scroll peek: fade + double chevron, hidden when text is in the way ---------- */
(function(){
  var secs=[].slice.call(document.querySelectorAll('section[id]')).map(function(s){
    var t=s.querySelector('.section-title');
    return t?{el:s}:null;
  }).filter(Boolean);
  if(secs.length<3) return;               /* only on the long home page */

  var peek=document.createElement('div');
  peek.className='peek';
  peek.innerHTML='<button class="peek-in" type="button" aria-label="Scroll down">'+
    '<svg class="peek-svg" viewBox="0 0 56 46" aria-hidden="true">'+
    '<defs><linearGradient id="pkgrad" x1="0" y1="0" x2="1" y2="0">'+
    '<stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#d946ef"/>'+
    '<stop offset="1" stop-color="#4f46e5"/></linearGradient></defs>'+
    '<path class="pk1" d="M6 8 L28 26 L50 8"/>'+
    '<path class="pk2" d="M6 22 L28 40 L50 22"/>'+
    '</svg></button>';
  document.body.appendChild(peek);
  var btn=peek.querySelector('.peek-in'), target=null;

  /* elements that count as "text in the way" */
  var textEls=[].slice.call(document.querySelectorAll(
    'p,h1,h2,h3,h4,li,.tag,.btn,.qlink,.stat,.news-item,.conf,.pub,.award-item,.card,.member,.docitem,figcaption,footer'));

  function bandBusy(){
    var band=innerHeight-(innerWidth<=760?108:132), bottom=innerHeight;
    for(var i=0;i<textEls.length;i++){
      var r=textEls[i].getBoundingClientRect();
      if(r.height===0&&r.width===0) continue;
      if(r.bottom>band+8 && r.top<bottom-6) return true;
    }
    return false;
  }

  var tick=false;
  function upd(){
    tick=false;
    var mid=scrollY+innerHeight*0.6, next=null;
    for(var i=0;i<secs.length;i++){
      if(secs[i].el.offsetTop>mid){ next=secs[i]; break; }
    }
    target=next;
    var atEnd=(innerHeight+scrollY)>=document.body.scrollHeight-90;
    peek.classList.toggle('on', !!next && !atEnd && !bandBusy());
  }
  function onScroll(){ if(!tick){ tick=true; requestAnimationFrame(upd); } }
  btn.addEventListener('click',function(){ if(target) target.el.scrollIntoView({behavior:'smooth',block:'start'}); });
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  upd();
})();

/* ---------- posts destacados del blog en la portada ---------- */
(function(){
  var box=document.getElementById('homeblog');
  if(!box || !window.PRIMO_POSTS || !window.PRIMO_POSTS.length) return;
  var L=['en','es','de','zh'];
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function localPath(v,fallback){
    v=String(v||'');
    return /^\/(?!\/)[A-Za-z0-9._~!$&()*+,;=:@/%-]*$/.test(v)?v:fallback;
  }
  function sitePath(v){return window.pfSitePath?window.pfSitePath(v):v;}
  function ml(o){ if(!o) return ''; if(typeof o==='string') return esc(o);
    return L.map(function(l){return '<span class="lang-'+l+'">'+esc(o[l]||o.en||'')+'</span>';}).join(''); }
  function card(p){
    var first={};
    L.forEach(function(l){ first[l]=String((p.body&&(p.body[l]||p.body.en))||'').split('\n')[0]; });
    var go=p.link?p.link.label:{en:'Read more',es:'Leer más',de:'Mehr lesen',zh:'阅读更多'};
    return '<a class="hbpost" href="'+sitePath(localPath(p.link&&p.link.url,'/blog'))+'">'+
      '<div><div class="pmeta"><span class="pdate">'+ml(p.dateLabel||p.date)+'</span>'+
      (p.category?'<span class="pcat">'+ml(p.category)+'</span>':'')+'</div>'+
      '<h3>'+ml(p.title)+'</h3><p>'+ml(first)+'</p></div>'+
      '<span class="hbgo">'+ml(go)+' &rarr;</span></a>';
  }
  var posts=window.PRIMO_POSTS.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));});
  var featured=posts.filter(function(p){return p.featured;});
  if(!featured.length) return;
  box.innerHTML='<h3 class="subhead homeblog-head"><span class="lang-en">Featured</span><span class="lang-es">Destacados</span><span class="lang-de">Highlights</span><span class="lang-zh">精选</span></h3>'+
    '<div class="hbgrid">'+featured.map(card).join('')+'</div>';
})();

/* ---------- "What's new": 4 items, or the whole month if it has more ---------- */
(function(){
  var wrap=document.querySelector('.news');
  if(!wrap) return;
  var items=[].slice.call(wrap.querySelectorAll('.news-item'));
  if(items.length<=4) return;
  function when(el){ var d=el.querySelector('.date'); return d?d.textContent.trim():''; }
  var keep=4;
  /* if item #5 onwards still belongs to the same month as #4, keep them too */
  while(keep<items.length && when(items[keep])===when(items[3])) keep++;
  for(var i=keep;i<items.length;i++) items[i].style.display='none';
})();
