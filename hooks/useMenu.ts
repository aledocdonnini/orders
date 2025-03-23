import { useEffect } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";

const fetchMenu = async (eventId: number) => {
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .eq("event_id", eventId);
  if (error) throw new Error(error.message);
  return data ?? [];
};

export function useMenu(eventId: number) {
  const { data, error, mutate, isLoading } = useSWR(
    eventId ? `menu-${eventId}` : null,
    () => fetchMenu(eventId)
  );

  useEffect(() => {
    if (!eventId) return;

    // Crea un canale realtime per ascoltare gli eventi sulla tabella menu
    const channel = supabase
      .channel(`menu:event_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // ascolta tutti gli eventi (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "menu",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("Realtime update in menu:", payload);
          mutate(); // Forza la revalidazione dei dati quando avviene una modifica
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, mutate]);

  return { menu: data ?? [], error, isLoading, mutate };
}
