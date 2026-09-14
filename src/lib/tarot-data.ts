export interface TarotCard {
  id: number;
  name: string;
  arcana: "major" | "minor";
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  suitLabel: string | null;
  upright: string;
  reversed: string;
}

// ---------- Arcanos Maiores (0-21) ----------
// Textos autorais e concisos — não são transcrição de nenhum guia específico.
const MAJOR_ARCANA: Omit<TarotCard, "arcana" | "suit" | "suitLabel">[] = [
  { id: 0, name: "O Louco", upright: "Começo sem mapa: fé no salto, abertura para o inesperado, leveza antes das regras.", reversed: "Risco tomado sem preparo nenhum, ou o oposto — medo travando qualquer movimento novo." },
  { id: 1, name: "O Mago", upright: "Todos os recursos já na mesa: vontade clara transformando ideia em ação concreta.", reversed: "Talento usado para manipular, ou potencial visível que nunca sai do lugar." },
  { id: 2, name: "A Sacerdotisa", upright: "Saber que vem de dentro, silêncio que escuta mais do que a lógica explica.", reversed: "Intuição ignorada, segredos guardados até demais, distância da própria voz interior." },
  { id: 3, name: "A Imperatriz", upright: "Fartura que cresce sozinha quando cuidada: criação, corpo, prazer e natureza em expansão.", reversed: "Autocuidado esquecido, criatividade bloqueada, ambiente que sufoca em vez de nutrir." },
  { id: 4, name: "O Imperador", upright: "Estrutura que sustenta: disciplina, limites claros e autoridade construída por consistência.", reversed: "Controle que vira rigidez, autoridade imposta pela força em vez de conquistada." },
  { id: 5, name: "O Hierofante", upright: "Tradição como bússola: aprendizado com quem já trilhou o caminho, pertencimento a um grupo.", reversed: "Regra questionada, caminho próprio fora da fórmula pronta, ruptura com o convencional." },
  { id: 6, name: "Os Enamorados", upright: "Escolha guiada por valores reais, conexão que exige ver o outro por inteiro.", reversed: "Decisão adiada, desalinhamento de valores, escolha feita por medo de ficar só." },
  { id: 7, name: "O Carro", upright: "Direção tomada com vontade: forças opostas puxadas para o mesmo destino.", reversed: "Rumo perdido, energia dispersa em direções contrárias, avanço sem controle real." },
  { id: 8, name: "A Força", upright: "Poder que convence sem impor: paciência e gentileza domando o que é bruto.", reversed: "Dúvida sobre a própria capacidade, força usada como violência em vez de coragem quieta." },
  { id: 9, name: "O Eremita", upright: "Retirada proposital: resposta que só aparece longe do barulho, luz própria guiando.", reversed: "Isolamento que já não ajuda, solidão sem propósito, recusa de qualquer ajuda." },
  { id: 10, name: "A Roda da Fortuna", upright: "Ciclo virando: o momento certo chegando sem aviso, sorte que também se constrói.", reversed: "Resistência à mudança inevitável, sequência de reveses, sensação de estar fora de controle." },
  { id: 11, name: "A Justiça", upright: "Causa e efeito sem atalho: decisão pesada com clareza, verdade que se impõe.", reversed: "Desequilíbrio não resolvido, consequência evitada, julgamento distorcido por parcialidade." },
  { id: 12, name: "O Enforcado", upright: "Pausa deliberada: ver a situação de outro ângulo antes de agir de novo.", reversed: "Sacrifício sem sentido, estagnação por teimosia, resistência a soltar o que já passou." },
  { id: 13, name: "A Morte", upright: "Fim necessário para o que vem depois: encerrar de vez o que já não serve.", reversed: "Transição negada, apego ao que deveria ter terminado, medo travando a virada." },
  { id: 14, name: "A Temperança", upright: "Mistura no ponto certo: paciência combinando extremos até virar algo novo e estável.", reversed: "Excesso ou falta de medida, pressa que estraga o equilíbrio, extremos sem meio-termo." },
  { id: 15, name: "O Diabo", upright: "Corrente visível: vício, desejo ou dependência que prende mais pela mente que pelos fatos.", reversed: "Primeiro passo para romper o padrão, consciência do que estava prendendo por escolha." },
  { id: 16, name: "A Torre", upright: "Estrutura falsa desmoronando de repente: verdade chocante que derruba o que estava mal construído.", reversed: "Colapso sendo adiado à força, medo da mudança que de qualquer forma vai acontecer." },
  { id: 17, name: "A Estrela", upright: "Esperança depois da tempestade: confiança tranquila de que o caminho volta a fazer sentido.", reversed: "Desânimo, fé abalada, sensação de que nada de bom está por vir." },
  { id: 18, name: "A Lua", upright: "Zona de sombra: medos e intuições confusas se misturando, nem tudo é o que parece.", reversed: "Confusão se dissipando, verdade escondida vindo à tona, ansiedade perdendo força." },
  { id: 19, name: "O Sol", upright: "Clareza total e alegria sem disfarce: vitalidade, sucesso visível, verdade simples e boa.", reversed: "Otimismo forçado, brilho momentaneamente ofuscado, alegria que ainda não voltou de vez." },
  { id: 20, name: "O Julgamento", upright: "Chamado que não dá para ignorar: avaliação honesta do que foi vivido, renascimento consciente.", reversed: "Autocrítica dura demais, recusa em encarar o próprio histórico, chamado ainda não ouvido." },
  { id: 21, name: "O Mundo", upright: "Ciclo fechado por inteiro: conquista reconhecida, sensação rara de tudo se encaixar.", reversed: "Quase lá, mas falta um passo; ciclo que se arrasta sem fechar de vez." },
];

// ---------- Arcanos Menores (22-77) ----------
const SUITS: {
  key: "wands" | "cups" | "swords" | "pentacles";
  label: string;
  domain: string;
}[] = [
  { key: "wands", label: "Paus", domain: "ação, iniciativa e energia criativa" },
  { key: "cups", label: "Copas", domain: "emoções, vínculos e intuição" },
  { key: "swords", label: "Espadas", domain: "pensamento, conflitos e decisões" },
  { key: "pentacles", label: "Ouros", domain: "corpo, trabalho e recursos materiais" },
];

const PIP_NAMES = [
  "Ás", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez",
];

const PIP_TEMPLATES: { upright: string; reversed: string }[] = [
  { upright: "Um começo puro em {d}: potencial intacto, ainda por moldar.", reversed: "Potencial em {d} bloqueado ou mal aproveitado logo na largada." },
  { upright: "Escolha ou equilíbrio inicial em {d}, decisão pedindo atenção.", reversed: "Indecisão ou desequilíbrio pesando sobre {d}." },
  { upright: "Primeiros resultados aparecendo em {d}, crescimento com apoio de fora.", reversed: "Atraso ou falta de apoio no que envolve {d}." },
  { upright: "Estabilidade conquistada em {d} — hora de aproveitar ou arriscar sair dela.", reversed: "Estagnação disfarçada de segurança em {d}." },
  { upright: "Tensão ou perda em {d} expondo o que precisa mudar.", reversed: "Conflito em {d} perdendo força, lição ficando mais clara." },
  { upright: "Cooperação avançando {d}, trocas equilibradas dando resultado.", reversed: "Desequilíbrio de poder ou generosidade unilateral em {d}." },
  { upright: "Persistência sendo testada em {d}, resultado exige continuar mesmo cansado.", reversed: "Dúvida sobre valer a pena continuar em {d}." },
  { upright: "Movimento rápido em {d}, as coisas ganhando velocidade de repente.", reversed: "Obstáculo temporário atrasando o que já estava em curso em {d}." },
  { upright: "Força acumulada em {d}, quase no limite antes da virada.", reversed: "Exaustão ou defensividade excessiva em {d}." },
  { upright: "Ciclo completo em {d}, peso total do que foi construído.", reversed: "Fim de ciclo em {d} chegando como alívio ou como excesso." },
];

const COURT_TEMPLATES: { rank: string; upright: string; reversed: string }[] = [
  { rank: "Pajem", upright: "Curiosidade genuína sobre {d}, primeiros passos de aprendizado.", reversed: "Imaturidade ou notícia atrasada envolvendo {d}." },
  { rank: "Cavaleiro", upright: "Ação decidida em {d}, disposição para ir atrás sem esperar o momento perfeito.", reversed: "Impulsividade em {d} sem direção nem plano por trás." },
  { rank: "Rainha", upright: "Domínio maduro e intuitivo de {d}, segurança que não precisa provar nada.", reversed: "Insegurança escondida atrás do controle sobre {d}." },
  { rank: "Rei", upright: "Domínio maduro e estratégico de {d}, autoridade construída com o tempo.", reversed: "Rigidez ou abuso de autoridade no que toca {d}." },
];

function buildMinorArcana(): Omit<TarotCard, "arcana">[] {
  const cards: Omit<TarotCard, "arcana">[] = [];
  let id = 22;
  for (const suit of SUITS) {
    for (let i = 0; i < 10; i++) {
      const t = PIP_TEMPLATES[i];
      cards.push({
        id: id++,
        name: `${PIP_NAMES[i]} de ${suit.label}`,
        suit: suit.key,
        suitLabel: suit.label,
        upright: t.upright.replace("{d}", suit.domain),
        reversed: t.reversed.replace("{d}", suit.domain),
      });
    }
    for (const court of COURT_TEMPLATES) {
      cards.push({
        id: id++,
        name: `${court.rank} de ${suit.label}`,
        suit: suit.key,
        suitLabel: suit.label,
        upright: court.upright.replace("{d}", suit.domain),
        reversed: court.reversed.replace("{d}", suit.domain),
      });
    }
  }
  return cards;
}

export const TAROT_DECK: TarotCard[] = [
  ...MAJOR_ARCANA.map((c) => ({ ...c, arcana: "major" as const, suit: null, suitLabel: null })),
  ...buildMinorArcana().map((c) => ({ ...c, arcana: "minor" as const })),
];

export function getCardById(id: number): TarotCard {
  const card = TAROT_DECK[id];
  if (!card) throw new Error(`Carta inválida: ${id}`);
  return card;
}
