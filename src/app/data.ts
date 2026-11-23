/** Dados fictícios para o protótipo (gerados de forma determinística). */
export interface Fatura {
  id: number;
  cliente: { nome: string; uf: string };
  vendedor: string;
  status: 'Pago' | 'Aberto' | 'Atrasado' | 'Cancelado';
  forma: 'Pix' | 'Boleto' | 'Cartão' | 'Transferência';
  emissao: string;
  vencimento: string;
  valor: number;
  desconto: number;
  recebido: number;
  ativo: boolean;
}

const NOMES = [
  'Padaria Pão Quente', 'Mercado Bom Preço', 'Auto Peças Andrade', 'Farmácia Vida', 'Construtora Horizonte',
  'Ótica Visão', 'Pet Shop Amigo Fiel', 'Livraria Página', 'Clínica Sorriso', 'Academia Movimento',
  'Restaurante Sabor da Terra', 'Hotel Bela Vista', 'Escola Saber', 'Gráfica Expressa', 'Loja Estilo',
  'Café do Ponto', 'Tech Soluções', 'Distribuidora Norte', 'Agro Campo Verde', 'Transportes Rápido',
];
const UFS = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO', 'PE', 'CE'];
const VENDEDORES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Prado', 'Fábio Nunes'];
const STATUS: Fatura['status'][] = ['Pago', 'Pago', 'Pago', 'Aberto', 'Aberto', 'Atrasado', 'Cancelado'];
const FORMAS: Fatura['forma'][] = ['Pix', 'Boleto', 'Cartão', 'Transferência'];

function prng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function gerarFaturas(qtd: number, seed = 42): Fatura[] {
  const rnd = prng(seed);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const base = Date.UTC(2026, 0, 1);
  const dia = 86_400_000;
  const out: Fatura[] = new Array(qtd);
  for (let i = 0; i < qtd; i++) {
    const emissao = base + Math.floor(rnd() * 320) * dia;
    const vencimento = emissao + (15 + Math.floor(rnd() * 45)) * dia;
    const status = pick(STATUS);
    const estorno = rnd() < 0.04;
    const valor = Math.round((estorno ? -1 : 1) * (80 + rnd() * 9_900) * 100) / 100;
    out[i] = {
      id: 1000 + i,
      cliente: { nome: pick(NOMES), uf: pick(UFS) },
      vendedor: pick(VENDEDORES),
      status,
      forma: pick(FORMAS),
      emissao: new Date(emissao).toISOString().slice(0, 10),
      vencimento: new Date(vencimento).toISOString().slice(0, 10),
      valor,
      desconto: Math.round(rnd() * 150) / 10,
      recebido: status === 'Pago' ? 100 : status === 'Cancelado' ? 0 : Math.round(rnd() * 90),
      ativo: status !== 'Cancelado',
    };
  }
  return out;
}
