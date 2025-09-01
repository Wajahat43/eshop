import React from 'react';
import { StatusBadge } from '../../atoms/home';

type EventProduct = {
  id: string;
  title: string;
  starting_date?: string | null;
  ending_date?: string | null;
};

type EventsListProps = {
  events: EventProduct[];
};

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="text-sm text-muted-foreground">No upcoming events</div>;
  }

  return (
    <ul className="divide-y divide-border">
      {events.map((e) => (
        <li key={e.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{e.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {e.starting_date ? new Date(e.starting_date).toLocaleDateString() : 'TBA'}
              {e.ending_date ? ` – ${new Date(e.ending_date).toLocaleDateString()}` : ''}
            </p>
          </div>
          <div className="shrink-0">
            <StatusBadge label="Event" status="warning" />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default EventsList;
