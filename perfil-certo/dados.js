(function (root) {
  'use strict';
  const PREMISSAS = { tarifaCasa: .80, tarifaPublica: 2.50, tarifaPublicaMin: 1.50, tarifaPublicaMax: 6, evKwhPor100km: 15, phevKwhPor100km: 17, phevKmEletricoDia: 50, phevRsPorKmGasolina: .35, gasolinaRsPorKm: { hatch: .52, sedan: .56, suv: .60 } };
  const rows = [
    ['dolphin-mini','BYD Dolphin Mini','ev','hatch','eletrico',2870.40,120000],
    ['yuan-pro','BYD Yuan Pro','ev','suv','eletrico',3880.73,184800],
    ['song-pro','BYD Song Pro DM-i','phev','suv','eletrico',4296.65,190000],
    ['mobi','Fiat Mobi','comb','hatch','economico',1990],
    ['onix','Chevrolet Onix','comb','hatch','economico',2390],
    ['argo','Fiat Argo','comb','hatch','economico',2290],
    ['polo','Volkswagen Polo','comb','hatch','intermediario',2490],
    ['city','Honda City','comb','sedan','intermediario',2790],
    ['fastback','Fiat Fastback','comb','suv','suv',2890],
    ['tcross','Volkswagen T-Cross','comb','suv','suv',3190],
    ['creta','Hyundai Creta','comb','suv','suv',3190],
    ['duster','Renault Duster','comb','suv','suv',2790],
    ['hrv','Honda HR-V','comb','suv','suv',3490],
    ['compass','Jeep Compass','comb','suv','suv',3990],
    ['taos','Volkswagen Taos','comb','suv','suv',3990]
  ];
  const CARROS = rows.map(([id,nome,tipo,categoria,abaSite,mensalidade,preco0km]) => ({id,nome,tipo,categoria,abaSite,mensalidade,preco0km,image: `carros/${id}.webp`}));
  const PERSONAS = [
    {nome:'Mariana',garagem:'cond_ok',km:40,viaja:'nao',carro:'Onix 2019',tipoCarro:'hatch',gasto:650},
    {nome:'João',garagem:'cond_sem',km:35,viaja:'nao',carro:'Gol 2015',tipoCarro:'hatch',gasto:null},
    {nome:'Carla',garagem:'casa',km:20,viaja:'nao',carro:'HB20 2018',tipoCarro:'hatch',gasto:null},
    {nome:'Rafael',garagem:'casa',km:50,viaja:'sim',carro:'Compass 2020',tipoCarro:'suv',gasto:900},
    {nome:'Pedro',garagem:'rua',km:30,viaja:'nao',carro:'Argo 2021',tipoCarro:'hatch',gasto:null}
  ];
  const PERFIS = {
    A: {nome:'Recarga em casa',titulo:'Explore o 100% elétrico primeiro',texto:'Sua rotina combina com a recarga residencial. Nesta simulação, o elétrico reduz o gasto de energia. Compare também a mensalidade e o espaço de que você precisa.'},
    B: {nome:'Uso urbano leve',titulo:'Elétrico compacto e híbrido lado a lado',texto:'Com poucos quilômetros por dia, a mensalidade pesa mais na conta total. Compare o compacto elétrico e o híbrido, considerando também tamanho e conforto.'},
    C: {nome:'Estrada frequente',titulo:'Compare o híbrido plug-in primeiro',texto:'Recarga em casa e viagens frequentes tornam o plug-in uma alternativa a explorar. Um elétrico também pode atender: a decisão exige verificar as rotas e paradas das viagens.'},
    D: {nome:'Recarga a avaliar',titulo:'Híbrido plug-in primeiro',texto:'Sem recarga na garagem, um elétrico dependeria de carregador público, que pode custar mais que gasolina. O híbrido plug-in funciona hoje sem tomada e não depende de encontrar carregador. Compare abaixo com o custo de um elétrico carregado na rua.'},
    E: {nome:'Sem garagem fixa',titulo:'Comece comparando a combustão',texto:'Como ainda não conhecemos uma recarga confiável na sua rotina, começamos pela combustão. Trabalho e pontos públicos podem viabilizar um elétrico; todos continuam disponíveis.'}
  };
  const data = { PREMISSAS, CARROS, PERSONAS, PERFIS };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.PcDados = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
