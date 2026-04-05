import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nexus/ui';
import type { Event, CreateEventInput } from '@nexus/api';
import './EventFormModal.css';

interface EventFormModalProps {
  open: boolean;
  initial?: Partial<Event>;
  mouseOrigin?: { x: number; y: number };
  onClose: () => void;
  onSubmit: (data: CreateEventInput) => Promise<unknown>;
}

// datetime-local inputs expect a value in LOCAL time ("YYYY-MM-DDTHH:mm").
// Stored timestamps are UTC, so we must shift by the local offset before slicing.
function toDateTimeLocal(value: string | undefined): string {
  if (!value) return '';
  if (value.length === 10) return `${value}T00:00`;
  const d = new Date(value);
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function EventFormModal({ open, initial, mouseOrigin, onClose, onSubmit }: EventFormModalProps) {
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setStartAt(toDateTimeLocal(initial?.start_at));
    setEndAt(toDateTimeLocal(initial?.end_at));
    setError(null);
  }, [initial]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        project_id: initial?.project_id ?? null,
        caldav_uid: null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="event-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="event-modal"
            initial={{
              x: mouseOrigin ? mouseOrigin.x - window.innerWidth / 2 : '200px',
              y: mouseOrigin ? mouseOrigin.y - window.innerHeight / 2 : 0,
              scale: .5,
              opacity: 0,
            }}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            exit={{
              x: mouseOrigin ? mouseOrigin.x - window.innerWidth / 2 : '200px',
              y: mouseOrigin ? mouseOrigin.y - window.innerHeight / 2 : 0,
              scale: .5,
              opacity: 0,
            }}
            transition={{ x: {duration: .3}, y: {duration: .3}, scale: {duration: .2, delay: .1}, opacity: {duration: .1} }}
          >
            <h2 className="event-modal__title">{initial?.id ? 'Edit Event' : 'New Event'}</h2>
            <form className="event-modal__form" onSubmit={handleSubmit}>
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="evt-title">Title</label>
                <input
                  id="evt-title"
                  className="event-modal__input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="evt-start">Start</label>
                <input
                  id="evt-start"
                  className="event-modal__input"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
                />
              </div>
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="evt-end">End</label>
                <input
                  id="evt-end"
                  className="event-modal__input"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
                />
              </div>
              {error && <p className="event-modal__error">{error}</p>}
              <div className="event-modal__actions">
                <Button type="button" variant="text" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
