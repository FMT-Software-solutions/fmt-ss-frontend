export const ease = [0.22, 1, 0.36, 1] as const

export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("en-GH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
