"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { RiskGradingBadge } from "@/components/ui/risk-badge";
import type { DeathReport, DeathReportPagination } from "@/lib/types";
import { formatShortDate, parseIsoDate } from "@/lib/utils/date";

interface DeathReportTableProps {
  reports: DeathReport[];
  loading: boolean;
  pagination: DeathReportPagination | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewReport: (report: DeathReport) => void;
}

export function DeathReportTable({
  reports,
  loading,
  pagination,
  currentPage,
  onPageChange,
  onViewReport,
}: DeathReportTableProps) {
  const current_page = pagination?.currentPage ?? currentPage ?? 1;
  const total_pages = pagination?.totalPages ?? 1;
  const total_items = pagination?.totalItems ?? reports.length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="py-3 pl-4 text-sm font-semibold text-foreground">Ref</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Date</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Department</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Category</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Risk</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Patient</TableHead>
              <TableHead className="py-3 pr-4 text-right text-sm font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3.5 pl-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="py-3.5 pr-4 text-right"><Skeleton className="ml-auto h-7 w-12" /></TableCell>
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm italic text-muted-foreground">
                  No death reports found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="py-3.5 pl-4 text-sm font-medium text-foreground">
                    {report.ref}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm">
                    {report.incidentDate ? formatShortDate(parseIsoDate(report.incidentDate)!) : "N/A"}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-muted-foreground">
                    {report.department}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-muted-foreground">
                    {report.category}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <RiskGradingBadge riskGrading={report.riskGrading || ""} />
                  </TableCell>
                  <TableCell className="py-3.5 text-sm">
                    {report.patientInvolved ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5 pr-4 text-right">
                    <Button
                      onClick={() => onViewReport(report)}
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && (
        <div className="flex flex-col items-center justify-between gap-4 px-1 pt-2 sm:flex-row">
          <div className="text-sm text-muted-foreground">{total_items} Death reports found</div>
          {total_pages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(current_page - 1)}
                disabled={current_page <= 1}
                className="h-8 w-8"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm">
                Page {current_page} of {total_pages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(current_page + 1)}
                disabled={current_page >= total_pages}
                className="h-8 w-8"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
