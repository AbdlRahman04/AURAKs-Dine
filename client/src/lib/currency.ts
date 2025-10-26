// UAE Dirham currency formatting utility
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} د.إ`;
}

// Format without decimal places for whole numbers
export function formatCurrencyShort(amount: number): string {
  if (amount % 1 === 0) {
    return `${amount.toFixed(0)} د.إ`;
  }
  return `${amount.toFixed(2)} د.إ`;
}
