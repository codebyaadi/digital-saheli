"use client";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  name?: string;
  defaultValue?: string; // ISO YYYY-MM-DD
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** A shadcn Calendar + Popover date picker that submits a hidden input value for forms. */
export function DatePicker({
  id,
  name,
  defaultValue,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValue ? new Date(defaultValue + "T00:00:00") : undefined,
  );
  const [open, setOpen] = React.useState(false);

  const formatted = date ? format(date, "dd MMM yyyy") : undefined;
  const isoValue = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <>
      {name && <input type="hidden" name={name} value={isoValue} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 size-4 shrink-0" />
            {formatted ?? placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            captionLayout="dropdown"
            defaultMonth={date}
            startMonth={new Date(1980, 0)}
            endMonth={new Date()}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
