(function(){
  'use strict';

  var CONFIG={
    supabaseUrl:'https://psluzxnfcqmmafjirxbp.supabase.co',
    supabaseKey:'sb_publishable_QPW52g9giKeHRr8z58vylA_3WXy-XKU',
    turnstileSiteKey:'0x4AAAAAAEI1QXmhqZz90ORh'
  };
  var LANGS=['en','es','de','zh'];
  var INTERACTION_POSTS={
    'black-hole-temperature':{
      prompt:{en:'What surprised you most about the thermal future of black holes?',es:'¿Qué te sorprendió más sobre el futuro térmico de los agujeros negros?',de:'Was hat dich an der thermischen Zukunft Schwarzer Löcher am meisten überrascht?',zh:'黑洞的热学未来最让你惊讶的是什么？'},
      topic:{en:'Hawking temperature and the thermal future of black holes',es:'la temperatura de Hawking y el futuro térmico de los agujeros negros',de:'der Hawking-Temperatur und der thermischen Zukunft Schwarzer Löcher',zh:'霍金温度与黑洞的热学未来'}
    },
    'saber-terremoto-lento':{
      prompt:{en:'What surprised you most about earthquakes that unfold over weeks?',es:'¿Qué te sorprendió más de los terremotos que se desarrollan durante semanas?',de:'Was hat dich an Erdbeben, die sich über Wochen entwickeln, am meisten überrascht?',zh:'持续数周发生的地震最让你惊讶的是什么？'},
      topic:{en:'slow earthquakes',es:'los terremotos lentos',de:'langsamen Erdbeben',zh:'慢地震'}
    },
    'saber-historia-del-pasaporte':{
      prompt:{en:'What detail surprised you most in the history of the passport?',es:'¿Qué detalle te sorprendió más en la historia del pasaporte?',de:'Welches Detail aus der Geschichte des Reisepasses hat dich am meisten überrascht?',zh:'护照历史中的哪个细节最让你惊讶？'},
      topic:{en:'the history of the passport',es:'la historia del pasaporte',de:'der Geschichte des Reisepasses',zh:'护照的历史'}
    },
    'klein-graphene':{
      pdfs:[
        {url:'https://drive.google.com/file/d/1ysdlE7V_DQ7UbNNmKfbX21Pq2dYHiiYJ/view',label:{en:'Detailed calculations · ES',es:'Cálculos detallados · ES',de:'Detaillierte Berechnungen · ES',zh:'详细计算 · ES'}},
        {url:'https://drive.google.com/file/d/1xPux2-iLG_lnvq37vasp03rS8oB1LzKs/view',label:{en:'Detailed calculations · EN',es:'Cálculos detallados · EN',de:'Detaillierte Berechnungen · EN',zh:'详细计算 · EN'}}
      ],
      prompt:{en:'What do you think about graphene transmitting carriers through a barrier that should stop them?',es:'¿Qué te parece que el grafeno transmita portadores a través de una barrera que debería detenerlos?',de:'Was hältst du davon, dass Graphen Ladungsträger durch eine Barriere überträgt, die sie aufhalten sollte?',zh:'你怎么看石墨烯让载流子穿过本应阻挡它们的势垒？'},
      topic:{en:'Klein tunnelling in graphene',es:'el túnel de Klein en grafeno',de:'dem Klein-Tunneln in Graphen',zh:'石墨烯中的克莱因隧穿'}
    },
    'spin-hall':{
      pdf:{en:'https://drive.google.com/file/d/1odKwLHW0-gKvbHgWKHLwOMhD8mTJmdw0/view',es:'https://drive.google.com/file/d/1FFhmc-BwCRj86FGWwTmc1BxuLeiAJsEx/view',de:'https://drive.google.com/file/d/1odKwLHW0-gKvbHgWKHLwOMhD8mTJmdw0/view',zh:'https://drive.google.com/file/d/1odKwLHW0-gKvbHgWKHLwOMhD8mTJmdw0/view'},
      prompt:{en:'What do you think about a current that separates spin without needing a temperature difference?',es:'¿Qué te parece que una corriente pueda separar espines sin necesitar una diferencia de temperatura?',de:'Was hältst du davon, dass ein Strom Spins ohne Temperaturunterschied trennen kann?',zh:'你怎么看待电流无需温差就能分离自旋这一现象？'},
      topic:{en:'the spin Hall effect',es:'el efecto Hall de espín',de:'dem Spin-Hall-Effekt',zh:'自旋霍尔效应'}
    },
    'liquid-helium':{
      pdf:{en:'https://drive.google.com/file/d/1gDYiAgRAIQI_ZyNnihwKJj1nUJUOfthy/view',es:'https://drive.google.com/file/d/1Tb5N4O9QqGI6vcG0pdrRpb7_jlmYbqrG/view',de:'https://drive.google.com/file/d/1gDYiAgRAIQI_ZyNnihwKJj1nUJUOfthy/view',zh:'https://drive.google.com/file/d/1gDYiAgRAIQI_ZyNnihwKJj1nUJUOfthy/view'},
      prompt:{en:'What surprises you most about helium remaining liquid and becoming superfluid?',es:'¿Qué te sorprende más de que el helio siga líquido y se vuelva superfluido?',de:'Was überrascht dich am meisten daran, dass Helium flüssig bleibt und suprafluid wird?',zh:'氦保持液态并转变为超流体，最令你惊讶的是什么？'},
      topic:{en:'superfluid helium and the lambda point',es:'el helio superfluido y el punto lambda',de:'suprafluidem Helium und dem Lambda-Punkt',zh:'超流氦与λ点'}
    },
    'butterfly':{
      pdf:{en:'https://arxiv.org/pdf/2603.07424',es:'https://arxiv.org/pdf/2603.07424',de:'https://arxiv.org/pdf/2603.07424',zh:'https://arxiv.org/pdf/2603.07424'},
      prompt:{en:'What do you think about making a quantum fractal visible through heat?',es:'¿Qué te parece que un fractal cuántico pueda hacerse visible mediante el calor?',de:'Was hältst du davon, ein Quantenfraktal durch Wärme sichtbar zu machen?',zh:'你怎么看通过热来显现量子分形这一想法？'},
      topic:{en:'the Hofstadter butterfly and its thermal signatures',es:'la mariposa de Hofstadter y sus señales térmicas',de:'dem Hofstadter-Schmetterling und seinen thermischen Signaturen',zh:'霍夫施塔特蝴蝶及其热学信号'}
    },
    'surface-charge':{
      pdf:{en:'https://drive.google.com/file/d/1HmcMaQ-ITQfDhdjRfdzgmkgxe2ErKwLJ/view',es:'https://drive.google.com/file/d/1HmcMaQ-ITQfDhdjRfdzgmkgxe2ErKwLJ/view',de:'https://drive.google.com/file/d/1HmcMaQ-ITQfDhdjRfdzgmkgxe2ErKwLJ/view',zh:'https://drive.google.com/file/d/1HmcMaQ-ITQfDhdjRfdzgmkgxe2ErKwLJ/view'},
      prompt:{en:'Did it change how you picture the surface charge of a conductor?',es:'¿Cambió tu forma de imaginar la carga superficial de un conductor?',de:'Hat sich dadurch deine Vorstellung von der Oberflächenladung eines Leiters verändert?',zh:'这是否改变了你对导体表面电荷的理解？'},
      topic:{en:'charge distribution in a conductor',es:'la distribución de carga en un conductor',de:'der Ladungsverteilung in einem Leiter',zh:'导体中的电荷分布'}
    },
    'paper-3qubits':{
      pdf:{en:'https://arxiv.org/pdf/2410.16133',es:'https://arxiv.org/pdf/2410.16133',de:'https://arxiv.org/pdf/2410.16133',zh:'https://arxiv.org/pdf/2410.16133'},
      prompt:{en:'What do you make of a qubit acquiring an effective temperature purely from entanglement?',es:'¿Qué te parece que un qubit adquiera una temperatura efectiva solo por entrelazamiento?',de:'Was hältst du davon, dass ein Qubit allein durch Verschränkung eine effektive Temperatur erhält?',zh:'你怎么看量子比特仅因纠缠就获得有效温度？'},
      topic:{en:'entanglement temperature in three qubits',es:'la temperatura de entrelazamiento en tres qubits',de:'der Verschränkungstemperatur bei drei Qubits',zh:'三个量子比特中的纠缠温度'}
    },
    'paper-entropy-ising':{
      pdf:{en:'/Castorene_2026_Entropy_Ising.pdf',es:'/Castorene_2026_Entropy_Ising.pdf',de:'/Castorene_2026_Entropy_Ising.pdf',zh:'/Castorene_2026_Entropy_Ising.pdf'},
      prompt:{en:'What do you make of a quantum chain that counts in Fibonacci?',es:'¿Qué te parece que una cadena cuántica cuente en Fibonacci?',de:'Was hältst du davon, dass eine Quantenkette in Fibonacci zählt?',zh:'你怎么看一条量子链用斐波那契数列“计数”？'},
      topic:{en:'the Ising model and its connection to Fibonacci',es:'el modelo de Ising y su relación con Fibonacci',de:'dem Ising-Modell und seiner Verbindung zu Fibonacci',zh:'伊辛模型及其与斐波那契数列的联系'}
    }
  };
  var PUBLICATIONS={
    'Exact Combinatorial Density of States for the Critical 1D Ising Model':'ising-dos',
    'Thermal Hofstadter Butterflies':'hofstadter',
    'Caloric phenomena and Stirling-cycle performance in Heisenberg–Kitaev magnon systems':'heisenberg-kitaev',
    'Reaching maximum efficiency in quantum Stirling engines using multilayer graphene':'graphene-stirling',
    'Quantum Level-Crossing Induced by Anisotropy in Spin-1 Heisenberg Dimers: Applications to Quantum Stirling Engines':'spin1-level-crossing',
    'Entropy, entanglement, and susceptibility of three qubits near quantum criticality':'three-qubit-criticality',
    'Ratio between Seebeck coefficient and entropy per particle as a tool for elementary charge determination':'seebeck-entropy',
    'Effects of magnetic anisotropy on three-qubit antiferromagnetic thermal machines':'three-qubit-machines',
    'Magnetic Stirling Cycle for Qubits with Anisotropy near the Quantum Critical Point':'magnetic-stirling',
    'Equilibrium Thermodynamics of Non-Hermitian Dirac Fermions: Caloric and Magnetic Responses':'nh-dirac',
    'Entropy-weighted Berry curvature: A geometric diagnostic for bosonic topological transitions':'entropy-berry',
    'Coupling-response thermodynamic density of states for bosonic working media':'coupling-tdos',
    'Fundamental Work Scaling and Non-Extensivity in Critical Quantum Stirling Engines':'work-scaling'
  };
  var TEXT={
    calculations:{en:'Detailed calculations',es:'Cálculos detallados',de:'Detaillierte Berechnungen',zh:'详细计算'},
    like:{en:'Like',es:'Me gusta',de:'Gefällt mir',zh:'赞'},
    dislike:{en:'Dislike',es:'No me gusta',de:'Gefällt mir nicht',zh:'不赞'},
    share:{en:'Share',es:'Compartir',de:'Teilen',zh:'分享'},
    views:{en:'Views',es:'Visualizaciones',de:'Aufrufe',zh:'浏览'},
    copy:{en:'Copy link',es:'Copiar enlace',de:'Link kopieren',zh:'复制链接'},
    copied:{en:'Link copied',es:'Enlace copiado',de:'Link kopiert',zh:'链接已复制'},
    discussion:{en:'Discussion',es:'Discusión',de:'Diskussion',zh:'讨论'},
    commentHint:{en:'Leave your question, comment or opinion below.',es:'Deja abajo tu pregunta, comentario u opinión.',de:'Hinterlasse unten deine Frage, deinen Kommentar oder deine Meinung.',zh:'欢迎在下方留下问题、评论或看法。'},
    materialPrompt:{en:'Questions or comments about this material?',es:'¿Tienes preguntas o comentarios sobre este material?',de:'Fragen oder Kommentare zu diesem Material?',zh:'对这份资料有问题或评论吗？'},
    name:{en:'Optional name · blank = Anonymous',es:'Nombre opcional · vacío = Anónimo',de:'Name optional · leer = Anonym',zh:'姓名可选 · 留空则匿名'},
    comment:{en:'Write your comment or opinion',es:'Escribe tu comentario u opinión',de:'Schreibe deinen Kommentar oder deine Meinung',zh:'写下你的评论或看法'},
    send:{en:'Send for review',es:'Enviar a revisión',de:'Zur Prüfung senden',zh:'提交审核'},
    moderation:{en:'Comments are published after moderation. Your name is optional.',es:'Los comentarios se publican después de moderación. El nombre es opcional.',de:'Kommentare erscheinen nach der Moderation. Der Name ist optional.',zh:'评论经审核后发布，姓名可不填。'},
    empty:{en:'No approved comments yet. You can start the discussion.',es:'Aún no hay comentarios aprobados. Puedes iniciar la conversación.',de:'Noch keine freigegebenen Kommentare. Du kannst die Diskussion beginnen.',zh:'暂时没有已审核评论，你可以开启讨论。'},
    anonymous:{en:'Anonymous',es:'Anónimo',de:'Anonym',zh:'匿名'},
    pending:{en:'Your comment was received and will appear after review.',es:'Tu comentario fue recibido y aparecerá después de su revisión.',de:'Dein Kommentar wurde empfangen und erscheint nach der Prüfung.',zh:'你的评论已收到，将在审核后显示。'},
    failed:{en:'The interaction could not be saved. Please try again.',es:'No se pudo guardar la interacción. Inténtalo nuevamente.',de:'Die Interaktion konnte nicht gespeichert werden. Bitte versuche es erneut.',zh:'无法保存此次操作，请重试。'},
    verifyTitle:{en:'Brief verification',es:'Verificación breve',de:'Kurze Überprüfung',zh:'简短验证'},
    verifyBody:{en:'Complete this simple check once to react or comment.',es:'Completa una vez esta verificación simple para reaccionar o comentar.',de:'Schließe diese einfache Prüfung einmal ab, um zu reagieren oder zu kommentieren.',zh:'完成一次简单验证后即可回应或评论。'},
    close:{en:'Close',es:'Cerrar',de:'Schließen',zh:'关闭'}
  };

  var client=null, state={}, gate={pending:null,widget:null};
  function lang(){var l=document.documentElement.getAttribute('data-lang')||'en';return LANGS.indexOf(l)>-1?l:'en';}
  function tx(o){return (o&&o[lang()])||(o&&o.en)||'';}
  function ml(o){return LANGS.map(function(l){return '<span class="lang-'+l+'">'+escapeHtml(o[l]||o.en||'')+'</span>';}).join('');}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function icon(type){
    if(type==='like')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.3 4.2 13.6A5.5 5.5 0 0 1 12 5.8a5.5 5.5 0 0 1 7.8 7.8Z"/></svg>';
    if(type==='dislike')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 14v6a2 2 0 0 1-2 2l-3-7H5a2 2 0 0 1-2-2l2-8a2 2 0 0 1 2-2h10v11Zm0-11h4v11h-4"/></svg>';
    if(type==='views')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg>';
  }
  function reactionButtons(id,compact){return '<div class="reaction-pair" data-reactions="'+id+'">'+
    '<button class="action-btn react-like'+(compact?' compact':'')+'" type="button" data-reaction="1" data-post="'+id+'" aria-label="'+escapeHtml(tx(TEXT.like))+'" aria-pressed="false">'+icon('like')+'<span class="like-count">0</span></button>'+
    '<button class="action-btn react-dislike'+(compact?' compact':'')+'" type="button" data-reaction="-1" data-post="'+id+'" aria-label="'+escapeHtml(tx(TEXT.dislike))+'" aria-pressed="false">'+icon('dislike')+'<span class="dislike-count">0</span></button></div>';}
  function viewCount(id,compact){return '<span class="action-btn view-stat'+(compact?' compact':'')+'" data-views="'+id+'" role="status" aria-label="'+escapeHtml(tx(TEXT.views))+': 0">'+icon('views')+'<span class="views-count">0</span></span>';}
  function pdfEntries(post){
    if(!post)return [];
    if(Array.isArray(post.pdfs))return post.pdfs.map(function(entry){return typeof entry==='string'?{url:entry,label:TEXT.calculations}:entry;}).filter(function(entry){return entry&&entry.url;});
    return post.pdf?[{url:post.pdf,label:TEXT.calculations}]:[];
  }
  function localized(value){return typeof value==='string'?value:tx(value);}
  function pdfAnchor(id,entry,index){var label=entry.label||TEXT.calculations;return '<a class="action-btn pdf-tech" data-pdf-post="'+id+'" data-pdf-index="'+index+'" href="'+escapeHtml(localized(entry.url))+'" target="_blank" rel="noopener" aria-label="'+escapeHtml(tx(label))+'">'+
    '<svg class="pdf-sparks" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><rect class="pdf-ring" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/><rect class="pdf-spark spark-3" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/><rect class="pdf-spark spark-2" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/><rect class="pdf-spark" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/></svg><span class="pdf-arrow pdf-arrow-in" aria-hidden="true">⟶</span>'+ml(label)+'<span class="pdf-arrow pdf-arrow-out" aria-hidden="true">⟵</span></a>';}
  function pdfChoice(id,entry,index){var label=entry.label||TEXT.calculations;return '<a class="pdf-choice" data-pdf-post="'+id+'" data-pdf-index="'+index+'" href="'+escapeHtml(localized(entry.url))+'" target="_blank" rel="noopener" aria-label="'+escapeHtml(tx(label))+'"><span aria-hidden="true">↓</span>'+ml(label)+'</a>';}
  function pdfButton(id){var entries=pdfEntries(INTERACTION_POSTS[id]);if(!entries.length)return '';if(entries.length===1)return pdfAnchor(id,entries[0],0);return '<div class="pdf-links pdf-menu-wrap" data-pdf-count="'+entries.length+'"><button class="action-btn pdf-tech pdf-menu-toggle" type="button" data-pdf-toggle="'+id+'" aria-expanded="false" aria-haspopup="menu">'+
    '<svg class="pdf-sparks" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><rect class="pdf-ring" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/><rect class="pdf-spark spark-3" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/><rect class="pdf-spark spark-2" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/><rect class="pdf-spark" x="1.5" y="1.5" width="97" height="27" rx="13.5" pathLength="100"/></svg><span class="pdf-arrow pdf-arrow-in" aria-hidden="true">⟶</span>'+ml(TEXT.calculations)+'<span class="pdf-arrow pdf-arrow-out" aria-hidden="true">⟵</span></button><div class="pdf-menu" data-pdf-menu="'+id+'" role="menu">'+entries.map(function(entry,index){return pdfChoice(id,entry,index);}).join('')+'</div></div>';}
  function shareBlock(id,url,title){return '<div class="share-wrap"'+(url?' data-share-url="'+escapeHtml(url)+'"':'')+(title?' data-share-title="'+escapeHtml(title)+'"':'')+'><button class="action-btn share-toggle" type="button" data-share-toggle="'+id+'" aria-expanded="false">'+icon('share')+ml(TEXT.share)+'</button><div class="share-menu" data-share-menu="'+id+'">'+
    '<a data-share="whatsapp" href="#">WhatsApp</a><button data-share="instagram" type="button">Instagram</button><a data-share="linkedin" href="#">LinkedIn</a><a data-share="x" href="#">X / Twitter</a><a data-share="facebook" href="#">Facebook</a><a data-share="email" href="#">'+ml({en:'Email',es:'Correo',de:'E-Mail',zh:'电子邮件'})+'</a><button data-share="copy" type="button">'+ml(TEXT.copy)+'</button></div></div>';}
  function signoff(p){return LANGS.reduce(function(out,l){var lead={en:'Had you heard about ',es:'¿Habías escuchado antes sobre ',de:'Hattest du schon von ',zh:'你以前听说过'}[l];var tail={en:' before? Leave your opinion below and, if you wish, suggest a topic for a future post.',es:'? Deja tu comentario abajo con tu opinión o, si deseas, sugiere un tema para un próximo post.',de:' gehört? Hinterlasse unten deine Meinung oder schlage ein Thema für einen künftigen Beitrag vor.',zh:'吗？欢迎在下方分享看法，也可以建议下一篇文章讨论的主题。'}[l];var thanks={en:'Thank you for reading. May the Force be with you.',es:'Gracias por leerme. Que la Fuerza te acompañe.',de:'Danke fürs Lesen. Möge die Macht mit dir sein.',zh:'感谢阅读。愿原力与你同在。'}[l];return out+'<span class="lang-'+l+'">'+escapeHtml(lead+p.topic[l]+tail)+'<b>'+escapeHtml(thanks)+'</b></span>';},'');}
  function interactionPanel(id){var p=INTERACTION_POSTS[id];return '<aside class="blog-interactions" id="discussion" data-post-panel="'+id+'">'+
    '<div class="article-actions">'+pdfButton(id)+reactionButtons(id,false)+viewCount(id,false)+shareBlock(id)+'</div>'+
    '<p class="discussion-prompt"><b>'+ml(p.prompt)+'</b> '+ml(TEXT.commentHint)+'</p>'+
    '<div class="engagement-head"><h2>'+ml(TEXT.discussion)+'</h2></div><div class="comments" data-comments="'+id+'"><p class="comments-empty">'+ml(TEXT.empty)+'</p></div>'+
    '<form class="comment-form" data-comment-form="'+id+'"><label><span class="sr-only">'+ml(TEXT.name)+'</span><input name="display_name" maxlength="40" autocomplete="name" placeholder="'+escapeHtml(tx(TEXT.name))+'" /></label><label><span class="sr-only">'+ml(TEXT.comment)+'</span><textarea name="body" minlength="3" maxlength="700" required placeholder="'+escapeHtml(tx(TEXT.comment))+'"></textarea></label><button class="btn btn-primary" type="submit">'+ml(TEXT.send)+'</button><p class="form-status" aria-live="polite"></p></form>'+
    '<p class="reader-signoff">'+signoff(p)+'</p><p class="privacy-note">'+ml(TEXT.moderation)+'</p></aside>';}
  function materialDiscussion(id){return '<section class="material-discussion" data-material-discussion="'+id+'"><p class="material-comment-prompt"><b>'+ml(TEXT.materialPrompt)+'</b> '+ml(TEXT.commentHint)+'</p><div class="engagement-head"><h3>'+ml(TEXT.discussion)+'</h3></div><div class="comments" data-comments="'+id+'"><p class="comments-empty">'+ml(TEXT.empty)+'</p></div><form class="comment-form" data-comment-form="'+id+'"><label><span class="sr-only">'+ml(TEXT.name)+'</span><input name="display_name" maxlength="40" autocomplete="name" placeholder="'+escapeHtml(tx(TEXT.name))+'" /></label><label><span class="sr-only">'+ml(TEXT.comment)+'</span><textarea name="body" minlength="3" maxlength="700" required placeholder="'+escapeHtml(tx(TEXT.comment))+'"></textarea></label><button class="btn btn-primary" type="submit">'+ml(TEXT.send)+'</button><p class="form-status" aria-live="polite"></p></form><p class="privacy-note">'+ml(TEXT.moderation)+'</p></section>';}

  function postIdFromPath(path){var value=String(path||location.pathname),m=value.match(/(?:^|\/)blog\/([^/?#]+?)(?:\.html)?\/?(?:[?#].*)?$/);if(m&&INTERACTION_POSTS[m[1]])return m[1];m=value.match(/(?:^|\/)saber\/([^/?#]+?)\/?(?:[?#].*)?$/);var saberId=m&&('saber-'+m[1]);return saberId&&INTERACTION_POSTS[saberId]?saberId:null;}
  function installIndividual(){var id=postIdFromPath();if(!id)return null;if(id.indexOf('saber-')===0){var byline=document.querySelector('.pf-saber-byline');if(byline&&!document.querySelector('.saber-top-actions'))byline.insertAdjacentHTML('afterend','<div class="top-post-actions saber-top-actions">'+reactionButtons(id,false)+viewCount(id,false)+shareBlock(id,location.pathname,document.title)+'</div>');return id;}var meta=document.querySelector('.papermeta');if(meta&&!document.querySelector('.top-post-actions'))meta.insertAdjacentHTML('afterend','<div class="top-post-actions">'+pdfButton(id)+reactionButtons(id,false)+viewCount(id,false)+shareBlock(id)+'</div>');var aidisc=document.querySelector('.aidisc');if(aidisc)aidisc.insertAdjacentHTML('beforebegin',interactionPanel(id));return id;}
  function installPreviews(){document.querySelectorAll('#bf article.post,#bt article.post,#saber-feed article.pf-saber-post-card').forEach(function(card){var link=card.querySelector('.plink');var id=link&&postIdFromPath(link.getAttribute('href'));if(!id||card.querySelector('.preview-actions'))return;card.insertAdjacentHTML('beforeend','<div class="preview-actions"></div>');var actions=card.querySelector('.preview-actions');actions.appendChild(link);actions.insertAdjacentHTML('beforeend',pdfButton(id)+reactionButtons(id,true)+viewCount(id,true)+shareBlock(id,link.getAttribute('href'),((card.querySelector('h3')||{}).textContent||document.title).trim()));});}
  function installSaberHubPreviews(){document.querySelectorAll('#saber-posts article.pf-saber-card').forEach(function(card){var link=card.firstElementChild&&card.firstElementChild.tagName==='A'?card.firstElementChild:null,title=card.querySelector('h2'),id=link&&postIdFromPath(link.getAttribute('href'));if(!id||card.querySelector('.saber-card-actions'))return;card.insertAdjacentHTML('beforeend','<div class="saber-card-actions">'+reactionButtons(id,true)+viewCount(id,true)+shareBlock(id,link.getAttribute('href'),(title&&title.textContent||document.title).trim())+'</div>');});}
  function observeDynamicPreviews(){if(!window.MutationObserver)return;var timer=0,observer=new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(function(){installPreviews();loadVisible();},0);});document.querySelectorAll('#saber-feed,#bt,#bf').forEach(function(feed){observer.observe(feed,{childList:true});});}
  function installPublications(){document.querySelectorAll('.pub').forEach(function(card){var title=((card.querySelector('h3')||{}).textContent||'').trim(),slug=PUBLICATIONS[title],id=slug&&('pub-'+slug);if(!id||card.querySelector('.publication-actions'))return;card.id='paper-'+slug;card.dataset.paperId=id;card.insertAdjacentHTML('beforeend','<div class="publication-actions">'+reactionButtons(id,true)+shareBlock(id,'/publications#'+card.id,title)+'</div>');});}
  function stableHash(value){var h=2166136261;for(var i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
  function installMaterials(){document.querySelectorAll('.docitem').forEach(function(card){var head=card.querySelector('.dochead'),url=head&&head.dataset.url;if(!url)return;var id='mat-'+stableHash(url),anchor='material-'+id.slice(4),title=((card.querySelector('.doctitle .lang-en')||card.querySelector('.doctitle')||{}).textContent||document.title).trim(),path=location.pathname.replace(/\.html$/,'');card.id=anchor;card.dataset.materialId=id;if(!card.querySelector('.material-actions'))head.insertAdjacentHTML('afterend','<div class="material-actions">'+reactionButtons(id,true)+shareBlock(id,path+'#'+anchor,title)+'</div>');var summary=card.querySelector('.docsum');if(summary&&!card.querySelector('.material-discussion'))summary.insertAdjacentHTML('beforeend',materialDiscussion(id));});}
  function installGate(){document.body.insertAdjacentHTML('beforeend','<div class="captcha-gate" hidden><div class="captcha-card" role="dialog" aria-modal="true" aria-labelledby="captcha-title"><button class="captcha-close" type="button" aria-label="'+escapeHtml(tx(TEXT.close))+'">×</button><h2 id="captcha-title">'+ml(TEXT.verifyTitle)+'</h2><p>'+ml(TEXT.verifyBody)+'</p><div id="turnstile-box"></div><p class="captcha-status" aria-live="polite"></p></div></div>');document.querySelector('.captcha-close').addEventListener('click',closeGate);}
  function closeGate(){var el=document.querySelector('.captcha-gate');if(el)el.hidden=true;gate.pending=null;}
  function openGate(next){gate.pending=next;var el=document.querySelector('.captcha-gate');if(el)el.hidden=false;renderTurnstile();}
  function renderTurnstile(){if(gate.widget!==null||!window.turnstile||CONFIG.turnstileSiteKey.indexOf('__')===0)return;gate.widget=window.turnstile.render('#turnstile-box',{sitekey:CONFIG.turnstileSiteKey,theme:'auto',language:'auto',size:'flexible','response-field':false,'refresh-expired':'auto',callback:captchaPassed,'error-callback':function(){showGateError();}});}
  function showGateError(){var el=document.querySelector('.captcha-status');if(el)el.textContent=tx(TEXT.failed);}
  async function captchaPassed(token){var result=await client.auth.signInAnonymously({options:{captchaToken:token}});if(result.error){showGateError();if(window.turnstile&&gate.widget!==null)window.turnstile.reset(gate.widget);return;}var next=gate.pending;gate.pending=null;var el=document.querySelector('.captcha-gate');if(el)el.hidden=true;if(next)next();}
  async function withAuth(next){if(!client){showAllErrors();return;}var got=await client.auth.getSession();if(got.data&&got.data.session){next();return;}openGate(next);}
  function showAllErrors(){document.querySelectorAll('.form-status').forEach(function(el){el.textContent=tx(TEXT.failed);});}

  async function load(ids){if(!client||!ids.length)return;var result=await client.rpc('get_blog_interactions',{p_post_ids:ids});if(result.error)return;result.data.forEach(function(row){state[row.post_id]={likes:Number(row.likes)||0,dislikes:Number(row.dislikes)||0,views:Number(row.views)||0,reaction:Number(row.user_reaction)||0,comments:Array.isArray(row.comments)?row.comments:[]};paint(row.post_id);renderComments(row.post_id);});}
  function paint(id){var s=state[id]||{likes:0,dislikes:0,views:0,reaction:0};document.querySelectorAll('[data-reactions="'+id+'"]').forEach(function(box){var like=box.querySelector('.react-like'),dislike=box.querySelector('.react-dislike');box.querySelector('.like-count').textContent=s.likes;box.querySelector('.dislike-count').textContent=s.dislikes;like.classList.toggle('selected',s.reaction===1);dislike.classList.toggle('selected',s.reaction===-1);like.setAttribute('aria-pressed',String(s.reaction===1));dislike.setAttribute('aria-pressed',String(s.reaction===-1));});document.querySelectorAll('[data-views="'+id+'"]').forEach(function(box){box.querySelector('.views-count').textContent=s.views;box.setAttribute('aria-label',tx(TEXT.views)+': '+s.views);});}
  function visibleIds(){return Array.from(document.querySelectorAll('[data-reactions]')).map(function(el){return el.dataset.reactions;}).filter(function(id,i,all){return all.indexOf(id)===i;});}
  function loadVisible(){load(visibleIds());}
  function viewerToken(){var key='pf-viewer-id',raw='';try{raw=localStorage.getItem(key)||'';if(!/^[0-9a-f-]{36}$/i.test(raw)){raw=window.crypto&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random();localStorage.setItem(key,raw);}}catch(e){raw='session-'+Math.random();}return raw;}
  async function viewerHash(){if(!window.crypto||!crypto.subtle)return null;var bytes=new TextEncoder().encode(viewerToken()),digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');}
  async function recordView(id){if(!client||!id)return;var hash=await viewerHash();if(!hash)return;var result=await client.rpc('record_blog_view',{p_post_id:id,p_viewer_hash:hash});if(result.error)return;await load([id]);}
  function renderComments(id){var box=document.querySelector('[data-comments="'+id+'"]');if(!box)return;var comments=(state[id]&&state[id].comments)||[];box.textContent='';if(!comments.length){box.innerHTML='<p class="comments-empty">'+ml(TEXT.empty)+'</p>';return;}comments.forEach(function(c){var item=document.createElement('article');item.className='comment';var head=document.createElement('div');head.className='comment-head';var author=document.createElement('span');author.className='comment-author';author.textContent=c.name||tx(TEXT.anonymous);var time=document.createElement('time');time.className='comment-time';time.dateTime=c.created_at;try{time.textContent=new Intl.DateTimeFormat(document.documentElement.lang||lang(),{dateStyle:'medium'}).format(new Date(c.created_at));}catch(e){time.textContent='';}var body=document.createElement('p');body.textContent=c.body;head.append(author,time);item.append(head,body);box.appendChild(item);});}
  async function saveReaction(id,wanted){var old=(state[id]&&state[id].reaction)||0;var next=old===wanted?0:wanted;var result=await client.rpc('set_blog_reaction',{p_post_id:id,p_reaction:next});if(result.error){showAllErrors();return;}await load([id]);}
  async function sendComment(form,id){var status=form.querySelector('.form-status');status.textContent='';var data=new FormData(form),body=String(data.get('body')||'').trim(),name=String(data.get('display_name')||'').trim();var result=await client.rpc('submit_blog_comment',{p_post_id:id,p_display_name:name,p_body:body});if(result.error){status.textContent=tx(TEXT.failed);return;}form.reset();status.textContent=tx(TEXT.pending);}
  function bindReactions(){document.addEventListener('click',function(e){var b=e.target.closest('[data-reaction]');if(!b)return;withAuth(function(){saveReaction(b.dataset.post,Number(b.dataset.reaction));});});}
  function bindComments(){document.querySelectorAll('[data-comment-form]').forEach(function(form){form.addEventListener('submit',function(e){e.preventDefault();if(!form.reportValidity())return;withAuth(function(){sendComment(form,form.dataset.commentForm);});});});}
  function setPdfHref(a){var entries=pdfEntries(INTERACTION_POSTS[a.dataset.pdfPost]),entry=entries[Number(a.dataset.pdfIndex)||0];if(entry){a.href=localized(entry.url);a.setAttribute('aria-label',tx(entry.label||TEXT.calculations));}}
  function bindPdfLanguage(){document.querySelectorAll('[data-pdf-post]').forEach(function(a){a.addEventListener('click',function(){setPdfHref(a);});});}
  function bindPdfMenu(){document.addEventListener('click',function(e){var toggle=e.target.closest('[data-pdf-toggle]'),menu=toggle&&toggle.closest('.pdf-menu-wrap').querySelector('.pdf-menu');document.querySelectorAll('.pdf-menu.open').forEach(function(open){if(open!==menu){open.classList.remove('open');var b=open.closest('.pdf-menu-wrap').querySelector('[data-pdf-toggle]');if(b)b.setAttribute('aria-expanded','false');}});if(toggle){e.stopPropagation();var isOpen=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(isOpen));return;}if(e.target.closest('.pdf-menu'))return;});}
  function bindShare(){
    function wrapFor(menu){return menu&&(menu._shareWrap||menu.closest('.share-wrap'));}
    function menuFor(toggle){var wrap=toggle&&toggle.closest('.share-wrap');if(!wrap)return null;if(wrap._shareMenu)return wrap._shareMenu;var menu=wrap.querySelector('.share-menu');if(menu){wrap._shareMenu=menu;menu._shareWrap=wrap;}return menu;}
    function position(menu,toggle){if(!menu.classList.contains('share-menu-portal'))return;var button=toggle.getBoundingClientRect(),pad=12,gap=9;menu.style.left='0px';menu.style.top='0px';var box=menu.getBoundingClientRect(),left=Math.min(Math.max(pad,button.right-box.width),window.innerWidth-box.width-pad),top=button.bottom+gap;if(top+box.height>window.innerHeight-pad&&button.top-gap-box.height>=pad)top=button.top-gap-box.height;if(top<pad)top=pad;menu.style.left=Math.round(left)+'px';menu.style.top=Math.round(top)+'px';}
    function close(menu){if(!menu)return;var wrap=wrapFor(menu);menu.classList.remove('open','share-menu-portal');menu.style.left='';menu.style.top='';menu.style.right='';if(wrap&&menu.parentElement!==wrap)wrap.appendChild(menu);}
    function open(menu,toggle){var wrap=wrapFor(menu);if(!wrap)return;menu._shareWrap=wrap;wrap._shareMenu=menu;if(menu.parentElement!==document.body)document.body.appendChild(menu);menu.classList.add('share-menu-portal','open');position(menu,toggle);}
    function reposition(){document.querySelectorAll('.share-menu.open').forEach(function(menu){var wrap=wrapFor(menu),toggle=wrap&&wrap.querySelector('[data-share-toggle]');if(toggle)position(menu,toggle);});}
    document.querySelectorAll('.share-wrap').forEach(function(wrap){var menu=wrap.querySelector('.share-menu');if(menu){wrap._shareMenu=menu;menu._shareWrap=wrap;}});
    window.addEventListener('resize',reposition);
    window.addEventListener('scroll',reposition,true);
    document.addEventListener('click',function(e){var toggle=e.target.closest('[data-share-toggle]'),targetMenu=menuFor(toggle);document.querySelectorAll('.share-menu.open').forEach(function(m){if(m!==targetMenu){close(m);var wrap=wrapFor(m),b=wrap&&wrap.querySelector('[data-share-toggle]');if(b)b.setAttribute('aria-expanded','false');}});if(toggle){e.stopPropagation();var isOpen=targetMenu.classList.contains('open');if(isOpen)close(targetMenu);else open(targetMenu,toggle);toggle.setAttribute('aria-expanded',String(!isOpen));return;}var item=e.target.closest('[data-share]');if(!item)return;var menu=item.closest('.share-menu'),wrap=wrapFor(menu);if(!menu||!wrap)return;var id=menu.dataset.shareMenu,base=window.pfSitePath?window.pfSitePath('/blog/'+id):('/blog/'+id),url=new URL(wrap.dataset.shareUrl||base,location.origin).href,title=wrap.dataset.shareTitle||document.title,type=item.dataset.share;if(type==='copy'){e.preventDefault();navigator.clipboard.writeText(url).then(function(){item.textContent=tx(TEXT.copied);});return;}if(type==='instagram'){e.preventDefault();if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(){});}else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(title+' '+url).then(function(){item.textContent=tx(TEXT.copied);window.open('https://www.instagram.com/','_blank','noopener');});}else{window.open('https://www.instagram.com/','_blank','noopener');}return;}var links={linkedin:'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url),x:'https://twitter.com/intent/tweet?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title),facebook:'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url),whatsapp:'https://wa.me/?text='+encodeURIComponent(title+' '+url),email:'mailto:?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent(url)};item.href=links[type];item.target=type==='email'?'':'_blank';item.rel='noopener';});
  }
  function observeLanguage(){new MutationObserver(function(){document.querySelectorAll('[data-comment-form] input[name="display_name"]').forEach(function(el){el.placeholder=tx(TEXT.name);});document.querySelectorAll('[data-comment-form] textarea').forEach(function(el){el.placeholder=tx(TEXT.comment);});document.querySelectorAll('.react-like').forEach(function(el){el.setAttribute('aria-label',tx(TEXT.like));});document.querySelectorAll('.react-dislike').forEach(function(el){el.setAttribute('aria-label',tx(TEXT.dislike));});document.querySelectorAll('[data-views]').forEach(function(el){paint(el.dataset.views);});var close=document.querySelector('.captcha-close');if(close)close.setAttribute('aria-label',tx(TEXT.close));document.querySelectorAll('[data-pdf-post]').forEach(setPdfHref);document.querySelectorAll('[data-comments]').forEach(function(el){renderComments(el.dataset.comments);});}).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});}
  function initClient(){if(!window.supabase||CONFIG.supabaseUrl.indexOf('__')===0)return;client=window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});}
  function init(){var viewedPost=installIndividual();installPreviews();installSaberHubPreviews();installPublications();installMaterials();observeDynamicPreviews();installGate();initClient();bindReactions();bindComments();bindPdfLanguage();bindPdfMenu();bindShare();observeLanguage();loadVisible();if(viewedPost)recordView(viewedPost);}
  window.castoreneTurnstileReady=function(){if(gate.pending)renderTurnstile();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
