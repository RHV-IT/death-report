"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller, type Control, type UseFormRegister } from "react-hook-form";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  LogIn,
  Loader2,
  ShieldCheck,
  CalendarIcon,
  ClockIcon,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  deathReportSchema,
  DEATH_REPORT_DEFAULTS,
  STEP_FIELDS,
  type DeathReportValues,
} from "@/lib/schemas/death-report";
import { useCreateDeathReportMutation } from "@/lib/api/hooks/use-death-report";
import { useAuthToken } from "@/lib/store/auth-store";
import { notify } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoadingScreen } from "@/components/loading-screen";
import { cn } from "@/lib/utils";
import { pad2, todayIsoDate, toIsoDate, parseIsoDate, formatDisplayDate, formatDisplayTime } from "@/lib/utils/date";

const STEP_LABELS = [
  "Basic Information",
  "Incident Details",
  "Risk & Outcome",
  "Patient & Family",
  "Investigation & Review",
];

const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));

function TextField({
  id,
  label,
  required,
  type = "text",
  placeholder,
  register,
  error,
  disabled,
  className,
}: {
  id: keyof DeathReportValues;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<DeathReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Field data-invalid={!!error} className={className}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className="h-11 rounded-xl px-4"
        {...register(id)}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function TextAreaField({
  id,
  label,
  required,
  placeholder,
  register,
  error,
  disabled,
  className,
  rows = 4,
}: {
  id: keyof DeathReportValues;
  label: string;
  required?: boolean;
  placeholder?: string;
  register: UseFormRegister<DeathReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  className?: string;
  rows?: number;
}) {
  return (
    <Field data-invalid={!!error} className={className}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className="rounded-xl"
        {...register(id)}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function SelectField({
  id,
  label,
  required,
  control,
  error,
  disabled,
  placeholder,
  options,
}: {
  id: keyof DeathReportValues;
  label: string;
  required?: boolean;
  control: Control<DeathReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Controller
        control={control}
        name={id}
        render={({ field }) => (
          <Select
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={id} className="h-11 w-full rounded-xl px-4" aria-invalid={!!error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function CheckboxField({
  id,
  label,
  control,
  error,
  disabled,
  required,
}: {
  id: keyof DeathReportValues;
  label: React.ReactNode;
  control: Control<DeathReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={id}
      render={({ field }) => (
        <Field orientation="horizontal" data-invalid={!!error} className="items-start">
          <Checkbox
            id={id}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <FieldLabel htmlFor={id} className="text-sm font-medium">
            {label} {required && <span className="text-destructive">*</span>}
          </FieldLabel>
        </Field>
      )}
    />
  );
}

function DateField({
  id,
  label,
  required,
  control,
  error,
  disabled,
  placeholder = "Pick a date",
  maxDate,
  fromYear,
}: {
  id: keyof DeathReportValues;
  label: string;
  required?: boolean;
  control: Control<DeathReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  placeholder?: string;
  maxDate?: Date;
  fromYear?: number;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Controller
        control={control}
        name={id}
        render={({ field }) => {
          const selected = typeof field.value === "string" ? parseIsoDate(field.value) : undefined;
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={!!error}
                  className={cn(
                    "h-11 w-full justify-start gap-2 rounded-xl px-4 font-normal",
                    !selected && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {selected ? formatDisplayDate(selected) : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={selected}
                  defaultMonth={selected ?? maxDate}
                  startMonth={fromYear ? new Date(fromYear, 0) : undefined}
                  endMonth={maxDate}
                  disabled={maxDate ? { after: maxDate } : undefined}
                  onSelect={(date) => field.onChange(date ? toIsoDate(date) : "")}
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function TimeField({
  id,
  label,
  required,
  control,
  error,
  disabled,
}: {
  id: keyof DeathReportValues;
  label: string;
  required?: boolean;
  control: Control<DeathReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Controller
        control={control}
        name={id}
        render={({ field }) => {
          const raw = typeof field.value === "string" ? field.value : "";
          const [h, m] = raw.includes(":") ? raw.split(":") : ["", ""];
          const display = formatDisplayTime(raw);
          const setPart = (part: "h" | "m", value: string) => {
            const nh = part === "h" ? value : h || "00";
            const nm = part === "m" ? value : m || "00";
            field.onChange(`${nh}:${nm}`);
          };
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={!!error}
                  className={cn(
                    "h-11 w-full justify-start gap-2 rounded-xl px-4 font-normal",
                    !display && "text-muted-foreground"
                  )}
                >
                  <ClockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {display || "Select time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Hour
                    </span>
                    <ScrollArea className="h-48 w-14 rounded-lg border">
                      <div className="flex flex-col gap-0.5 p-1">
                        {HOURS.map((hh) => (
                          <button
                            key={hh}
                            type="button"
                            onClick={() => setPart("h", hh)}
                            className={cn(
                              "cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors hover:bg-accent",
                              h === hh && "bg-primary text-primary-foreground hover:bg-primary"
                            )}
                          >
                            {hh}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <span className="mt-6 text-lg font-semibold text-muted-foreground">:</span>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Minute
                    </span>
                    <ScrollArea className="h-48 w-14 rounded-lg border">
                      <div className="flex flex-col gap-0.5 p-1">
                        {MINUTES.map((mm) => (
                          <button
                            key={mm}
                            type="button"
                            onClick={() => setPart("m", mm)}
                            className={cn(
                              "cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors hover:bg-accent",
                              m === mm && "bg-primary text-primary-foreground hover:bg-primary"
                            )}
                          >
                            {mm}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isComplete = currentStep > step;
        const isActive = currentStep === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                  isComplete || isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step}
              </motion.div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium whitespace-nowrap sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {step < STEP_LABELS.length && (
              <div className="relative h-0.5 w-full flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={false}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

const SUBMIT_COOLDOWN_MS = 10_000;
const DRAFT_STORAGE_KEY = "death-report-draft-v1";

export default function DeathReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [success, setSuccess] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const token = useAuthToken();
  const createReport = useCreateDeathReportMutation();
  const today = useMemo(() => new Date(), []);
  const lastSubmitAtRef = React.useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<DeathReportValues>({
    resolver: zodResolver(deathReportSchema),
    defaultValues: { ...DEATH_REPORT_DEFAULTS, reportedDate: todayIsoDate(), incidentDate: todayIsoDate() },
    mode: "onSubmit",
  });

  const isLoading = createReport.isPending;

  const [draftPromptVisible, setDraftPromptVisible] = useState(false);
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DRAFT_STORAGE_KEY)) setDraftPromptVisible(true);
    } catch {
      // localStorage unavailable (private browsing, disabled storage)
    }
  }, []);

  useEffect(() => {
    const subscription = watch((values) => {
      if (draftPromptVisible) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
        } catch {
          // localStorage unavailable
        }
      }, 600);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [watch, draftPromptVisible]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const values = getValues();
      const hasProgress = values.ref || values.description || values.actionTaken;
      if (hasProgress && !success) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [getValues, success]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  };

  const resumeDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) reset(JSON.parse(raw) as DeathReportValues);
    } catch {
      // corrupt or unavailable draft — nothing to restore
    }
    setDraftPromptVisible(false);
  };

  const discardDraft = () => {
    clearDraft();
    setDraftPromptVisible(false);
  };

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep as 1 | 2 | 3 | 4 | 5]);
    if (valid) {
      setDirection(1);
      setCurrentStep((s) => (s < STEP_LABELS.length ? s + 1 : s));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((s) => (s > 1 ? s - 1 : s));
  };

  const onSubmit = (values: DeathReportValues) => {
    const now = Date.now();
    if (now - lastSubmitAtRef.current < SUBMIT_COOLDOWN_MS) {
      notify.error("Please wait a moment", "Give it a few seconds before submitting another report.");
      return;
    }
    lastSubmitAtRef.current = now;

    createReport.mutate(values, {
      onSuccess: (data) => {
        setSuccess(true);
        notify.success("Report submitted", data?.message ?? "Your death report has been logged into the system.");
        clearDraft();
        reset({ ...DEATH_REPORT_DEFAULTS, reportedDate: todayIsoDate(), incidentDate: todayIsoDate() });
        setDirection(-1);
        setCurrentStep(1);
      },
      onError: (err) => {
        notify.apiError("Submission failed", err);
      },
    });
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <div className="min-h-screen w-full bg-background">
      <AnimatePresence>{!appReady && <LoadingScreen />}
      </AnimatePresence>

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/60 lg:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/images/rhv logo.png" alt="RHV Logo" width={90} height={24} className="h-6 w-auto" />
            <span>DeathReport</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {token ? (
              <Link href="/dashboard" passHref>
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" passHref>
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Personnel Login
                </Button>
              </Link>
            )}
          </div>
        </header>

        <main className="relative flex flex-1 items-start justify-center overflow-hidden p-4 sm:p-6 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl"
          >
            <Card className="w-full gap-0 overflow-visible rounded-3xl py-0 shadow-xl ring-1 ring-foreground/10">
              <CardHeader className="space-y-1.5 border-b px-6 py-7 text-center sm:px-10">
                <span className="mx-auto mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Safety Reporting
                </span>
                <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  RHV Hospital Death Reporting Form
                </CardTitle>
                <CardDescription className="mx-auto max-w-2xl text-sm sm:text-base">
                  Please use this form to safely record and report any death occurrences following an incident or
                  treatment episode. All fields marked with * are required.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Draft autosave prompt */}
                <AnimatePresence>
                  {draftPromptVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                        <span>You have an unsaved report from a previous visit. Resume where you left off?</span>
                        <div className="flex shrink-0 gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={discardDraft} className="rounded-lg">
                            Discard
                          </Button>
                          <Button type="button" size="sm" onClick={resumeDraft} className="rounded-lg">
                            Resume Draft
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success banner */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </motion.span>
                        <div className="flex flex-col">
                          <span>Your death report has been logged into the system.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <CardContent className="space-y-6 px-6 pt-6 sm:px-10">
                  <Stepper currentStep={currentStep} />

                  <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Basic Information
                            </h3>
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
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Incident Details
                            </h3>
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
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Risk & Outcome Assessment
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <SelectField
                                id="riskGrading"
                                label="Risk Grading"
                                required
                                control={control}
                                error={errors.riskGrading}
                                disabled={isLoading}
                                placeholder="Select risk grading"
                                options={[
                                  { value: "Low", label: "Low" },
                                  { value: "Medium", label: "Medium" },
                                  { value: "High", label: "High" },
                                  { value: "Critical", label: "Critical" },
                                ]}
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
                              className="mt-4"
                            />
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Patient & Family Communication
                            </h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                  <CheckboxField
                                    id="patientInvolved"
                                    control={control}
                                    error={errors.patientInvolved}
                                    disabled={isLoading}
                                    label="Patient involved"
                                  />
                                </div>
                                <div>
                                  <CheckboxField
                                    id="patientTold"
                                    control={control}
                                    error={errors.patientTold}
                                    disabled={isLoading}
                                    label="Patient told"
                                  />
                                </div>
                                <div>
                                  <CheckboxField
                                    id="familyTold"
                                    control={control}
                                    error={errors.familyTold}
                                    disabled={isLoading}
                                    label="Family told"
                                  />
                                </div>
                                <div>
                                  <CheckboxField
                                    id="doctorNotified"
                                    control={control}
                                    error={errors.doctorNotified}
                                    disabled={isLoading}
                                    label="Doctor notified"
                                  />
                                </div>
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
                          </div>
                        </div>
                      )}

                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Investigation & Review
                            </h3>
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
                                options={[
                                  { value: "Level 1", label: "Level 1" },
                                  { value: "Level 2", label: "Level 2" },
                                  { value: "Level 3", label: "Level 3" },
                                  { value: "Comprehensive", label: "Comprehensive" },
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="flex justify-between gap-3 px-6 py-5 sm:px-10">
                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading} className="gap-1.5">
                          <ArrowLeft className="h-4 w-4" />
                          Previous
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentStep < STEP_LABELS.length ? (
                      <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
                        <Button type="button" onClick={nextStep} disabled={isLoading} className="gap-1.5">
                          Next Step
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
                        <Button type="submit" disabled={isLoading} className="gap-1.5">
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting Report...
                            </>
                          ) : (
                            "Submit Death Report"
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
