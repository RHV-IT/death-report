"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/utils/date";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

function formatRange(value: DateRange | undefined): string {
  if (value?.from && value?.to) {
    return `${formatDisplayDate(value.from)} – ${formatDisplayDate(value.to)}`;
  }
  if (value?.from) {
    return formatDisplayDate(value.from);
  }
  return "Filter by reported date";
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const hasValue = Boolean(value?.from);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="default"
          className={cn(
            "h-9 justify-start gap-2 text-muted-foreground",
            hasValue && "text-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{formatRange(value)}</span>
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date range"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(undefined);
                }
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={onChange}
          disabled={{ after: new Date() }}
        />
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
          >
            Clear
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
