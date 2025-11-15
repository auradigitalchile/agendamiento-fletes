"use client"

import { useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { Service } from "@/lib/api/services"
import { getServiceTypeColor, formatPrice } from "@/lib/utils"

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
    title: `${service.clientName} - ${service.type}`,
    start: service.scheduledDate,
    backgroundColor: getServiceTypeColor(service.type),
    borderColor: getServiceTypeColor(service.type),
    extendedProps: {
      service,
    },
    classNames: [`fc-event-${service.type.toLowerCase()}`],
  }))

  return (
    <div className="bg-card rounded-lg border p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
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
          return (
            <div className="fc-event-main-frame p-1">
              <div className="fc-event-title-container">
                <div className="fc-event-title fc-sticky text-xs font-medium">
                  {service.clientName}
                </div>
              </div>
              <div className="text-xs opacity-90">
                {formatPrice(service.price)}
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
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          startTime: "08:00",
          endTime: "18:00",
        }}
      />
    </div>
  )
}
