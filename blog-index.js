/* The post data lives in posts.js; this file only renders the blog index. */
(function(){
  'use strict';
  var L=['en','es','de','zh'];
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function localPath(v,fallback){
    v=String(v||'');
    return /^\/(?!\/)[A-Za-z0-9._~!$&()*+,;=:@/%-]*$/.test(v)?v:fallback;
  }
  function sitePath(v){
    var p=String(location.pathname||'/'),marker='/blog/',i=p.indexOf(marker),base='';
    if(i>=0)base=p.slice(0,i);
    else if(/\/blog\/?$/.test(p))base=p.replace(/\/blog\/?$/,'');
    return base+String(v||'');
  }
  function driveId(v){v=String(v||'');return /^[A-Za-z0-9_-]{10,}$/.test(v)?v:null;}
  function youtubeId(v){v=String(v||'');return /^[A-Za-z0-9_-]{11}$/.test(v)?v:null;}
  function ml(value){
    if(value==null)return '';
    if(typeof value==='string')return esc(value);
    return L.map(function(lang){return '<span class="lang-'+lang+'">'+esc(value[lang]||value.en||'')+'</span>';}).join('');
  }
  function bodyHtml(value){
    if(value==null)return '';
    if(typeof value==='string')value={en:value,es:value,de:value,zh:value};
    var paragraphs={},count=0;
    L.forEach(function(lang){paragraphs[lang]=String(value[lang]||value.en||'').split('\n').filter(function(line){return line.trim();});count=Math.max(count,paragraphs[lang].length);});
    var html='';
    for(var i=0;i<count;i++)html+='<p>'+L.map(function(lang){return '<span class="lang-'+lang+'">'+esc(paragraphs[lang][i]||'')+'</span>';}).join('')+'</p>';
    return html;
  }
  function media(post){
    var html='';
    var images=(post.images||[]).map(driveId).filter(Boolean);
    if(images.length){
      html+='<div class="pgallery">'+images.map(function(id){return '<a href="https://drive.google.com/file/d/'+id+'/view" target="_blank" rel="noopener"><img loading="lazy" src="https://drive.google.com/thumbnail?id='+id+'&sz=w1600" alt="" /></a>';}).join('')+'</div>';
    }
    var youtube=youtubeId(post.youtube),video=driveId(post.video);
    if(youtube)html+='<div class="pvideo"><iframe src="https://www.youtube.com/embed/'+youtube+'" title="video" allowfullscreen loading="lazy"></iframe></div>';
    else if(video)html+='<div class="pvideo"><iframe src="https://drive.google.com/file/d/'+video+'/preview" title="video" allow="autoplay" allowfullscreen loading="lazy"></iframe></div>';
    return html;
  }
  function card(post,featured){
    return '<article class="post'+(featured?' post-feat':'')+'">'+
      '<div class="pmeta"><span class="pdate">'+ml(post.dateLabel||post.date)+'</span>'+(post.category?'<span class="pcat">'+ml(post.category)+'</span>':'')+'</div>'+
      '<h3>'+ml(post.title)+'</h3>'+bodyHtml(post.body)+media(post)+(post.link?'<a class="plink" href="'+sitePath(localPath(post.link.url,'/blog'))+'">'+ml(post.link.label)+' &rarr;</a>':'')+'</article>';
  }
  var posts=(window.PRIMO_POSTS||[]).slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));});
  if(!posts.length){var empty=document.getElementById('bempty');if(empty)empty.style.display='block';return;}
  var featured=posts.filter(function(post){return post.featured;});
  var featuredElement=document.getElementById('bf'),timelineElement=document.getElementById('bt');
  if(featured.length&&featuredElement){
    featuredElement.innerHTML='<h3 class="subhead"><span class="lang-en">Featured</span><span class="lang-es">Destacados</span><span class="lang-de">Highlights</span><span class="lang-zh">精选</span></h3><div class="feat-grid">'+featured.map(function(post){return card(post,true);}).join('')+'</div>';
  }
  var html='<h3 class="subhead" style="margin-top:34px"><span class="lang-en">Timeline</span><span class="lang-es">Línea de tiempo</span><span class="lang-de">Zeitleiste</span><span class="lang-zh">时间线</span></h3>',currentYear=null;
  posts.forEach(function(post){
    var year=String(post.date||'').slice(0,4)||'—';
    if(year!==currentYear){currentYear=year;html+='<div class="tl-year">'+esc(year)+'</div>';}
    html+='<div class="tl-item">'+card(post,false)+'</div>';
  });
  if(timelineElement)timelineElement.innerHTML=html;
})();
