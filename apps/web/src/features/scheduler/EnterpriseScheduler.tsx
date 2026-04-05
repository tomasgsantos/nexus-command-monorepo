import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { Event } from '@nexus/api';
import { useEventToast } from './hooks/use-event-toast';
import { useScheduler } from './hooks/use-scheduler';
import { AgendaPanel } from './components/AgendaPanel';
import { EventFormModal } from './components/EventFormModal';
import { EventToast } from './components/EventToast';
import './scheduler.css';

export default function EnterpriseScheduler() {
  const { toasts, notify, dismiss } = useEventToast();
  const { events, loading, refetch, createEvent, updateEvent, deleteEvent } = useScheduler(notify);

  // Re-fetch whenever the Scheduler page is mounted so navigating back from
  // Central Command always shows the latest events without a manual refresh.
  useEffect(() => { refetch(); }, [refetch]);
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
      try {
        await updateEvent(arg.event.id, {
          start_at: arg.event.startStr,
          end_at: arg.event.endStr || arg.event.startStr,
        });
      } catch {
        notify('Failed to reschedule event', 'error');
        arg.revert();
      }
    },
    [updateEvent, notify],
  );

  const handleFormSubmit = useCallback(
    async (data: Parameters<typeof createEvent>[0]) => {
      if (formInitial.id) {
        await updateEvent(formInitial.id, data);
      } else {
        await createEvent(data);
      }
    },
    [formInitial.id, createEvent, updateEvent, notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteEvent(id);
      } catch {
        notify('Failed to delete event', 'error');
      }
    },
    [deleteEvent, notify],
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
          {loading && <div className="scheduler-calendar__loading" />}
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
        </div>

        <AgendaPanel
          selectedDate={selectedDate}
          events={events}
          onDateChange={setSelectedDate}
          onNewEvent={openNewEventForDate}
          onEdit={(event, e) => { setFormInitial(event); setMouseOrigin(e ? { x: e.clientX, y: e.clientY } : undefined); setFormOpen(true); }}
          onDelete={handleDelete}
        />
      </motion.div>

      <EventFormModal
        open={formOpen}
        initial={formInitial}
        mouseOrigin={mouseOrigin}
        onClose={() => { setFormOpen(false); setFormInitial({}); setMouseOrigin(undefined); }}
        onSubmit={handleFormSubmit}
      />

      <EventToast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
