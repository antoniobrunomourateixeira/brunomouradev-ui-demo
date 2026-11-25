/**
 * Carteira de cobrança fictícia, mas com cara de real, de uma assessoria que cobra
 * títulos de vários credores:
 * - credores de segmentos diferentes (banco, financeira, varejo, telecom, energia, escola),
 *   cada um com suas carteiras e faixas de valor (veículo vale muito mais que conta de telefone);
 * - vencimentos de jan/2024 a dez/2026, com data-base em 31/10/2026 (o que vence depois está "a vencer");
 * - quanto mais velha a dívida, menor a chance de recuperar e maior o desconto para quitar;
 * - juros de 1% ao mês + multa de 2% sobre o atraso;
 * - acordos (em dia ou quebrados), protestos e títulos sem contato;
 * - WhatsApp recupera mais que carta.
 * Gerado de forma determinística: a mesma quantidade dá sempre os mesmos dados.
 */
export interface Titulo {
  titulo: number;
  credor: string;
  segmento: string;
  carteira: string;
  regiao: string;
  uf: string;
  devedor: 'Pessoa física' | 'Empresa';
  vencimento: string;
  diasAtraso: number;
  /** 0 = a vencer, 1 = 1–30 dias, 2 = 31–60, 3 = 61–90, 4 = 91–180, 5 = 181–360, 6 = mais de 360. */
  faixa: number;
  situacao: 'Em aberto' | 'Acordo em dia' | 'Acordo quebrado' | 'Pago' | 'Protestado';
  canal: 'WhatsApp' | 'Ligação' | 'SMS' | 'E-mail' | 'Carta' | 'Sem contato';
  operador: string;
  valorOriginal: number;
  /** Original + juros e multa até a data-base (ou até o pagamento). */
  valorAtualizado: number;
  /** O que ainda falta receber. */
  saldo: number;
  /** O que já entrou (pagamento à vista ou parcelas do acordo). */
  recuperado: number;
  /** Desconto dado para quitar ou fazer acordo. */
  descontoConcedido: number;
  /** 100 se houve recuperação, 0 se não (a média vira a taxa de recuperação). */
  taxaRecuperacao: number;
}

export const FAIXAS = ['A vencer', '1 a 30 dias', '31 a 60 dias', '61 a 90 dias', '91 a 180 dias', '181 a 360 dias', 'Mais de 360 dias'];

const CREDORES: { credor: string; segmento: string; peso: number; carteiras: { nome: string; min: number; max: number; peso: number }[] }[] = [
  {
    credor: 'Banco Horizonte', segmento: 'Banco', peso: 26,
    carteiras: [
      { nome: 'Cartão de crédito', min: 400, max: 9000, peso: 5 },
      { nome: 'Crédito pessoal', min: 2000, max: 25000, peso: 3 },
      { nome: 'Cheque especial', min: 300, max: 6000, peso: 2 },
    ],
  },
  {
    credor: 'Financeira Avante', segmento: 'Financeira', peso: 18,
    carteiras: [
      { nome: 'Financiamento de veículo', min: 12000, max: 65000, peso: 2 },
      { nome: 'Crédito consignado', min: 3000, max: 30000, peso: 3 },
    ],
  },
  {
    credor: 'Lojas Primavera', segmento: 'Varejo', peso: 20,
    carteiras: [
      { nome: 'Crediário', min: 150, max: 3500, peso: 4 },
      { nome: 'Cartão da loja', min: 200, max: 4500, peso: 3 },
    ],
  },
  {
    credor: 'Conecta Telecom', segmento: 'Telecom', peso: 16,
    carteiras: [
      { nome: 'Telefonia móvel', min: 60, max: 450, peso: 3 },
      { nome: 'Internet residencial', min: 90, max: 700, peso: 3 },
      { nome: 'Plano empresarial', min: 400, max: 6000, peso: 1 },
    ],
  },
  {
    credor: 'Energia Vale', segmento: 'Energia', peso: 12,
    carteiras: [{ nome: 'Conta de energia', min: 80, max: 1500, peso: 1 }],
  },
  {
    credor: 'Colégio Saber', segmento: 'Educação', peso: 8,
    carteiras: [{ nome: 'Mensalidade escolar', min: 700, max: 3200, peso: 1 }],
  },
];

const UFS: { uf: string; regiao: string; peso: number }[] = [
  { uf: 'SP', regiao: 'Sudeste', peso: 28 }, { uf: 'RJ', regiao: 'Sudeste', peso: 11 }, { uf: 'MG', regiao: 'Sudeste', peso: 10 },
  { uf: 'ES', regiao: 'Sudeste', peso: 2 }, { uf: 'PR', regiao: 'Sul', peso: 6 }, { uf: 'RS', regiao: 'Sul', peso: 6 },
  { uf: 'SC', regiao: 'Sul', peso: 4 }, { uf: 'BA', regiao: 'Nordeste', peso: 7 }, { uf: 'PE', regiao: 'Nordeste', peso: 5 },
  { uf: 'CE', regiao: 'Nordeste', peso: 4 }, { uf: 'MA', regiao: 'Nordeste', peso: 2 }, { uf: 'GO', regiao: 'Centro-Oeste', peso: 4 },
  { uf: 'DF', regiao: 'Centro-Oeste', peso: 3 }, { uf: 'MT', regiao: 'Centro-Oeste', peso: 2 }, { uf: 'PA', regiao: 'Norte', peso: 3 },
  { uf: 'AM', regiao: 'Norte', peso: 2 },
];

/** Canal do último contato e quanto ele ajuda a recuperar. */
const CANAIS: { canal: Titulo['canal']; peso: number; efeito: number }[] = [
  { canal: 'WhatsApp', peso: 34, efeito: 1.25 },
  { canal: 'Ligação', peso: 24, efeito: 1.1 },
  { canal: 'SMS', peso: 16, efeito: 0.9 },
  { canal: 'E-mail', peso: 12, efeito: 0.75 },
  { canal: 'Carta', peso: 4, efeito: 0.5 },
  { canal: 'Sem contato', peso: 10, efeito: 0.15 },
];

const OPERADORES = ['Amanda Silva', 'Bruno Costa', 'Camila Duarte', 'Daniel Moura', 'Eduarda Lins', 'Felipe Araújo', 'Giovana Pires', 'Henrique Sá'];

/** Chance de recuperar por faixa de atraso (índice = faixa). */
const CHANCE = [0, 0.62, 0.45, 0.32, 0.2, 0.1, 0.04];
/** Desconto médio para quitar por faixa. */
const DESCONTO = [0, 0.02, 0.06, 0.12, 0.25, 0.4, 0.6];

const DATA_BASE = Date.UTC(2026, 9, 31);
const DIA = 86_400_000;

function prng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function sorteio<T>(itens: T[], peso: (t: T) => number, rnd: () => number): T {
  const total = itens.reduce((s, t) => s + peso(t), 0);
  let r = rnd() * total;
  for (const t of itens) if ((r -= peso(t)) <= 0) return t;
  return itens[itens.length - 1];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function faixaDeAtraso(dias: number): number {
  if (dias <= 0) return 0;
  if (dias <= 30) return 1;
  if (dias <= 60) return 2;
  if (dias <= 90) return 3;
  if (dias <= 180) return 4;
  if (dias <= 360) return 5;
  return 6;
}

export function gerarTitulos(qtd: number, seed = 33): Titulo[] {
  const rnd = prng(seed);
  const inicio = Date.UTC(2024, 0, 1);
  const fim = Date.UTC(2026, 11, 31);
  const titulos: Titulo[] = [];

  for (let i = 0; i < qtd; i++) {
    const c = sorteio(CREDORES, (x) => x.peso, rnd);
    const cart = sorteio(c.carteiras, (x) => x.peso, rnd);
    const local = sorteio(UFS, (x) => x.peso, rnd);
    const canal = sorteio(CANAIS, (x) => x.peso, rnd);

    // A carteira recebe mais títulos recentes do que antigos (quem paga sai da carteira)
    const t = Math.pow(rnd(), 0.4);
    const venc = inicio + Math.floor(t * (fim - inicio) / DIA) * DIA;
    const diasAtraso = Math.max(0, Math.round((DATA_BASE - venc) / DIA));
    const faixa = faixaDeAtraso(diasAtraso);

    // Valor: distribuição puxada para baixo (muitos títulos pequenos, poucos grandes)
    const valorOriginal = r2(cart.min + Math.pow(rnd(), 2.2) * (cart.max - cart.min));
    const empresa = cart.nome === 'Plano empresarial' || rnd() < 0.08;

    let situacao: Titulo['situacao'] = 'Em aberto';
    let recuperado = 0;
    let descontoConcedido = 0;
    let mesesJuros = diasAtraso / 30;

    if (faixa > 0) {
      const chance = Math.min(0.9, CHANCE[faixa] * canal.efeito);
      const r = rnd();
      if (r < chance * 0.6) {
        situacao = 'Pago';
        mesesJuros = (diasAtraso * (0.2 + rnd() * 0.6)) / 30; // pagou antes da data-base
      } else if (r < chance) {
        situacao = rnd() < 0.7 ? 'Acordo em dia' : 'Acordo quebrado';
      } else if (faixa >= 4 && rnd() < 0.18) {
        situacao = 'Protestado';
      }
    }

    const valorAtualizado = r2(valorOriginal * (1 + (faixa > 0 ? 0.02 : 0) + 0.01 * mesesJuros));
    if (situacao === 'Pago') {
      const desc = Math.min(0.85, DESCONTO[faixa] * (0.6 + rnd() * 0.8));
      descontoConcedido = r2(valorAtualizado * desc);
      recuperado = r2(valorAtualizado - descontoConcedido);
    } else if (situacao === 'Acordo em dia' || situacao === 'Acordo quebrado') {
      const desc = Math.min(0.85, DESCONTO[faixa] * (0.5 + rnd() * 0.7));
      descontoConcedido = r2(valorAtualizado * desc);
      const acordo = valorAtualizado - descontoConcedido;
      const parcelasPagas = situacao === 'Acordo em dia' ? 0.2 + rnd() * 0.6 : 0.05 + rnd() * 0.25;
      recuperado = r2(acordo * parcelasPagas);
    }
    const saldo = situacao === 'Pago' ? 0 : r2(valorAtualizado - descontoConcedido - recuperado);

    titulos.push({
      titulo: 500000 + i,
      credor: c.credor,
      segmento: c.segmento,
      carteira: cart.nome,
      regiao: local.regiao,
      uf: local.uf,
      devedor: empresa ? 'Empresa' : 'Pessoa física',
      vencimento: new Date(venc).toISOString().slice(0, 10),
      diasAtraso,
      faixa,
      situacao,
      canal: faixa === 0 ? 'Sem contato' : canal.canal,
      operador: faixa === 0 ? 'Régua automática' : OPERADORES[Math.floor(rnd() * OPERADORES.length)],
      valorOriginal,
      valorAtualizado,
      saldo,
      recuperado,
      descontoConcedido,
      taxaRecuperacao: recuperado > 0 ? 100 : 0,
    });
  }
  return titulos.sort((a, b) => a.vencimento.localeCompare(b.vencimento));
}
