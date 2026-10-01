# Perfil Certo — MVP do Ideathon Localiza

Implementado sobre a landing page recebida, em HTML, CSS e JavaScript puro. Sem bibliotecas externas ou build.

## Abrir

Abra index.html no navegador, ou execute `node server.cjs` nesta pasta e acesse http://localhost:4174. Essa porta evita conflito com a base anterior.

O diagnóstico funciona offline, sem IA externa, CRM, analytics ou contratação. As respostas ficam em memória, são mantidas ao fechar o modal e apagadas ao recarregar. O servidor opcional só entrega arquivos. Uma política de conteúdo bloqueia conexões de scripts e envio de formulários.

## Demonstração

Abra **Demo** no rodapé ou pressione **Shift+D**, fora de campos de edição. Selecione Mariana, João, Carla, Rafael ou Pedro. Use **Recomeçar do zero** para restaurar a página.

Roteiro: Mariana (conta residencial), João (recarga a avaliar), Pedro (combustão primeiro). Em **Como calculamos**, edite as tarifas e veja o recálculo. Restaure as premissas para repetir os números de referência.

Simular preenche categoria, 36 meses e franquia no formulário original, sem enviar nada. O download do resumo da base foi preservado.

## Arquivos

- index.html: integração, hero sem promoção antiga e política de conteúdo.
- perfil-certo/dados.js: 15 veículos, cinco personas e premissas.
- perfil-certo/logica.js: funções puras de perfil, ordenação, custo e franquia.
- perfil-certo/ui.js: estado central, diagnóstico, resultados, abas e integração.
- perfil-certo/estilos.css: componentes com fonte/paleta existentes, responsividade e avisos.
- perfil-certo/logica.test.cjs: testes com o Node.js, sem dependências.
- app.js e styles.css: base preservada. config.js e assets/: imagens das categorias atualizadas.
- server.cjs: pré-visualização local na porta 4174.

## Testes

Execute `node --test perfil-certo/logica.test.cjs`.

13 testes passaram: cinco personas, recarga pública, ordenação, selos, limites de perfil, franquias, ausência de carro, gasto zero, alteração de tarifas e imutabilidade do catálogo.

No navegador: jornada manual de Mariana, cinco personas, preservação dos 15 veículos, recálculo/restauração de tarifa, Esc, respostas preservadas e preenchimento do formulário original. Layout inspecionado em 375 e 1366 px, sem largura do documento superior ao viewport nos estados verificados. Sem erros de aplicação no console durante esses testes.

## Adaptações e limites

1. Recomendação por regras locais, sem IA externa. A análise completa de rotina, orçamento e rotas é uma evolução futura.
2. Preservados os números e a ordenação A–E do prompt. No perfil D, o plug-in é explicitamente uma prioridade demonstrativa, não a melhor escolha universal para quem não tem tomada. Trabalho e recarga pública precisam de análise adicional.
3. Economia de abastecimento separada do total da assinatura. Não é comparação completa entre comprar e assinar.
4. Diferença negativa aparece como custo adicional. Sem carro atual, não há economia fictícia. Pular a etapa usa uma referência estimada de hatch, declarada na tela.
5. Acima de 3.000 km/mês, não se recomenda uma franquia insuficiente: a aplicação informa a necessidade de oferta específica. Uso com aplicativos exige condições próprias.
6. Todos os preços são ilustrativos, inclusive BYD. As mensalidades não variam com prazo/franquia porque não há tabela comercial. Sem garantia de disponibilidade ou aprovação.
7. Cada um dos 15 modelos tem sua própria foto, obtida de fonte oficial. Cor, ano e versão podem variar. Origens em IMAGENS.md e assets/carros/fontes.json.
8. Antes do diagnóstico, permanece a vitrine original. Depois, aparecem modelos. Premium e Utilitários permanecem acessíveis sem modelos/preços inventados. Elétricos mostra EV; Eletrificados reúne EV e plug-in; SUVs inclui SUVs eletrificados.
9. Retiradas afirmações não validadas sobre média nacional de 35 km, recarga sempre a um quinto, recompra de 92%, instalação por R$ 3 mil e autorização legal genérica. Coberturas, pneus, reserva e planos curtos dependem de confirmação.
10. Transição suave de entrada do catálogo, respeitando movimento reduzido, sem animação individual de deslocamento dos cartões.
11. Sem mapas, consulta de carregadores, orçamento de instalação, preços reais, previsão de filas, reajustes ou cálculo de excedentes. Botões relacionados apenas explicam o próximo passo simulado.

## Evolução

Integrar ofertas autorizadas, orçamento/passsageiros/rotas, dados de recarga e regras comerciais validadas. Cálculos continuam auditáveis; IA pode interpretar e explicar. Nunca colocar chaves de API no front-end.

Marcas e imagens pertencem aos titulares. Protótipo independente para o Ideathon, sem vínculo oficial.


## Atualização: celular e fotos dos modelos

- A mesma aplicação se adapta a celular, tablet e computador, sem duplicar o estado.
- Navegação inferior no celular, áreas de toque maiores, campos de 16 px (evitam zoom automático do iPhone), safe areas e formulário rolável com aviso e rodapé visíveis.
- Cabeçalhos medidos dinamicamente; a barra de perfil não cobre a área útil em telas pequenas.
- Fotos individuais dos 15 modelos, salvas localmente em WebP. Créditos em IMAGENS.md.
- Novos arquivos: perfil-certo/responsivo.css e perfil-certo/responsivo.js.
- Verificados resultados em 320, 375, 390, 768 e 1366 px, sem transbordamento horizontal nesses estados; formulário também conferido em 375 × 667.

### Abrir em outro aparelho

Execute Abrir-no-celular.cmd (ou node server.cjs) e mantenha o computador ligado. O servidor exibe os endereços atuais da rede; também estão em http://localhost:4174/acesso.html. Abra o endereço de rede no celular conectado ao mesmo Wi-Fi. Não use localhost no celular.

O servidor escuta na rede local e só aceita leitura de arquivos desta pasta. Não há publicação na internet nem recebimento de respostas do diagnóstico. Não foi testado em um celular físico. Redes de convidados ou isolamento entre aparelhos podem impedir a conexão; se necessário, permita o Node.js na rede privada do Windows, sem desativar o firewall. O IP pode mudar quando a rede mudar.
