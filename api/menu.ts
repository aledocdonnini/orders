"use server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Ottiene il menu di un evento
export async function getMenu(eventId: number) {
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .eq("event_id", eventId);
  if (error) throw error;
  return data;
}

// Aggiunge una portata al menu
export async function addMenuItem(
  eventId: number,
  title: string,
  price: number
) {
  const { data, error } = await supabase
    .from("menu")
    .insert([{ event_id: eventId, title, price }])
    .select("*");
  if (error) throw error;
  return data[0];
}

// Elimina una portata
export async function deleteMenuItem(itemId: number) {
  const { error } = await supabase.from("menu").delete().eq("id", itemId);
  if (error) throw error;
}

// Imposta una portata come terminata/non terminata
export async function toggleMenuItemStatus(
  itemId: number,
  isAvailable: boolean
) {
  const { error } = await supabase
    .from("menu")
    .update({ available: isAvailable })
    .eq("id", itemId);
  if (error) throw error;
}
