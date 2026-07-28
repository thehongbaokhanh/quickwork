export function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildSearchText(values: unknown[]): string {
  return normalizeSearchText(
    values
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value) => value !== null && value !== undefined && value !== '')
      .join(' ')
  )
}
