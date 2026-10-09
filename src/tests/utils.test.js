// ─── Utility function tests ───────────────────────────────────────────────────
// BankConverter helpers
import { describe, it, expect } from 'vitest'
import { cleanAmount } from '../utils/cleanAmount'

// parseDate helper
function parseDate(str) {
  if (!str) return null
  const patterns = [
    { re: /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, fn: m => `${m[3]}-${m[2]}-${m[1]}` },
    { re: /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/, fn: m => `${m[1]}-${m[2]}-${m[3]}` },
    { re: /(\d{2})\s([A-Za-z]{3})\s(\d{4})/, fn: m => {
      const months = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
                      jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'}
      return `${m[3]}-${months[m[2].toLowerCase()]||'01'}-${m[1]}`
    }},
  ]
  for (const { re, fn } of patterns) {
    const m = str.match(re)
    if (m) return fn(m)
  }
  return null
}

// detectBank helper
function detectBank(text) {
  const t = text.toLowerCase()
  if (t.includes('state bank of india') || t.includes('sbi')) return 'SBI'
  if (t.includes('hdfc')) return 'HDFC'
  if (t.includes('icici')) return 'ICICI'
  if (t.includes('axis bank') || t.includes('axis ')) return 'Axis Bank'
  if (t.includes('kotak')) return 'Kotak'
  return 'Auto-Detected'
}

describe('BankConverter — cleanAmount', () => {
  it('parses plain number', () => expect(cleanAmount('1234.56')).toBe(1234.56))
  it('removes commas', () => expect(cleanAmount('1,23,456.78')).toBe(123456.78))
  it('removes ₹ symbol', () => expect(cleanAmount('₹500.00')).toBe(500))
  it('removes Rs.', () => expect(cleanAmount('Rs.250.50')).toBe(250.50))
  it('returns null for empty', () => expect(cleanAmount('')).toBeNull())
  it('returns null for non-number', () => expect(cleanAmount('N/A')).toBeNull())
})

describe('BankConverter — parseDate', () => {
  it('parses DD/MM/YYYY', () => expect(parseDate('15/06/2024')).toBe('2024-06-15'))
  it('parses DD-MM-YYYY', () => expect(parseDate('01-01-2024')).toBe('2024-01-01'))
  it('parses YYYY-MM-DD', () => expect(parseDate('2024-03-20')).toBe('2024-03-20'))
  it('parses DD MMM YYYY', () => expect(parseDate('25 Dec 2023')).toBe('2023-12-25'))
  it('parses Jan month', () => expect(parseDate('01 Jan 2024')).toBe('2024-01-01'))
  it('returns null for invalid', () => expect(parseDate('not-a-date')).toBeNull())
  it('returns null for empty', () => expect(parseDate('')).toBeNull())
})

describe('BankConverter — detectBank', () => {
  it('detects SBI', () => expect(detectBank('State Bank of India Account Statement')).toBe('SBI'))
  it('detects SBI abbreviation', () => expect(detectBank('SBI Net Banking')).toBe('SBI'))
  it('detects HDFC', () => expect(detectBank('HDFC Bank Statement')).toBe('HDFC'))
  it('detects ICICI', () => expect(detectBank('ICICI Bank Ltd')).toBe('ICICI'))
  it('detects Axis', () => expect(detectBank('Axis Bank Account')).toBe('Axis Bank'))
  it('returns Auto-Detected for unknown', () => expect(detectBank('Some Random Bank')).toBe('Auto-Detected'))
})
