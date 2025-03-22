"use client";

import { useOrderContext } from "@/context/OrderContext";
import EventCreator from "@/components/EventCreator";
import EventList from "@/components/EventList";

export default function HomePage() {
  const { events, setSelectedEvent } = useOrderContext();

  return (
    <div>
      <h1 className="text-2xl font-bold">Gestione Ordinazioni Sagra</h1>
      <EventCreator />
      <EventList events={events} setSelectedEvent={setSelectedEvent} />
    </div>
  );
}
