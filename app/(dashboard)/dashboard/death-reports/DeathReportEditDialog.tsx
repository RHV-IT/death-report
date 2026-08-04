"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  DateField,
  TimeField,
} from "@/components/death-report-form-fields";
import {
  deathReportSchema,
  DEATH_REPORT_DEFAULTS,
  type DeathReportValues,
} from "@/lib/schemas/death-report";
import { useUpdateDeathReportMutation } from "@/lib/api/hooks/use-death-report";
import { notify } from "@/lib/toast";
import type { DeathReport } from "@/lib/types";

interface DeathReportEditDialogProps {
  report: DeathReport | null;
  onClose: () => void;
  onUpdated: (report: DeathReport) => void;
}

const RISK_GRADING_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

const LEVEL_OF_INVESTIGATION_OPTIONS = [
  { value: "Level 1", label: "Level 1" },
  { value: "Level 2", label: "Level 2" },
  { value: "Level 3", label: "Level 3" },
  { value: "Comprehensive", label: "Comprehensive" },
];

function toFormValues(report: DeathReport): DeathReportValues {
  return {
    ref: report.ref,
    reportedDate: report.reportedDate,
    incidentDate: report.incidentDate,
    incidentTime: report.incidentTime,
    department: report.department,
    location: report.location,
    category: report.category,
    subCategory: report.subCategory,
    description: report.description,
    actionTaken: report.actionTaken,
    openedDate: report.openedDate ?? "",
    submittedTime: report.submittedTime ?? "",
    handler: report.handler ?? "",
    manager: report.manager ?? "",
    specialty: report.specialty ?? "",
    exactLocation: report.exactLocation ?? "",
    coding: report.coding ?? "",
    type: report.type ?? "Clinical Incident",
    riskGrading: (report.riskGrading as DeathReportValues["riskGrading"]) || "High",
    result: report.result ?? "",
    actualHarm: report.actualHarm ?? "",
    potentialHarm: report.potentialHarm ?? "",
    details: report.details ?? "",
    patientInvolved: report.patientInvolved,
    patientTold: report.patientTold,
    familyTold: report.familyTold,
    whatFamilyTold: report.whatFamilyTold ?? "",
    incidentInvestigation: report.incidentInvestigation ?? "",
    reviewMeetingDate: report.reviewMeetingDate ?? "",
    qualityAssuranceLead: report.qualityAssuranceLead ?? "",
    doctorNotified: report.doctorNotified,
    meetingDiscussionPoints: report.meetingDiscussionPoints ?? "",
    meetingActionPoints: report.meetingActionPoints ?? "",
    levelOfInvestigation:
      (report.levelOfInvestigation as DeathReportValues["levelOfInvestigation"]) || "Level 3",
  };
}

export function DeathReportEditDialog({ report, onClose, onUpdated }: DeathReportEditDialogProps) {
  const today = useMemo(() => new Date(), []);
  const updateReport = useUpdateDeathReportMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeathReportValues>({
    resolver: zodResolver(deathReportSchema),
    defaultValues: DEATH_REPORT_DEFAULTS,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (report) {
      reset(toFormValues(report));
    }
  }, [report, reset]);

  if (!report) return null;

  const isLoading = updateReport.isPending;

  const onSubmit = (values: DeathReportValues) => {
    updateReport.mutate(
      { id: report.id, ...values },
      {
        onSuccess: () => {
          notify.success(
            "Report updated",
            `Death report #${report.id} has been updated successfully.`
          );
          onUpdated({ ...report, ...values });
        },
        onError: (err) => {
          notify.apiError("Update failed", err);
        },
      }
    );
  };

  const sectionTitle = (text: string) => (
    <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">{text}</h3>
  );

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-4xl !w-[95vw] max-h-[92vh] overflow-y-auto rounded-xl p-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-10 border-b bg-background/95 px-6 py-5 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                <Pencil className="h-5 w-5 text-primary" />
                Edit Death Report #{report.id}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Reference: <strong className="text-foreground">{report.ref}</strong> · Department:{" "}
                <strong className="text-foreground">{report.department}</strong>
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {updateReport.isError && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertTitle>Unable to save changes</AlertTitle>
              <AlertDescription>
                {updateReport.error instanceof Error
                  ? updateReport.error.message
                  : "Something went wrong while updating the report."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 px-6 py-6">
          <section className="space-y-6">
            {sectionTitle("Basic Information")}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                id="ref"
                label="Reference Number"
                required
                placeholder="DR-2026-001"
                register={register}
                error={errors.ref}
                disabled={isLoading}
              />
              <DateField
                id="reportedDate"
                label="Reported Date"
                required
                control={control}
                error={errors.reportedDate}
                disabled={isLoading}
                placeholder="Select reported date"
                maxDate={today}
                fromYear={today.getFullYear() - 5}
              />
              <DateField
                id="incidentDate"
                label="Incident Date"
                required
                control={control}
                error={errors.incidentDate}
                disabled={isLoading}
                placeholder="Select incident date"
                maxDate={today}
                fromYear={today.getFullYear() - 5}
              />
              <TimeField
                id="incidentTime"
                label="Incident Time"
                required
                control={control}
                error={errors.incidentTime}
                disabled={isLoading}
              />
              <TextField
                id="department"
                label="Department"
                required
                placeholder="ICU, Emergency, Ward 4A..."
                register={register}
                error={errors.department}
                disabled={isLoading}
              />
              <TextField
                id="location"
                label="Location"
                required
                placeholder="Main Hospital, North Wing..."
                register={register}
                error={errors.location}
                disabled={isLoading}
              />
              <TextField
                id="category"
                label="Category"
                required
                placeholder="Mortality, Safety, Infection..."
                register={register}
                error={errors.category}
                disabled={isLoading}
              />
              <TextField
                id="subCategory"
                label="Sub Category"
                required
                placeholder="Unexpected death, Procedure related..."
                register={register}
                error={errors.subCategory}
                disabled={isLoading}
              />
            </div>
          </section>

          <section className="space-y-6">
            {sectionTitle("Incident Details")}
            <div className="space-y-4">
              <TextAreaField
                id="description"
                label="Description of Incident"
                required
                placeholder="Provide a precise, factual and chronological timeline outlining exactly what happened..."
                register={register}
                error={errors.description}
                disabled={isLoading}
                rows={4}
              />
              <TextAreaField
                id="actionTaken"
                label="Action Taken"
                required
                placeholder="Detail the immediate response actions, medical interventions attempted, and follow-up steps..."
                register={register}
                error={errors.actionTaken}
                disabled={isLoading}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateField
                id="openedDate"
                label="Opened Date"
                control={control}
                error={errors.openedDate}
                disabled={isLoading}
                placeholder="Select opened date"
                maxDate={today}
                fromYear={today.getFullYear() - 5}
              />
              <TimeField
                id="submittedTime"
                label="Submitted Time"
                control={control}
                error={errors.submittedTime}
                disabled={isLoading}
              />
              <TextField
                id="handler"
                label="Handler"
                placeholder="Person handling the report"
                register={register}
                error={errors.handler}
                disabled={isLoading}
              />
              <TextField
                id="manager"
                label="Manager"
                placeholder="Manager overseeing the case"
                register={register}
                error={errors.manager}
                disabled={isLoading}
              />
              <TextField
                id="specialty"
                label="Specialty"
                placeholder="Medical specialty involved"
                register={register}
                error={errors.specialty}
                disabled={isLoading}
              />
              <TextField
                id="exactLocation"
                label="Exact Location"
                placeholder="Ward, bed, room number..."
                register={register}
                error={errors.exactLocation}
                disabled={isLoading}
              />
              <TextField
                id="coding"
                label="Coding"
                placeholder="Medical coding (e.g., ICD-10-I46.9)"
                register={register}
                error={errors.coding}
                disabled={isLoading}
              />
              <TextField
                id="type"
                label="Type of Incident"
                placeholder="Clinical Incident"
                register={register}
                error={errors.type}
                disabled={isLoading}
              />
            </div>
          </section>

          <section className="space-y-6">
            {sectionTitle("Risk & Outcome Assessment")}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                id="riskGrading"
                label="Risk Grading"
                required
                control={control}
                error={errors.riskGrading}
                disabled={isLoading}
                placeholder="Select risk grading"
                options={RISK_GRADING_OPTIONS}
              />
              <TextField
                id="result"
                label="Result"
                placeholder="Outcome of the incident"
                register={register}
                error={errors.result}
                disabled={isLoading}
              />
              <TextField
                id="actualHarm"
                label="Actual Harm"
                placeholder="e.g. Severe / Death"
                register={register}
                error={errors.actualHarm}
                disabled={isLoading}
              />
              <TextField
                id="potentialHarm"
                label="Potential Harm"
                placeholder="e.g. Severe, Moderate..."
                register={register}
                error={errors.potentialHarm}
                disabled={isLoading}
              />
            </div>
            <TextAreaField
              id="details"
              label="Additional Details"
              placeholder="Any additional details about the risk and outcome..."
              register={register}
              error={errors.details}
              disabled={isLoading}
              rows={4}
            />
          </section>

          <section className="space-y-6">
            {sectionTitle("Patient & Family Communication")}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CheckboxField
                  id="patientInvolved"
                  control={control}
                  error={errors.patientInvolved}
                  disabled={isLoading}
                  label="Patient involved"
                />
                <CheckboxField
                  id="patientTold"
                  control={control}
                  error={errors.patientTold}
                  disabled={isLoading}
                  label="Patient told"
                />
                <CheckboxField
                  id="familyTold"
                  control={control}
                  error={errors.familyTold}
                  disabled={isLoading}
                  label="Family told"
                />
                <CheckboxField
                  id="doctorNotified"
                  control={control}
                  error={errors.doctorNotified}
                  disabled={isLoading}
                  label="Doctor notified"
                />
              </div>
              <TextAreaField
                id="whatFamilyTold"
                label="What Family Was Told"
                placeholder="Details of what was communicated to the family..."
                register={register}
                error={errors.whatFamilyTold}
                disabled={isLoading}
                rows={4}
              />
            </div>
          </section>

          <section className="space-y-6">
            {sectionTitle("Investigation & Review")}
            <div className="space-y-4">
              <TextAreaField
                id="incidentInvestigation"
                label="Incident Investigation"
                placeholder="Internal review initiated by QA panel. Outline the investigation details..."
                register={register}
                error={errors.incidentInvestigation}
                disabled={isLoading}
                rows={4}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DateField
                  id="reviewMeetingDate"
                  label="Review Meeting Date"
                  control={control}
                  error={errors.reviewMeetingDate}
                  disabled={isLoading}
                  placeholder="Select review meeting date"
                  maxDate={today}
                  fromYear={today.getFullYear() - 5}
                />
                <TextField
                  id="qualityAssuranceLead"
                  label="Quality Assurance Lead"
                  placeholder="e.g. Dr. Alice Johnson"
                  register={register}
                  error={errors.qualityAssuranceLead}
                  disabled={isLoading}
                />
              </div>
              <TextAreaField
                id="meetingDiscussionPoints"
                label="Meeting Discussion Points"
                placeholder="Discussion points from the review meeting..."
                register={register}
                error={errors.meetingDiscussionPoints}
                disabled={isLoading}
                rows={4}
              />
              <TextAreaField
                id="meetingActionPoints"
                label="Meeting Action Points"
                placeholder="Action items from the review meeting..."
                register={register}
                error={errors.meetingActionPoints}
                disabled={isLoading}
                rows={4}
              />
              <SelectField
                id="levelOfInvestigation"
                label="Level of Investigation"
                required
                control={control}
                error={errors.levelOfInvestigation}
                disabled={isLoading}
                placeholder="Select investigation level"
                options={LEVEL_OF_INVESTIGATION_OPTIONS}
              />
            </div>
          </section>

          <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
