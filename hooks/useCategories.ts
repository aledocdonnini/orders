import useSWR from "swr";
import { supabase } from "@/lib/supabase";

const fetchCategories = async (eventId: number) => {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, name")
    .eq("event_id", eventId);

  if (error) throw error;
  return data;
};

export function useCategories(eventId: number) {
  const { data, error, isLoading } = useSWR(
    eventId ? ["categories", eventId] : null,
    () => fetchCategories(eventId)
  );

  return { categories: data || [], error, isLoading };
}
