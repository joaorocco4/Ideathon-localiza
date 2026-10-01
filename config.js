// Ponto central para personalizar o catálogo. Não há conexão com serviços externos.
window.SITE_CONFIG = {
  cars: [
    { id: 'economico', name: 'Econômicos', image: 'carros/mobi.webp', example: 'Veículo da categoria econômica', description: 'Leveza para a cidade e economia para ir além.' },
    { id: 'intermediario', name: 'Intermediários', image: 'carros/polo.webp', example: 'Veículo da categoria intermediária', description: 'Mais espaço para levar seus planos com conforto.' },
    { id: 'suv', name: 'SUVs', image: 'carros/tcross.webp', example: 'Veículo da categoria SUV', description: 'Versatilidade para a semana. Liberdade no fim de semana.' },
    { id: 'eletrico', name: 'Elétricos', image: 'carros/dolphin-mini.webp', example: 'Veículo elétrico', description: 'Uma nova experiência de dirigir, com tecnologia e silêncio.' },
    { id: 'utilitario', name: 'Utilitários', image: 'utilitario.webp', example: 'Utilitário', description: 'Capacidade para acompanhar você nos grandes desafios.' },
    { id: 'premium', name: 'Premium', image: 'premium.webp', example: 'Premium', description: 'Conforto e sofisticação para aproveitar cada trajeto.' }
  ],
  benefits: [
    { icon: 'document', title: 'Documentação', text: 'Menos burocracia para começar a dirigir.' },
    { icon: 'tool', title: 'Revisões', text: 'Cuidados programados para acompanhar sua rotina.' },
    { icon: 'shield', title: 'Proteção', text: 'Coberturas e condições previstas no seu plano.' },
    { icon: 'tire', title: 'Pneus', text: 'Manutenção conforme as condições contratadas.' },
    { icon: 'phone', title: 'Atendimento', text: 'Suporte para os momentos em que você precisar.' },
    { icon: 'car', title: 'Assistência', text: 'Apoio para seguir viagem com mais tranquilidade.' }
  ]
};
