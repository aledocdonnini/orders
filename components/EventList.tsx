"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-5">Eventi Disponibili</h2>
      {events.length === 0 && <p>Nessun evento disponibile.</p>}
      <ul className="space-y-2">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex justify-between items-center border p-2 hover:bg-foreground/10"
          >
            <span
              className="cursor-pointer flex-1"
              onClick={() => handleEventClick(event)}
            >
              {event.title} - {formatDate(event.date)}
            </span>
            <button
              onClick={() => onDelete(event.id)}
              className="ml-4 text-sm text-red-500 hover:underline"
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
