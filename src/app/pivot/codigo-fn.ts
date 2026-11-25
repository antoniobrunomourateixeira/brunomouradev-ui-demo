/** Função que também sabe se escrever como código no exemplo gerado. */
export type ComCodigo<F> = F & { __codigo: string };

export function comCodigo<F extends Function>(fn: F, codigo: string): ComCodigo<F> {
  return Object.assign(fn, { __codigo: codigo });
}
