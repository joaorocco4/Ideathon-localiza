(function (root) {
  'use strict';
  const casa = r => ['casa','cond_ok'].includes(r.garagem);
  function identificarPerfil(r) {
    if (r.garagem === 'rua') return 'E';
    if (r.garagem === 'cond_sem') return 'D';
    if (r.km < 30) return 'B';
    return r.viaja === 'sim' ? 'C' : 'A';
  }
  function prioridade(c, perfil) {
    const pesos = {A:{ev:0,phev:1,comb:2},B:{ev:0,phev:0,comb:2},C:{ev:1,phev:0,comb:2},D:{ev:2,phev:0,comb:1},E:{ev:2,phev:1,comb:0}};
    return perfil === 'B' && c.tipo === 'ev' && c.categoria === 'suv' ? 1 : pesos[perfil][c.tipo];
  }
  function ordenarCarros(carros, r) {
    const perfil = identificarPerfil(r), categoria = r.tipoCarro === 'nenhum' ? 'hatch' : r.tipoCarro;
    return carros.map((c,i) => ({...c, ordem:i, prioridade:prioridade(c,perfil)})).sort((a,b) => {
      if (a.prioridade !== b.prioridade) return a.prioridade-b.prioridade;
      if (a.tipo === 'comb' && b.tipo === 'comb') return Number(b.categoria === categoria)-Number(a.categoria === categoria) || a.ordem-b.ordem;
      return a.mensalidade-b.mensalidade || a.ordem-b.ordem;
    }).map((c,i) => ({...c, combina:c.prioridade === 0 && (perfil !== 'E' || i < 3)}));
  }
  function custoMensal(c, r, p) {
    const km = Number(r.km), total = km*30;
    if (c.tipo === 'ev') return total*p.evKwhPor100km/100*(casa(r)?p.tarifaCasa:p.tarifaPublica);
    if (c.tipo === 'phev') {
      const eletricos = casa(r)?Math.min(km,p.phevKmEletricoDia):0;
      return eletricos*30*p.phevKwhPor100km/100*p.tarifaCasa+(km-eletricos)*30*p.phevRsPorKmGasolina;
    }
    return total*p.gasolinaRsPorKm[c.categoria];
  }
  function gastoAtual(r,p) {
    if (r.tipoCarro === 'nenhum') return null;
    if (r.gasto !== null && r.gasto !== '' && r.gasto !== undefined && Number.isFinite(Number(r.gasto)) && Number(r.gasto)>=0) return Number(r.gasto);
    return r.km*30*p.gasolinaRsPorKm[r.tipoCarro || 'hatch'];
  }
  function franquiaSugerida(kmMes) { return [1000,1500,2000,2500,3000].find(k => k >= kmMes) ?? null; }
  const logic = {temRecargaCasa:casa,identificarPerfil,prioridade,ordenarCarros,custoMensal,gastoAtual,franquiaSugerida};
  if (typeof module !== 'undefined' && module.exports) module.exports = logic;
  else root.PcLogica = logic;
})(typeof globalThis !== 'undefined' ? globalThis : this);
