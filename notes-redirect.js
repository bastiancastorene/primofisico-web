/* notes-lectures.html y notes-teaching.html son fuentes de datos heredadas que
   la portada y las subpáginas de material leen con fetch(). Quien las abre
   directamente llega a la página de material equivalente, conservando el ancla. */
(function(){
  var script=document.currentScript,target=script&&script.getAttribute('data-target');
  if(!target)return;
  location.replace(new URL(target,location.href).pathname+location.hash);
})();
