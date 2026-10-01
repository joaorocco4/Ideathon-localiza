(() => {
  'use strict';
  // Medidas reais evitam sobreposição quando avisos ou fontes quebram de linha.
  const root = document.documentElement;
  const notice = document.querySelector('.pc-prototype');
  const header = document.querySelector('.header');
  let pending;
  const measure = () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      root.style.setProperty('--prototype-height', `${Math.ceil(notice.getBoundingClientRect().height)}px`);
      root.style.setProperty('--pc-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    });
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(notice); observer.observe(header);
  }
  window.addEventListener('resize',measure,{passive:true});
  document.fonts?.ready.then(measure);
  measure();
  document.body.insertAdjacentHTML('beforeend', '<nav class="pc-mobile-nav" aria-label="Atalhos no celular"><a href="#carros">Ver carros</a><button class="button" data-pc-open>Descobrir meu perfil <span aria-hidden="true">↗</span></button></nav>');
})();
