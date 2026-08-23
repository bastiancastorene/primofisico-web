(function(){
  'use strict';
  if(!document.body.classList.contains('pf-saber-post')||document.querySelector('.pf-space-anemone'))return;
  var background=document.createElement('div');
  background.className='pf-space-anemone';
  background.setAttribute('aria-hidden','true');
  var count=document.body.classList.contains('pf-saber-hub')?4:3;
  for(var formIndex=1;formIndex<=count;formIndex++){
    var form=document.createElement('div');
    form.className='pf-anemone-form pf-anemone-form--'+formIndex;
    var core=document.createElement('span');
    core.className='pf-anemone-core';
    var filaments=document.createElement('span');
    filaments.className='pf-anemone-filaments';
    for(var filamentIndex=0;filamentIndex<12;filamentIndex++){
      var filament=document.createElement('i');
      filament.className='pf-anemone-filament';
      var upper=document.createElement('span');
      upper.className='pf-anemone-segment pf-anemone-segment--upper';
      var middle=document.createElement('span');
      middle.className='pf-anemone-segment pf-anemone-segment--middle';
      var tip=document.createElement('span');
      tip.className='pf-anemone-segment pf-anemone-segment--tip';
      middle.appendChild(tip);
      upper.appendChild(middle);
      filament.appendChild(upper);
      filaments.appendChild(filament);
    }
    form.appendChild(core);
    form.appendChild(filaments);
    background.appendChild(form);
  }
  document.body.insertBefore(background,document.body.firstChild);
})();
