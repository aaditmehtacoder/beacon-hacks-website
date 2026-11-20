/**
 * Phone numbers as people expect to read them: (408) 477-0702, or
 * +1 (408) 477-0702 when typed with the country code. Formats as far as
 * the digits go, without trailing punctuation, so it can run on every
 * keystroke and backspace still works. A number starting with + and
 * another country code is left as typed, digits only.
 */
export function formatPhone(raw: string): string {
  const typed = raw.trimStart();
  let digits = raw.replace(/\D/g, "");
  if (typed.startsWith("+") && !typed.startsWith("+1")) return `+${digits.slice(0, 15)}`;

  /* US area codes never start with 1, so a leading 1 is the country code. */
  let prefix = "";
  if (digits.startsWith("1")) {
    prefix = "+1 ";
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (!digits) return prefix.trim();
  if (digits.length < 4) return `${prefix}(${digits}`;
  if (digits.length < 7) return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
