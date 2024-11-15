export function formatCurrency(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

export function parseCurrency(valor: string): number {
  // Remove todos os caracteres não numéricos exceto ponto e vírgula
  const numeroLimpo = valor.replace(/[^\d.,]/g, '')
  
  // Converte vírgula para ponto e remove pontos de milhar
  const numeroFormatado = numeroLimpo
    .replace(/\./g, '')
    .replace(',', '.')
  
  return Number(numeroFormatado) || 0
} 