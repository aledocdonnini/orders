"use client";

import { useEffect, useState } from "react";
import EventCreator from "@/components/EventCreator";
import EventList from "@/components/EventList";
import { getEvents, createEvent, deleteEvent } from "@/lib/supabase";

interface Event {
  id: number;
  title: string;
  date: string;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Errore nel recupero degli eventi:", error);
    }
  };

  const handleCreateEvent = async (title: string, date: string) => {
    try {
      const newEvent = await createEvent(title, date);
      setEvents((prev) => [...prev, newEvent]);
    } catch (error) {
      console.error("Errore nella creazione dell'evento:", error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));

      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Errore nell'eliminazione dell'evento:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-x-10">
      <EventCreator onEventCreated={handleCreateEvent} />
      <EventList
        events={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
