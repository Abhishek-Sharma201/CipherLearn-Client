'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getDay, getDaysInMonth, isSameDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
  setMonth: (month: CalendarState['month']) => void;
  setYear: (year: CalendarState['year']) => void;
};

export const useCalendar = create<CalendarState>()(
  devtools((set) => ({
    month: new Date().getMonth() as CalendarState['month'],
    year: new Date().getFullYear(),
    setMonth: (month: CalendarState['month']) => set(() => ({ month })),
    setYear: (year: CalendarState['year']) => set(() => ({ year })),
  }))
);

type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
};

const CalendarContext = createContext<CalendarContextProps>({
  locale: 'en-US',
  startDay: 0,
});

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};

type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
  data: { value: string; label: string }[];
  labels: { button: string; empty: string; search: string };
  className?: string;
};

export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long'
) => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...new Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, m % 12)))
  );
};

export const daysForLocale = (locale: Intl.LocalesArgument, startDay: number) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);
  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate)
    );
    baseDate.setDate(baseDate.getDate() + 1);
  }
  return weekdays;
};

const Combobox = ({ value, setValue, data, labels, className }: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn('w-36 justify-between capitalize text-[13.5px] h-9', className)}
        >
          {value ? data.find((item) => item.value === value)?.label : labels.button}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-0">
        <Command
          filter={(value, search) => {
            const label = data.find((item) => item.value === value)?.label;
            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type OutOfBoundsDayProps = { day: number };

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="relative h-full w-full bg-muted/30 p-1 text-muted-foreground/40 text-[12px] select-none">
    {day}
  </div>
);

export type CalendarBodyProps = {
  features: Feature[];
  children: (props: { feature: Feature }) => ReactNode;
  onDateClick?: (date: Date) => void;
};

export const CalendarBody = ({ features, children, onDateClick }: CalendarBodyProps) => {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const firstDay = (getDay(new Date(year, month, 1)) - startDay + 7) % 7;
  const today = new Date();

  // Calculate total cells (complete rows of 7)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // Prev month days for leading out-of-bounds cells
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));

  return (
    <div
      className="flex-1 min-h-0 grid grid-cols-7"
      style={{ gridAutoRows: '1fr' }}
    >
      {Array.from({ length: totalCells }, (_, index) => {
        const isOutPrev = index < firstDay;
        const isOutNext = index >= firstDay + daysInMonth;
        const isOut = isOutPrev || isOutNext;

        const day = isOutPrev
          ? prevMonthDays - (firstDay - index - 1)
          : isOutNext
            ? index - (firstDay + daysInMonth) + 1
            : index - firstDay + 1;

        const isToday = !isOut && isSameDay(new Date(year, month, day), today);
        const featuresForDay = !isOut
          ? features.filter((f) => isSameDay(new Date(f.endAt), new Date(year, month, day)))
          : [];

        return (
          <div
            key={index}
            className={cn(
              'relative overflow-hidden border-t border-r border-border',
              index % 7 === 6 && 'border-r-0',
              !isOut && 'transition-colors',
              !isOut && onDateClick && 'cursor-pointer hover:bg-primary/5'
            )}
            onClick={!isOut && onDateClick ? (e) => {
              // Only trigger if clicking on the cell background, not on a feature item
              if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-calendar-item]') === null) {
                onDateClick(new Date(year, month, day));
              }
            } : undefined}
          >
            {isOut ? (
              <OutOfBoundsDay day={day} />
            ) : (
              <div
                className={cn(
                  'relative flex h-full w-full flex-col gap-0.5 p-1 text-[12px]',
                  isToday ? 'text-primary font-bold' : 'text-foreground/70'
                )}
              >
                <span className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded-full leading-none text-[11.5px] shrink-0',
                  isToday && 'bg-primary text-primary-foreground font-bold'
                )}>
                  {day}
                </span>
                <div className="space-y-0.5 overflow-hidden">
                  {featuresForDay.slice(0, 2).map((feature) => (
                    <div key={feature.id} data-calendar-item="true">
                      {children({ feature })}
                    </div>
                  ))}
                </div>
                {featuresForDay.length > 2 && (
                  <span className="block text-muted-foreground text-[10px] font-medium mt-0.5">
                    +{featuresForDay.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker = ({ className, children }: CalendarDatePickerProps) => (
  <div className={cn('flex items-center gap-2', className)}>{children}</div>
);

export type CalendarMonthPickerProps = { className?: string };

export const CalendarMonthPicker = ({ className }: CalendarMonthPickerProps) => {
  const { month, setMonth } = useCalendar();
  const { locale } = useContext(CalendarContext);

  return (
    <Combobox
      className={className}
      value={month.toString()}
      setValue={(value) => setMonth(Number.parseInt(value) as CalendarState['month'])}
      data={monthsForLocale(locale).map((month, index) => ({
        value: index.toString(),
        label: month,
      }))}
      labels={{ button: 'Month', empty: 'No month found', search: 'Search month...' }}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};

export const CalendarYearPicker = ({ className, start, end }: CalendarYearPickerProps) => {
  const { year, setYear } = useCalendar();

  return (
    <Combobox
      className={className}
      value={year.toString()}
      setValue={(value) => setYear(Number.parseInt(value))}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{ button: 'Year', empty: 'No year found', search: 'Search year...' }}
    />
  );
};

export type CalendarDatePaginationProps = { className?: string };

export const CalendarDatePagination = ({ className }: CalendarDatePaginationProps) => {
  const { month, year, setMonth, setYear } = useCalendar();

  const handlePreviousMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else { setMonth((month - 1) as CalendarState['month']); }
  };

  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else { setMonth((month + 1) as CalendarState['month']); }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button onClick={handlePreviousMonth} variant="ghost" size="icon" className="h-8 w-8">
        <ChevronLeftIcon size={16} />
      </Button>
      <Button onClick={handleNextMonth} variant="ghost" size="icon" className="h-8 w-8">
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};

export type CalendarDateProps = { children: ReactNode };

export const CalendarDate = ({ children }: CalendarDateProps) => (
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
    {children}
  </div>
);

export type CalendarHeaderProps = { className?: string };

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useContext(CalendarContext);

  return (
    <div className={cn('grid grid-cols-7 border-b border-border shrink-0', className)}>
      {daysForLocale(locale, startDay).map((day) => (
        <div
          key={day}
          className="py-2 text-center text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground"
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarItemProps = {
  feature: Feature;
  className?: string;
  onClick?: () => void;
};

export const CalendarItem = ({ feature, className, onClick }: CalendarItemProps) => (
  <div
    className={cn(
      'flex items-center gap-1 rounded px-1 py-px text-[11px] font-semibold truncate w-full',
      onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
      className
    )}
    style={{ backgroundColor: `${feature.status.color}18`, color: feature.status.color }}
    onClick={onClick}
    key={feature.id}
  >
    <div
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: feature.status.color }}
    />
    <span className="truncate">{feature.name}</span>
  </div>
);

export type CalendarProviderProps = {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
};

export const CalendarProvider = ({
  locale = 'en-US',
  startDay = 0,
  children,
  className,
}: CalendarProviderProps) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn('relative flex flex-col min-h-0', className)}>{children}</div>
  </CalendarContext.Provider>
);
