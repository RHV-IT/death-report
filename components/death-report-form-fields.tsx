"use client";

import React from "react";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { pad2, toIsoDate, parseIsoDate, formatDisplayDate, formatDisplayTime } from "@/lib/utils/date";
import type { DeathReportValues } from "@/lib/schemas/death-report";

const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));

export function TextField({
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

export function TextAreaField({
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

export function SelectField({
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

export function CheckboxField({
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

export function DateField({
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

export function TimeField({
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
