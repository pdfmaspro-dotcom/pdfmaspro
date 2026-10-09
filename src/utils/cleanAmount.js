// Parses amounts like "1,23,456.78", "₹500.00", "Rs.250.50" into numbers.
// The decimal point must be kept; only currency markers, commas and spaces are removed.
export function cleanAmount(str) {
  if (str === null || str === undefined || str === '') return null
  const cleaned = String(str).replace(/₹|Rs\.?|INR/gi, '').replace(/[,\s]/g, '')
  const n = parseFloat(cleaned)
  return Number.isNaN(n) ? null : n
}
