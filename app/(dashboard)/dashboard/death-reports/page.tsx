"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import type { DeathReport } from "@/lib/types";
import { DeathReportTable } from "./DeathReportTable";
import { DeathReportDetails } from "./DeathReportDetails";
import { DeathReportEditDialog } from "./DeathReportEditDialog";
import { useDeathReportsQuery, useSearchDeathReportsQuery } from "@/lib/api/hooks/use-death-report";

export default function DeathReportsPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<DeathReport | null>(null);
  const [editingReport, setEditingReport] = useState<DeathReport | null>(null);

  const listQuery = useDeathReportsQuery({ page: currentPage });
  const searchQueryTrimmed = searchQuery.trim();
  const searchQueryEnabled = searchQueryTrimmed.length >= 2;
  const searchQueryResult = useSearchDeathReportsQuery(searchQueryTrimmed);

  const isSearching = searchQueryEnabled;
  const activeReports: DeathReport[] = isSearching
    ? searchQueryResult.data?.deathReports ?? []
    : listQuery.data?.deathReports?.data ?? [];
  const activeLoading = isSearching ? searchQueryResult.isLoading : listQuery.isLoading;
  const activePagination = isSearching
    ? null
    : listQuery.data?.deathReports?.pagination ?? null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length < 2) {
      setCurrentPage(1);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const totalItems = activePagination?.totalItems ?? activeReports.length;
  const totalPages = activePagination?.totalPages ?? (activeReports.length > 0 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card className="rounded-xl">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Death Reports</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Browse, search, and review all death reports in the system.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder="Search death reports..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-9 pl-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted/50"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Searching: &ldquo;{searchQuery}&rdquo;
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {totalItems} death report{totalItems === 1 ? "" : "s"} {totalPages > 0 && `· Page ${listQuery.data ? currentPage : ""} of ${totalPages}`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <DeathReportTable
            reports={activeReports}
            loading={activeLoading}
            pagination={activePagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onViewReport={setSelectedReport}
          />
        </CardContent>
      </Card>

      <DeathReportDetails
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onEdit={(report) => {
          setSelectedReport(null);
          setEditingReport(report);
        }}
      />

      <DeathReportEditDialog
        report={editingReport}
        onClose={() => setEditingReport(null)}
        onUpdated={(updated) => {
          setEditingReport(null);
          setSelectedReport(updated);
        }}
      />
    </div>
  );
}
