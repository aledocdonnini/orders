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
  return { orders: data ?? [], error, mutate, isLoading };
}
