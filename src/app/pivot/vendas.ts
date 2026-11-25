/**
 * Vendas fictícias, mas com cara de dados reais, de uma rede de varejo de eletrônicos:
 * - lojas em 18 cidades, com peso proporcional ao tamanho do mercado (SP vende mais que AM);
 * - catálogo com preço e custo por produto (margens diferentes por categoria);
 * - 4 canais com descontos próprios (marketplace cobra comissão, loja dá mais desconto);
 * - sazonalidade (Black Friday, Natal, Dia das Mães, janeiro fraco) e crescimento ano a ano;
 * - devoluções (quantidade e valores negativos);
 * - jan/2024 a out/2026.
 * Gerado de forma determinística: o mesmo número de vendas dá sempre os mesmos dados.
 */
export interface Venda {
  pedido: number;
  data: string;
  regiao: string;
  uf: string;
  cidade: string;
  canal: 'Loja física' | 'E-commerce' | 'Marketplace' | 'Televendas';
  vendedor: string;
  cliente: 'Pessoa física' | 'Empresa';
  categoria: string;
  produto: string;
  tipo: 'Venda' | 'Devolução';
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  faturamento: number;
  custo: number;
  lucro: number;
}

const CIDADES: { cidade: string; uf: string; regiao: string; peso: number }[] = [
  { cidade: 'São Paulo', uf: 'SP', regiao: 'Sudeste', peso: 20 },
  { cidade: 'Campinas', uf: 'SP', regiao: 'Sudeste', peso: 6 },
  { cidade: 'Ribeirão Preto', uf: 'SP', regiao: 'Sudeste', peso: 4 },
  { cidade: 'Rio de Janeiro', uf: 'RJ', regiao: 'Sudeste', peso: 11 },
  { cidade: 'Niterói', uf: 'RJ', regiao: 'Sudeste', peso: 2 },
  { cidade: 'Belo Horizonte', uf: 'MG', regiao: 'Sudeste', peso: 8 },
  { cidade: 'Uberlândia', uf: 'MG', regiao: 'Sudeste', peso: 3 },
  { cidade: 'Curitiba', uf: 'PR', regiao: 'Sul', peso: 6 },
  { cidade: 'Londrina', uf: 'PR', regiao: 'Sul', peso: 2 },
  { cidade: 'Porto Alegre', uf: 'RS', regiao: 'Sul', peso: 6 },
  { cidade: 'Florianópolis', uf: 'SC', regiao: 'Sul', peso: 4 },
  { cidade: 'Salvador', uf: 'BA', regiao: 'Nordeste', peso: 5 },
  { cidade: 'Recife', uf: 'PE', regiao: 'Nordeste', peso: 4 },
  { cidade: 'Fortaleza', uf: 'CE', regiao: 'Nordeste', peso: 4 },
  { cidade: 'Goiânia', uf: 'GO', regiao: 'Centro-Oeste', peso: 4 },
  { cidade: 'Brasília', uf: 'DF', regiao: 'Centro-Oeste', peso: 5 },
  { cidade: 'Belém', uf: 'PA', regiao: 'Norte', peso: 3 },
  { cidade: 'Manaus', uf: 'AM', regiao: 'Norte', peso: 3 },
];

/** preço de lista, custo (fração do preço), quantidade máxima por pedido e peso nas vendas. */
const PRODUTOS: { categoria: string; produto: string; preco: number; custo: number; qtdMax: number; peso: number }[] = [
  { categoria: 'Informática', produto: 'Notebook 15"', preco: 4299, custo: 0.78, qtdMax: 2, peso: 6 },
  { categoria: 'Informática', produto: 'Monitor 27"', preco: 1399, custo: 0.72, qtdMax: 3, peso: 5 },
  { categoria: 'Informática', produto: 'SSD 1 TB', preco: 449, custo: 0.65, qtdMax: 4, peso: 6 },
  { categoria: 'Informática', produto: 'Teclado mecânico', preco: 329, custo: 0.55, qtdMax: 4, peso: 4 },
  { categoria: 'Informática', produto: 'Mouse sem fio', preco: 89, custo: 0.45, qtdMax: 8, peso: 8 },
  { categoria: 'Celulares', produto: 'Smartphone Pro', preco: 6499, custo: 0.82, qtdMax: 1, peso: 4 },
  { categoria: 'Celulares', produto: 'Smartphone A', preco: 1799, custo: 0.75, qtdMax: 2, peso: 9 },
  { categoria: 'Celulares', produto: 'Fone Bluetooth', preco: 249, custo: 0.5, qtdMax: 4, peso: 9 },
  { categoria: 'Celulares', produto: 'Carregador turbo', preco: 119, custo: 0.4, qtdMax: 6, peso: 8 },
  { categoria: 'Eletrodomésticos', produto: 'Geladeira frost free', preco: 3899, custo: 0.76, qtdMax: 1, peso: 3 },
  { categoria: 'Eletrodomésticos', produto: 'Lava e seca', preco: 2799, custo: 0.74, qtdMax: 1, peso: 3 },
  { categoria: 'Eletrodomésticos', produto: 'Micro-ondas', preco: 749, custo: 0.68, qtdMax: 2, peso: 4 },
  { categoria: 'Eletrodomésticos', produto: 'Air fryer', preco: 449, custo: 0.6, qtdMax: 3, peso: 7 },
  { categoria: 'TV e Áudio', produto: 'Smart TV 55"', preco: 3199, custo: 0.8, qtdMax: 2, peso: 5 },
  { categoria: 'TV e Áudio', produto: 'Soundbar', preco: 899, custo: 0.62, qtdMax: 2, peso: 3 },
  { categoria: 'TV e Áudio', produto: 'Caixa de som portátil', preco: 379, custo: 0.55, qtdMax: 3, peso: 5 },
];

const CANAIS: { canal: Venda['canal']; peso: number; descontoMax: number; comissao: number }[] = [
  { canal: 'Loja física', peso: 45, descontoMax: 0.12, comissao: 0 },
  { canal: 'E-commerce', peso: 33, descontoMax: 0.08, comissao: 0 },
  { canal: 'Marketplace', peso: 14, descontoMax: 0.05, comissao: 0.12 },
  { canal: 'Televendas', peso: 8, descontoMax: 0.1, comissao: 0 },
];

const VENDEDORES_LOJA = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Prado', 'Fábio Nunes', 'Gabriela Reis', 'Heitor Alves'];
const VENDEDORES_TELE = ['Júlia Castro', 'Lucas Ferraz'];

/** Peso de cada mês nas vendas: janeiro fraco, Dia das Mães, Black Friday e Natal. */
const SAZONALIDADE = [0.75, 0.8, 0.95, 0.9, 1.15, 1.0, 0.95, 1.05, 0.95, 1.0, 1.7, 1.6];

function prng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function sorteioPonderado<T>(itens: T[], peso: (t: T) => number, rnd: () => number): T {
  const total = itens.reduce((s, t) => s + peso(t), 0);
  let r = rnd() * total;
  for (const t of itens) if ((r -= peso(t)) <= 0) return t;
  return itens[itens.length - 1];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function gerarVendas(qtd: number, seed = 2024): Venda[] {
  const rnd = prng(seed);

  // Meses de jan/2024 a out/2026, com peso = sazonalidade × crescimento (~14% ao ano)
  const meses: { ano: number; mes: number; peso: number }[] = [];
  for (let ano = 2024; ano <= 2026; ano++) {
    for (let mes = 0; mes < 12; mes++) {
      if (ano === 2026 && mes > 9) break;
      meses.push({ ano, mes, peso: SAZONALIDADE[mes] * Math.pow(1.14, ano - 2024 + mes / 12) });
    }
  }

  const vendas: Venda[] = [];
  for (let i = 0; i < qtd; i++) {
    const m = sorteioPonderado(meses, (x) => x.peso, rnd);
    const diasNoMes = new Date(m.ano, m.mes + 1, 0).getDate();
    // Black Friday: metade das vendas de novembro cai na última semana
    const dia = m.mes === 10 && rnd() < 0.5 ? 22 + Math.floor(rnd() * 8) : 1 + Math.floor(rnd() * diasNoMes);
    const data = `${m.ano}-${String(m.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    const local = sorteioPonderado(CIDADES, (c) => c.peso, rnd);
    const canal = sorteioPonderado(CANAIS, (c) => c.peso, rnd);
    // Linha branca vende mais na loja; acessórios, mais no digital
    const produto = sorteioPonderado(PRODUTOS, (p) => p.peso * (canal.canal === 'Loja física' && p.preco > 2000 ? 1.4 : 1), rnd);

    const devolucao = rnd() < 0.03;
    const quantidade = (1 + Math.floor(rnd() * rnd() * produto.qtdMax)) * (devolucao ? -1 : 1);
    const blackFriday = m.mes === 10 && dia >= 22;
    const desconto = r2(rnd() * canal.descontoMax + (blackFriday ? 0.1 : 0));
    // Preço sobe com a inflação (~5% ao ano)
    const precoUnitario = r2(produto.preco * Math.pow(1.05, m.ano - 2024));

    const faturamento = r2(quantidade * precoUnitario * (1 - desconto));
    const custo = r2(quantidade * precoUnitario * produto.custo + faturamento * canal.comissao);

    vendas.push({
      pedido: 100000 + i,
      data,
      regiao: local.regiao,
      uf: local.uf,
      cidade: local.cidade,
      canal: canal.canal,
      vendedor:
        canal.canal === 'Loja física'
          ? VENDEDORES_LOJA[Math.floor(rnd() * VENDEDORES_LOJA.length)]
          : canal.canal === 'Televendas'
            ? VENDEDORES_TELE[Math.floor(rnd() * VENDEDORES_TELE.length)]
            : 'Canal digital',
      cliente: rnd() < 0.18 ? 'Empresa' : 'Pessoa física',
      categoria: produto.categoria,
      produto: produto.produto,
      tipo: devolucao ? 'Devolução' : 'Venda',
      quantidade,
      precoUnitario,
      desconto,
      faturamento,
      custo,
      lucro: r2(faturamento - custo),
    });
  }
  return vendas.sort((a, b) => a.data.localeCompare(b.data));
}
