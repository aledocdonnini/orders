"use server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getMenu(eventId: number) {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("event_id", eventId);
  if (error) throw error;
  return data;
}

export async function addMenuItem(
  eventId: number,
  title: string,
  price: number
) {
  const { data, error } = await supabase
    .from("menu_items")
    .insert([{ event_id: eventId, title, price, available: true }])
    .select("*");
  if (error) throw error;
  return data[0];
}

export async function deleteMenuItems(ids: number[]) {
  const { error } = await supabase.from("menu_items").delete().in("id", ids);
  if (error) throw error;
}

export async function toggleMenuItemStatus(itemId: number, available: boolean) {
  const { error } = await supabase
    .from("menu_items")
    .update({ available })
    .eq("id", itemId);
  if (error) throw error;
}
