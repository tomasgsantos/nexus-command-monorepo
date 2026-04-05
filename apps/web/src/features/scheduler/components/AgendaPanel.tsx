import type React from 'react';
import { Button } from '@nexus/ui';
import type { Event } from '@nexus/api';
import { downloadIcs } from '../utils/ics-formatter';
import './AgendaPanel.css';

interface AgendaPanelProps {
  selectedDate: Date;
  events: Event[];
  onDateChange: (date: Date) => void;
  onNewEvent: (e?: React.MouseEvent) => void;
  onEdit: (event: Event, e?: React.MouseEvent) => void;
  onDelete: (id: string) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export function AgendaPanel({ selectedDate, events, onDateChange, onNewEvent, onEdit, onDelete }: AgendaPanelProps) {
  function shiftDay(delta: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onDateChange(next);
  }
  const dayEvents = events
    .filter((e) => {
      const start = new Date(e.start_at);
      return (
        start.getFullYear() === selectedDate.getFullYear() &&
        start.getMonth() === selectedDate.getMonth() &&
        start.getDate() === selectedDate.getDate()
      );
    })
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const upcomingCount = events.filter((e) => new Date(e.start_at) >= new Date()).length;

  return (
    <aside className="agenda">
      <header className="agenda__header">
        <div className="agenda__header-nav">
          <Button variant="icon" onClick={() => shiftDay(-1)} aria-label="Previous day">‹</Button>
          <div>
            <p className="agenda__header-label">Daily Agenda</p>
            <p className="agenda__header-date">{formatDateHeader(selectedDate)}</p>
          </div>
          <Button variant="icon" onClick={() => shiftDay(1)} aria-label="Next day">›</Button>
        </div>
        <Button variant="primary" onClick={onNewEvent}>+ New</Button>
      </header>

      <div className="agenda__events">
        {dayEvents.length === 0 ? (
          <div className="agenda__empty">
            <p>No events scheduled</p>
            <Button variant="secondary" onClick={onNewEvent}>Schedule event</Button>
          </div>
        ) : (
          dayEvents.map((event) => (
            <div key={event.id} className="agenda__card">
              <div className="agenda__card-time">
                <span>{formatTime(event.start_at)}</span>
                <span className="agenda__card-time-sep">–</span>
                <span>{formatTime(event.end_at)}</span>
              </div>
              <div className="agenda__card-body">
                <p className="agenda__card-title">{event.title}</p>
                {event.caldav_uid && (
                  <p className="agenda__card-sub">CalDAV synced</p>
                )}
              </div>
              <div className="agenda__card-actions">
                <Button variant="icon" onClick={(e) => onEdit(event, e)} title="Edit">✎</Button>
                <Button variant="icon" onClick={() => downloadIcs(event)} title="Export .ics">↓</Button>
                <Button variant="icon" onClick={() => onDelete(event.id)} title="Delete">✕</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="agenda__pulse">
        <div className="agenda__pulse-dot" />
        <span className="agenda__pulse-label">Live Strategy Pulse</span>
        <div className="agenda__pulse-stats">
          <div className="agenda__stat">
            <span className="agenda__stat-value">{dayEvents.length}</span>
            <span className="agenda__stat-label">Today</span>
          </div>
          <div className="agenda__stat">
            <span className="agenda__stat-value agenda__stat-value--accent">{upcomingCount}</span>
            <span className="agenda__stat-label">Upcoming</span>
          </div>
        </div>
      </footer>
    </aside>
  );
}
