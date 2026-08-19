(function(){
  'use strict';
  document.querySelectorAll('.dochead').forEach(function(head){
    head.addEventListener('click',function(event){
      var item=head.parentNode;
      if(!item.classList.contains('open')){
        document.querySelectorAll('.docitem.open').forEach(function(open){if(open!==item)open.classList.remove('open');});
        item.classList.add('open');
      }else if(event.target.closest('.docchev')){
        item.classList.remove('open');
      }else{
        window.open(head.getAttribute('data-url'),'_blank','noopener,noreferrer');
      }
    });
  });
})();
