import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface EventData {
  id: number;
  title: string;
  date: string; // ISO string, es: "2025-04-16T12:00:00+00:00"
}

export function useEvent(eventId: number) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date")
        .eq("id", eventId)
        .single();

      if (error) setError(error);
      else setEvent(data);

      setIsLoading(false);
    }

    if (eventId) fetchEvent();
  }, [eventId]);

  return { event, isLoading, error };
}
