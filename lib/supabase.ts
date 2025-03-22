import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funzione per aggiornare una portata
export async function updateMenuItem(id: number, title: string, price: number) {
  const { data, error } = await supabase
    .from("menu")
    .update({ title, price })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createOrder(
  eventId: number,
  customerName: string,
  items: any[]
) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const { data, error } = await supabase
    .from("orders")
    .insert([{ event_id: eventId, customer_name: customerName, items, total }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOrder(orderId: number) {
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function updateOrder(
  orderId: number,
  customerName: string,
  items: any[]
) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const { data, error } = await supabase
    .from("orders")
    .update({ customer_name: customerName, items, total })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
