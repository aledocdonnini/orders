"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  title: string;
  date: string;
}

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  onDelete: (id: number) => void;
}

export default function EventList({
  events,
  selectedEvent,
  setSelectedEvent,
  onDelete,
}: EventListProps) {
  const router = useRouter();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    router.push(`/protected/event/${event.id}`);
  };

  const now = new Date();
  const upcomingEvents = events.filter((event) => new Date(event.date) >= now);
  const pastEvents = events.filter((event) => new Date(event.date) < now);

  const renderEvents = (list: Event[]) =>
    list.length === 0 ? (
      <p className="text-sm text-muted-foreground">Nessun evento.</p>
    ) : (
      <ul className="space-y-3">
        {list.map((event) => (
          <li
            key={event.id}
            className="flex justify-between items-center px-5 py-4 rounded-xl bg-muted/50 hover:bg-foreground/10"
          >
            <span
              className="cursor-pointer flex-1 text-lg font-semibold"
              onClick={() => handleEventClick(event)}
            >
              {event.title}{" "}
              <span className="text-xs">– {formatDate(event.date)}</span>
            </span>
            <Button
              variant={"outline"}
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-sm "
            >
              <XIcon />
            </Button>
          </li>
        ))}
      </ul>
    );

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Eventi Disponibili</h2>
      {renderEvents(upcomingEvents)}

      <h2 className="text-xl font-bold mt-8 mb-5">Eventi Passati</h2>
      {renderEvents(pastEvents)}
    </div>
  );
}
