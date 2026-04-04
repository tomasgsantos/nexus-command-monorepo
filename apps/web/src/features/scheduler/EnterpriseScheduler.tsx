import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { Event } from '@nexus/api';
import { useScheduler } from './hooks/use-scheduler';
import { AgendaPanel } from './components/AgendaPanel';
import { EventFormModal } from './components/EventFormModal';
import './scheduler.css';

export default function EnterpriseScheduler() {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useScheduler();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<Event>>({});
  const [mouseOrigin, setMouseOrigin] = useState<{ x: number; y: number } | undefined>();

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_at,
    end: e.end_at,
  }));

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setSelectedDate(arg.date);
  }, []);

  const handleDateSelect = useCallback((arg: DateSelectArg) => {
    setSelectedDate(arg.start);
    setFormInitial({ start_at: arg.startStr, end_at: arg.endStr });
    setMouseOrigin(arg.jsEvent ? { x: arg.jsEvent.clientX, y: arg.jsEvent.clientY } : undefined);
    setFormOpen(true);
  }, []);

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const found = events.find((e) => e.id === arg.event.id);
      if (found) {
        setFormInitial(found);
        setMouseOrigin({ x: arg.jsEvent.clientX, y: arg.jsEvent.clientY });
        setFormOpen(true);
      }
    },
    [events],
  );

  const handleEventDrop = useCallback(
    async (arg: EventDropArg) => {
      await updateEvent(arg.event.id, {
        start_at: arg.event.startStr,
        end_at: arg.event.endStr || arg.event.startStr,
      });
    },
    [updateEvent],
  );

  function openNewEventForDate(e?: React.MouseEvent) {
    const start = new Date(selectedDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(10, 0, 0, 0);
    setFormInitial({ start_at: start.toISOString(), end_at: end.toISOString() });
    setMouseOrigin(e ? { x: e.clientX, y: e.clientY } : undefined);
    setFormOpen(true);
  }

  return (
    <div className="scheduler-root">
      <motion.header
        className="scheduler-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="scheduler-header__title">Enterprise Scheduler</h1>
          <p className="scheduler-header__sub">Strategic alignment overview</p>
        </div>
      </motion.header>

      <motion.div
        className="scheduler-layout"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="scheduler-calendar">
          {loading ? (
            <div className="app-loading" />
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
              }}
              events={calendarEvents}
              selectable
              editable
              dateClick={handleDateClick}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              height="100%"
            />
          )}
        </div>

        <AgendaPanel
          selectedDate={selectedDate}
          events={events}
          onNewEvent={openNewEventForDate}
          onEdit={(event, e) => { setFormInitial(event); setMouseOrigin(e ? { x: e.clientX, y: e.clientY } : undefined); setFormOpen(true); }}
          onDelete={deleteEvent}
        />
      </motion.div>

      <EventFormModal
        open={formOpen}
        initial={formInitial}
        mouseOrigin={mouseOrigin}
        onClose={() => { setFormOpen(false); setFormInitial({}); setMouseOrigin(undefined); }}
        onSubmit={createEvent}
      />
    </div>
  );
}
