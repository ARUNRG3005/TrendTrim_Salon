"use client"

import * as React from "react"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Card, CardContent, CardFooter } from "./card"

export function CalendarWithTimePresets({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  onContinue
}) {
  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const totalMinutes = i * 15
    const hour = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  })

  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // No locked mock dates by default
  const bookedDates = React.useMemo(() => {
    return []
  }, [])

  return (
    <Card className="gap-0 p-0 overflow-hidden border border-border bg-card text-card-foreground shadow-lg rounded-2xl">
      <CardContent className="relative p-0 flex flex-col md:flex-row md:pr-48">
        <div className="p-6 flex-1 flex justify-center items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            defaultMonth={selectedDate || today}
            disabled={{ before: today }}
            showOutsideDays={false}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: "[&>button]:line-through opacity-100 text-muted-foreground/30",
            }}
            className="bg-transparent p-0 [--cell-size:40px] md:[--cell-size:48px]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("en-US", { weekday: "short" })
              },
            }}
          />
        </div>
        <div className="no-scrollbar flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t border-border p-6 md:absolute md:inset-y-0 md:right-0 md:max-h-none md:w-48 md:border-t-0 md:border-l">
          <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onSelectTime(time)}
                  className={`w-full shadow-none transition-all duration-200 ${
                    isSelected 
                      ? "bg-[var(--champagne)] text-[#0D0D0D] font-medium hover:bg-[var(--champagne-lt)]" 
                      : "border-[var(--color-border)] hover:border-[var(--champagne)] hover:text-[var(--champagne)]"
                  }`}
                  style={{
                    fontFamily: 'Tenor Sans, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                  }}
                >
                  {time}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border px-6 py-5 md:flex-row items-center justify-between">
        <div className="text-sm text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
          {selectedDate && selectedTime ? (
            <>
              Your meeting is booked for{" "}
              <span className="font-medium text-[var(--color-text)]">
                {" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
              </span>
              at <span className="font-medium text-[var(--color-text)]">{selectedTime}</span>.
            </>
          ) : (
            <>Select a date and time for your meeting.</>
          )}
        </div>
        <Button
          disabled={!selectedDate || !selectedTime}
          onClick={onContinue}
          className="w-full md:w-auto md:ml-auto px-6 py-2 transition-all bg-[var(--champagne)] text-[#0D0D0D] hover:bg-[var(--champagne-lt)] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'Tenor Sans, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            height: '42px',
            borderRadius: '99px',
          }}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}
