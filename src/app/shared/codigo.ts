/** Tipos e utilitários comuns dos geradores de código das páginas. */

export type Linguagem = 'angular' | 'react' | 'vue' | 'html';

export interface ArquivoCodigo {
  nome: string;
  codigo: string;
}

/** Versão dos pacotes @brunomouradev usada nos exemplos de código. */
export const VERSAO = '0.1.5';

export const LINGUAGENS: { id: Linguagem; rotulo: string }[] = [
  { id: 'angular', rotulo: 'Angular' },
  { id: 'react', rotulo: 'React' },
  { id: 'vue', rotulo: 'Vue' },
  { id: 'html', rotulo: 'HTML puro' },
];

/** Comando de instalação de um pacote em cada linguagem. */
export function instalacao(pacote: string): Record<Linguagem, string> {
  const npm = `npm i @brunomouradev/${pacote}@${VERSAO}`;
  return {
    angular: npm,
    react: npm,
    vue: npm,
    html: `<script type="module" src="https://cdn.jsdelivr.net/npm/@brunomouradev/${pacote}@${VERSAO}/dist/index.js"></script>`,
  };
}

/** Realce de sintaxe mínimo (comentários, strings, palavras-chave, tags). */
export function destacar(codigo: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const re =
    /(\/\/[^\n]*|<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|const|let|function|return|async|await|class|new|type|interface|if|else|switch|case|declare|global|namespace|true|false|null|undefined)\b|(<\/?[a-zA-Z][\w.-]*|\/?>)|(@[A-Z]\w*)/g;
  let out = '';
  let ultimo = 0;
  for (let m: RegExpExecArray | null; (m = re.exec(codigo)); ) {
    out += esc(codigo.slice(ultimo, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 't' : 'd';
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    ultimo = m.index + m[0].length;
  }
  return out + esc(codigo.slice(ultimo));
}

/** Item do log de eventos. */
export interface Evento {
  hora: string;
  nome: string;
  detalhe: string;
}
