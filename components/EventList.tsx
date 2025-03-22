"use client";

import { useRouter } from "next/navigation";

// Definizione del tipo per un evento
interface Event {
  id: number;
  title: string;
  date: string;
}

// Definizione del tipo per le props del componente
interface EventListProps {
  events: Event[];
  setSelectedEvent: (event: Event | null) => void;
}

export default function EventList({
  events,
  setSelectedEvent,
}: EventListProps) {
  const router = useRouter();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    router.push(`/protected/event/${event.id}`);
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Eventi Disponibili</h2>
      {events.length === 0 && <p>Nessun evento disponibile.</p>}
      <ul className="space-y-2">
        {events.map((event) => (
          <li
            key={event.id}
            className="border p-2 cursor-pointer hover:bg-gray-200"
            onClick={() => handleEventClick(event)}
          >
            {event.title} - {event.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
