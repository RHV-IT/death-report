"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  FileText,
  ClipboardList,
  User,
  Users,
  Search,
  AlertCircle,
} from "lucide-react";
import { RiskGradingBadge } from "@/components/ui/risk-badge";
import type { DeathReport } from "@/lib/types";
import {
  formatDisplayDate,
  parseIsoDate,
  formatShortDate,
  formatDisplayTime,
} from "@/lib/utils/date";

interface DeathReportDetailsProps {
  report: DeathReport | null;
  onClose: () => void;
}

function formatDateValue(value: string): string {
  if (!value) return "N/A";
  const parsed = parseIsoDate(value);
  return parsed ? formatDisplayDate(parsed) : value;
}

function formatShortDateValue(value?: string): string {
  if (!value) return "N/A";
  const parsed = parseIsoDate(value);
  return parsed ? formatShortDate(parsed) : value;
}

function formatTimeValue(value: string): string {
  if (!value) return "N/A";
  const display = formatDisplayTime(value);
  return display ? `${value} (${display})` : value;
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-sm">
      <strong className="font-medium text-foreground">{label}:</strong>{" "}
      <span className="text-muted-foreground">{value || "N/A"}</span>
    </p>
  );
}

function ShowBoolean({ value, label }: { value: boolean | undefined; label: string }) {
  return (
    <Badge
      variant={value ? "default" : "outline"}
      className={
        value
          ? "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
          : "text-muted-foreground"
      }
    >
      {label}: {value ? "Yes" : "No"}
    </Badge>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

export function DeathReportDetails({ report, onClose }: DeathReportDetailsProps) {
  if (!report) return null;

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-5xl !w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl md:p-8">
        <div key={report.id} className="animate-in fade-in space-y-5">
          <DialogHeader className="border-b pb-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Death Report #{report.id}
                </DialogTitle>
              </div>
              <RiskGradingBadge riskGrading={report.riskGrading || ""} />
            </div>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Reference: <strong className="text-foreground">{report.ref}</strong> · Department:{" "}
              <strong className="text-foreground">{report.department}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <SectionCard icon={Calendar} title="Dates & Timing">
                <p className="text-sm">
                  <strong className="font-medium text-foreground">Reported Date:</strong>{" "}
                  <span className="text-muted-foreground">{formatDateValue(report.reportedDate)}</span>
                </p>
                <p className="text-sm">
                  <strong className="font-medium text-foreground">Incident Date:</strong>{" "}
                  <span className="text-muted-foreground">{formatDateValue(report.incidentDate)}</span>
                </p>
                <p className="text-sm">
                  <strong className="font-medium text-foreground">Incident Time:</strong>{" "}
                  <span className="text-muted-foreground">{formatTimeValue(report.incidentTime)}</span>
                </p>
                <p className="text-sm">
                  <strong className="font-medium text-foreground">Opened Date:</strong>{" "}
                  <span className="text-muted-foreground">{formatShortDateValue(report.openedDate)}</span>
                </p>
              </SectionCard>

              <SectionCard icon={MapPin} title="Location">
                <FieldRow label="Location" value={report.location} />
                <FieldRow label="Exact Location" value={report.exactLocation} />
                <FieldRow label="Category" value={report.category} />
                <FieldRow label="Sub-Category" value={report.subCategory} />
                <FieldRow label="Coding" value={report.coding} />
                <FieldRow label="Type" value={report.type} />
              </SectionCard>

              <SectionCard icon={User} title="Handlers">
                <FieldRow label="Handler" value={report.handler} />
                <FieldRow label="Manager" value={report.manager} />
                <FieldRow label="Specialty" value={report.specialty} />
                <FieldRow label="Quality Assurance Lead" value={report.qualityAssuranceLead} />
              </SectionCard>

              <SectionCard icon={ClipboardList} title="Risk & Outcome">
                <FieldRow label="Result" value={report.result} />
                <FieldRow label="Actual Harm" value={report.actualHarm} />
                <FieldRow label="Potential Harm" value={report.potentialHarm} />
                <FieldRow label="Level of Investigation" value={report.levelOfInvestigation} />
                <div className="pt-1">
                  <RiskGradingBadge riskGrading={report.riskGrading || ""} className="text-xs" />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                    <ClipboardList className="h-4 w-4 text-primary" /> Incident Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {report.description && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Description</span>
                      <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        {report.description}
                      </div>
                    </div>
                  )}
                  {report.actionTaken && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Action Taken</span>
                      <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        {report.actionTaken}
                      </div>
                    </div>
                  )}
                  {report.details && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Additional Details</span>
                      <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        {report.details}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                    <Users className="h-4 w-4 text-primary" /> Patient & Family Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <ShowBoolean value={report.patientInvolved} label="Patient Involved" />
                    <ShowBoolean value={report.patientTold} label="Patient Told" />
                    <ShowBoolean value={report.familyTold} label="Family Told" />
                    <ShowBoolean value={report.doctorNotified} label="Doctor Notified" />
                  </div>
                  {report.whatFamilyTold && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">What Family Was Told</span>
                      <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        {report.whatFamilyTold}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                    <Search className="h-4 w-4 text-primary" /> Investigation & Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {report.reviewMeetingDate && (
                    <p className="text-sm">
                      <strong className="font-medium text-foreground">Review Meeting Date:</strong>{" "}
                      <span className="text-muted-foreground">{formatShortDateValue(report.reviewMeetingDate)}</span>
                    </p>
                  )}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Incident Investigation</span>
                    <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      {report.incidentInvestigation || "No investigation notes recorded."}
                    </div>
                  </div>
                  {report.meetingDiscussionPoints && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Meeting Discussion Points</span>
                      <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        {report.meetingDiscussionPoints}
                      </div>
                    </div>
                  )}
                  {report.meetingActionPoints && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Meeting Action Points</span>
                      <div className="mt-1.5 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        {report.meetingActionPoints}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                    <AlertCircle className="h-4 w-4 text-primary" /> Submitted Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <FieldRow label="Submitted Time" value={report.submittedTime} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
