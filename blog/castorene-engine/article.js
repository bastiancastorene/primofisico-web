(function(){
  'use strict';
  function localizeImages(){
    var lang=document.documentElement.getAttribute('data-lang')||'en';
    document.querySelectorAll('img[data-alt-en]').forEach(function(img){
      img.alt=img.getAttribute('data-alt-'+lang)||img.getAttribute('data-alt-en');
    });
  }
  localizeImages();
  new MutationObserver(localizeImages).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
})();
