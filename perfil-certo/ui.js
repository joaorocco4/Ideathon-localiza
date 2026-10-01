(() => {
  'use strict';
  const D = window.PcDados, L = window.PcLogica;
  const q = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reais = (n, cents=false) => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:cents?2:0,maximumFractionDigits:cents?2:0});
  const numero = n => n.toLocaleString('pt-BR');
  const defaults = () => ({garagem:null,km:35,viaja:null,carro:'',tipoCarro:'hatch',gasto:null});
  const state = {respostas:defaults(),premissas:JSON.parse(JSON.stringify(D.PREMISSAS)),concluido:false,passo:0,filtro:'perfil'};
  const tipos = {ev:'100% elétrico',phev:'Híbrido plug-in',comb:'Combustão'};
  const garages = {casa:'casa com tomada',cond_ok:'prédio com recarga',cond_sem:'prédio sem recarga',rua:'sem garagem fixa'};
  const categorias = {hatch:'hatch',sedan:'sedã',suv:'SUV',nenhum:'sem carro atual'};
  const faixa = 'Protótipo do Ideathon Localiza. Não é o site oficial; valores ilustrativos.';
  document.body.insertAdjacentHTML('afterbegin',`<div class="pc-prototype">${faixa}</div>`);
  document.querySelectorAll('dialog').forEach(d => d.insertAdjacentHTML('afterbegin',`<div class="pc-dialog-notice">${faixa}</div>`));
  q('.hero').insertAdjacentHTML('beforeend',`<div class="pc-hero-entry"><div><span class="eyebrow">PERFIL CERTO</span><strong>Seu próximo carro começa com a sua rotina.</strong><p>Compare recarga, uso e custos antes de escolher.</p></div><button class="button outline" data-pc-open>Elétrico ou híbrido serve pra você?<br>Descubra em 1 minuto <span aria-hidden="true">↗</span></button></div>`);
  q('#car-grid').insertAdjacentHTML('beforebegin',`<div class="pc-invite" id="pc-invite"><span>Não sabe qual escolher? Responda 4 perguntas e compare as opções para sua rotina.</span><button class="button" data-pc-open>Descobrir meu perfil <span aria-hidden="true">→</span></button></div>`);
  q('#carros .tabs').insertAdjacentHTML('beforebegin',`<div id="pc-results" hidden tabindex="-1"></div>`);
  const tabs = q('#carros .tabs');
  [['perfil','Para o seu perfil'],['intermediario','Intermediários'],['eletrificados','Eletrificados'],['utilitario','Utilitários'],['premium','Premium']].forEach(([id,label]) => {
    if (!tabs.querySelector(`[data-filter="${id}"]`)) tabs.insertAdjacentHTML(id === 'perfil'?'afterbegin':'beforeend',`<button data-filter="${id}" aria-pressed="false" ${['perfil','eletrificados'].includes(id)?'hidden':''}>${label}</button>`);
  });
  q('#carros').insertAdjacentHTML('beforeend',`<details class="pc-calculations" id="pc-calculations" hidden><summary>Como calculamos <span>Edite as premissas da demonstração</span></summary><p>Valores hipotéticos, sem consulta a preços ou disponibilidade. 30 dias de uso por mês. Consumos genéricos por motorização; o modelo informado não altera automaticamente o consumo. Viagens estão incluídas na média diária: a pergunta sobre viagens muda a ordem, não acrescenta quilômetros.</p><div id="pc-assumptions" class="pc-fields"></div><p id="pc-assumption-error" role="status"></p><p>O híbrido plug-in pressupõe uma recarga diária em casa. As estimativas não incluem perdas de recarga, estacionamento, tarifas por tempo ou instalação. Mensalidades são fixas neste protótipo e não variam por franquia ou prazo: o total é uma referência, não uma cotação.</p><button class="text-link" id="pc-restore">Restaurar premissas</button></details>`);
  document.body.insertAdjacentHTML('beforeend',`<dialog class="pc-dialog" id="pc-dialog" aria-labelledby="pc-question"><div class="pc-dialog-notice">${faixa}</div><div class="pc-dialog-top"><span class="eyebrow">PERFIL CERTO</span><button class="icon-button" id="pc-close" aria-label="Fechar diagnóstico">×</button></div><div class="pc-progress" aria-label="Progresso do diagnóstico"><span></span><span></span><span></span><span></span></div><div id="pc-step"></div><div class="pc-dialog-footer">Não pedimos nome, e-mail nem renda.<br><span>Suas respostas ficam apenas nesta página.</span></div></dialog><dialog id="pc-demo" aria-labelledby="pc-demo-title"><div class="pc-dialog-notice">${faixa}</div><button class="close icon-button" data-pc-close-dialog aria-label="Fechar demonstração">×</button><span class="eyebrow">APRESENTAÇÃO</span><h2 id="pc-demo-title">Cinco rotinas. Novas possibilidades.</h2><p>Personas fictícias para explorar a experiência.</p><div class="pc-personas">${D.PERSONAS.map((p,i)=>`<button class="pc-persona" data-persona="${i}"><strong>${p.nome}</strong><span>${p.km} km/dia · ${garages[p.garagem]}</span></button>`).join('')}</div><button class="text-link" data-pc-reset>Recomeçar do zero</button></dialog><dialog id="pc-message" aria-labelledby="pc-message-title"><div class="pc-dialog-notice">${faixa}</div><button class="close icon-button" data-pc-close-dialog aria-label="Fechar mensagem">×</button><span class="eyebrow">SIMULAÇÃO</span><h2 id="pc-message-title">Seu próximo passo</h2><p id="pc-message-text"></p><button class="button" data-pc-close-dialog>Entendi</button></dialog>`);
  q('.footer-bottom').insertAdjacentHTML('beforeend','<button class="pc-demo-button" id="pc-demo-open">Demo <span>↗</span></button>');
  const dialog = q('#pc-dialog');
  let advanceTimer;
  function clearAdvance() { clearTimeout(advanceTimer); }
  function openDiagnostic() { clearAdvance(); renderStep(); dialog.showModal(); focusStep(); }
  function focusStep() { q('#pc-question').focus(); }
  function next() { clearAdvance(); state.passo = Math.min(3,state.passo+1); renderStep(); focusStep(); }
  function why(text) { return `<details class="pc-why"><summary>Por que perguntamos isso?</summary><p>${text}</p></details>`; }
  function renderStep() {
    const r = state.respostas, s = state.passo;
    document.querySelectorAll('.pc-progress span').forEach((el,i) => {el.classList.toggle('done',i<=s);el.setAttribute('aria-hidden','true');});
    const options = (items,key) => `<div class="pc-options">${items.map(([v,t,d])=>`<button class="pc-option ${r[key]===v?'chosen':''}" data-answer="${key}" data-value="${v}" aria-pressed="${r[key]===v}"><span><strong>${t}</strong><small>${d}</small></span><span class="pc-radio" aria-hidden="true"></span></button>`).join('')}</div>`;
    let title,body;
    if(s===0) {title='Onde o carro dorme?';body=options([['casa','Casa com garagem e tomada','Possibilidade de recarga, após avaliação elétrica'],['cond_ok','Prédio com vaga e ponto de recarga','Ou instalação já autorizada e viável'],['cond_sem','Prédio sem ponto de recarga','Ainda precisamos avaliar outras opções'],['rua','Na rua, sem garagem fixa','A recarga pode depender de outros locais']],'garagem')+why('O local de recarga muda o custo e a praticidade. Recarga residencial, no trabalho e pública têm condições diferentes. Aqui simulamos casa ou pontos públicos.');}
    if(s===1) {title='Quantos km você roda por dia?';body=`<p class="pc-subtitle">Pense na média de todos os dias, incluindo viagens.</p><div class="pc-km"><output id="pc-km-output" for="pc-km">${r.km}</output><span>km por dia</span></div><label class="pc-range-label" for="pc-km">Sua média diária<input id="pc-km" type="range" min="5" max="150" step="5" value="${r.km}"></label><div class="pc-range-ends"><span>5 km</span><span>150 km</span></div><p class="pc-monthly" id="pc-monthly">Cerca de ${numero(r.km*30)} km por mês</p><p class="pc-small">Média do brasileiro: cerca de 35 km por dia (KBB Brasil).</p>${why('A distância ajuda a estimar energia e franquia. Rodar mais amplia a diferença de gasto por quilômetro; a mensalidade também entra na decisão.')}<button class="button pc-next" id="pc-next">Próxima <span aria-hidden="true">→</span></button>`;}
    if(s===2) {title='Você viaja para fora da cidade todo mês?';body=options([['nao','Não, quase nunca','Minha rotina é principalmente na cidade'],['sim','Sim, todo mês','Quero considerar também a estrada']],'viaja')+why('Viagens exigem analisar distâncias e paradas. O plug-in pode usar gasolina na estrada; o elétrico também pode atender, dependendo da rota e da recarga.');}
    if(s===3) {title='Qual carro você tem hoje?';body=`<p class="pc-subtitle">Opcional. Uma referência para comparar energia e combustível.</p><form id="pc-current-form"><label>Modelo<input id="pc-model" type="text" maxlength="60" placeholder="Ex.: Onix 2019" value="${esc(r.carro)}" autocomplete="off"></label><label>Tipo de carro<select id="pc-current-type">${Object.entries(categorias).map(([v,t])=>`<option value="${v}" ${r.tipoCarro===v?'selected':''}>${t==='sem carro atual'?'Não tenho carro':t}</option>`).join('')}</select></label><label>Gasto mensal com combustível (R$)<input type="number" id="pc-spend" min="0" max="100000" step="0.01" value="${r.gasto??''}" placeholder="Se não souber, estimamos" ${r.tipoCarro==='nenhum'?'disabled':''}></label>${why('Usamos o gasto que você informar ou uma estimativa por categoria. Sem carro atual, mostramos os custos das opções, sem inventar uma economia.')}<button class="button pc-next" type="submit">Ver meu resultado <span aria-hidden="true">→</span></button><button class="text-link pc-skip" type="button" id="pc-skip">Pular e usar referência estimada</button></form>`;}
    q('#pc-step').innerHTML=`<p class="pc-step-count">Pergunta ${s+1} de 4 ${s===3?'· opcional':''}</p><h2 id="pc-question" tabindex="-1">${title}</h2>${body}${s>0?'<button class="text-link pc-back" id="pc-back">← Voltar</button>':''}`;
    q('#pc-back')?.addEventListener('click',()=>{clearAdvance();state.passo--;renderStep();focusStep();});
    q('#pc-next')?.addEventListener('click',next);
    q('#pc-km')?.addEventListener('input',e=>{r.km=Number(e.target.value);q('#pc-km-output').textContent=r.km;q('#pc-monthly').textContent=`Cerca de ${numero(r.km*30)} km por mês`;});
    q('#pc-model')?.addEventListener('input',e=>{r.carro=e.target.value;});
    q('#pc-current-type')?.addEventListener('change',e=>{r.tipoCarro=e.target.value;q('#pc-spend').disabled=r.tipoCarro==='nenhum';});
    q('#pc-spend')?.addEventListener('input',e=>{r.gasto=e.target.value===''?null:Number(e.target.value);});
    q('#pc-current-form')?.addEventListener('submit',e=>{e.preventDefault();complete();});
    q('#pc-skip')?.addEventListener('click',()=>{r.carro='';r.tipoCarro='hatch';r.gasto=null;complete();});
  }
  dialog.addEventListener('click', e=>{
    const b=e.target.closest('[data-answer]');
    if(b){clearAdvance();state.respostas[b.dataset.answer]=b.dataset.value;dialog.querySelectorAll('[data-answer]').forEach(el=>{el.classList.toggle('chosen',el===b);el.setAttribute('aria-pressed',String(el===b));});advanceTimer=setTimeout(next,250);}
    if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}
  });
  q('#pc-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',clearAdvance);
  dialog.addEventListener('cancel',clearAdvance);
  function complete() {
    if(!state.respostas.garagem||!state.respostas.viaja)return;
    clearAdvance();state.concluido=true;state.filtro='perfil';dialog.close();q('#pc-demo').close();renderResult();renderCatalog();renderAssumptions();
    q('#pc-results').focus({preventScroll:true});q('#carros').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function energyLegend(c) {return c.tipo==='comb'?'gasolina':c.tipo==='ev'?(L.temRecargaCasa(state.respostas)?'recarga em casa':'recarga pública'):(L.temRecargaCasa(state.respostas)?'tomada no dia a dia + gasolina':'gasolina, sem recarga');}
  function savings(cost) {
    const base=L.gastoAtual(state.respostas,state.premissas);
    if(base===null)return '<strong>Sem comparação com carro atual</strong><span>Compare o custo mensal estimado entre as opções abaixo.</span>';
    const diff=base-cost;
    if(diff<0)return `<strong>${reais(-diff)} a mais por mês em energia/combustível</strong><span>Com essas premissas, não há economia de abastecimento.</span>`;
    if(diff<20)return '<strong>Gasto parecido com o de hoje</strong><span>Considere também mensalidade, conveniência e serviços previstos no contrato.</span>';
    return `<strong>${reais(diff)} <small>por mês</small></strong><span>${reais(diff*36)} em 36 meses, mantendo uso e tarifas constantes.</span>`;
  }
  function bar(label,value,max,type,caption='') {return `<div class="pc-bar-row"><div><span>${esc(label)}</span><strong>${reais(value)}</strong></div><div class="pc-bar-track"><span class="${type}" style="width:${Math.max(0,Math.min(100,value/max*100))}%"></span></div>${caption?`<small>${esc(caption)}</small>`:''}</div>`;}
  function modelCard(c,compact=false) {
    const cost=L.custoMensal(c,state.respostas,state.premissas),base=L.gastoAtual(state.respostas,state.premissas);
    return `<article class="car-card pc-model ${c.combina?'pc-match':''} pc-${c.tipo}"><div class="car-visual"><img src="assets/${c.image}" alt="${esc(c.nome)} — foto do modelo" loading="eager">${c.combina?'<span class="pc-badge">Combina com você</span>':''}</div><div class="car-body"><span class="pc-chip ${c.tipo}">${tipos[c.tipo]}</span><span class="pc-category">${categorias[c.categoria]}</span><h3>${c.nome}</h3><div class="pc-price"><small>Mensalidade ilustrativa a partir de</small><strong>${reais(c.mensalidade,true)}<small>/mês</small></strong></div><p>Energia/combustível: <strong>${reais(cost)}/mês</strong><br><small>${energyLegend(c)}</small></p>${base!==null&&base-cost>=20?`<div class="pc-card-saving">${reais(base-cost)} menos em abastecimento</div>`:''}<p class="pc-total-small">Mensalidade + uso: <strong>${reais(c.mensalidade+cost,true)}/mês</strong></p><button class="button outline" data-pc-quote="${c.id}">Simular este plano</button></div></article>`;
  }
  function renderResult() {
    const r=state.respostas,p=state.premissas,perfil=L.identificarPerfil(r),info=D.PERFIS[perfil],list=L.ordenarCarros(D.CARROS,r),car=list[0],cost=L.custoMensal(car,r,p),base=L.gastoAtual(r,p),franquia=L.franquiaSugerida(r.km*30);
    const publico=r.km*30*p.evKwhPor100km/100*p.tarifaPublica,max=Math.max(base??0,cost,(['D','E'].includes(perfil)?publico:0),1);
    const result=q('#pc-results');result.hidden=false;q('#pc-invite').hidden=true;q('#pc-calculations').hidden=false;
    const extra=perfil==='D'?`<h3>A recarga pode mudar sua escolha.</h3><p>Verifique instalação, regras do condomínio ou recarga no trabalho. Com acesso confiável, vale refazer a comparação. Não há instalador ou serviço contratado neste protótipo.</p><button class="text-link" data-pc-message="Em uma versão integrada, você poderia consultar parceiros e receber uma avaliação de instalação. Esta demonstração não envia solicitações.">Explorar apoio à recarga →</button>`:perfil==='E'?`<h3>Tem outra opção de recarga?</h3><p>Garagem não é o único caminho. Avalie trabalho e pontos públicos antes de decidir. O diagnóstico simplificado ainda não verifica essas rotas.</p><button class="text-link" data-pc-open>Rever minha rotina →</button>`:`<h3>Ainda em dúvida? Explore um prazo menor.</h3><p>A Localiza oferece planos de diferentes durações. A disponibilidade de elétricos, valores e condições para troca precisam ser confirmados.</p><button class="text-link" data-pc-message="Aqui você consultaria a disponibilidade de planos curtos, inclusive de 3 meses. Não garantimos este modelo nesse prazo, nem troca gratuita para um contrato longo.">Conhecer a possibilidade →</button>`;
    result.innerHTML=`<div class="pc-profile-bar"><span><strong>Seu perfil: ${perfil} · ${info.nome}</strong><small>${r.km} km/dia · ${garages[r.garagem]}</small></span><div><button class="text-link" data-pc-open>Refazer</button><button class="text-link" data-pc-all>Ver todos os carros</button></div></div><div class="pc-profile-heading"><span class="pc-letter">${perfil}</span><div><span class="eyebrow">UMA ESCOLHA QUE COMEÇA EM VOCÊ</span><h2>${info.titulo}</h2><p>${info.texto}</p><small>${r.km} km/dia · ${r.viaja==='sim'?'viagens mensais':'uso principalmente urbano'} · ${esc(r.carro||categorias[r.tipoCarro])}</small></div></div><article class="pc-recommendation"><div class="pc-recommended-car"><span class="eyebrow">MAIS RECOMENDADO NESTA SIMULAÇÃO</span><span class="pc-chip ${car.tipo}">${tipos[car.tipo]}</span><h3>${car.nome}</h3><img src="assets/${car.image}" alt="${esc(car.nome)} — foto do modelo"><p class="pc-small">Foto do modelo · cor e versão podem variar</p><div class="pc-price"><small>Mensalidade ilustrativa a partir de</small><strong>${reais(car.mensalidade,true)}<small>/mês</small></strong></div><button class="button" data-pc-quote="${car.id}">Simular assinatura do ${car.nome.replace('BYD ','')}</button></div><div class="pc-account"><span class="eyebrow">A CONTA DA SUA ROTINA</span><h3>Quanto muda no abastecimento?</h3>${base===null?'<p>Você informou que não tem carro. Não estimamos uma economia sobre um gasto inexistente.</p>':bar(`Hoje, com ${r.carro||'seu carro atual'}`,base,max,'comb',r.gasto!==null?'Gasto informado por você':`Estimativa para ${categorias[r.tipoCarro]} a gasolina`)}${bar(car.nome,cost,max,car.tipo,energyLegend(car))}${['D','E'].includes(perfil)?bar('Se fosse um elétrico na rua',publico,max,'ev',`Faixa ilustrativa: ${reais(r.km*30*p.evKwhPor100km/100*p.tarifaPublicaMin)} a ${reais(r.km*30*p.evKwhPor100km/100*p.tarifaPublicaMax)} por mês`):''}<div class="pc-saving"><small>COMPARAÇÃO SOMENTE DE ENERGIA / COMBUSTÍVEL</small>${savings(cost)}</div><div class="pc-total"><span>Mensalidade + energia/combustível</span><strong>${reais(car.mensalidade+cost,true)}<small>/mês</small></strong></div><p class="pc-small">Total ilustrativo. Excedentes, reajustes e serviços adicionais não calculados. A economia de abastecimento não é economia total da assinatura.</p></div></article><div class="pc-plan-details"><div><h3>O plano acompanha a rotina.</h3><p>${franquia?`Franquia sugerida: <strong>${numero(franquia)} km/mês</strong>, para cerca de ${numero(r.km*30)} km mensais.`:`Sua estimativa é de <strong>${numero(r.km*30)} km/mês</strong>, acima dos 3.000 km do catálogo. Precisamos de um plano específico; não sugerimos uma franquia insuficiente.`}</p><p>Documentação, proteção e manutenção: confirme coberturas e responsabilidades na proposta. Pneus, carro reserva e assistência dependem das condições do plano.</p></div><div><h3>Usar sem comprar.</h3>${car.preco0km?`<p>Preço de compra ilustrativo: <strong>${reais(car.preco0km)}</strong>. Ao assinar, você não desembolsa esse valor para adquirir o veículo.</p>`:''}<p>Assinar não é sempre mais barato que comprar à vista. A comparação completa precisa considerar revenda, custos de propriedade e capital.</p></div></div><div class="pc-alternatives"><h3>Outras opções para comparar</h3><p>Observe também o custo total e o tamanho do carro.</p><div class="car-grid">${list.slice(1,3).map(c=>modelCard(c,true)).join('')}</div></div><div class="pc-extra">${extra}</div>${r.km>=100?'<div class="pc-extra pc-high-use"><h3>Essa quilometragem é para trabalhar com aplicativo?</h3><p>Esse uso exige oferta e condições próprias. A recomendação de assinatura para pessoa física não confirma permissão para transporte por aplicativo.</p></div>':''}<div class="pc-full-catalog-title"><span class="eyebrow">A ESCOLHA CONTINUA SUA</span><h3>Explore todos os carros</h3><p>A ordem muda com o perfil. As alternativas continuam aqui.</p></div>`;
  }
  function renderCatalog() {
    tabs.querySelectorAll('[data-filter]').forEach(b=>{if(['perfil','eletrificados'].includes(b.dataset.filter))b.hidden=!state.concluido;b.classList.toggle('selected',b.dataset.filter===state.filtro);b.setAttribute('aria-pressed',String(b.dataset.filter===state.filtro));});
    if(!state.concluido){window.renderCars(state.filtro==='perfil'?'todos':state.filtro);return;}
    const all=L.ordenarCarros(D.CARROS,state.respostas),f=state.filtro;
    const cars=all.filter(c=>['todos','perfil'].includes(f)||f==='eletrificados'&&c.tipo!=='comb'||f==='eletrico'&&c.tipo==='ev'||f==='suv'&&c.categoria==='suv'||c.abaSite===f&&f!=='eletrico');
    const grid=q('#car-grid');grid.innerHTML=cars.length?cars.map(c=>modelCard(c)).join(''):`<div class="pc-empty"><h3>Categoria ${f==='premium'?'Premium':'Utilitários'}</h3><p>A categoria da página base foi preservada, mas não há modelos com preços no catálogo demonstrativo. Você pode montar suas preferências no formulário original.</p><button class="button outline" data-quote>Montar preferências</button></div>`;
    grid.classList.remove('pc-enter');void grid.offsetWidth;grid.classList.add('pc-enter');
    q('#carros .catalog-note').textContent='Todos os valores são ilustrativos, inclusive os BYD. Fotos dos modelos; cores e versões podem variar. Sem cotação ou disponibilidade em tempo real.';
  }
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;e.stopImmediatePropagation();state.filtro=b.dataset.filter;renderCatalog();},true);
  const fields=[['tarifaCasa','Energia em casa (R$/kWh)',.01,20],['tarifaPublica','Energia pública (R$/kWh)',.01,20],['tarifaPublicaMin','Mínimo público (R$/kWh)',.01,20],['tarifaPublicaMax','Máximo público (R$/kWh)',.01,20],['evKwhPor100km','Elétrico (kWh/100 km)',.1,100],['phevKwhPor100km','Plug-in elétrico (kWh/100 km)',.1,100],['phevKmEletricoDia','Plug-in: km elétricos/dia',1,300],['phevRsPorKmGasolina','Plug-in gasolina (R$/km)',.01,10],['hatch','Hatch gasolina (R$/km)',.01,10],['sedan','Sedã gasolina (R$/km)',.01,10],['suv','SUV gasolina (R$/km)',.01,10]];
  function renderAssumptions() {q('#pc-assumptions').innerHTML=fields.map(([k,label,step,max])=>`<label>${label}<input type="number" data-premissa="${k}" min="0" max="${max}" step="${step}" value="${state.premissas.gasolinaRsPorKm[k]??state.premissas[k]}" required></label>`).join('');q('#pc-assumption-error').textContent='';}
  q('#pc-assumptions').addEventListener('input',()=>{
    const candidate=JSON.parse(JSON.stringify(state.premissas));let valid=true;
    q('#pc-assumptions').querySelectorAll('input').forEach(input=>{if(!input.checkValidity()||input.value==='')valid=false;const k=input.dataset.premissa;if(k in candidate.gasolinaRsPorKm)candidate.gasolinaRsPorKm[k]=Number(input.value);else candidate[k]=Number(input.value);});
    if(candidate.tarifaPublicaMin>candidate.tarifaPublicaMax)valid=false;
    q('#pc-assumption-error').textContent=valid?'Premissas aplicadas.':'Revise os valores: preencha números válidos e mantenha o mínimo público menor ou igual ao máximo. A última conta válida foi mantida.';
    if(valid){state.premissas=candidate;renderResult();renderCatalog();}
  });
  q('#pc-restore').addEventListener('click',()=>{state.premissas=JSON.parse(JSON.stringify(D.PREMISSAS));renderAssumptions();renderResult();renderCatalog();});
  function message(text){q('#pc-message-text').textContent=text;q('#pc-message').showModal();}
  function reset(){clearAdvance();document.querySelectorAll('dialog[open]').forEach(d=>d.close());state.respostas=defaults();state.premissas=JSON.parse(JSON.stringify(D.PREMISSAS));state.concluido=false;state.passo=0;state.filtro='todos';q('#pc-results').hidden=true;q('#pc-calculations').hidden=true;q('#pc-invite').hidden=false;renderCatalog();q('#carros .catalog-note').textContent='Imagens ilustrativas. Consulte disponibilidade e condições na contratação.';q('#carros').scrollIntoView();}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.matches('[data-pc-open]'))openDiagnostic();
    if(b.matches('[data-persona]')){state.respostas={...D.PERSONAS[Number(b.dataset.persona)]};state.passo=0;complete();}
    if(b.matches('[data-pc-close-dialog]'))b.closest('dialog').close();
    if(b.matches('[data-pc-reset]'))reset();
    if(b.matches('[data-pc-all]')){state.filtro='todos';renderCatalog();tabs.scrollIntoView({block:'center'});tabs.querySelector('[data-filter="todos"]').focus({preventScroll:true});}
    if(b.matches('[data-pc-message]'))message(b.dataset.pcMessage);
    if(b.matches('[data-pc-quote]')){
      const car=D.CARROS.find(c=>c.id===b.dataset.pcQuote),franquia=L.franquiaSugerida(state.respostas.km*30);
      if(!franquia){message('Sua rotina supera 3.000 km/mês. Em uma versão integrada, seria necessário consultar uma oferta específica antes de continuar. Nenhum pedido foi enviado.');return;}
      window.openQuote(car.abaSite);q('#duration').value='36 meses';const val=`${numero(franquia)} km`;
      if(!Array.from(q('#mileage').options).some(o=>o.value===val))q('#mileage').add(new Option(val,val));q('#mileage').value=val;
      q('#pc-quote-context').textContent=`${car.nome} · mensalidade ilustrativa de ${reais(car.mensalidade,true)}. Prazo e franquia sugeridos foram preenchidos. Alterá-los não gera uma nova cotação neste protótipo.`;
    }
    if(b.matches('[data-quote]')){q('#pc-quote-context').textContent='';if(b.closest('.pc-empty'))window.openQuote(state.filtro);}
  });
  q('#quote-title').insertAdjacentHTML('afterend','<p id="pc-quote-context" role="status"></p>');
  function demo(){if(!document.querySelector('dialog[open]'))q('#pc-demo').showModal();}
  q('#pc-demo-open').addEventListener('click',demo);
  document.addEventListener('keydown',e=>{if(e.shiftKey&&e.key.toLowerCase()==='d'&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!e.target.closest('input,textarea,select,[contenteditable]')){e.preventDefault();demo();}});
  document.querySelectorAll('dialog:not(.pc-dialog)').forEach(d=>{const close=d.querySelector('.close');if(close)d.querySelector('.pc-dialog-notice').append(close);});
})();
