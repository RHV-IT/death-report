import type { DeathReport } from "@/lib/types";
import { toIsoDate, parseIsoDate } from "@/lib/utils/date";

export interface CountBreakdown {
  label: string;
  count: number;
}

/** Count of death reports grouped by a string field, ranked by frequency. */
export function computeTopBreakdown(
  reports: DeathReport[],
  field: "department" | "location" | "category" | "subCategory" | "riskGrading",
  topN = 6
): CountBreakdown[] {
  const counts = new Map<string, number>();
  for (const report of reports) {
    const raw = report[field]?.trim();
    if (!raw) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export interface DailyCount {
  date: string;
  label: string;
  count: number;
}

/** Daily death report counts for the trailing `days` days (today inclusive), zero-filled. */
export function computeDailyTimeSeries(reports: DeathReport[], days = 30): DailyCount[] {
  const counts = new Map<string, number>();
  for (const report of reports) {
    const occurred = parseIsoDate(report.incidentDate);
    if (!occurred) continue;
    const key = toIsoDate(occurred);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: DailyCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = toIsoDate(d);
    series.push({
      date: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: counts.get(key) ?? 0,
    });
  }
  return series;
}

export function computeRiskGradingCounts(reports: DeathReport[]): Record<string, number> {
  const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  for (const report of reports) {
    const grading = report.riskGrading || "";
    if (grading in counts) counts[grading] += 1;
    else counts[grading] = (counts[grading] ?? 0) + 1;
  }
  return counts;
}

export function computeBooleanCounts(reports: DeathReport[], field: "patientInvolved" | "patientTold" | "familyTold" | "doctorNotified"): number {
  return reports.filter((report) => report[field] === true).length;
}
