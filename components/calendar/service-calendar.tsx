"use client"

import { useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { Service } from "@/lib/api/services"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"

interface ServiceCalendarProps {
  services: Service[]
  onDateClick: (date: Date) => void
  onEventClick: (service: Service) => void
}

export function ServiceCalendar({
  services,
  onDateClick,
  onEventClick,
}: ServiceCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)

  // Convertir servicios a eventos de FullCalendar
  const events = services.map((service) => ({
    id: service.id,
    title: service.clientName,
    start: service.scheduledDate,
    extendedProps: {
      service,
      price: service.price,
      time: format(new Date(service.scheduledDate), "HH:mm"),
    },
    classNames: [`fc-event-${service.type.toLowerCase()}`],
  }))

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden calendar-google-style">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        locale={esLocale}
        events={events}
        dateClick={(info) => onDateClick(info.date)}
        eventClick={(info) => {
          const service = info.event.extendedProps.service as Service
          onEventClick(service)
        }}
        eventContent={(eventInfo) => {
          const service = eventInfo.event.extendedProps.service as Service
          const time = eventInfo.event.extendedProps.time as string

          return (
            <div className="fc-event-content-wrapper">
              <div className="fc-event-time">{time}</div>
              <div className="fc-event-title-wrapper">
                <div className="fc-event-title">{service.clientName}</div>
              </div>
            </div>
          )
        }}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        nowIndicator
        editable={false}
        selectable
        selectMirror
        dayMaxEvents={3}
        weekends
        fixedWeekCount={false}
        showNonCurrentDates={false}
        dayHeaderFormat={{ weekday: 'short' }}
      />
    </div>
  )
}
