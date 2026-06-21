/**
 * Detects phone numbers embedded in free text (e.g. an agency bio/description).
 *
 * Agencies must not advertise direct contact numbers in their public bio, so we
 * block saving when a phone number is present. Two evasion techniques are caught:
 *
 *  1. Plain digit sequences, optionally spaced/dashed/dotted or with a country
 *     code (e.g. "0311-1234567", "+92 311 1234567", "0 3 1 1 1 2 3 4 5 6 7").
 *  2. Numbers written as words, in English ("zero three one one ...") and common
 *     Roman-Urdu spellings ("sifar teen aik aik ...").
 */

const PHONE_ERROR =
  'Bio cannot contain a phone number. Please remove any contact numbers (written as digits or words).'

/** Minimum run of digits we treat as a phone number. */
const MIN_PHONE_DIGITS = 7

/** Map of spelled-out number words (English + Roman Urdu) to their digit. */
const NUMBER_WORDS: Record<string, string> = {
  // English
  zero: '0',
  one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9',
  // Roman Urdu / Hindi
  sifar: '0', siffar: '0',
  aik: '1', ek: '1',
  do: '2',
  teen: '3',
  char: '4', chaar: '4',
  panch: '5', paanch: '5',
  che: '6', chay: '6', cheh: '6',
  saat: '7', sat: '7',
  aath: '8', ath: '8',
  nau: '9', no: '9',
}

/** Words that multiply the next number word ("double 3" -> "33"). */
const REPEAT_WORDS: Record<string, number> = {
  double: 2,
  triple: 3,
  dabal: 2,
  tripal: 3,
}

/** Minimum digit count for a *formatted* (separator-broken) phone number. */
const MIN_FORMATTED_PHONE_DIGITS = 10

/**
 * True if the text contains a phone number written with digits.
 *
 * Two cases are detected:
 *  1. A contiguous run of digits (>= MIN_PHONE_DIGITS), e.g. "03111234567".
 *  2. A phone-like span broken by spaces/dashes/dots/parentheses with >= 10
 *     digits once separators are stripped, e.g. "+92 311 1234567" or
 *     "0311-123-4567". The higher bar avoids merging unrelated short numbers
 *     such as two years ("2024 2025" -> only 8 digits, not flagged).
 */
function hasLongDigitRun(text: string): boolean {
  // Case 1: contiguous digits.
  if (new RegExp(`\\d{${MIN_PHONE_DIGITS},}`).test(text)) return true

  // Case 2: formatted phone span.
  const phoneLike = text.match(/\+?\d[\d\s().\-\u00a0]{8,}\d/g) ?? []
  for (const span of phoneLike) {
    const digits = span.replace(/\D/g, '')
    if (digits.length >= MIN_FORMATTED_PHONE_DIGITS) return true
  }
  return false
}

/**
 * Convert spelled-out number words into a digit string, then check the result.
 * Non-number words act as separators between candidate runs.
 */
function spelledOutDigits(text: string): string {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  let digits = ''
  let pendingRepeat = 0

  for (const token of tokens) {
    if (token in REPEAT_WORDS) {
      pendingRepeat = REPEAT_WORDS[token]
      continue
    }
    if (token in NUMBER_WORDS) {
      const digit = NUMBER_WORDS[token]
      const times = pendingRepeat > 0 ? pendingRepeat : 1
      digits += digit.repeat(times)
      pendingRepeat = 0
    } else {
      // a non-number word ends the current spelled-out run; mark with a separator
      pendingRepeat = 0
      digits += ' '
    }
  }
  return digits
}

/** True if the spelled-out numbers form a phone-length run. */
function hasSpelledOutPhone(text: string): boolean {
  const digits = spelledOutDigits(text)
  return digits.split(' ').some((run) => run.length >= MIN_PHONE_DIGITS)
}

/**
 * Returns `true` if the text appears to contain a phone number.
 */
export function containsPhoneNumber(text: string): boolean {
  if (!text) return false
  return hasLongDigitRun(text) || hasSpelledOutPhone(text)
}

/**
 * Validation helper mirroring the project's `cnic.ts` pattern: returns an error
 * message string when a phone number is detected, otherwise `null`.
 */
export function phoneInTextValidationMessage(text: string): string | null {
  if (containsPhoneNumber(text)) return PHONE_ERROR
  return null
}
