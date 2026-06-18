/** Pakistani CNIC: 13 digits formatted as xxxxx-xxxxxxx-x */
const CNIC_PATTERN = /^\d{5}-\d{7}-\d{1}$/

export function formatCnicInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

export function isValidCnic(value: string): boolean {
  return CNIC_PATTERN.test(value.trim())
}

export function cnicValidationMessage(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'CNIC is required.'
  if (!isValidCnic(trimmed)) {
    return 'Enter a valid CNIC in the format xxxxx-xxxxxxx-x (13 digits).'
  }
  return null
}
