'use client';

import React, { useState } from 'react';
import useEvents from 'apps/seller-ui/src/hooks/useEvents';

const AllEventsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useEvents(page, 12);

  const events = data?.events || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="w-full p-8">
      <h2 className="text-2xl py-2 font-semibold font-Poppins">All Events</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-destructive">Failed to load events</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event: any) => (
              <div key={event.id} className="border border-border rounded-md p-4">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.short_description}</p>
                <div className="mt-2 text-sm">
                  <p>Start: {event.starting_date ? new Date(event.starting_date).toLocaleString() : '-'}</p>
                  <p>End: {event.ending_date ? new Date(event.ending_date).toLocaleString() : '-'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button
              className="px-3 py-1 border border-border rounded-md disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 border border-border rounded-md disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEventsPage;
