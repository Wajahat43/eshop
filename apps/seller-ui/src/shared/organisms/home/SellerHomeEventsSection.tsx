import React from 'react';
import { SectionHeader } from '../../atoms/home';
import { EventsList } from '../../molecules/home';
import Link from 'next/link';

type EventProduct = {
  id: string;
  title: string;
  starting_date?: string | null;
  ending_date?: string | null;
};

type SellerHomeEventsSectionProps = {
  events: EventProduct[];
};

const SellerHomeEventsSection: React.FC<SellerHomeEventsSectionProps> = ({ events }) => {
  const upcoming = [...(events || [])]
    .filter((e) => e.starting_date)
    .sort((a, b) => new Date(a.starting_date || '').getTime() - new Date(b.starting_date || '').getTime())
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow p-4 md:p-5">
      <SectionHeader
        title="Upcoming Events"
        description="Scheduled promotions and event-based products."
        action={
          <Link href="/dashboard/all-events" className="text-sm text-primary hover:underline">
            Manage Events
          </Link>
        }
      />
      <div className="mt-4">
        <EventsList events={upcoming} />
      </div>
    </div>
  );
};

export default SellerHomeEventsSection;
