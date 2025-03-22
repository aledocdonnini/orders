"use server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Ottiene gli ordini di un evento
export async function getOrders(eventId: number) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("event_id", eventId);
  if (error) throw error;
  return data;
}

// Crea un nuovo ordine
export async function createOrder(
  eventId: number,
  customerName: string,
  items: any[]
) {
  const total = items.reduce((acc, item) => acc + item.price, 0);
  const { data, error } = await supabase
    .from("orders")
    .insert([{ event_id: eventId, customer_name: customerName, items, total }])
    .select("*");
  if (error) throw error;
  return data[0];
}
