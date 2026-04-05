import { useNavigate } from 'react-router-dom';
import { Button } from '@nexus/ui';
import { AppRoute } from '../../../constants/routes';
import { useScheduler } from '../hooks/use-scheduler';
import './SchedulerWidget.css';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function SchedulerWidget() {
  const navigate = useNavigate();
  const { events } = useScheduler();

  const upcoming = events
    .filter((e) => new Date(e.start_at) >= new Date())
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, 4);

  return (
    <div className="sched-widget">
      <header className="sched-widget__header">
        <h3 className="sched-widget__title">Upcoming</h3>
        <Button variant="text" onClick={() => navigate(AppRoute.Scheduler)}>
          View all
        </Button>
      </header>

      {upcoming.length === 0 ? (
        <p className="sched-widget__empty">No upcoming events</p>
      ) : (
        <ul className="sched-widget__list">
          {upcoming.map((event) => (
            <li key={event.id} className="sched-widget__item">
              <div className="sched-widget__item-dot" />
              <div className="sched-widget__item-body">
                <p className="sched-widget__item-title">{event.title}</p>
                <p className="sched-widget__item-time">
                  {formatDate(event.start_at)} · {formatTime(event.start_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
