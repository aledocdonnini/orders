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
  return { menu: data ?? [], error, mutate, isLoading };
}
