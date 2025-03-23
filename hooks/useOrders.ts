import { useEffect } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";

const fetchOrders = async (eventId: number) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export function useOrders(eventId: number) {
  const { data, error, mutate, isLoading } = useSWR(
    eventId ? `orders-${eventId}` : null,
    () => fetchOrders(eventId)
  );

  useEffect(() => {
    // Crea un canale realtime per ascoltare gli INSERT sulla tabella orders per questo evento
    const channel = supabase
      .channel(`orders:event_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("Nuovo ordine inserito:", payload);
          // Forza la revalidazione dei dati quando c'è una modifica
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, mutate]);

  return { orders: data ?? [], error, isLoading, mutate };
}
