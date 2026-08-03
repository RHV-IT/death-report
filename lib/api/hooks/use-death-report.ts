import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys, type DeathReportFilters } from "@/lib/api/query-keys";
import type { DeathReportsResponse, DeathReportsSearchResponse } from "@/lib/types";
import type { DeathReportValues } from "@/lib/schemas/death-report";

export function useDeathReportsQuery(filters: DeathReportFilters) {
  return useQuery({
    queryKey: queryKeys.deathReports.list(filters),
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: "10",
      });
      if (filters.department) params.set("department", filters.department);
      if (filters.category) params.set("category", filters.category);
      return apiFetch<DeathReportsResponse>(`/deathreports?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });
}

export const DEATH_REPORT_ANALYTICS_FETCH_LIMIT = 200;

export function useDeathReportsAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.deathReports.all,
    queryFn: () =>
      apiFetch<DeathReportsResponse>(
        `/deathreports?page=1&limit=${DEATH_REPORT_ANALYTICS_FETCH_LIMIT}`
      ),
    staleTime: 60_000,
  });
}

export function useSearchDeathReportsQuery(searchQuery: string) {
  const query = searchQuery.trim();
  return useQuery({
    queryKey: queryKeys.deathReports.search(query),
    queryFn: () =>
      apiFetch<DeathReportsSearchResponse>(
        `/searchDeathReport?searchQuery=${encodeURIComponent(query)}`
      ),
    enabled: query.length > 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateDeathReportMutation() {
  return useMutation({
    mutationFn: (values: DeathReportValues) =>
      apiFetch<{ message: string }>("/deathreport", {
        auth: false,
        method: "POST",
        body: {
          ref: values.ref,
          reportedDate: values.reportedDate,
          incidentDate: values.incidentDate,
          incidentTime: values.incidentTime,
          department: values.department,
          location: values.location,
          category: values.category,
          subCategory: values.subCategory,
          description: values.description,
          actionTaken: values.actionTaken,
          openedDate: values.openedDate,
          submittedTime: values.submittedTime,
          handler: values.handler,
          manager: values.manager,
          specialty: values.specialty,
          exactLocation: values.exactLocation,
          coding: values.coding,
          type: values.type,
          riskGrading: values.riskGrading,
          result: values.result,
          actualHarm: values.actualHarm,
          potentialHarm: values.potentialHarm,
          details: values.details,
          patientInvolved: values.patientInvolved,
          patientTold: values.patientTold,
          familyTold: values.familyTold,
          whatFamilyTold: values.whatFamilyTold,
          incidentInvestigation: values.incidentInvestigation,
          reviewMeetingDate: values.reviewMeetingDate,
          qualityAssuranceLead: values.qualityAssuranceLead,
          doctorNotified: values.doctorNotified,
          meetingDiscussionPoints: values.meetingDiscussionPoints,
          meetingActionPoints: values.meetingActionPoints,
          levelOfInvestigation: values.levelOfInvestigation,
        },
      }),
  });
}

export function useUpdateDeathReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DeathReportValues & { id: number }) =>
      apiFetch<{ message: string }>("/deathreport", {
        auth: false,
        method: "PUT",
        body: {
          id: values.id,
          ref: values.ref,
          reportedDate: values.reportedDate,
          incidentDate: values.incidentDate,
          incidentTime: values.incidentTime,
          department: values.department,
          location: values.location,
          category: values.category,
          subCategory: values.subCategory,
          description: values.description,
          actionTaken: values.actionTaken,
          openedDate: values.openedDate,
          submittedTime: values.submittedTime,
          handler: values.handler,
          manager: values.manager,
          specialty: values.specialty,
          exactLocation: values.exactLocation,
          coding: values.coding,
          type: values.type,
          riskGrading: values.riskGrading,
          result: values.result,
          actualHarm: values.actualHarm,
          potentialHarm: values.potentialHarm,
          details: values.details,
          patientInvolved: values.patientInvolved,
          patientTold: values.patientTold,
          familyTold: values.familyTold,
          whatFamilyTold: values.whatFamilyTold,
          incidentInvestigation: values.incidentInvestigation,
          reviewMeetingDate: values.reviewMeetingDate,
          qualityAssuranceLead: values.qualityAssuranceLead,
          doctorNotified: values.doctorNotified,
          meetingDiscussionPoints: values.meetingDiscussionPoints,
          meetingActionPoints: values.meetingActionPoints,
          levelOfInvestigation: values.levelOfInvestigation,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deathReports.all });
    },
  });
}
