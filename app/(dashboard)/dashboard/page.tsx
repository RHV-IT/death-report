"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  ShieldAlert,
  Clock,
  RefreshCw,
  ClipboardList,
  Activity,
  Users,
  ShieldCheck,
  ArrowRight,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskGradingBadge } from "@/components/ui/risk-badge";
import { StatTile } from "./StatTile";
import {
  DeathReportsTrendChart,
  RiskGradingChart,
  TopBreakdownChart,
} from "./DeathReportOverviewCharts";
import { useDeathReportsAnalyticsQuery } from "@/lib/api/hooks/use-death-report";
import {
  computeRiskGradingCounts,
  computeTopBreakdown,
  computeDailyTimeSeries,
} from "@/lib/utils/death-report-stats";

const CAPABILITIES = [
  {
    icon: ClipboardList,
    title: "Death reporting",
    description: "A structured, multi-step form captures every detail of a death occurrence in minutes.",
    href: "/",
    cta: "Report a Death",
  },
  {
    icon: Activity,
    title: "Live tracking",
    description: "Follow every death report from initial filing through investigation and review.",
    href: "/dashboard/death-reports",
    cta: "View Reports",
  },
  {
    icon: Users,
    title: "Role-based access",
    description: "supervisors, admins and super admins each see exactly the tools their role needs.",
    href: null,
    cta: null,
  },
  {
    icon: ShieldCheck,
    title: "Investigation oversight",
    description: "Risk grading, follow-up details and review meetings, all attached to the original report.",
    href: "/dashboard/death-reports",
    cta: "Review Reports",
  },
];

const cardEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export default function OverviewPage() {
  const { data, isLoading, isError, isFetching, refetch } = useDeathReportsAnalyticsQuery();
  const reports = data?.deathReports?.data ?? [];
  const totalKnown = data?.deathReports?.pagination?.totalItems ?? reports.length;
  const isPartial = totalKnown > reports.length;

  const riskCounts = computeRiskGradingCounts(reports);
  const departmentBreakdown = computeTopBreakdown(reports, "department", 6);
  const categoryBreakdown = computeTopBreakdown(reports, "category", 6);
  const trend = computeDailyTimeSeries(reports, 30);
  const recent = [...reports]
    .sort((a, b) => (b.incidentDate || "").localeCompare(a.incidentDate || ""))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              A live snapshot of every death report tracked in the system.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-fit gap-2"
        >
          <RefreshCw className={isFetching ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
      </div>

      {isError ? (
        <Card className="rounded-2xl border-destructive/20">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <WifiOff className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load death report data. Check your connection and try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {isPartial && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              Showing the most recent {reports.length} of {totalKnown} death reports. The numbers below reflect this
              window, not the full history.
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Total" value={reports.length} icon={Layers} loading={isLoading} />
            <StatTile
              label="Critical"
              value={riskCounts.Critical ?? 0}
              icon={ShieldAlert}
              tone="critical"
              loading={isLoading}
            />
            <StatTile
              label="High"
              value={riskCounts.High ?? 0}
              icon={ShieldAlert}
              tone="info"
              loading={isLoading}
            />
            <StatTile
              label="Patient Involved"
              value={reports.filter((r) => r.patientInvolved).length}
              icon={Users}
              tone="info"
              loading={isLoading}
            />
            <StatTile
              label="Family Told"
              value={reports.filter((r) => r.familyTold).length}
              icon={Clock}
              tone="default"
              loading={isLoading}
            />
            <StatTile
              label="Doctor Notified"
              value={reports.filter((r) => r.doctorNotified).length}
              icon={ShieldCheck}
              tone="default"
              loading={isLoading}
            />
          </div>

          {/* Trend */}
          <motion.div {...cardEntrance}>
            <Card className="rounded-2xl py-0 shadow-sm">
              <CardHeader className="gap-1 border-b py-5">
                <CardTitle>Death Reports Over Time</CardTitle>
                <CardDescription>Daily count for the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                {isLoading ? <Skeleton className="h-[220px] w-full rounded-xl" /> : <DeathReportsTrendChart data={trend} />}
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk grading + Departments */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Risk Grading Breakdown</CardTitle>
                  <CardDescription>How death report severity is distributed across all reports.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <RiskGradingChart reports={reports} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Status Breakdown</CardTitle>
                  <CardDescription>Where every report currently stands.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <div className="space-y-2 text-sm">
                      {Object.entries(riskCounts).map(([grading, count]) => (
                        <div key={grading} className="flex items-center justify-between">
                          <RiskGradingBadge riskGrading={grading} />
                          <span className="font-medium text-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Departments + Categories */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Top Departments</CardTitle>
                  <CardDescription>Where death reports are most frequently logged.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <TopBreakdownChart data={departmentBreakdown} emptyMessage="No department data yet." />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>The most frequently recorded incident categories.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <TopBreakdownChart data={categoryBreakdown} emptyMessage="No category data yet." />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent death reports */}
          <motion.div {...cardEntrance}>
            <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
              <CardHeader className="flex-row items-center justify-between gap-3 border-b py-5">
                <div>
                  <CardTitle>Recent Death Reports</CardTitle>
                  <CardDescription>The five most recently recorded reports.</CardDescription>
                </div>
                <Link href="/dashboard/death-reports">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))
                ) : recent.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">No death reports reported yet.</p>
                ) : (
                  recent.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">{report.ref}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {report.incidentDate} · {report.department}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <RiskGradingBadge riskGrading={report.riskGrading || ""} />
                        {report.doctorNotified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Doctor Notified
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Capabilities */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">What DeathReport Does</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((capability) => (
            <Card key={capability.title} className="flex h-full flex-col rounded-2xl shadow-sm">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <capability.icon className="h-5 w-5" />
                </span>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">{capability.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{capability.description}</p>
                </div>
                {capability.href && capability.cta && (
                  <Link href={capability.href} className="inline-flex w-fit">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80">
                      {capability.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
