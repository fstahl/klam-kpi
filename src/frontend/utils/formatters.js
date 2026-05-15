export function fmt(n, decimals = 1) {
  if (n == null) return '—';
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function fmtInt(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function monthName(label) {
  const map = { Jan:'January', Feb:'February', Mar:'March', Apr:'April', May:'May', Jun:'June', Jul:'July', Aug:'August', Sep:'September', Oct:'October', Nov:'November', Dec:'December' };
  return map[label?.slice(0, 3)] ?? label?.split(' ')[0] ?? '';
}
