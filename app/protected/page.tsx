"use client";

import { useEffect, useState } from "react";
import EventCreator from "@/components/EventCreator";
import EventList from "@/components/EventList";
import { getEvents, createEvent, deleteEvent } from "@/lib/supabase";
import { PlusIcon } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
    <div className="">
      <EventList
        events={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onDelete={handleDeleteEvent}
      />
      <Drawer>
        <DrawerTrigger className="fixed bottom-5 right-5 bg-foreground text-background p-3 rounded-full">
          <PlusIcon />
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-10 w-full max-w-[350px] mx-auto">
            <EventCreator onEventCreated={handleCreateEvent} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
