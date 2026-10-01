const {test} = require('node:test');
const assert = require('node:assert/strict');
const D = require('./dados.js');
const L = require('./logica.js');
const cases = [
  ['A','dolphin-mini',650,144,506,1500],
  ['D','song-pro',546,367.5,178.5,1500],
  ['B','dolphin-mini',312,72,240,1000],
  ['C','song-pro',900,204,696,1500],
  ['E','mobi',468,468,0,1000]
];
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
D.PERSONAS.forEach((r,i)=>test(`Persona ${r.nome}: perfil, ranking, custos e franquia`,()=>{
  const [perfil,carro,base,custo,economia,franquia]=cases[i];
  const cars=L.ordenarCarros(D.CARROS,r);
  assert.equal(L.identificarPerfil(r),perfil);assert.equal(cars[0].id,carro);
  close(L.gastoAtual(r,D.PREMISSAS),base);close(L.custoMensal(cars[0],r,D.PREMISSAS),custo);
  close(base-L.custoMensal(cars[0],r,D.PREMISSAS),economia);
  assert.equal(L.franquiaSugerida(r.km*30),franquia);
  assert.equal(new Set(cars.map(c=>c.id)).size,D.CARROS.length);
}));
test('João: recarga pública e intervalo, sem arredondamento intermediário',()=>{
  const r=D.PERSONAS[1],car=D.CARROS[0];
  close(L.custoMensal(car,r,D.PREMISSAS),393.75);
  close(L.custoMensal(car,r,{...D.PREMISSAS,tarifaPublica:1.5}),236.25);
  close(L.custoMensal(car,r,{...D.PREMISSAS,tarifaPublica:6}),945);
  assert.equal(Math.round(cases[1][3]),368);assert.equal(Math.round(cases[1][4]),179);
});
test('Uso leve: Mini e Song no topo; SUV elétrico vem depois',()=>{
  const cars=L.ordenarCarros(D.CARROS,D.PERSONAS[2]);
  assert.deepEqual(cars.slice(0,3).map(c=>c.id),['dolphin-mini','song-pro','yuan-pro']);
  assert.ok(cars[0].combina&&cars[1].combina&&!cars[2].combina);
});
test('Perfil E: categoria atual primeiro, ordem estável e apenas três selos',()=>{
  const cars=L.ordenarCarros(D.CARROS,{...D.PERSONAS[4],tipoCarro:'suv'});
  assert.equal(cars[0].id,'fastback');assert.equal(cars.filter(c=>c.combina).length,3);
  assert.ok(cars.slice(0,6).every(c=>c.tipo==='comb'&&c.categoria==='suv'));
  assert.deepEqual(cars.slice(-2).map(c=>c.id),['dolphin-mini','yuan-pro']);
});
test('Fronteiras do diagnóstico',()=>{
  assert.equal(L.identificarPerfil({...D.PERSONAS[0],km:25}),'B');
  assert.equal(L.identificarPerfil({...D.PERSONAS[0],km:30}),'A');
  assert.equal(L.identificarPerfil({...D.PERSONAS[0],km:20,viaja:'sim'}),'B');
  assert.equal(L.identificarPerfil({...D.PERSONAS[0],garagem:'rua',km:5}),'E');
});
test('Franquias: não prometer cobertura acima do catálogo',()=>{
  for (const [km,expected] of [[150,1000],[1000,1000],[1001,1500],[1501,2000],[2400,2500],[3000,3000],[3001,null],[4500,null]])assert.equal(L.franquiaSugerida(km),expected);
});
test('Sem carro: sem economia fictícia; gasto zero informado é respeitado',()=>{
  assert.equal(L.gastoAtual({...D.PERSONAS[0],tipoCarro:'nenhum'},D.PREMISSAS),null);
  assert.equal(L.gastoAtual({...D.PERSONAS[0],gasto:0},D.PREMISSAS),0);
});
test('Custos respondem à tarifa e podem superar o gasto atual',()=>{
  const r=D.PERSONAS[4],cost=L.custoMensal(D.CARROS[0],r,{...D.PREMISSAS,tarifaPublica:6});
  assert.ok(cost>L.gastoAtual(r,D.PREMISSAS));
  close(L.custoMensal(D.CARROS[2],{...D.PERSONAS[3],km:100},D.PREMISSAS),729);
});
test('Ordenação não altera o catálogo de entrada',()=>{
  const before=JSON.stringify(D.CARROS);L.ordenarCarros(D.CARROS,D.PERSONAS[0]);assert.equal(JSON.stringify(D.CARROS),before);
});
