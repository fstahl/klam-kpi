// Compute a delta percentage for a card given the comparison type.
export function computeDelta(card, periodData, allPeriodData) {
  const { field, spark, comparison, delta_field } = card;
  if (!comparison || comparison === 'none') return null;

  if (comparison === 'target') {
    const key = delta_field ?? `${field}_delta`;
    return periodData[key] ?? null;
  }

  if (comparison === 'lastq') {
    const current = periodData[field];
    const lastq = allPeriodData?.LASTQ?.[field];
    if (current == null || lastq == null || lastq === 0) return null;
    return (current - lastq) / Math.abs(lastq) * 100;
  }

  if ((comparison === 'prev_month' || comparison === 'prev_year') && spark) {
    const series = periodData?.sparks?.[spark];
    if (!series || series.length < 2) return null;
    const current = series[series.length - 1];
    const baseline = comparison === 'prev_month' ? series[series.length - 2] : series[0];
    if (baseline == null || baseline === 0) return null;
    return (current - baseline) / Math.abs(baseline) * 100;
  }

  return null;
}

export function comparisonLabel(comparison) {
  switch (comparison) {
    case 'target':     return 'vs target';
    case 'lastq':      return 'vs last quarter';
    case 'prev_month': return 'vs prev month';
    case 'prev_year':  return 'vs prev year';
    default:           return '';
  }
}
